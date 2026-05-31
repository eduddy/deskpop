#include "net_buddy.h"
#include "ir_blaster.h"
#include "stats_access.h"

#include <Arduino.h>
#include <WiFi.h>
#include <LittleFS.h>
#include <ArduinoJson.h>
#include <PubSubClient.h>

// Persona indices must match PersonaState in main.cpp.
enum { NP_SLEEP, NP_IDLE, NP_BUSY, NP_ATTENTION, NP_CELEBRATE, NP_DIZZY, NP_HEART };

// ── configuration ───────────────────────────────────────────────────────────
struct NetCfg {
  char ssid[33]   = "";
  char pass[65]   = "";
  char broker[64] = "";
  uint16_t port   = 1883;
  char user[33]   = "";
  char mqttPass[65] = "";
  char base[40]   = "claude/buddy";
};
static NetCfg  _cfg;
static bool    _haveCfg = false;
static char    _devId[20] = "Claude";

static char _topImu[80], _topOnline[80], _topCmd[80], _topState[80];

static WiFiClient   _wifiClient;
static PubSubClient _mqtt(_wifiClient);

// ── runtime state ────────────────────────────────────────────────────────────
static uint32_t _seq          = 0;
static uint32_t _lastPubMs    = 0;
static uint32_t _lastTryMs    = 0;
static uint8_t  _backoffStep  = 0;       // grows the retry gap up to ~16s
static uint8_t  _moodOverride = 0xFF;
static uint32_t _moodUntil    = 0;
static uint8_t  _lastState    = 0xFF;

// shake / gesture smoothing
static float _accelBaseline = 1.0f;

static void _buildTopics() {
  snprintf(_topImu,    sizeof(_topImu),    "%s/%s/imu",    _cfg.base, _devId);
  snprintf(_topOnline, sizeof(_topOnline), "%s/%s/online", _cfg.base, _devId);
  snprintf(_topCmd,    sizeof(_topCmd),    "%s/%s/cmd",    _cfg.base, _devId);
  snprintf(_topState,  sizeof(_topState),  "%s/%s/state",  _cfg.base, _devId);
}

static bool _readConfigFile() {
  if (!LittleFS.begin(true)) return false;
  File f = LittleFS.open("/mqtt.json", "r");
  if (!f) return false;
  JsonDocument doc;
  DeserializationError e = deserializeJson(doc, f);
  f.close();
  if (e) { Serial.printf("[net] /mqtt.json parse error: %s\n", e.c_str()); return false; }

  auto cp = [](char* dst, size_t n, const char* src) {
    if (src) { strncpy(dst, src, n - 1); dst[n - 1] = 0; }
  };
  cp(_cfg.ssid,     sizeof(_cfg.ssid),     doc["ssid"]   | (const char*)nullptr);
  cp(_cfg.pass,     sizeof(_cfg.pass),     doc["pass"]   | (const char*)nullptr);
  cp(_cfg.broker,   sizeof(_cfg.broker),   doc["broker"] | (const char*)nullptr);
  cp(_cfg.user,     sizeof(_cfg.user),     doc["user"]   | (const char*)nullptr);
  cp(_cfg.mqttPass, sizeof(_cfg.mqttPass), doc["mqtt_pass"] | (const char*)nullptr);
  const char* base = doc["base"] | (const char*)nullptr;
  if (base && *base) cp(_cfg.base, sizeof(_cfg.base), base);
  _cfg.port = doc["port"] | 1883;

  return _cfg.ssid[0] && _cfg.broker[0];
}

// Map an incoming mood word to a PersonaState the stick can show.
static uint8_t _moodToPersona(const char* m) {
  if (!m) return 0xFF;
  if (!strcmp(m, "wave")  || !strcmp(m, "idle"))      return NP_IDLE;
  if (!strcmp(m, "busy")  || !strcmp(m, "work"))      return NP_BUSY;
  if (!strcmp(m, "angry") || !strcmp(m, "impatient")
                          || !strcmp(m, "watch"))     return NP_ATTENTION;
  if (!strcmp(m, "celebrate") || !strcmp(m, "happy")) return NP_CELEBRATE;
  if (!strcmp(m, "dizzy") || !strcmp(m, "confused"))  return NP_DIZZY;
  if (!strcmp(m, "heart") || !strcmp(m, "love"))      return NP_HEART;
  if (!strcmp(m, "sleep"))                            return NP_SLEEP;
  return 0xFF;
}

// Inbound command: {"ir":{"proto":"nec","addr":N,"cmd":N}} | {"ir":{"data":N,"bits":N}}
//                  | {"mood":"angry"} | {"carrier":38000}
static void _onMessage(char* topic, byte* payload, unsigned int len) {
  JsonDocument doc;
  if (deserializeJson(doc, payload, len)) return;

  JsonVariant ir = doc["ir"];
  if (!ir.isNull()) {
    if (ir["carrier"].is<uint32_t>()) irSetCarrier(ir["carrier"].as<uint32_t>());
    const char* proto = ir["proto"] | "nec";
    if (ir["data"].is<uint32_t>()) {
      irSendNECRaw(ir["data"].as<uint32_t>(), ir["bits"] | 32);
    } else if (!strcmp(proto, "nec") && ir["addr"].is<int>() && ir["cmd"].is<int>()) {
      irSendNEC((uint8_t)(ir["addr"].as<int>()), (uint8_t)(ir["cmd"].as<int>()));
    }
  }

  const char* mood = doc["mood"];
  if (mood) {
    uint8_t p = _moodToPersona(mood);
    if (p != 0xFF) { _moodOverride = p; _moodUntil = millis() + 4000; }
  }
}

