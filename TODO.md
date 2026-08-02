# Fix: Missing Department/College/Description Text & Company Logo on Certificates

## Root Causes
1. Template mode in `certGenerator.js` only maps/draws `studentName`, `courseName`, `dateOfIssue`, `place`, `ceoName`, `ceoTitle`, `certNumber`. The `department`, `college`, `description`, and `registrationId` fields are never drawn.
2. The company logo (`logoDataUrl`) is only rendered in built-in design mode, never in template mode.
3. `DEFAULT_TEXT_ELEMENTS` in `storage.js` has no entries for the missing fields or the logo, so there are no positions to place them.

## Plan / Steps
- [x] 1. `src/utils/storage.js` — Add `department`, `college`, `description`, `registrationId`, `logo` to `DEFAULT_TEXT_ELEMENTS` with sensible default positions/sizes.
- [x] 2. `src/utils/storage.js` — Enhance `migrateTypes()` to backfill the new elements into already-saved certificate types in localStorage.
- [x] 3. `src/utils/certGenerator.js` — Add the missing fields to the template-mode `dataMap`.
- [x] 4. `src/utils/certGenerator.js` — Add logo rendering in template mode (using the `logo` element position + height, with top-center fallback).
- [x] 5. `src/utils/certGenerator.js` — Update the inline fallback elements array to include the new fields/logo.
- [x] 6. `src/pages/Templates.jsx` — Add sample preview values for `department`, `college`, `description`, `registrationId` and pass them to the live preview.
- [x] 7. `src/pages/Templates.jsx` — Add special handling in `TextElementRow` for the `logo` element (Height control instead of font controls).
- [x] 8. Verify — Confirm the app builds and the fixes work in the browser.

