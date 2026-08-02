import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Award, Trash2, Edit3, X, Check,
  Palette, User, Hash, Image as ImageIcon,
  Type, AlignCenter, AlignLeft, AlignRight,
  Eye, EyeOff, ChevronDown, ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateCertificate } from '../utils/certGenerator';
import { DEFAULT_TEXT_ELEMENTS } from '../utils/storage';
import FileUploadZone from '../components/FileUploadZone';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'internship', label: 'Internship',       color: '#6366f1' },
  { value: 'iv',         label: 'Industrial Visit',  color: '#8b5cf6' },
  { value: 'course',     label: 'Course',            color: '#ec4899' },
  { value: 'other',      label: 'Other',             color: '#14b8a6' },
];

const FONT_FAMILIES = [
  'Inter', 'Poppins', 'Roboto', 'Montserrat', 'Lato', 'Raleway',
  'Playfair Display', 'Cinzel', 'Cormorant Garamond',
  'Dancing Script', 'Great Vibes', 'Satisfy', 'Sacramento',
  'Georgia', 'Times New Roman', 'Arial',
];

const ALIGN_OPTS = [
  { value: 'left',   Icon: AlignLeft   },
  { value: 'center', Icon: AlignCenter },
  { value: 'right',  Icon: AlignRight  },
];

// Sample preview values for each field
const PREVIEW_VALS = {
  studentName: 'John Doe',
  courseName:  'IoT & Robotics Programme',
  department:  'Robotics and Artificial Intelligence',
  college:     'Rajiv Gandhi Institute of Technology, Kottayam',
  description: 'Covering the basics of IoT, Robotics, AI, and Software Development through a 2-Week Hybrid Program conducted from May 25, 2026 to June 05, 2026.',
  registrationId: 'DIPP24591/2018/KSUM798',
  dateOfIssue: '25-06-2026',
  place:       'Kottayam',
  ceoName:     'Mr. Amit Raman',
  ceoTitle:    'CEO, Inker Robotics',
  certNumber:  'CERT/001',
};

const DEFAULT = {
  name: '', description: '', category: 'internship',
  templateDataUrl: null, templateFileName: null,
  textElements: DEFAULT_TEXT_ELEMENTS.map(e => ({ ...e })),
  certTitle: 'Internship Certificate',
  ceoName: 'Mr. Amit Raman', ceoTitle: 'CEO, Inker Robotics',
  registrationId: '', certNumberPrefix: 'CERT/', certNumberStart: 1,
  primaryColor: '#1B3264', accentColor: '#F47B20', bgColor: '#CECCBF',
  logoDataUrl: null, logoFileName: null,
  signatureDataUrl: null, signatureFileName: null,
};

const inputCls   = 'w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-2 focus:ring-indigo-500/40';
const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' };
const labelCls   = 'block text-xs font-medium text-slate-400 mb-1.5';

// ── Live canvas preview ───────────────────────────────────────────────────────
function CertPreview({ form }) {
  const [src, setSrc]       = useState(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    setLoading(true);
    timerRef.current = setTimeout(() => {
      generateCertificate({
        templateDataUrl: form.templateDataUrl || null,
        textElements:    form.textElements || DEFAULT_TEXT_ELEMENTS,
        studentName:     PREVIEW_VALS.studentName,
        courseName:      PREVIEW_VALS.courseName,
        department:      PREVIEW_VALS.department,
        college:         PREVIEW_VALS.college,
        description:     PREVIEW_VALS.description,
        registrationId:  PREVIEW_VALS.registrationId,
        dateOfIssue:     PREVIEW_VALS.dateOfIssue,
        place:           PREVIEW_VALS.place,
        ceoName:         form.ceoName || PREVIEW_VALS.ceoName,
        ceoTitle:        form.ceoTitle || PREVIEW_VALS.ceoTitle,
        certNumber:      (form.certNumberPrefix || '') + '001',
        signatureDataUrl: form.signatureDataUrl || null,
        logoDataUrl:     form.logoDataUrl || null,
        primaryColor:    form.primaryColor,
        accentColor:     form.accentColor,
        bgColor:         form.bgColor,
        certTitle:       form.certTitle,
      })
        .then(canvas => { setSrc(canvas.toDataURL()); setLoading(false); })
        .catch(() => setLoading(false));
    }, 500);
    return () => clearTimeout(timerRef.current);
  }, [form]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/30">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Rendering…</p>
          </div>
        </div>
      )}
      {src
        ? <img src={src} alt="Certificate preview" className="w-full block" />
        : !loading && (
          <div className="h-48 flex flex-col items-center justify-center text-slate-600 gap-2">
            <Award size={28} className="opacity-30" />
            <p className="text-sm">Preview will appear here</p>
          </div>
        )}
    </div>
  );
}

