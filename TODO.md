# Fix: Missing Department/College/Description Text & Company Logo on Certificates

## Root Causes
1. Template mode in `certGenerator.js` only maps/draws `studentName`, `courseName`, `dateOfIssue`, `place`, `ceoName`, `ceoTitle`, `certNumber`. The `department`, `college`, `description`, and `registrationId` fields are never drawn.
2. The company logo (`logoDataUrl`) is only rendered in built-in design mode, never in template mode.
3. `DEFAULT_TEXT_ELEMENTS` in `storage.js` has no entries for the missing fields or the logo, so there are no positions to place them.
4. The certificate title was not customizable per batch in the Generate page.
5. The certificate format needed an "at {Company Name}" line and Registration ID from text boxes.
6. Dropdown `<select>` menus had invisible options (white on white).

## Plan / Steps
- [x] 1. `src/utils/storage.js` — Add `department`, `college`, `description`, `registrationId`, `logo` to `DEFAULT_TEXT_ELEMENTS` with sensible default positions/sizes.
- [x] 2. `src/utils/storage.js` — Enhance `migrateTypes()` to backfill the new elements into already-saved certificate types in localStorage.
- [x] 3. `src/utils/certGenerator.js` — Add the missing fields to the template-mode `dataMap`.
- [x] 4. `src/utils/certGenerator.js` — Add logo rendering in template mode (using the `logo` element position + height, with top-center fallback).
- [x] 5. `src/utils/certGenerator.js` — Update the inline fallback elements array to include the new fields/logo.
- [x] 6. `src/pages/Templates.jsx` — Add sample preview values for `department`, `college`, `description`, `registrationId` and pass them to the live preview.
- [x] 7. `src/pages/Templates.jsx` — Add special handling in `TextElementRow` for the `logo` element (Height control instead of font controls).
- [x] 8. `src/utils/certGenerator.js` + `storage.js` — Add `certTitle` as a text element (custom title drawn on certificate).
- [x] 9. `src/pages/Generate.jsx` — Add Certificate Title input field; pass custom title through preview & generation; store in history.
- [x] 10. `src/utils/certGenerator.js` + `storage.js` + `Generate.jsx` + `Templates.jsx` — Add `companyName` field drawn as "at {Company Name}".
- [x] 11. `src/index.css` — Fix invisible dropdown options (dark background + readable text).
- [x] 12. Verify — Confirm the app builds (✓ 713ms) and the fixes work in the browser.
- [x] 13. Add static default lines as customizable text elements: `introLine` ("This is to certify that"), `completedLine` ("has successfully completed the"), and prefix "from …", "at …", "Registration ID:" — so textbox values stay empty by default and are printed only when filled. Built-in design updated to match (removed trailing comma after department).
- [x] 14. Delete template — Fix invisible delete (trash) button on template cards (missing `group` class) and add a confirmation dialog (`DeleteModal`) so templates can be safely deleted when needed.
- [x] 15. README + .gitignore — Fully updated README documentation; `TODO.md` added to `.gitignore`.
- [x] 16. Logo / CertStudio navigation — Sidebar logo, mobile top bar brand, and footer brand now link to the Dashboard (`/`) with hover effects; mobile drawer closes on navigation.
- [x] 17. Preloader responsive — Icon badge, title, tagline, progress bar, orbs, and watermark now scale responsively across mobile/tablet/desktop (removed non-existent `xs:` breakpoint, added `sm:`/`md:` variants, `whitespace-nowrap`, max-width progress bar, centered watermark).
- [x] 18. Preloader full-screen fix — The `#root > * { position: relative; z-index: 1; }` CSS rule (specificity 1-0-0) was overriding Tailwind's `.fixed` (0-1-0), collapsing the preloader to content height. Added inline `position: fixed; top/right/bottom/left: 0; zIndex: 100` which always wins over stylesheet rules.