void netBuddyApplyConfig(const char* json) {
  if (!LittleFS.begin(true)) return;
  File f = LittleFS.open("/mqtt.json", "w");
  if (!f) return;
  f.print(json);
  f.close();
  _mqtt.disconnect();
  WiFi.disconnect(true);
  _haveCfg = _readConfigFile();
  _buildTopics();
  _backoffStep = 0;
  _lastTryMs = 0;
  Serial.println("[net] config saved; reconnecting");
}

void netBuddyBegin(const char* deviceId) {
  if (deviceId && *deviceId) { strncpy(_devId, deviceId, sizeof(_devId) - 1); _devId[sizeof(_devId)-1] = 0; }
  _haveCfg = _readConfigFile();
  _buildTopics();
  if (_haveCfg) {
    _mqtt.setBufferSize(512);
    _mqtt.setSocketTimeout(2);   // cap a dead-broker stall at ~2s, not 15s
    _mqtt.setCallback(_onMessage);
    Serial.printf("[net] armed: ssid=%s broker=%s:%u base=%s\n",
                  _cfg.ssid, _cfg.broker, _cfg.port, _cfg.base);
  } else {
    Serial.println("[net] no /mqtt.json — MQTT bridge dormant");
  }
}

bool netBuddyArmed()     { return _haveCfg && netSettingWifiOn(); }
bool netBuddyConnected() { return _mqtt.connected(); }

uint8_t netBuddyMoodOverride() {
  if (_moodOverride != 0xFF && (int32_t)(millis() - _moodUntil) < 0) return _moodOverride;
  _moodOverride = 0xFF;
  return 0xFF;
}

static const char* _gesture(float ax, float ay, float az, bool shake) {
  if (shake)            return "dizzy";
  if (az < -0.7f)       return "facedown";
  if (ay >  0.55f)      return "wave";      // flicked up
  if (ax >  0.5f)       return "lean_r";
  if (ax < -0.5f)       return "lean_l";
  return "idle";
}

static const char* const _STATE_NAMES[] = {
  "sleep","idle","busy","attention","celebrate","dizzy","heart"
};

static bool _reconnect() {
  // Stage 1: WiFi. Non-blocking — WiFi.begin once, then poll status.
  if (WiFi.status() != WL_CONNECTED) {
    static bool started = false;
    if (!started) {
      WiFi.mode(WIFI_STA);
      WiFi.setSleep(true);                 // let BLE share the radio
      WiFi.begin(_cfg.ssid, _cfg.pass);
      started = true;
    }
    return false;                          // try again next backoff tick
  }
  // Stage 2: MQTT.
  String willTopic = _topOnline;
  bool ok = _cfg.user[0]
    ? _mqtt.connect(_devId, _cfg.user, _cfg.mqttPass, _topOnline, 0, true, "0")
    : _mqtt.connect(_devId, _topOnline, 0, true, "0");
  if (ok) {
    _mqtt.publish(_topOnline, "1", true);
    _mqtt.subscribe(_topCmd);
    Serial.println("[net] MQTT connected");
  }
  return ok;
}

void netBuddyLoop(float ax, float ay, float az, uint8_t persona, bool shake) {
  if (!netBuddyArmed()) return;
  _mqtt.setServer(_cfg.broker, _cfg.port);

  uint32_t now = millis();

  if (!_mqtt.connected()) {
    uint32_t gap = 1000u << (_backoffStep > 4 ? 4 : _backoffStep);   // 1s..16s
    if (now - _lastTryMs >= gap) {
      _lastTryMs = now;
      if (_reconnect()) _backoffStep = 0;
      else if (_backoffStep < 5) _backoffStep++;
    }
    return;
  }
  _mqtt.loop();

  // shake magnitude (same heuristic as main.cpp, kept local so callers can
  // pass an already-computed shake flag or let us derive a softer one).
  float mag = sqrtf(ax*ax + ay*ay + az*az);
  bool localShake = fabsf(mag - _accelBaseline) > 0.8f;
  _accelBaseline = _accelBaseline * 0.95f + mag * 0.05f;
  bool sh = shake || localShake;

  // retained state message on change → late webapp subscribers catch up
  if (persona != _lastState && persona < 7) {
    _lastState = persona;
    _mqtt.publish(_topState, _STATE_NAMES[persona], true);
  }

  if (now - _lastPubMs < 100) return;     // ~10 Hz telemetry
  _lastPubMs = now;

  // tilt mapped to -1..1 for the webapp to drive horizontal position
  float tx = ax; if (tx > 1) tx = 1; if (tx < -1) tx = -1;
  float ty = ay; if (ty > 1) ty = 1; if (ty < -1) ty = -1;

  char buf[200];
  int n = snprintf(buf, sizeof(buf),
    "{\"id\":\"%s\",\"ax\":%.3f,\"ay\":%.3f,\"az\":%.3f,"
    "\"tx\":%.3f,\"ty\":%.3f,\"shake\":%d,\"g\":\"%s\","
    "\"state\":\"%s\",\"seq\":%lu,\"up\":%lu}",
    _devId, ax, ay, az, tx, ty, sh ? 1 : 0,
    _gesture(ax, ay, az, sh),
    persona < 7 ? _STATE_NAMES[persona] : "idle",
    (unsigned long)(++_seq), (unsigned long)(now / 1000));
  if (n > 0) _mqtt.publish(_topImu, buf);
}
