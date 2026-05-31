#pragma once
#include <stdint.h>

// =============================================================================
// net_buddy — WiFi + MQTT bridge that streams the IMU to the Cowork Buddy
// webapp and relays remote commands (IR, mood) back to the stick.
//
// This is *additive and opt-in*: it only starts when the "wifi" setting is on
// AND a /mqtt.json config exists on LittleFS. The BLE Hardware-Buddy link is
// untouched and stays the primary channel, so existing Claude Cowork / Claude
// Code integration keeps working exactly as before. When WiFi is off the whole
// module compiles in but stays dormant (no radio, no heap cost beyond statics).
//
//   provisioning   /mqtt.json on LittleFS, or {"cmd":"netcfg",...} over BLE/USB
//   telemetry out  <base>/<id>/imu      JSON, ~10 Hz  (accel + gesture + state)
//   presence       <base>/<id>/online   retained "1"/"0" (LWT)
//   commands in    <base>/<id>/cmd      {"ir":{...}} | {"mood":"wave"|"angry"|..}
//
// <base> defaults to "claude/buddy"; <id> is the BLE name, e.g. "Claude-1A2B".
// =============================================================================

// Load /mqtt.json and remember the device id. Does not touch the radio yet.
void netBuddyBegin(const char* deviceId);

// Persist a new config (from a {"cmd":"netcfg",...} JSON object) to
// /mqtt.json and re-arm the connection. Pass the raw JSON object string.
void netBuddyApplyConfig(const char* json);

// Pump WiFi/MQTT state and publish telemetry. Call every loop; it self-throttles
// publishing to ~10 Hz and reconnect attempts to a slow backoff so it never
// stalls the render loop. Pass the latest accel, current persona state index,
// and whether a shake was detected this frame.
void netBuddyLoop(float ax, float ay, float az, uint8_t persona, bool shake);

// True once the MQTT session is live.
bool netBuddyConnected();

// True if a config was found and the wifi setting permits running.
bool netBuddyArmed();

// A remote {"mood":...} command sets a short-lived persona override so the
// stick can mirror what the webapp shows. Returns a PersonaState index, or
// 0xFF when no override is active.
uint8_t netBuddyMoodOverride();
