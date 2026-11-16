# Changelog

## VYLT 3.0.2 – Backup and restore safety

- Ask on every restore whether to Merge, Replace, or Cancel.
- Create a timestamped safety backup before applying a restore.
- Validate the backup structure before modifying app data.
- Improve Merge behavior for albums, nested folders, tags, favorites, file tags, lyrics, progress, Reader collections, and CineVault entries.
- Add rollback from the pre-restore snapshot when a restore operation fails.
- Rename new backup exports and their destination folder to VYLT while preserving the existing `FileVaultLocal` IndexedDB database name and Android application ID.
- Document backup contents, restore modes, compatibility, and remaining test requirements.

## 3.0.2 – Restore refresh and theme launcher icon fixes
- Refresh restored Reader, playback, CineVault, and organization caches in memory before redrawing the active page; open refreshable sheets are also refreshed.
- Preserve unrelated in-memory modules when importing a CineVault-only backup.
- Report launcher icon switching failures instead of silently swallowing them; confirm Android plugin success before reporting an icon update.
- Set the Gold theme alias as the initial Android launcher alias, matching VYLT's default theme.
- Keep the existing package ID and IndexedDB database unchanged.
