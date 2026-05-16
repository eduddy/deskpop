#pragma once
// Platform include shim — resolves the right display/board header for each env.
#if defined(BOARD_IDEASPARK) || defined(BOARD_PLUS2)
#include <TFT_eSPI.h>
#else
#include <M5StickCPlus.h>
#endif
