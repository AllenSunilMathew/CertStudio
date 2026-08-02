\
const KEYS = {
  TYPES:   'certstudio_types',
  HISTORY: 'certstudio_history',
};

function read(key) {
  try { return JSON.parse(localStorage.getItem(key)) || []; }
  catch { return []; }
}
function write(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ── Default text element layout (positions as % of canvas W/H) ───────────────
export const DEFAULT_TEXT_ELEMENTS = [
  { id: 'certTitle',     label: 'Certificate Title',        x: 50, y: 20, fontSize: 40, fontFamily: 'Dancing Script', bold: true,  italic: true,  color: '#1B3264', align: 'center', enabled: true },
  { id: 'introLine',     label: 'Intro Line (This is to certify that)', x: 50, y: 28, fontSize: 18, fontFamily: 'Inter', bold: false, italic: false, color: '#333333', align: 'center', enabled: true },
  { id: 'studentName',   label: 'Student Name',             x: 50, y: 36, fontSize: 38, fontFamily: 'Inter', bold: true,  italic: false, color: '#1B3264', align: 'center', enabled: true },
  { id: 'department',    label: 'Department (from …)',      x: 50, y: 44, fontSize: 18, fontFamily: 'Inter', bold: false, italic: false, color: '#444444', align: 'center', enabled: true },
  { id: 'college',       label: 'College / Institution',    x: 50, y: 50, fontSize: 18, fontFamily: 'Inter', bold: true,  italic: false, color: '#333333', align: 'center', enabled: true },
  { id: 'completedLine', label: 'Completed Line (has successfully completed the)', x: 50, y: 56, fontSize: 18, fontFamily: 'Inter', bold: false, italic: false, color: '#333333', align: 'center', enabled: true },
  { id: 'courseName',    label: 'Course / Program',         x: 50, y: 62, fontSize: 26, fontFamily: 'Inter', bold: true,  italic: false, color: '#1B3264', align: 'center', enabled: true },
  { id: 'description',   label: 'Description / Program Details', x: 50, y: 68, fontSize: 16, fontFamily: 'Inter', bold: false, italic: false, color: '#444444', align: 'center', enabled: true },
  { id: 'companyName',   label: 'Company Name (at …)',      x: 50, y: 74, fontSize: 18, fontFamily: 'Inter', bold: true,  italic: false, color: '#333333', align: 'center', enabled: true },
  { id: 'registrationId', label: 'Registration ID',         x: 10, y: 80, fontSize: 14, fontFamily: 'Inter', bold: false, italic: false, color: '#555555', align: 'left',   enabled: true },
  { id: 'dateOfIssue',   label: 'Date of Issue',            x: 10, y: 83, fontSize: 14, fontFamily: 'Inter', bold: false, italic: false, color: '#1B3264', align: 'left',   enabled: true },
  { id: 'place',         label: 'Place',                    x: 90, y: 83, fontSize: 14, fontFamily: 'Inter', bold: false, italic: false, color: '#1B3264', align: 'right',  enabled: true },
  { id: 'ceoName',       label: 'CEO Name',                 x: 50, y: 88, fontSize: 15, fontFamily: 'Inter', bold: true,  italic: false, color: '#1B3264', align: 'center', enabled: true },
  { id: 'ceoTitle',      label: 'CEO Title',                x: 50, y: 93, fontSize: 13, fontFamily: 'Inter', bold: false, italic: false, color: '#555555', align: 'center', enabled: true },
  { id: 'certNumber',    label: 'Cert Number',              x: 88, y:  6, fontSize: 13, fontFamily: 'Inter', bold: true,  italic: false, color: '#1B3264', align: 'right',  enabled: true },
  { id: 'logo',          label: 'Company Logo',             x: 50, y:  7, fontSize: 48, fontFamily: 'Inter', bold: false, italic: false, color: '#000000', align: 'center', enabled: true },
];

/** One-time migration: backfill textElements into types saved before this feature existed */
function migrateTypes() {
  try {
    const raw = localStorage.getItem('certstudio_types');
    if (!raw) return;
    const types = JSON.parse(raw);
    let changed = false;
    const migrated = types.map(t => {
      // Case 1: type has no textElements at all — give it the full default set
      if (!Array.isArray(t.textElements) || t.textElements.length === 0) {
        changed = true;
        return { ...t, textElements: DEFAULT_TEXT_ELEMENTS };
      }
      // Case 2: type has an old textElements array — backfill any newly-added ids
      const have  = new Set(t.textElements.map(e => e.id));
      const missing = DEFAULT_TEXT_ELEMENTS.filter(e => !have.has(e.id));
      if (missing.length > 0) {
        changed = true;
        return { ...t, textElements: [...t.textElements, ...missing.map(e => ({ ...e }))] };
      }
      return t;
    });
    if (changed) localStorage.setItem('certstudio_types', JSON.stringify(migrated));
  } catch (_) {}
}
migrateTypes(); // runs once when this module is first imported

// ── Certificate Types ─────────────────────────────────────────────────────────
export const typesStore = {
  list() { return read(KEYS.TYPES); },
  get(id) { return this.list().find(t => t.id === id) || null; },

  create(data) {
    const types = this.list();
    const t = {
      id:                uid(),
      name:              data.name               || 'Unnamed',
      description:       data.description        || '',
      category:          data.category           || 'other',
      // ── Uploaded certificate template (background image) ──────────────────
      templateDataUrl:   data.templateDataUrl    || null,
      templateFileName:  data.templateFileName   || null,
      // ── Per-field text element config (font, size, position, color) ────────
      textElements:      data.textElements       || DEFAULT_TEXT_ELEMENTS,
      // ── Certificate design settings ──────────────────────────────────────────
      certTitle:         data.certTitle          || 'Certificate',
      ceoName:           data.ceoName            || 'Mr. Amit Raman',
      ceoTitle:          data.ceoTitle           || 'CEO, Inker Robotics',
      registrationId:    data.registrationId     || '',
      certNumberPrefix:  data.certNumberPrefix   || '',
      certNumberStart:   data.certNumberStart    ?? 1,
      // ── Colors (used for built-in design or text color override) ──────────
      primaryColor:      data.primaryColor       || '#1B3264',
      accentColor:       data.accentColor        || '#F47B20',
      bgColor:           data.bgColor            || '#CECCBF',
      // ── Uploaded assets (base64 data URLs) ───────────────────────────────────
      logoDataUrl:       data.logoDataUrl        || null,
      logoFileName:      data.logoFileName       || null,
      signatureDataUrl:  data.signatureDataUrl   || null,
      signatureFileName: data.signatureFileName  || null,
      // ── Stats ─────────────────────────────────────────────────────────────────
      totalGenerated:    0,
      createdAt:         new Date().toISOString(),
    };
    write(KEYS.TYPES, [t, ...types]);
    return t;
  },

  update(id, data) {
    const types = this.list().map(t => (t.id === id ? { ...t, ...data } : t));
    write(KEYS.TYPES, types);
    return types.find(t => t.id === id);
  },

  delete(id) { write(KEYS.TYPES, this.list().filter(t => t.id !== id)); },

  incrementGenerated(id, count) {
    const t = this.get(id);
    if (t) this.update(id, { totalGenerated: (t.totalGenerated || 0) + count });
  },
};


// ── Generation History ────────────────────────────────────────────────────────
export const historyStore = {
  list() { return read(KEYS.HISTORY); },

  add(data) {
    const history = this.list();
    const entry = {
      id:          uid(),
      typeId:      data.typeId,
      typeName:    data.typeName,
      category:    data.category,
      namesCount:  data.namesCount,
      names:       data.names,
      certTitle:   data.certTitle   || '',
      companyName: data.companyName || '',
      // batch content
      department:  data.department  || '',
      college:     data.college     || '',
      courseName:  data.courseName  || '',
      description: data.description || '',
      dateOfIssue: data.dateOfIssue || '',
      place:       data.place       || '',
      certNumberPrefix: data.certNumberPrefix || '',
      createdAt:   new Date().toISOString(),
    };
    write(KEYS.HISTORY, [entry, ...history]);
    return entry;
  },

  clear() { write(KEYS.HISTORY, []); },
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export function getStats() {
  const history = historyStore.list();
  const types   = typesStore.list();

  const totalCertificates = history.reduce((s, h) => s + (h.namesCount || 0), 0);
  const totalBatches      = history.length;
  const totalTypes        = types.length;

  const catMap = {};
  history.forEach(h => {
    const cat = h.category || 'other';
    catMap[cat] = (catMap[cat] || 0) + (h.namesCount || 0);
  });
  const byCategory = Object.entries(catMap).map(([_id, count]) => ({ _id, count }));

  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key     = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('en', { weekday: 'short' });
    const count   = history
      .filter(h => h.createdAt?.slice(0, 10) === key)
      .reduce((s, h) => s + (h.namesCount || 0), 0);
    chartData.push({ day: dayName, count });
  }

  const recentGenerations = history.slice(0, 5);
  return { totalCertificates, totalBatches, totalTypes, byCategory, chartData, recentGenerations };
}
