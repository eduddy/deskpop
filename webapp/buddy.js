/* =============================================================================
 * Claude Cowork Buddy — ASCII android that paces the top of the screen.
 *
 * Two data sources, same renderer:
 *   • MQTT (over WebSocket) — subscribes to <base>/<id>/imu + /state from the
 *     M5StickC Plus2 firmware (net_buddy.cpp) and reacts to live IMU/gestures.
 *   • Simulator — synthesises the same signals from the sliders/buttons so the
 *     character is fully alive with no hardware attached.
 *
 * The avatar walks left/right with tilt, waves on an up-flick, goes dizzy on a
 * shake, checks a watch when an approval is pending (state=attention), and can
 * be posed remotely. Moods map 1:1 to the on-device edydroid persona states.
 * ===========================================================================*/
(() => {
"use strict";

// ── DOM ──────────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const stripEl   = $("strip");
const buddyEl   = $("buddy");
const speechEl  = $("speech");
const moodTagEl = $("moodtag");
const linkDot   = $("linkdot");
const statusEl  = $("status");
const telemetryEl = $("telemetry");

// ── ASCII art ────────────────────────────────────────────────────────────────
// Each frame is an array of equal-width rows (right-padded on use). The android:
// domed head + antenna, visor eyes, two arms, a reactor chest, two legs.
const W = 11; // canonical frame width
const pad = (rows) => rows.map(r => (r + " ".repeat(W)).slice(0, W));
const F = (...rows) => pad(rows);

// Mirror a frame horizontally so the android can face left when walking left.
const FLIP = { "(":")", ")":"(", "[":"]", "]":"[", "{":"}", "}":"{",
               "<":">", ">":"<", "/":"\\", "\\":"/", "d":"b", "b":"d" };
const mirrorRow = (r) => [...r].reverse().map(c => FLIP[c] || c).join("");
const mirror = (frame) => frame.map(mirrorRow);

// mood → { frames, fps, color, lock(ms or 0=persistent) }
const A = {
  idle: { fps:3, color:"var(--ink)", frames:[
    F("   ___   ", "  /. .\\  ", " <|=#=|> ", "  |___|  ", "  |   |  ", "  d   b  "),
    F("   _o_   ", "  /. .\\  ", " <|=#=|> ", "  |___|  ", "  |   |  ", "  d   b  "),
    F("   ___   ", "  /- -\\  ", " <|=#=|> ", "  |___|  ", "  |   |  ", "  d   b  "),
    F("   ___   ", "  /. .\\  ", " <|=#=|> ", "  |___|  ", "  |   |  ", "  d   b  "),
  ]},
  walk: { fps:6, color:"var(--ink)", frames:[
    F("   ___   ", "  /. .\\  ", " <|=#=|> ", "  |___|  ", "  |   \\  ", "  d    L "),
    F("   ___   ", "  /. .\\  ", " <|=#=|> ", "  |___|  ", "  /   |  ", " J    b  "),
  ]},
  wave: { fps:5, color:"var(--accent)", lock:1600, frames:[
    F("   ___  \\", "  /^ ^\\_/ ", " <|=#=|   ", "  |___|  ", "  |   |  ", "  d   b  "),
    F("   ___  / ", "  /^ ^\\/  ", " <|=#=|   ", "  |___|  ", "  |   |  ", "  d   b  "),
    F("   ___ \\  ", "  /^ ^\\ \\ ", " <|=#=|   ", "  |___|  ", "  |   |  ", "  d   b  "),
  ]},
  checkwatch: { fps:4, color:"var(--warn)", lock:0, frames:[ // impatient / attention
    F("   ___   ", "  /o o\\@  ", " <|=#=|@  ", "  |___|  ", "  |   |  ", "  d   L  "),
    F("   ___   ", "  /- -\\o  ", " <|=#=|@  ", "  |___|  ", "  |   |  ", "  d   b  "),
    F("   _!_   ", "  /o o\\   ", " <|=#=|>  ", "  |___|  ", "  |   |  ", "  L   b  "),
    F("   ___   ", "  /o o\\@  ", " <|=#=|@  ", "  |___|  ", "  |   |  ", "  d   L  "),
  ]},
  confused: { fps:3, color:"var(--accent)", lock:0, frames:[
    F("  ___  ? ", " /@ -\\   ", "<|=#=|>  ", " |___|   ", " |   |   ", " d   b   "),
    F("   ___ ? ", "  /- @\\  ", " <|=#=|> ", "  |___|  ", "  |   |  ", "  d   b  "),
  ]},
  dizzy: { fps:7, color:"var(--love)", lock:1800, frames:[
    F("  *___   ", " /@ @\\ * ", "<|=#=|>  ", " |~~~|   ", " /   \\   ", " b   d   "),
    F("   ___*  ", "  /@ @\\  ", " <|=#=|> ", "  |~~~|  ", "  \\   /  ", "  d   b  "),
    F("  ___ *  ", " /x x\\   ", "<|=#=|> *", " |~~~|   ", " /   \\   ", " b   d   "),
  ]},
  angry: { fps:6, color:"var(--hot)", lock:0, frames:[
    F("  _###_  ", " /> <\\ ^ ", "<|=#=|>  ", " |XXX|   ", " |   |   ", " J   L   "),
    F(" ^_###_  ", " /> <\\   ", "<|=#=|> ^", " |XXX|   ", " |   |   ", " J   L   "),
    F("  _###_  ", " />=<\\   ", "<|=#=|>  ", " |XXX|   ", " |   |   ", " L   J   "),
  ]},
  busy: { fps:6, color:"var(--ink)", lock:0, frames:[
    F("   ___   ", "  /- -\\  ", " <|=#=|> ", "  |___|  ", " _|   |_ ", "  d   b  "),
    F("   ___   ", "  /- -\\  ", " <|=#=|> ", " _|___|_ ", "  |   |  ", "  d   b  "),
  ]},
  celebrate: { fps:6, color:"var(--warn)", lock:0, frames:[
    F("\\  _*_  /", " \\/. .\\/ ", "  |=#=|  ", "  |___|  ", "  |   |  ", "  d   b  "),
    F(" | _*_ | ", " |/^ ^\\| ", "  |=#=|  ", "  |___|  ", "  /   \\  ", "  b   d  "),
  ]},
  sleep: { fps:2, color:"var(--dim)", lock:0, frames:[
    F("   _z_   ", "  /- -\\  ", " <|=#=|> ", "  |._.|  ", "  |   |  ", "  d   b  "),
    F("   __z   ", "  /- -\\  ", " <|=#=|> ", "  |._.|  ", "  |   |  ", "  d   b  "),
  ]},
  heart: { fps:3, color:"var(--love)", lock:0, frames:[
    F("   ___   ", "  /v v\\  ", " <|<3=|> ", "  |___|  ", "  |   |  ", "  d   b  "),
    F("   ___   ", "  /^ ^\\  ", " <|<3=|> ", "  |___|  ", "  |   |  ", "  d   b  "),
  ]},
};

// Map firmware persona/state words + gesture words to a mood key.
const STATE_MOOD = { sleep:"sleep", idle:"idle", busy:"busy",
  attention:"checkwatch", celebrate:"celebrate", dizzy:"dizzy", heart:"heart" };
const MOOD_KEYS = ["idle","wave","checkwatch","confused","dizzy","angry",
                   "busy","celebrate","sleep","heart"];
// Mood → the firmware mood word published back to the stick's cmd topic.
const MOOD_PUBLISH = { idle:"idle", wave:"wave", checkwatch:"watch",
  confused:"confused", dizzy:"dizzy", angry:"angry", busy:"busy",
  celebrate:"celebrate", sleep:"sleep", heart:"heart" };

// ── buddy runtime state ──────────────────────────────────────────────────────
const buddy = {
  x: 0, targetX: 0, facing: 1,
  stateMood: "idle",     // persistent mood from firmware state / mood buttons
  transient: null,       // {mood, until} short-lived gesture (wave/dizzy)
  frame: 0, frameAt: 0,
  walking: false,
};

function setSpeech(text) {
  if (!text) { speechEl.classList.remove("show"); return; }
  speechEl.textContent = text;
  speechEl.classList.add("show");
  clearTimeout(setSpeech._t);
  setSpeech._t = setTimeout(() => speechEl.classList.remove("show"), 1800);
}

function activeMood() {
  if (buddy.transient && performance.now() < buddy.transient.until) return buddy.transient.mood;
  buddy.transient = null;
  if (buddy.walking && !A[buddy.stateMood]?.lock) return "walk";
  return buddy.stateMood;
}

function trigger(mood, speech) {
  const def = A[mood]; if (!def) return;
  if (def.lock) buddy.transient = { mood, until: performance.now() + def.lock };
  else buddy.stateMood = mood;
  buddy.frame = 0; buddy.frameAt = 0;
  if (speech) setSpeech(speech);
}

// ── render loop ──────────────────────────────────────────────────────────────
function stripWidth() { return stripEl.clientWidth; }

function layout() {
  // px per character ≈ font-size * 0.6 for monospace
  const charPx = 13 * 0.62;
  return { charPx, frameW: W * charPx, margin: 24 };
}

function tick() {
  const now = performance.now();
  // ease horizontal position toward target
  const { frameW, margin } = layout();
  const span = Math.max(40, stripWidth() - frameW - margin * 2);
  const desired = margin + (buddy.targetX * 0.5 + 0.5) * span; // targetX in -1..1
  const dx = desired - buddy.x;
  if (Math.abs(dx) > 0.5) { buddy.facing = dx > 0 ? 1 : -1; buddy.x += dx * 0.12; }
  buddy.walking = Math.abs(dx) > 3;

  const mood = activeMood();
  const def = A[mood] || A.idle;
  const interval = 1000 / def.fps;
  if (now - buddy.frameAt >= interval) {
    buddy.frameAt = now;
    buddy.frame = (buddy.frame + 1) % def.frames.length;
  }
  let frame = def.frames[buddy.frame % def.frames.length];
  if (buddy.facing < 0) frame = mirror(frame);

  buddyEl.textContent = frame.join("\n");
  buddyEl.style.color = def.color;
  buddyEl.style.transform = `translateX(${buddy.x|0}px)`;

  // a little dust kick while walking
  buddyEl.style.textShadow = buddy.walking
    ? "0 0 6px rgba(7,255,200,.5)" : "0 0 6px rgba(7,255,200,.3)";

  moodTagEl.firstChild.textContent = (mood === "walk" ? "walking" : mood) + " ";
}
// setInterval rather than requestAnimationFrame: this widget is meant to live in
// an unfocused, always-on-top top-strip window, and rAF is throttled/paused when
// the tab isn't visible. A timer keeps the android alive regardless of focus.
setInterval(tick, 33);   // ~30 fps
tick();                   // paint one frame immediately

// ── ingest a telemetry sample (from MQTT or the simulator) ───────────────────
function ingestImu(m) {
  if (typeof m.tx === "number") buddy.targetX = Math.max(-1, Math.min(1, m.tx));
  if (m.shake) trigger("dizzy");
  switch (m.g) {
    case "wave":     trigger("wave", "hi! \u{1F44B}"); break;
    case "dizzy":    trigger("dizzy"); break;
    case "facedown": buddy.stateMood = "sleep"; break;
  }
  renderTelemetry(m);
}
function ingestState(stateWord) {
  const mood = STATE_MOOD[stateWord];
  if (mood) buddy.stateMood = mood;
}
function renderTelemetry(m) {
  telemetryEl.innerHTML =
    `id <b>${m.id ?? "—"}</b> · state <b>${m.state ?? "—"}</b> · gesture <b>${m.g ?? "—"}</b><br>` +
    `accel <b>${(m.ax??0).toFixed(2)}, ${(m.ay??0).toFixed(2)}, ${(m.az??0).toFixed(2)}</b> · ` +
    `tilt <b>${(m.tx??0).toFixed(2)}</b> · shake <b>${m.shake?"yes":"no"}</b> · ` +
    `seq <b>${m.seq ?? "—"}</b>`;
}

// ── MQTT ─────────────────────────────────────────────────────────────────────
let client = null;
let topics = { imu:"", state:"", online:"", cmd:"" };

function buildTopics() {
  const base = ($("base").value || "claude/buddy").replace(/\/+$/,"");
  const dev  = $("dev").value || "+";   // '+' = any device if none specified
  topics = { imu:`${base}/${dev}/imu`, state:`${base}/${dev}/state`,
             online:`${base}/${dev}/online`, cmd:`${base}/${dev}/cmd` };
}
function setLink(on) { linkDot.classList.toggle("on", on); }

function connect() {
  if (typeof mqtt === "undefined") {
    statusEl.textContent = "mqtt.js failed to load (offline?). Use simulator mode.";
    return;
  }
  const url = $("url").value.trim();
  if (!url) { statusEl.textContent = "Enter a broker WebSocket URL, e.g. ws://localhost:9001"; return; }
  buildTopics();
  statusEl.textContent = "Connecting to " + url + " …";
  try { client && client.end(true); } catch (_) {}
  const opts = { reconnectPeriod: 3000, connectTimeout: 6000 };
  if ($("user").value) opts.username = $("user").value;
  if ($("pass").value) opts.password = $("pass").value;
  client = mqtt.connect(url, opts);

  client.on("connect", () => {
    setLink(true);
    statusEl.textContent = "Connected. Subscribed to " + topics.imu;
    client.subscribe([topics.imu, topics.state, topics.online]);
  });
  client.on("reconnect", () => { statusEl.textContent = "Reconnecting…"; });
  client.on("error", (e) => { statusEl.textContent = "MQTT error: " + e.message; });
  client.on("close", () => setLink(false));
  client.on("message", (topic, payload) => {
    const text = payload.toString();
    if (topic.endsWith("/imu")) { try { ingestImu(JSON.parse(text)); } catch (_) {} }
    else if (topic.endsWith("/state")) ingestState(text);
    else if (topic.endsWith("/online")) statusEl.textContent =
      "Stick is " + (text === "1" ? "online" : "offline");
  });
}
function disconnect() { try { client && client.end(true); } catch (_) {} setLink(false);
  statusEl.textContent = "Disconnected."; }

function publishCmd(obj) {
  if (!client || !client.connected) return false;
  buildTopics();
  // publish to a concrete device topic only (not the '+' wildcard)
  const dev = $("dev").value;
  if (!dev) { statusEl.textContent = "Set a device id to send commands."; return false; }
  client.publish(`${($("base").value||"claude/buddy").replace(/\/+$/,"")}/${dev}/cmd`,
                 JSON.stringify(obj));
  return true;
}

// ── simulator ────────────────────────────────────────────────────────────────
let sim = false;
let simTimer = null;
function setSim(on) {
  sim = on;
  statusEl.textContent = on
    ? "Simulator on — drive it with the slider and buttons below."
    : "Simulator off.";
  setLink(on || (client && client.connected));
  if (on) {
    moodTagEl.firstChild.textContent = "sim ";
    // ambient life: occasional glance/blink handled by idle frames; nothing to do
  }
}

// tilt slider → targetX (and a synthetic imu telemetry row)
$("tilt").addEventListener("input", (e) => {
  const v = parseFloat(e.target.value);
  $("tiltVal").textContent = v.toFixed(2);
  buddy.targetX = v;
  if (sim) renderTelemetry({ id:"SIM", state:buddy.stateMood, g: v>0.2?"lean_r":v<-0.2?"lean_l":"idle",
    ax:v, ay:0, az:-1, tx:v, shake:false, seq:"sim" });
});

// gesture buttons (simulator)
document.querySelectorAll("[data-g]").forEach(b => b.addEventListener("click", () => {
  switch (b.dataset.g) {
    case "wave":     ingestImu({ g:"wave", tx:buddy.targetX }); break;
    case "shake":    ingestImu({ shake:1, g:"dizzy", tx:buddy.targetX }); break;
    case "facedown": ingestImu({ g:"facedown", tx:buddy.targetX }); break;
    case "center":   buddy.targetX = 0; $("tilt").value = 0; $("tiltVal").textContent="0.00"; break;
  }
}));

// ── mood grid (drives locally + publishes to the stick) ──────────────────────
const moodGrid = $("moodGrid");
MOOD_KEYS.forEach(k => {
  const btn = document.createElement("button");
  btn.textContent = k;
  btn.addEventListener("click", () => {
    const def = A[k];
    if (def.lock) trigger(k); else buddy.stateMood = k;
    buddy.transient = def.lock ? { mood:k, until: performance.now() + def.lock } : buddy.transient;
    if (client && client.connected) {
      if (publishCmd({ mood: MOOD_PUBLISH[k] }))
        statusEl.textContent = `Sent mood "${MOOD_PUBLISH[k]}" to the stick.`;
    }
  });
  moodGrid.appendChild(btn);
});

// ── IR relay ─────────────────────────────────────────────────────────────────
$("irSend").addEventListener("click", () => {
  const addr = parseInt($("irAddr").value || "0", 10) & 0xff;
  const cmd  = parseInt($("irCmd").value  || "0", 10) & 0xff;
  trigger("wave"); // the android "points" at the device
  if (publishCmd({ ir: { proto:"nec", addr, cmd } }))
    statusEl.textContent = `Blasted IR NEC addr=${addr} cmd=${cmd}.`;
  else statusEl.textContent = "Connect (with a device id) to relay IR to the stick.";
});

// ── persistence + wiring ─────────────────────────────────────────────────────
const FIELDS = ["url","base","dev","user","pass"];
const DEFAULTS = { url:"ws://localhost:9001", base:"claude/buddy", dev:"", user:"", pass:"" };
FIELDS.forEach(f => {
  $(f).value = localStorage.getItem("cb_"+f) ?? DEFAULTS[f];
  $(f).addEventListener("change", () => localStorage.setItem("cb_"+f, $(f).value));
});

$("connectBtn").addEventListener("click", connect);
$("disconnectBtn").addEventListener("click", disconnect);
$("simToggle").addEventListener("change", (e) => setSim(e.target.checked));

// Start life immediately so the strip is never empty.
buddy.stateMood = "idle";
setSpeech("booting…");
setTimeout(() => setSpeech(""), 1200);

})();
