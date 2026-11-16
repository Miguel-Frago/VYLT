# Changelog

## VYLT 3.0.2 – Backup and restore safety

- Ask on every restore whether to Merge, Replace, or Cancel.
- Create a timestamped safety backup before applying a restore.
- Validate the backup structure before modifying app data.
- Improve Merge behavior for albums, nested folders, tags, favorites, file tags, lyrics, progress, Reader collections, and CineVault entries.
- Add rollback from the pre-restore snapshot when a restore operation fails.
- Rename new backup exports and their destination folder to VYLT while preserving the existing `FileVaultLocal` IndexedDB database name and Android application ID.
- Document backup contents, restore modes, compatibility, and remaining test requirements.

## VYLT testing update — 2026-11-16
- Added optional PIN locks for individual albums and nested subfolders. PINs are confirmed on setup and only a SHA-256 hash is stored; the lock is an in-app privacy barrier, not encryption of the original files.
- Added a Custom Theme Editor for accent, background, card, and text colors, with device-local persistence and reset controls.
- Applied custom theme settings during startup and cleared custom overrides when switching preset themes.
- Mirrored updated runtime scripts into `www/js`, which is the script directory loaded by the Android WebView.
