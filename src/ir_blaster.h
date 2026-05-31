#pragma once
#include <stdint.h>
#include <stddef.h>

// =============================================================================
// IR blaster — minimal NEC + raw transmitter for the desk buddy.
//
// Drives an IR LED on IR_TX_PIN with a hardware 38 kHz carrier (LEDC), so the
// timing survives WiFi/BLE radio activity that would jitter a bit-banged
// carrier. Disabled (compiled to no-ops) unless IR_TX_PIN is a valid GPIO.
//
// Wiring: IR LED anode → IR_TX_PIN through a ~100Ω resistor, cathode → GND
// (a transistor-driven LED reaches farther). On the M5StickC Plus2 the onboard
// IR LED is exposed; set IR_TX_PIN in platformio.ini to that GPIO.
//
// Codes can be fired locally (serial/BLE {"cmd":"ir",...}) or remotely over
// MQTT (<base>/<id>/cmd  → {"ir":{...}}), letting the Cowork Buddy webapp turn
// the avatar's "point at the TV" gesture into a real power toggle.
// =============================================================================

// Call once at boot. Safe to call when IR is disabled.
void irInit();

// True if IR_TX_PIN is configured to a usable GPIO.
bool irEnabled();

// Send a 38 kHz-modulated NEC frame for an 8-bit address + 8-bit command.
// Builds the standard addr / ~addr / cmd / ~cmd frame, LSB-first.
void irSendNEC(uint8_t address, uint8_t command);

// Send a raw NEC 32-bit value (already framed) LSB-first, `nbits` long.
void irSendNECRaw(uint32_t data, uint8_t nbits = 32);

// Send an arbitrary mark/space pattern in microseconds. Even indices are
// marks (carrier on), odd indices are spaces (carrier off). Used for
// protocols the webapp captures elsewhere and replays verbatim.
void irSendRaw(const uint16_t* durationsUs, size_t count);

// Carrier frequency for raw sends (NEC uses 38000). Persists until changed.
void irSetCarrier(uint32_t hz);
