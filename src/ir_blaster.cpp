#include "ir_blaster.h"
#include <Arduino.h>

// IR_TX_PIN is supplied as a build flag (see platformio.ini). -1 / undefined
// means no IR hardware fitted → every entry point becomes a no-op.
#ifndef IR_TX_PIN
#define IR_TX_PIN -1
#endif

static bool     _irOk      = false;
static uint32_t _carrierHz = 38000;

// LEDC carrier. The Arduino-ESP32 LEDC API changed at core 3.0: 3.x binds a
// frequency directly to a pin, 2.x binds a numbered channel. Guard both so the
// firmware builds on whatever the platform pin resolves to.
#if ESP_ARDUINO_VERSION_MAJOR >= 3
static void _carrierBegin(uint32_t hz) { ledcAttach(IR_TX_PIN, hz, 8); }
static inline void _carrierOn()  { ledcWrite(IR_TX_PIN, 128); }   // ~50% duty
static inline void _carrierOff() { ledcWrite(IR_TX_PIN, 0); }
#else
static const int _IR_CH = 2;   // LEDC channel; avoid 0/1 used by tone()
static void _carrierBegin(uint32_t hz) { ledcSetup(_IR_CH, hz, 8); ledcAttachPin(IR_TX_PIN, _IR_CH); }
static inline void _carrierOn()  { ledcWrite(_IR_CH, 128); }
static inline void _carrierOff() { ledcWrite(_IR_CH, 0); }
#endif

void irInit() {
#if IR_TX_PIN >= 0
  _carrierBegin(_carrierHz);
  _carrierOff();
  _irOk = true;
  Serial.printf("[ir] blaster ready on GPIO %d\n", IR_TX_PIN);
#else
  _irOk = false;
#endif
}

bool irEnabled() { return _irOk; }

void irSetCarrier(uint32_t hz) {
  _carrierHz = hz;
#if IR_TX_PIN >= 0
  if (_irOk) _carrierBegin(hz);
#endif
}

// A "mark" is the carrier gated on for `us`; a "space" is silence for `us`.
// delayMicroseconds is accurate to a few µs which is well inside IR tolerance.
static inline void _mark(uint16_t us)  { _carrierOn();  delayMicroseconds(us); }
static inline void _space(uint16_t us) { _carrierOff(); delayMicroseconds(us); }

void irSendRaw(const uint16_t* durationsUs, size_t count) {
  if (!_irOk || !durationsUs) return;
  noInterrupts();   // keep the carrier gating tight during the burst
  for (size_t i = 0; i < count; i++) {
    if (i & 1) _space(durationsUs[i]);
    else       _mark(durationsUs[i]);
  }
  _carrierOff();
  interrupts();
}

// NEC: 9ms lead mark, 4.5ms space, 32 data bits (LSB-first), 560µs stop mark.
// Bit 0 = 560µs mark + 560µs space; bit 1 = 560µs mark + 1690µs space.
void irSendNECRaw(uint32_t data, uint8_t nbits) {
  if (!_irOk) return;
  uint32_t prev = _carrierHz;
  if (prev != 38000) irSetCarrier(38000);

  noInterrupts();
  _mark(9000);  _space(4500);
  for (uint8_t i = 0; i < nbits; i++) {
    _mark(560);
    _space((data & 1) ? 1690 : 560);
    data >>= 1;
  }
  _mark(560);
  _carrierOff();
  interrupts();

  if (prev != 38000) irSetCarrier(prev);
}

void irSendNEC(uint8_t address, uint8_t command) {
  // Frame order on the wire: address, ~address, command, ~command. Each byte
  // is sent LSB-first; assembling them little-endian into the 32-bit word and
  // shifting out LSB-first reproduces that order.
  uint32_t frame = (uint32_t)address
                 | ((uint32_t)(uint8_t)~address << 8)
                 | ((uint32_t)command       << 16)
                 | ((uint32_t)(uint8_t)~command << 24);
  irSendNECRaw(frame, 32);
}
