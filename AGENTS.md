# AGENTS.md

## Cursor Cloud specific instructions

This is an ESP32 firmware project built with PlatformIO. There are no web services, databases, or Docker containers. The development loop is: edit C++ → `pio run` → observe on hardware. Without physical hardware, you can validate that firmware **compiles** but cannot flash or run it.

### Building

- **Primary target**: `pio run -e m5stickc-plus` (default, always works)
- **Secondary target**: `pio run -e ideaspark-114-esp32` has a pre-existing build issue — `buddies/*.cpp` files include `<M5StickCPlus.h>` without `#ifdef BOARD_IDEASPARK` guards
- Incremental builds are fast (~2s); first build downloads the ESP32 toolchain and takes ~60s

### Static analysis / lint

- `pio check -e m5stickc-plus --skip-packages` runs cppcheck on project source (skips library code)
- All reported issues in `src/` are low-style (unused functions exposed as a public API); no medium/high issues in project code

### Python tools

- `tools/prep_character.py <dir>` — resizes GIF character packs (requires `Pillow`)
- `tools/flash_character.py <dir>` — stages + flashes a character over USB (requires hardware)
- `tools/test_serial.py` / `tools/test_xfer.py` — USB serial test scripts (require `pyserial` and hardware)

### PATH

PlatformIO CLI (`pio`) is installed to `~/.local/bin`. The update script adds it to PATH via `~/.bashrc`. If `pio` is not found, run `export PATH="$HOME/.local/bin:$PATH"`.
