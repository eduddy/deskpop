#pragma once

// stats.h is header-only with file-static state and may only be included from
// main.cpp. Modules that need a single setting (net_buddy needs the "wifi"
// toggle) read it through this thin accessor, which main.cpp defines.
bool netSettingWifiOn();
