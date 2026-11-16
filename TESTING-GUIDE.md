# VYLT — User Testing Guide

This package is a testing build, not a release certification. Please test on a copy of your data where possible and keep your current backup file until the tests pass.

## 1. Install and preserve data
1. Build the APK from this project using the existing Android build workflow.
2. Install it as an update over the existing VYLT installation. Do not uninstall the old app or clear its storage.
3. Confirm the Library, Albums, CineVault, Reader, Settings, and music library still open.

## 2. Backup and restore
1. Open Settings → Backup & restore → Save backup.
2. Confirm the floating success notification appears and disappears after about 5 seconds.
3. Create a test album and a test CineVault entry, then save another backup.
4. Restore that backup using Merge; confirm the test data is present and existing data remains.
5. Restore the same backup using Replace only after saving a separate safety backup; confirm the data represented by the backup is restored.
6. Keep the safety backup until all restored screens have been checked.

## 3. Individual album and subfolder locks
1. Create a test album.
2. Open its ⋮ menu → Lock this album.
3. Set and confirm a 4–12 digit PIN.
4. Return to Albums and open the locked album; confirm it asks for the PIN.
5. Enter a wrong PIN; confirm access is denied. Enter the correct PIN; confirm the album opens.
6. Open the album, create a nested subfolder, then lock that subfolder from its ⋮ menu.
7. Confirm opening the subfolder requires its PIN, while the parent album remains accessible.
8. Remove each lock from its menu after verifying it.
9. Save a backup and confirm the collection lock state survives a restore to a test install. Do not forget the PIN: this build has no separate recovery flow for collection PINs.

## 4. Custom Theme Editor
1. Open Settings → Theme → Customize theme.
2. Change accent, background, card, and text colors; confirm the preview updates immediately.
3. Save, close Settings, navigate to other tabs, and reopen the app; confirm the custom colors persist.
4. Select one of the six preset themes; confirm the custom overrides clear and the preset is applied.
5. Open Customize theme again, change colors, then use Reset custom theme in Settings; confirm the preset returns.

## 5. Existing feature regression checks
- Music: play a track, lock the screen, use notification play/pause/next, and check background playback.
- Reader: open an EPUB, TXT, PDF, and CBZ; check bookmarks and resume position. A genuine RAR-compressed CBR is still not supported by this build; ZIP-based `.cbr` files may open.
- Albums: add and remove files, create nested folders, change covers, and confirm original files are not moved or deleted.
- CineVault: add a watchlist item, set watched status, and verify history/resume behavior.
- App lock: verify pattern lock and biometric unlock (if enrolled and available).
- Search and storage: search for a known file/movie/book and compare the storage dashboard with the indexed library.

## 6. Report problems
For each issue, send the tab, exact steps, expected result, actual result, and a screenshot or screen recording. Do not include your PIN or recovery word.

## Known limitations in this testing package
- Collection PIN locks are app-level access gates, not encryption; someone with direct access to the app database or device files may bypass them.
- Genuine RAR/ RAR5 archive extraction is not implemented. `.cbr` works only when its contents are ZIP-compatible.
- A real Android APK build and physical-device regression tests must still be completed in the Android build environment.
