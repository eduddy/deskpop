# claude-desktop-buddy

Claude for macOS and Windows can connect Claude Cowork and Claude Code to
maker devices over BLE, so developers and makers can build hardware that
displays permission prompts, recent messages, and other interactions. We've
been impressed by the creativity of the maker community around Claude -
providing a lightweight, opt-in API is our way of making it easier to build
fun little hardware devices that integrate with Claude.

> **Building your own device?** You don't need any of the code here. See
> **[REFERENCE.md](REFERENCE.md)** for the wire protocol: Nordic UART
> Service UUIDs, JSON schemas, and the folder push transport.

As an example, we built a desk pet on ESP32 that lives off permission
approvals and interaction with Claude. It sleeps when nothing's happening,
wakes when sessions start, gets visibly impatient when an approval prompt is
waiting, and lets you approve or deny right from the device.

<p align="center">
  <img src="docs/device.jpg" alt="M5StickC Plus running the buddy firmware" width="500">
</p>

## Hardware

The firmware targets ESP32 with the Arduino framework. Three boards are wired
up in `platformio.ini`:

- **`m5stickc-plus`** — the original M5StickC Plus (uses the M5StickCPlus lib).
- **`m5stickc-plus2`** — M5StickC Plus2 (AXP2101 PMIC, QMI8658 IMU); drives the
  panel via TFT_eSPI directly. This is the primary target for the IMU→MQTT
  webapp and the IR blaster (onboard IR on GPIO&nbsp;19).
- **`ideaspark-114-esp32`** — Ideaspark 1.14" ESP32 + MPU6050.

A per-board include shim (`src/hw_platform.h`) selects the right display header,
so the species/render code is board-agnostic. To bring up a different board,
add an env with your `-DTFT_*` / `-DBTN_*` pins.

## Flashing

Install
[PlatformIO Core](https://docs.platformio.org/en/latest/core/installation/),
then:

```bash
pio run -t upload
```

If you're starting from a previously-flashed device, wipe it first:

```bash
pio run -t erase && pio run -t upload
```

Once running, you can also wipe everything from the device itself: **hold A
→ settings → reset → factory reset → tap twice**.

## Pairing

To pair your device with Claude, first enable developer mode (**Help →
Troubleshooting → Enable Developer Mode**). Then, open the Hardware Buddy
window in **Developer → Open Hardware Buddy…**, click **Connect**, and pick
your device from the list. macOS will prompt for Bluetooth permission on
first connect; grant it.

<p align="center">
  <img src="docs/menu.png" alt="Developer → Open Hardware Buddy… menu item" width="420">
  <img src="docs/hardware-buddy-window.png" alt="Hardware Buddy window with Connect button and folder drop target" width="420">
</p>

Once paired, the bridge auto-reconnects whenever both sides are awake.

If discovery isn't finding the stick:

- Make sure it's awake (any button press)
- Check the stick's settings menu → bluetooth is on

## Controls

|                         | Normal               | Pet         | Info        | Approval    |
| ----------------------- | -------------------- | ----------- | ----------- | ----------- |
| **A** (front)           | next screen          | next screen | next screen | **approve** |
| **B** (right)           | scroll transcript    | next page   | next page   | **deny**    |
| **Hold A**              | menu                 | menu        | menu        | menu        |
| **Power** (left, short) | toggle screen off    |             |             |             |
| **Power** (left, ~6s)   | hard power off       |             |             |             |
| **Shake**               | dizzy                |             |             | —           |
| **Face-down**           | nap (energy refills) |             |             |             |

The screen auto-powers-off after 30s of no interaction (kept on while an
approval prompt is up). Any button press wakes it.

## ASCII pets

Nineteen pets, each with seven animations (sleep, idle, busy, attention,
celebrate, dizzy, heart). Menu → "next pet" cycles them with a counter.
Choice persists to NVS.

One of them, **`edydroid`**, is a little humanoid robotic-AI avatar rather than
a critter — a chrome android with an antenna, a visor, arms, and a reactor
chest. Its seven states read as human moods: it waves and glances around when
idle, hammers a keyboard when busy, taps a wrist-watch impatiently when an
approval is pending, gets confused-dizzy when you shake it, and so on. The same
character is rendered large and given room to roam in the **Cowork Buddy
webapp** (see below).

## GIF pets

If you want a custom GIF character instead of an ASCII buddy, drag a
character pack folder onto the drop target in the Hardware Buddy window. The
app streams it over BLE and the stick switches to GIF mode live. **Settings
→ delete char** reverts to ASCII mode.

A character pack is a folder with `manifest.json` and 96px-wide GIFs:

```json
{
  "name": "bufo",
  "colors": {
    "body": "#6B8E23",
    "bg": "#000000",
    "text": "#FFFFFF",
    "textDim": "#808080",
    "ink": "#000000"
  },
  "states": {
    "sleep": "sleep.gif",
    "idle": ["idle_0.gif", "idle_1.gif", "idle_2.gif"],
    "busy": "busy.gif",
    "attention": "attention.gif",
    "celebrate": "celebrate.gif",
    "dizzy": "dizzy.gif",
    "heart": "heart.gif"
  }
}
```

State values can be a single filename or an array. Arrays rotate: each
loop-end advances to the next GIF, useful for an idle activity carousel so
the home screen doesn't loop one clip forever.

GIFs are 96px wide; height up to ~140px stays on a 135×240 portrait screen.
Crop tight to the character — transparent margins waste screen and shrink
the sprite. `tools/prep_character.py` handles the resize: feed it source
GIFs at any sizes and it produces a 96px-wide set where the character is the
same scale in every state.

The whole folder must fit under 1.8MB —
`gifsicle --lossy=80 -O3 --colors 64` typically cuts 40–60%.

See `characters/bufo/` for a working example.

If you're iterating on a character and would rather skip the BLE round-trip,
`tools/flash_character.py characters/bufo` stages it into `data/` and runs
`pio run -t uploadfs` directly over USB.

## Cowork Buddy webapp + IMU over MQTT

The stick can also broadcast its **IMU** over WiFi/MQTT to a browser companion,
[`webapp/`](webapp/) — the **Claude Cowork Buddy**. It renders the `edydroid`
android pinned to the top edge of your screen and lets it *move*: tilt the stick
to walk it left/right, flick it up to wave, shake it to make it dizzy, and it
checks a watch impatiently whenever an approval is pending. There's a full
**simulator mode**, so the webapp is alive with no hardware at all.

This is opt-in and additive — the BLE Hardware-Buddy link is untouched and stays
the primary Claude channel. The MQTT bridge only runs when **settings → wifi**
is on *and* a `/mqtt.json` config exists on the device. Provision it by dropping
the file on LittleFS (`webapp/mqtt.example.json` is a template) or at runtime
with `{"cmd":"netcfg",...}` over the BLE/USB link. Topic schema and the IMU
payload are in [REFERENCE.md](REFERENCE.md); webapp usage is in
[webapp/README.md](webapp/README.md).

You'll need an MQTT broker with a WebSocket listener (Mosquitto's `listener 9001`
/ `protocol websockets`) for the browser; the stick connects over plain TCP.

