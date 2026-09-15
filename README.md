# CertStudio 🎓

A modern, full-featured **bulk certificate generator** built with React + Vite. Upload a certificate template (or use the built-in design), configure every text field's position & styling, import student names from Excel/CSV, and generate a ZIP of personalized, high-resolution certificate PNGs.

---

## ✨ Features

- 🖼️ **Custom Template Support** — Upload your own certificate design (PNG/JPG) and type text directly on top of it.
- 📐 **Per-Field Positioning** — Move/resize/style every text field (X/Y %, font family, size, bold, italic, color, alignment) with a live canvas preview.
- 🎓 **Smart Certificate Format** — Automatically renders:
  - Customizable certificate title
  - Static "This is to certify that" line
  - Student name (from Excel/CSV)
  - `from {Department}` (only when filled)
  - `{College / Institution}`
  - Static "has successfully completed the" line
  - `{Course / Internship Name}`
  - `{Description / Program Details}`
  - `at {Company Name}` (only when filled)
  - `Registration ID: {...}` (only when filled)
- 📊 **Excel/CSV Import** — Auto-detects the name column; choose a different column if needed.
- 🏢 **Company Logo** — Renders your logo on both custom templates and the built-in design.
- ✍️ **Signature & Seal** — CEO signature + extra seal/stamp placement.
- 🔢 **Auto Numbering** — Configurable cert-number prefix + start value.
- 🗂️ **History & Stats** — Track how many certificates you've generated, by category and over time.
- 💾 **Local Persistence** — Everything is stored in `localStorage` (no backend required).

---

## 🚀 Getting Started

### Prerequisites

- Node.js **18+** (recommended 20+)
- npm (or yarn/pnpm/bun)

### Install

```bash
# Clone / navigate into the project
cd certstudio/client

# Install dependencies
npm install
```

### Run in development

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
```

Output is written to `dist/`. Preview the production build with:

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 🧭 How to Use

### 1. Create a Certificate Type

Go to **Templates → New Type**:

1. **Basic Info** — Set the type name, category (Internship / Industrial Visit / Course / Other), and default certificate title.
2. **Certificate Template** — Upload your certificate image (PNG/JPG/WebP/BMP). If you skip this, the built-in Inker Robotics design is used.
3. **Text Fields** — Expand each field to configure:
   - Position (X/Y as % of canvas)
   - Font family & size
   - Bold / Italic / Alignment / Color
   - Enable/disable (eye icon)
4. **CEO / Authority** — CEO name and title shown in the signature area.
5. **Certificate Numbering** — Prefix (e.g. `INK/26-06/`) and starting number.
6. **Branding Assets** — Upload your **Company Logo** and **CEO Signature**.
7. Watch the **live preview** update as you position the fields, then **Save**.

> Existing certificate types are automatically migrated when new text fields are added — no need to recreate them.

### 2. Generate a Batch

Go to **Generate**:

1. **Select Type** — Pick the certificate type you created.
2. **Upload Excel** — Drop an `.xlsx`, `.xls`, or `.csv` file with student names. The first row is treated as headers; the name column is auto-detected.
3. **Certificate Content** — Fill in the values you want on every certificate:
   - Certificate Title (optional — overrides the type default)
   - Department (renders as `from {department}`)
   - College / Institution Name
   - Course / Internship Name *(required)*
   - Description / Program Details
   - Company Name (renders as `at {company name}`)
   - Registration ID (renders as `Registration ID: {...}`)
   - Date of Issue & Place
   - Cert Number start & Extra Seal/Stamp
   - Any field left **blank** is simply omitted from the certificate.
4. **Generate** — The app renders each certificate and downloads a ZIP (each file named `CertNumber_StudentName_certificate.png`).

---

## 🗂️ Project Structure

```
client/
├── public/                    # Static assets (bg images, banner, etc.)
├── src/
│   ├── components/
│   │   ├── FileUploadZone.jsx # Drag & drop file uploader
│   │   ├── Preloader.jsx      # Loading screen
│   │   └── Sidebar.jsx        # Navigation sidebar
│   ├── context/
│   │   └── AppContext.jsx     # Global state (cert types, history, stats)
│   ├── pages/
│   │   ├── Dashboard.jsx      # Stats overview
│   │   ├── Templates.jsx      # Create/edit certificate types
│   │   ├── Generate.jsx       # Bulk certificate generation
│   │   ├── History.jsx        # Past generation history
│   │   └── Settings.jsx       # App settings
│   ├── utils/
│   │   ├── certGenerator.js   # Canvas certificate rendering engine
│   │   ├── excelParser.js     # Excel/CSV parsing & name detection
│   │   └── storage.js         # localStorage persistence + defaults
│   ├── App.jsx                # Root layout + routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles (dark theme, animations)
├── index.html
├── package.json
└── vite.config.js
```

---

## 🧩 Key Concepts

### Text Elements

Every piece of text (and the logo) is a **text element** with `id`, `label`, position (X/Y %), `fontSize`, `fontFamily`, `bold`, `italic`, `color`, `align`, and `enabled`. Elements are stored per certificate type and rendered on the canvas in order.

Default elements:

| id               | Description                                  |
| ---------------- | -------------------------------------------- |
| `certTitle`      | Certificate title (script font)              |
| `introLine`      | "This is to certify that"                    |
| `studentName`    | Student name (from Excel/CSV)                |
| `department`     | "from {Department}"                          |
| `college`        | College / Institution                        |
| `completedLine`  | "has successfully completed the"             |
| `courseName`     | Course / Program name                        |
| `description`    | Description / Program details                |
| `companyName`    | "at {Company Name}"                          |
| `registrationId` | "Registration ID: {…}"                       |
| `dateOfIssue`    | Date of issue                                |
| `place`          | Place                                        |
| `ceoName`        | CEO name                                     |
| `ceoTitle`       | CEO title                                    |
| `certNumber`     | Certificate number                           |
| `logo`           | Company logo image (height controlled)       |

### Canvas

- Rendering resolution: **1120 × 793 px**.
- Text positions are stored as percentages so they scale consistently.
- The uploaded template is drawn as the background; text/logo/signature are overlaid on top.
- The built-in design draws an Inker Robotics–style border, watermark, title, body content, signature line, and date/place row.

---

## 🛠️ Tech Stack

- **React 19** — UI framework
- **Vite 8** — Build tool & dev server
- **Tailwind CSS 4** — Styling (via `@tailwindcss/vite`)
- **Framer Motion** — Animations
- **React Router 7** — Routing
- **lucide-react** — Icons
- **xlsx** — Excel parsing
- **JSZip + file-saver** — ZIP packaging & download
- **react-hot-toast** — Notifications
- **react-dropzone** — File uploads
- **recharts** — Dashboard charts
- **Oxlint** — Linting

---

## 📝 License

© 2026 **Allen Sunil Mathew** · All rights reserved.

