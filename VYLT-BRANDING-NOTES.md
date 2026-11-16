# VYLT branding and theme launcher icons

- Visible app name: VYLT.
- Supplied purple secure-media-folder artwork is the source design for the launcher icon family.
- Six launcher icon variants are generated for Midnight Gold, Crimson Noir, Deep Ocean, Forest, Neon Violet, and Paper Light.
- Android launcher activity aliases allow the app to enable the icon matching the selected theme.
- Theme selection in Settings updates both the in-app theme and the Android launcher icon.
- The default launcher alias is Neon Violet, matching the supplied purple artwork until the saved theme is loaded and applied.

The Android application ID remains `com.filevault.app` to preserve update compatibility. Native plugin identifiers and existing local data identifiers are unchanged.

Important Android behavior: launcher icon changes are applied through Android package component aliases. Some launchers may take a short time to refresh the icon or may display a duplicate/old shortcut until their cache refreshes. This implementation must be verified on the target Android device and launcher.

No Android APK build or device test has been run in this environment.


## Backup restore responsiveness update

The Settings backup restore flow now shows a progress overlay, validates the backup before applying changes, writes lyrics in a single IndexedDB transaction instead of one transaction per lyric, yields between restore phases so the WebView can repaint, refreshes the CineVault shelf and the visible app screen, and refreshes in-memory Reader/music/watch-history caches. A duplicate restore is prevented while one is already running. Errors close the progress overlay and show a failure message.

The backup continues to contain VYLT's organization and progress metadata, not original media files. This update has passed JavaScript syntax checks; it has not yet been built into an APK or tested on a physical Android device.