## IR blaster

Builds with `IR_TX_PIN` set turn the stick into an IR remote. It transmits NEC
codes (38&nbsp;kHz carrier via LEDC) from an IR LED — GPIO&nbsp;19 on the
M5StickC&nbsp;Plus2, GPIO&nbsp;9 on the original Plus. Fire a code locally over
BLE/USB with `{"cmd":"ir","ir":{"addr":4,"cmd":8}}`, or remotely from the webapp
(which publishes it to the stick's MQTT command topic) so the on-screen android
can "point at the TV" and actually toggle it. Full command schema in
[REFERENCE.md](REFERENCE.md).

## The seven states

| State       | Trigger                     | Feel                        |
| ----------- | --------------------------- | --------------------------- |
| `sleep`     | bridge not connected        | eyes closed, slow breathing |
| `idle`      | connected, nothing urgent   | blinking, looking around    |
| `busy`      | sessions actively running   | sweating, working           |
| `attention` | approval pending            | alert, **LED blinks**       |
| `celebrate` | level up (every 50K tokens) | confetti, bouncing          |
| `dizzy`     | you shook the stick         | spiral eyes, wobbling       |
| `heart`     | approved in under 5s        | floating hearts             |

## Project layout

```
src/
  main.cpp       — loop, state machine, UI screens
  buddy.cpp      — ASCII species dispatch + render helpers
  buddies/       — one file per species, seven anim functions each
                   (incl. edydroid, the humanoid android avatar)
  hw_platform.h  — per-board display header shim (M5 vs TFT_eSPI)
  ble_bridge.cpp — Nordic UART service, line-buffered TX/RX
  net_buddy.cpp  — WiFi + MQTT IMU broadcaster + remote command sink
  ir_blaster.cpp — NEC IR transmitter (38kHz carrier via LEDC)
  character.cpp  — GIF decode + render
  data.h         — wire protocol, JSON parse (incl. ir / netcfg commands)
  xfer.h         — folder push receiver
  stats.h        — NVS-backed stats, settings, owner, species choice
characters/      — example GIF character packs
webapp/          — Claude Cowork Buddy: browser ASCII avatar over MQTT
tools/           — generators and converters
```

## Availability

The BLE API is only available when the desktop apps are in developer mode
(**Help → Troubleshooting → Enable Developer Mode**). It's intended for
makers and developers and isn't an officially supported product feature.
