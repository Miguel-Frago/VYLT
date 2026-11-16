# VYLT Backup and Restore

## Backup contents

VYLT exports its organization metadata and app-managed information: albums and nested folders, tags, favorites, file-tag assignments, lyrics, video resume/watch state, Reader collections/progress/bookmarks, music/watch history, equalizer settings, and CineVault metadata/artwork/subtitles. The backup does not contain the user's original media or document files; file paths are references to files on the device.

## Restore choices

Every restore asks the user to choose:

- **Merge:** keep current matching records and add items that are missing from the backup. Lists such as tags, favorites, and file paths are unioned. Existing keyed progress/settings and CineVault records are preferred where a matching record already exists.
- **Replace:** replace the organization data represented by the backup. A confirmation is required because current records may be removed. Data not represented in older/partial backups is not automatically inferred or deleted.
- **Cancel:** make no changes.

Before applying either mode, VYLT creates a timestamped safety backup. On Android it is saved under `Documents/VYLT/Pre-restore-<timestamp>.json`; in a browser it is downloaded as `VYLT-pre-restore-<timestamp>.json`.

If an error occurs after restoration begins, VYLT attempts to restore the in-memory pre-restore snapshot. Keep the separately created safety backup until the restored library has been checked.

## Compatibility and limitations

- The IndexedDB database remains named `FileVaultLocal` to preserve existing installations.
- New exports identify themselves as `vylt` and use schema marker `v: 3`; older full FileVault/VYLT exports are still recognized by their data structure.
- Older CineVault-only exports can still be imported.
- Backup paths refer to files on the original device. Restoring on another device does not copy those original files or guarantee that paths resolve.
- This implementation has passed JavaScript syntax checks. A full Android build and on-device restore/rollback tests remain required before release.
