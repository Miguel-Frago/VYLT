# VYLT branding update

This source package changes the visible app name to VYLT, uses the supplied purple secure-media-folder image as the primary Capacitor app icon, and removes the standalone Accent Color settings card so each built-in theme controls its own accent color.

The Android application ID remains `com.filevault.app` to preserve upgrade compatibility with existing installs. Native plugin identifiers, IndexedDB names, and backup compatibility identifiers are intentionally retained.

The theme-linked Android launcher icon switching is not yet wired to Android launcher aliases in this package. The supplied image is the default launcher icon; theme-dependent launcher icon switching needs a separate native Android implementation and device testing.

No Android build or device test has been run in this environment.
