# VYLT restore refresh and launcher icon fix – validation

## Changes
- Rebinds long-lived in-memory state after restore for Reader progress/folders/bookmarks/categories, playback and watch history, equalizer settings, and CineVault shelf/artwork/movie records.
- Reloads CineVault records from IndexedDB and redraws the active tab, mini-player, selection bar, and an open refreshable sheet.
- Keeps unrelated module caches intact during CineVault-only imports.
- Reports launcher icon switch failures to the user rather than silently ignoring them.
- Makes the Gold launcher alias the initial enabled alias, consistent with the default Gold theme.
- Rewrites generated VYLT activity aliases on every prepare script run, so an existing generated manifest can receive updated alias defaults.

## Checks performed
- `node --check` passed for all files in `www/js/` and `scripts/`.
- Static checks confirmed all six launcher aliases, Gold as default, and the in-memory refresh hooks.
- Package ID remains `com.filevault.app`; IndexedDB remains `FileVaultLocal` version 3.

## Not performed
- Android Gradle build was not run: this source archive does not include a generated `android/` directory or installed `node_modules/`.
- No physical-device test was performed. The final launcher icon behavior must be verified on the rebuilt APK and the device launcher.