// ── Text element editor row ───────────────────────────────────────────────────
function TextElementRow({ el, onChange }) {
  const [open, setOpen] = useState(false);
  const update = (key, val) => onChange({ ...el, [key]: val });

  // Logo is an image element: replace font controls with a Height control
  const isLogo = el.id === 'logo';

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header */}
      <button type="button"
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors"
        onClick={() => setOpen(o => !o)}>
        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: el.color }} />
        <span className="text-sm font-medium text-white flex-1 text-left">{el.label}</span>
        <span className="text-xs text-slate-500 font-mono">{isLogo ? `${el.fontSize}px height` : `${el.fontFamily} · ${el.fontSize}px`}</span>
        {/* Toggle enabled */}
        <button type="button"
          className="p-1 hover:text-indigo-400 transition-colors"
          title={el.enabled ? 'Disable' : 'Enable'}
          onClick={e => { e.stopPropagation(); update('enabled', !el.enabled); }}>
          {el.enabled ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-slate-600" />}
        </button>
        {open ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRightIcon size={14} className="text-slate-400" />}
      </button>

      {/* Controls */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="px-3 pb-3 space-y-3"
              style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>

              {/* Row 1: Logo height OR Font family + Size */}
              {isLogo ? (
                <div className="grid grid-cols-1 gap-2 pt-3">
                  <div>
                    <label className={labelCls}>Logo Height (px)</label>
                    <div className="flex rounded-xl overflow-hidden"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)' }}>
                      <input type="number" min="8" max="300"
                        value={el.fontSize}
                        onChange={e => update('fontSize', Math.max(8, parseInt(e.target.value)||48))}
                        className="flex-1 px-3 py-2.5 bg-transparent text-sm text-white outline-none
                                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                                   [&::-webkit-inner-spin-button]:appearance-none" />
                      <div className="flex flex-col border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <button type="button"
                          onClick={() => update('fontSize', Math.min(300, el.fontSize + 1))}
                          className="flex-1 px-2 flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                          <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                            <path d="M1 6L5 1L9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" />
                          </svg>
                        </button>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        <button type="button"
                          onClick={() => update('fontSize', Math.max(8, el.fontSize - 1))}
                          className="flex-1 px-2 flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                          <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                            <path d="M1 1L5 6L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-3">
                  <div>
                    <label className={labelCls}>Font Family</label>
                    <select value={el.fontFamily}
                      onChange={e => update('fontFamily', e.target.value)}
                      className={inputCls}
                      style={{ ...inputStyle, fontFamily: el.fontFamily }}>
                      {FONT_FAMILIES.map(f => (
                        <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Font Size (px)</label>
                    <div className="flex rounded-xl overflow-hidden"
                      style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)' }}>
                      <input type="number" min="8" max="120"
                        value={el.fontSize}
                        onChange={e => update('fontSize', Math.max(8, parseInt(e.target.value)||16))}
                        className="flex-1 px-3 py-2.5 bg-transparent text-sm text-white outline-none
                                   [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                                   [&::-webkit-inner-spin-button]:appearance-none" />
                      <div className="flex flex-col border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <button type="button"
                          onClick={() => update('fontSize', Math.min(120, el.fontSize + 1))}
                          className="flex-1 px-2 flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                          <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                            <path d="M1 6L5 1L9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" />
                          </svg>
                        </button>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                        <button type="button"
                          onClick={() => update('fontSize', Math.max(8, el.fontSize - 1))}
                          className="flex-1 px-2 flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                          <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                            <path d="M1 1L5 6L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Row 2: Bold, Italic, Align, Color (text only) */}
              {!isLogo && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Bold */}
                  <button type="button"
                    onClick={() => update('bold', !el.bold)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${el.bold ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-white/10'}`}>
                    B
                  </button>
                  {/* Italic */}
                  <button type="button"
                    onClick={() => update('italic', !el.italic)}
                    className={`px-3 py-1.5 rounded-lg text-sm italic transition-colors ${el.italic ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-white/10'}`}>
                    I
                  </button>
                  {/* Align */}
                  {ALIGN_OPTS.map(({ value, Icon }) => (
                    <button key={value} type="button"
                      onClick={() => update('align', value)}
                      className={`p-1.5 rounded-lg transition-colors ${el.align === value ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:bg-white/10'}`}>
                      <Icon size={14} />
                    </button>
                  ))}
                  <div className="flex-1" />
                  {/* Color */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs text-slate-400">Color</span>
                    <div className="relative">
                      <div className="w-7 h-7 rounded-lg border-2 border-white/20 cursor-pointer"
                        style={{ background: el.color }} />
                      <input type="color" value={el.color}
                        onChange={e => update('color', e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                    </div>
                  </label>
                </div>
              )}

              {/* Row 3: X / Y position sliders */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>X Position — {el.x}%</label>
                  <input type="range" min="0" max="100" step="0.5"
                    value={el.x}
                    onChange={e => update('x', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500" />
                </div>
                <div>
                  <label className={labelCls}>Y Position — {el.y}%</label>
                  <input type="range" min="0" max="100" step="0.5"
                    value={el.y}
                    onChange={e => update('y', parseFloat(e.target.value))}
                    className="w-full accent-indigo-500" />
                </div>
              </div>

              {/* Preview of font */}
              {!isLogo && (
                <p className="text-center py-1 rounded-lg"
                  style={{
                    fontFamily: el.fontFamily,
                    fontSize: Math.min(el.fontSize, 24),
                    fontWeight: el.bold ? 'bold' : 'normal',
                    fontStyle: el.italic ? 'italic' : 'normal',
                    color: el.color,
                    background: 'rgba(255,255,255,0.04)',
                  }}>
                  {PREVIEW_VALS[el.id] || el.label}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="glass-card w-full max-w-6xl my-6 p-0 overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-0 overflow-y-auto max-h-[88vh]">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ── Type Card ─────────────────────────────────────────────────────────────────
function TypeCard({ type, onEdit, onDelete }) {
  const cat = CATEGORIES.find(c => c.value === type.category) || CATEGORIES[3];
  return (
    <motion.div whileHover={{ y: -3 }} className="glass-card overflow-hidden flex flex-col cursor-pointer"
      onClick={() => onEdit(type)}>
      {/* Template thumbnail */}
      <div className="relative h-36 overflow-hidden" style={{ background: type.bgColor || '#CECCBF' }}>
        {type.templateDataUrl
          ? <img src={type.templateDataUrl} alt="template" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <Award size={40} className="opacity-20" style={{ color: type.primaryColor }} />
            </div>}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: cat.color + '33', color: cat.color, border: `1px solid ${cat.color}44` }}>
          {cat.label}
        </span>
        {type.templateDataUrl && (
          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
            Custom Template
          </span>
        )}
        <button onClick={e => { e.stopPropagation(); onDelete(type.id); }}
          className="absolute bottom-2 right-2 p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 size={13} />
        </button>
      </div>
      <div className="p-4 flex-1">
        <h3 className="font-bold text-white">{type.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">{type.certTitle}</p>
        <p className="text-xs text-slate-500 mt-2">{type.totalGenerated || 0} certificates generated</p>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Templates() {
  const { certTypes, addType, updateType, deleteType } = useApp();
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form,       setForm]       = useState(DEFAULT);
  const [saving,     setSaving]     = useState(false);

  const field = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const openCreate = () => { setForm(DEFAULT); setEditTarget(null); setShowForm(true); };
  const openEdit   = (t) => {
    setForm({
      ...DEFAULT, ...t,
      textElements: t.textElements?.length ? t.textElements : DEFAULT_TEXT_ELEMENTS.map(e => ({ ...e })),
    });
    setEditTarget(t);
    setShowForm(true);
  };

  // Update a single textElement by id
  const updateTextEl = useCallback((id, updated) => {
    setForm(p => ({
      ...p,
      textElements: p.textElements.map(el => el.id === id ? updated : el),
    }));
  }, []);

  const handleAssetFile = (file, urlKey, nameKey) => {
    if (file.type === 'application/pdf') {
      toast.error('PDF cannot be drawn on canvas. Please use PNG or JPG.', { duration: 4000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = e => field(urlKey, e.target.result);
    reader.readAsDataURL(file);
    field(nameKey, file.name);
    toast.success(`${file.name} uploaded`);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (editTarget) { updateType(editTarget.id, form); toast.success('Updated!'); }
      else { addType(form); toast.success('Certificate type created!'); }
      setShowForm(false);
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Certificate Types</h1>
          <p className="text-slate-400 text-sm mt-1">Upload your template and configure text fields</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
          <Plus size={16} /> New Type
        </motion.button>
      </div>

      {/* Grid */}
      {certTypes.length === 0
        ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Award size={48} className="text-slate-600 mb-4" />
            <p className="text-slate-400">No certificate types yet.</p>
            <button onClick={openCreate} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm underline">
              Create your first type →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {certTypes.map(t => (
              <TypeCard key={t.id} type={t}
                onEdit={openEdit}
                onDelete={id => { deleteType(id); toast.success('Deleted'); }} />
            ))}
          </div>
        )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <Modal title={editTarget ? `Edit: ${editTarget.name}` : 'New Certificate Type'}
            onClose={() => setShowForm(false)}>
            <div className="flex h-full" style={{ minHeight: '70vh' }}>

              {/* ── Left: form ─────────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

                {/* Basic info */}
                <div className="space-y-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <h3 className="text-sm font-semibold text-slate-300">Basic Info</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className={labelCls}>Type Name *</label>
                      <input className={inputCls} style={inputStyle} placeholder="e.g. Internship Certificate"
                        value={form.name} onChange={e => field('name', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Category</label>
                      <select className={inputCls} style={inputStyle}
                        value={form.category} onChange={e => field('category', e.target.value)}>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Certificate Title</label>
                      <input className={inputCls} style={inputStyle} placeholder="Internship Certificate"
                        value={form.certTitle} onChange={e => field('certTitle', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* ── TEMPLATE UPLOAD ─────────────────────────────────────── */}
                <div className="space-y-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <h3 className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                    <ImageIcon size={14} className="text-indigo-400" />
                    Certificate Template
                    <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                      {form.templateDataUrl ? '✓ Uploaded' : 'Upload your design'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Upload your certificate image (PNG/JPG). The student name, course, date, place,
                    and CEO info will be <strong className="text-white">typed on top</strong> at positions
                    you configure below.
                  </p>
                  <FileUploadZone
                    accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp'] }}
                    label="Upload Certificate Template"
                    subLabel="PNG · JPG · JPEG · WebP"
                    currentFile={form.templateFileName ? { name: form.templateFileName } : null}
                    onFileAccepted={f => handleAssetFile(f, 'templateDataUrl', 'templateFileName')}
                    onRemove={() => { field('templateDataUrl', null); field('templateFileName', null); }}
                  />
                  {form.templateDataUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-indigo-500/20">
                      <img src={form.templateDataUrl} alt="Template preview"
                        className="w-full object-contain max-h-40" />
                    </div>
                  )}
                </div>

                {/* ── TEXT ELEMENTS EDITOR ────────────────────────────────── */}
                <div className="space-y-2 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                    <Type size={14} className="text-emerald-400" />
                    Text Fields — Font, Size &amp; Position
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Click each field to expand and configure font, size, style, color, and X/Y position on the certificate.
                  </p>
                  <div className="space-y-2">
                    {(form.textElements || DEFAULT_TEXT_ELEMENTS).map(el => (
                      <TextElementRow key={el.id} el={el}
                        onChange={updated => updateTextEl(el.id, updated)} />
                    ))}
                  </div>
                </div>

                {/* CEO / Authority */}
                <div className="space-y-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <User size={14} className="text-amber-400" /> CEO / Authority
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>CEO Name</label>
                      <input className={inputCls} style={inputStyle} placeholder="Mr. Amit Raman"
                        value={form.ceoName} onChange={e => field('ceoName', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>CEO Title</label>
                      <input className={inputCls} style={inputStyle} placeholder="CEO, Inker Robotics"
                        value={form.ceoTitle} onChange={e => field('ceoTitle', e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Cert numbering */}
                <div className="space-y-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Hash size={14} className="text-emerald-400" /> Certificate Numbering
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Number Prefix</label>
                      <input className={inputCls} style={inputStyle} placeholder="INK/26-06/"
                        value={form.certNumberPrefix} onChange={e => field('certNumberPrefix', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Start From</label>
                      <div className="flex rounded-xl overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)' }}>
                        <input type="number" min="1"
                          className="flex-1 px-3 py-2.5 bg-transparent text-sm text-white outline-none
                                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                                     [&::-webkit-inner-spin-button]:appearance-none"
                          value={form.certNumberStart}
                          onChange={e => { const v = parseInt(e.target.value,10); field('certNumberStart', isNaN(v)||v<1?1:v); }} />
                        <div className="flex flex-col border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                          <button type="button" onClick={() => field('certNumberStart', (form.certNumberStart||1)+1)}
                            className="flex-1 px-2 flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                            <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 6L5 1L9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                          <button type="button" onClick={() => field('certNumberStart', Math.max(1,(form.certNumberStart||1)-1))}
                            className="flex-1 px-2 flex items-center justify-center hover:bg-indigo-500/20 transition-colors">
                            <svg width="10" height="7" viewBox="0 0 10 7" fill="none"><path d="M1 1L5 6L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Registration ID (optional)</label>
                    <input className={inputCls} style={inputStyle} placeholder="DIPP24591/2018/KSUM798"
                      value={form.registrationId} onChange={e => field('registrationId', e.target.value)} />
                  </div>
                </div>

                {/* Colors (only relevant for built-in design) */}
                {!form.templateDataUrl && (
                  <div className="space-y-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                      <Palette size={14} className="text-pink-400" /> Color Scheme (built-in design)
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { key: 'primaryColor', label: 'Primary (Border/Text)' },
                        { key: 'accentColor',  label: 'Accent (Corners)'     },
                        { key: 'bgColor',      label: 'Background'            },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className={labelCls}>{label}</label>
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-lg border-2 border-white/20 cursor-pointer"
                                style={{ background: form[key] }} />
                              <input type="color" value={form[key]} onChange={e => field(key, e.target.value)}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                            </div>
                            <span className="text-xs text-slate-400 font-mono">{form[key]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Branding assets */}
                <div className="space-y-3 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <ImageIcon size={14} className="text-violet-400" /> Branding Assets
                  </h3>
                  <div>
                    <label className={labelCls}>Company Logo {!form.templateDataUrl && '(top center of built-in design)'}</label>
                    <FileUploadZone
                      accept={{ 'image/*': ['.png','.jpg','.jpeg','.svg','.webp','.bmp','.gif'] }}
                      label="Upload Logo" subLabel="PNG · JPG · SVG · Any image"
                      currentFile={form.logoFileName ? { name: form.logoFileName } : null}
                      onFileAccepted={f => handleAssetFile(f, 'logoDataUrl', 'logoFileName')}
                      onRemove={() => { field('logoDataUrl', null); field('logoFileName', null); }}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>CEO Signature (placed above CEO name)</label>
                    <FileUploadZone
                      accept={{ 'image/*': ['.png','.jpg','.jpeg','.webp','.bmp','.gif','.svg'] }}
                      label="Upload Signature" subLabel="PNG · JPG · Any image"
                      currentFile={form.signatureFileName ? { name: form.signatureFileName } : null}
                      onFileAccepted={f => handleAssetFile(f, 'signatureDataUrl', 'signatureFileName')}
                      onRemove={() => { field('signatureDataUrl', null); field('signatureFileName', null); }}
                    />
                  </div>
                </div>

                {/* Save buttons */}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-slate-400 text-sm hover:bg-white/5 transition-colors">
                    Cancel
                  </button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={handleSave} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <Check size={16} />}
                    {editTarget ? 'Update Type' : 'Create Type'}
                  </motion.button>
                </div>
              </div>

              {/* ── Right: live preview ─────────────────────────────────────── */}
              <div className="w-[440px] shrink-0 overflow-y-auto p-6 space-y-4"
                style={{ background: 'rgba(0,0,0,0.2)' }}>
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Eye size={14} className="text-indigo-400" /> Live Preview
                </h3>
                <CertPreview form={form} />
                <p className="text-xs text-slate-500 text-center">
                  Showing sample values — adjust positions in the left panel and see changes here in real-time.
                </p>
              </div>

            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
