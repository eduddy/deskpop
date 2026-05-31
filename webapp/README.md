# Claude Cowork Buddy — webapp

An ASCII android that paces the **top edge of your screen** and mirrors your
M5StickC&nbsp;Plus2. Tilt the stick to walk it, flick it up to wave, shake it to
make it dizzy; when an approval is pending it taps a wrist-watch impatiently.
It's the same character as the on-device `edydroid` ASCII buddy, just rendered
much larger and given room to move.

It works in two ways:

- **Live** — subscribes over MQTT (WebSocket) to the IMU/state stream the
  firmware publishes (see [`net_buddy`](../src/net_buddy.cpp) and
  [REFERENCE.md](../REFERENCE.md)).
- **Simulator** — synthesises the same signals from on-page sliders/buttons, so
  the buddy is fully alive with no hardware at all. Flip the **Simulator mode**
  switch and drive the tilt slider.

## Run it

It's a static page — no build step.

```bash
cd webapp
python -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` directly (the MQTT client loads from a CDN, so live
mode needs internet; simulator mode works offline).

> **"Top-most part of the screen."** In a normal browser tab the buddy sits in a
> fixed banner pinned to the top of the page. To turn it into a true desktop
> top-bar overlay, open the page in a borderless, always-on-top browser window
> (e.g. Chrome `--app=URL` sized to a thin strip, or wrap it in a transparent
> always-on-top Electron/Tauri shell). The strip is already styled like a
> desktop top-bar for that purpose.

## Live mode

You need an MQTT broker with a **WebSocket** listener (Mosquitto example):

```conf
# mosquitto.conf
listener 1883
listener 9001
protocol websockets
allow_anonymous true
```

Point the firmware at `1883` (TCP) and the webapp at `9001` (WebSocket). In the
**Connection** card enter:

- **Broker** — `ws://your-broker:9001` (or `wss://…` behind TLS)
- **Base topic** — `claude/buddy` (must match the stick's `/mqtt.json` `base`)
- **Device id** — the stick's BLE name, e.g. `Claude-1A2B`. Leave blank to
  follow *any* device (`+` wildcard); set it to send commands back.

Click **Connect**. Telemetry appears at the bottom; the link dot in the strip
turns cyan.

## Controls

- **Make it emote** — buttons for every mood. In live mode each also publishes
  `{"mood":…}` to `<base>/<id>/cmd` so the physical stick strikes the same pose.
- **Drive the IMU** — tilt slider + gesture buttons (simulator).
- **IR blaster relay** — sends `{"ir":{"proto":"nec","addr":N,"cmd":N}}` to the
  command topic; the stick fires it from its IR LED.

Connection settings persist in `localStorage`.

## Files

| File | What |
| --- | --- |
| `index.html` | layout, top strip, control panels |
| `buddy.js` | ASCII animation engine, MQTT client, simulator |
| `mqtt.example.json` | template for the stick's `/mqtt.json` provisioning file |
