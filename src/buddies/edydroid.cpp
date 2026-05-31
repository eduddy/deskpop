#include "../buddy.h"
#include "../buddy_common.h"
#include "../hw_platform.h"
#include <string.h>

extern TFT_eSprite spr;

// =============================================================================
// edydroid — a humanoid robotic-AI avatar of the owner.
//
// A little chrome android: domed head with a single antenna, a visor of two
// eyes, an arm on each side, a chest reactor panel, and two stubby legs.
// Five rows tall like every other species so it shares the canvas geometry,
// but posed as a *person* rather than a critter. The seven persona states are
// read as human moods:
//
//   sleep      → powered down, head slumped, reactor dim
//   idle       → standing easy, blinking, glancing, the odd friendly WAVE
//   busy       → heads-down, hammering an invisible keyboard
//   attention  → impatient: taps a wrist, checks a watch, foot-tap, frown
//   celebrate  → both arms up, hops, sparks
//   dizzy      → confused, wobbling, spiral eyes, "?" orbiting
//   heart      → warm, hand on reactor, hearts rising
//
// The companion webapp (webapp/index.html) renders the same character far
// larger and adds an explicit "angry" pose driven over MQTT; on the 135px
// stick, anger reads through the attention/impatient set.
// =============================================================================

namespace edydroid {

static const uint16_t CHROME = 0x9CD3;  // steel/chrome body
static const uint16_t VISOR  = 0x07FF;  // cyan visor glow
static const uint16_t CORE   = 0x07E0;  // green reactor (calm)

// Draw the chest-reactor dot over the body at a given color/intensity.
static void reactor(uint16_t col, int yOff = 0) {
  buddySetColor(col);
  buddySetCursor(BUDDY_X_CENTER - 1, BUDDY_Y_OVERLAY + 16 + yOff);
  buddyPrint("*");
}

// ─── SLEEP ───  powered down, ~12s, head sags, reactor pulses faint
static void doSleep(uint32_t t) {
  static const char* const DOWN_A[5] = { "    .o.    ", "   (___)   ", "  -[._.]-  ", "   | . |   ", "   _| |_   " };
  static const char* const DOWN_B[5] = { "    .o.    ", "   (___)   ", "  -[-_-]-  ", "   | . |   ", "   _| |_   " };
  static const char* const SAG_A[5]  = { "    .o.    ", "    (__)   ", "   [-_-]_  ", "    |.|    ", "   _|_|_   " };
  static const char* const SAG_B[5]  = { "    .o.    ", "    (__)   ", "  _[-_-]   ", "    |.|    ", "   _|_|_   " };
  static const char* const REBOOT[5] = { "    .o.    ", "   (___)   ", "  -[o _]-  ", "   | . |   ", "   _| |_   " };

  const char* const* P[5] = { DOWN_A, DOWN_B, SAG_A, SAG_B, REBOOT };
  static const uint8_t SEQ[] = {
    0,1,0,1, 2,3,2,3, 0,1,0,1, 2,3, 0,4,0
  };
  uint8_t beat = (t / 5) % sizeof(SEQ);
  buddyPrintSprite(P[SEQ[beat]], 5, 0, CHROME);

  // faint reactor heartbeat
  reactor(((t / 4) & 1) ? 0x2965 : 0x14A3);

  // standby "z" drifting from the antenna
  int p1 = t % 12, p2 = (t + 6) % 12;
  buddySetColor(BUDDY_DIM);
  buddySetCursor(BUDDY_X_CENTER + 14 + p1 / 2, BUDDY_Y_OVERLAY + 10 - p1);
  buddyPrint("z");
  buddySetColor(VISOR);
  buddySetCursor(BUDDY_X_CENTER + 20 + p2 / 2, BUDDY_Y_OVERLAY + 6 - p2 / 2);
  buddyPrint("z");
}

// ─── IDLE ───  standing, blink, glance, periodic friendly WAVE
static void doIdle(uint32_t t) {
  static const char* const REST[5]   = { "    _o_    ", "   /___\\   ", "  -[o o]-  ", "   |[#]|   ", "   /| |\\   " };
  static const char* const BLINK[5]  = { "    _o_    ", "   /___\\   ", "  -[- -]-  ", "   |[#]|   ", "   /| |\\   " };
  static const char* const LOOK_L[5] = { "    _o_    ", "   /___\\   ", "  -[o o ]- ", "   |[#]|   ", "   /| |\\   " };
  static const char* const LOOK_R[5] = { "    _o_    ", "   /___\\   ", " -[ o o]-  ", "   |[#]|   ", "   /| |\\   " };
  static const char* const WAVE_U[5] = { "    _o_  \\ ", "   /___\\_/ ", "  -[^ ^]   ", "   |[#]|   ", "   /| |\\   " };
  static const char* const WAVE_D[5] = { "    _o_    ", "   /___\\ \\ ", "  -[^ ^]-/ ", "   |[#]|   ", "   /| |\\   " };
  static const char* const BREATHE[5]= { "    _o_    ", "   /___\\   ", "  -[o o]-  ", "   |[#]|   ", "   /|_|\\   " };

  const char* const* P[7] = { REST, BLINK, LOOK_L, LOOK_R, WAVE_U, WAVE_D, BREATHE };
  static const uint8_t SEQ[] = {
    0,0,6,0, 1,0, 2,2,0, 3,3,0,    // settle, blink, glance around
    4,5,4,5,0,                     // a wave hello
    0,6,0, 1,0, 0,6,0              // breathe + blink
  };
  uint8_t beat = (t / 5) % sizeof(SEQ);
  buddyPrintSprite(P[SEQ[beat]], 5, 0, CHROME);

  reactor(((t / 6) & 1) ? CORE : 0x05E0);   // calm green pulse

  // antenna blip
  if ((t / 5) & 1) {
    buddySetColor(VISOR);
    buddySetCursor(BUDDY_X_CENTER - 1, BUDDY_Y_BASE - 4);
    buddyPrint(".");
  }
}

// ─── BUSY ───  heads-down, hammering keys, data streaming
static void doBusy(uint32_t t) {
  static const char* const TYPE_A[5] = { "    _o_    ", "   /___\\   ", "  -[> <]-  ", "   |[#]|   ", "  _/| |\\_  " };
  static const char* const TYPE_B[5] = { "    _o_    ", "   /___\\   ", "  -[> <]-  ", "  _|[#]|_  ", "   /| |\\   " };
  static const char* const FOCUS[5]  = { "    _o_    ", "   /___\\   ", "  -[- -]-  ", "   |[#]|   ", "   /| |\\   " };
  static const char* const NOD[5]    = { "    _o_    ", "   /___\\   ", "  -[o o]=  ", "   |[#]|   ", "   /| |\\   " };
  static const char* const SIP[5]    = { "    _o_  c ", "   /___\\_| ", "  -[o o]   ", "   |[#]|   ", "   /| |\\   " };

  const char* const* P[5] = { TYPE_A, TYPE_B, FOCUS, NOD, SIP };
  static const uint8_t SEQ[] = {
    0,1,0,1,0,1, 2,2, 0,1,0,1, 3,3, 0,1,0,1, 4,4,4, 2
  };
  uint8_t beat = (t / 4) % sizeof(SEQ);
  buddyPrintSprite(P[SEQ[beat]], 5, 0, CHROME);

  reactor(((t / 2) & 1) ? 0xFD20 : 0xFB80);  // amber working core

  // code/data bits streaming beside the body
  static const char* const BITS[] = { "1 ", "01", "10", "0 ", "11", "1 " };
  buddySetColor(BUDDY_GREEN);
  buddySetCursor(BUDDY_X_CENTER + 22, BUDDY_Y_OVERLAY + 12);
  buddyPrint(BITS[t % 6]);
  buddySetColor(0x0540);
  buddySetCursor(BUDDY_X_CENTER + 22, BUDDY_Y_OVERLAY + 20);
  buddyPrint(BITS[(t + 3) % 6]);
}

// ─── ATTENTION ───  impatient: checks a wrist-watch, taps foot, frowns
static void doAttention(uint32_t t) {
  static const char* const ALERT[5]  = { "    [!]     ", "   /___\\    ", "  -[O O]-   ", "   |[#]|    ", "   /| |\\    " };
  static const char* const WATCH[5]  = { "    _o_     ", "   /___\\    ", "  -[O O]@   ", "   |[#]@    ", "   /| |\\    " };  // looking at wrist watch
  static const char* const WATCH2[5] = { "    _o_     ", "   /___\\    ", "  -[- -]o   ", "   |[#]@    ", "   /| |\\    " };  // tapping watch face
  static const char* const TAP_A[5]  = { "    _o_     ", "   /___\\    ", "  -[O O]-   ", "   |[#]|    ", "   /| |/    " };  // foot tap
  static const char* const TAP_B[5]  = { "    _o_     ", "   /___\\    ", "  -[O O]-   ", "   |[#]|    ", "   /| |\\_   " };
  static const char* const HUFF[5]   = { "   ~_o_~    ", "   /___\\    ", "  -[> <]-   ", "   |[#]|    ", "   /| |\\    " };  // frown / huff

  const char* const* P[6] = { ALERT, WATCH, WATCH2, TAP_A, TAP_B, HUFF };
  static const uint8_t SEQ[] = {
    0,0, 1,1,2,1, 0, 3,4,3,4, 0, 5,5, 1,2,1, 3,4, 0
  };
  uint8_t beat = (t / 4) % sizeof(SEQ);
  uint8_t pose = SEQ[beat];
  int xOff = (pose == 0) ? ((t & 1) ? 1 : -1) : 0;   // jitter on the alert pose
  buddyPrintSprite(P[pose], 5, 0, CHROME, xOff);

  reactor(((t / 2) & 1) ? BUDDY_RED : 0xC800);   // red impatient core

  // pulsing exclamation + warning antenna
  if ((t / 2) & 1) {
    buddySetColor(BUDDY_YEL);
    buddySetCursor(BUDDY_X_CENTER - 1, BUDDY_Y_OVERLAY);
    buddyPrint("!");
  }
  if ((t / 3) & 1) {
    buddySetColor(BUDDY_RED);
    buddySetCursor(BUDDY_X_CENTER - 1, BUDDY_Y_BASE - 4);
    buddyPrint("*");
  }
  // little "tick tick" marks when checking the watch
  if (pose == 1 || pose == 2) {
    buddySetColor(BUDDY_YEL);
    buddySetCursor(BUDDY_X_CENTER + 18, BUDDY_Y_OVERLAY + 8 + ((t & 1) ? 0 : 2));
    buddyPrint(((t / 2) & 1) ? "'" : ".");
  }
}

// ─── CELEBRATE ───  arms up, hops, sparks fly
static void doCelebrate(uint32_t t) {
  static const char* const CROUCH[5] = { "    _o_    ", "   /___\\   ", "  -[^ ^]-  ", "   |[#]|   ", "  _/| |\\_  " };
  static const char* const JUMP[5]   = { " \\  _o_  / ", "  \\/___\\/  ", "   [O O]   ", "   |[#]|   ", "   /| |\\   " };
  static const char* const PEAK[5]   = { " \\| _*_ |/ ", "  \\/___\\/  ", "   [^ ^]   ", "   |[#]|   ", "   / | \\   " };
  static const char* const SPINL[5]  = { "  \\ _o_    ", "   /___\\   ", "  =[< <]-  ", "   |[#]|   ", "   /| |\\   " };
  static const char* const SPINR[5]  = { "    _o_ /  ", "   /___\\   ", "  -[> >]=  ", "   |[#]|   ", "   /| |\\   " };

  const char* const* P[5] = { CROUCH, JUMP, PEAK, SPINL, SPINR };
  static const uint8_t SEQ[] = { 0,1,2,1,0, 3,4,3,4, 0,1,2,1,0 };
  static const int8_t Y_SHIFT[] = { 0,-4,-7,-4,0, 0,0,0,0, 0,-4,-7,-4,0 };
  uint8_t beat = (t / 3) % sizeof(SEQ);
  buddyPrintSprite(P[SEQ[beat]], 5, Y_SHIFT[beat], CHROME);

  reactor(BUDDY_YEL, Y_SHIFT[beat]);

  // sparks shooting out
  static const uint16_t cols[] = { BUDDY_YEL, VISOR, BUDDY_GREEN, BUDDY_WHITE, BUDDY_PURPLE };
  for (int i = 0; i < 6; i++) {
    int phase = (t * 2 + i * 11) % 22;
    int x = BUDDY_X_CENTER - 34 + i * 13;
    int y = BUDDY_Y_OVERLAY - 6 + phase;
    if (y > BUDDY_Y_BASE + 18 || y < 0) continue;
    buddySetColor(cols[i % 5]);
    buddySetCursor(x, y);
    buddyPrint((i + (int)(t / 2)) & 1 ? "+" : "*");
  }
}

// ─── DIZZY ───  confused, wobbling, spiral eyes, "?" orbit
static void doDizzy(uint32_t t) {
  static const char* const TILTL[5]  = { "   _o_     ", "  /___\\    ", " -[@ x]-   ", "  |[?]|    ", "  /| |\\    " };
  static const char* const TILTR[5]  = { "     _o_   ", "    /___\\  ", "   -[x @]- ", "    |[?]|  ", "    /| |\\  " };
  static const char* const GLITCH[5] = { "    _o_    ", "   /~~~\\   ", "  -[x @]-  ", "   |[v]|   ", "   /\\ /\\   " };
  static const char* const GLITCH2[5]= { "    _o_    ", "   /~~~\\   ", "  -[@ x]-  ", "   |[v]|   ", "   /\\ /\\   " };
  static const char* const SCRATCH[5]= { "    _o_ ?  ", "   /___\\_  ", "  -[. .]   ", "   |[?]|   ", "   /| |\\   " };  // head scratch

  const char* const* P[5] = { TILTL, TILTR, GLITCH, GLITCH2, SCRATCH };
  static const uint8_t SEQ[] = { 0,1,0,1, 2,3, 0,1,0,1, 4,4, 2,3 };
  static const int8_t X_SHIFT[] = { -3,3,-3,3, 0,0, -3,3,-3,3, 0,0, 0,0 };
  uint8_t beat = (t / 4) % sizeof(SEQ);
  buddyPrintSprite(P[SEQ[beat]], 5, 0, CHROME, X_SHIFT[beat]);

  reactor(((t / 2) & 1) ? BUDDY_PURPLE : 0x500F);

  // orbiting confusion marks
  static const int8_t OX[] = { 0, 5, 7, 5, 0, -5, -7, -5 };
  static const int8_t OY[] = { -5, -3, 0, 3, 5, 3, 0, -3 };
  uint8_t p1 = t % 8, p2 = (t + 4) % 8;
  buddySetColor(BUDDY_YEL);
  buddySetCursor(BUDDY_X_CENTER + OX[p1] - 2, BUDDY_Y_OVERLAY + 4 + OY[p1]);
  buddyPrint("?");
  buddySetColor(VISOR);
  buddySetCursor(BUDDY_X_CENTER + OX[p2] - 2, BUDDY_Y_OVERLAY + 4 + OY[p2]);
  buddyPrint("*");
}

// ─── HEART ───  warm, hand on reactor, hearts rising
static void doHeart(uint32_t t) {
  static const char* const WARM[5]   = { "    _o_    ", "   /___\\   ", "  -[^ ^]-  ", "   |[v]|   ", "   /| |\\   " };
  static const char* const BLUSH[5]  = { "    _o_    ", "   /___\\   ", "  -[* *]-  ", "   |[v]|   ", "   /| |\\   " };
  static const char* const HOLD[5]   = { "    _o_    ", "   /___\\   ", "  -[^ ^]   ", "   |[v]\\   ", "   /| |\\   " };  // hand to chest
  static const char* const EYESC[5]  = { "    _o_    ", "   /___\\   ", "  -[v v]-  ", "   |[v]|   ", "   /| |\\   " };
  static const char* const SIGH[5]   = { "    _o_    ", "   /___\\   ", "  -[- -]-  ", "   |[v]|   ", "   /|_|\\   " };

  const char* const* P[5] = { WARM, BLUSH, HOLD, EYESC, SIGH };
  static const uint8_t SEQ[] = { 0,0,1,0, 2,2,0, 1,0,4, 0,0,3,3, 0,1,0,2, 1,0 };
  static const int8_t Y_BOB[] = { 0,-1,0,-1, 0,-1,0, -1,0,0, -1,0,0,0, -1,0,-1,0, -1,0 };
  uint8_t beat = (t / 5) % sizeof(SEQ);
  buddyPrintSprite(P[SEQ[beat]], 5, Y_BOB[beat], CHROME);

  reactor(BUDDY_HEART, Y_BOB[beat]);

  buddySetColor(BUDDY_HEART);
  for (int i = 0; i < 5; i++) {
    int phase = (t + i * 4) % 16;
    int y = BUDDY_Y_OVERLAY + 14 - phase;
    if (y < -2 || y > BUDDY_Y_BASE) continue;
    int x = BUDDY_X_CENTER - 18 + i * 8 + ((phase / 3) & 1) * 2 - 1;
    buddySetCursor(x, y);
    buddyPrint("v");
  }
}

}  // namespace edydroid

extern const Species EDYDROID_SPECIES = {
  "edydroid",
  0x9CD3,
  { edydroid::doSleep, edydroid::doIdle, edydroid::doBusy, edydroid::doAttention,
    edydroid::doCelebrate, edydroid::doDizzy, edydroid::doHeart }
};
