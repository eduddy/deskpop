#pragma once
// Platform include shim — resolves the right display/board header for each env.
// M5StickC Plus pulls in the full M5 driver stack; Ideaspark and Plus2 drive
// the panel through TFT_eSPI directly and must NOT include M5StickCPlus.h
// (that variant has no pins_arduino.h and a different board class).
#if defined(BOARD_IDEASPARK) || defined(BOARD_PLUS2)
#include <TFT_eSPI.h>
#else
#include <M5StickCPlus.h>
#endif
