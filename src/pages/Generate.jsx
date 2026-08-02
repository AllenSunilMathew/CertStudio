import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, FileSpreadsheet, Users, Zap, CheckCircle,
  AlertCircle, RefreshCw, ChevronRight, Eye, EyeOff,
  Building2, GraduationCap, BookOpen, AlignLeft, Hash,
  Calendar, MapPin, UserCheck, Stamp,
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useApp } from '../context/AppContext';
import { parseExcel, extractColumn } from '../utils/excelParser';
import { generateCertificate, canvasToBlob } from '../utils/certGenerator';
import FileUploadZone from '../components/FileUploadZone';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Select Type' },
  { id: 2, label: 'Upload Excel' },
  { id: 3, label: 'Certificate Content' },
  { id: 4, label: 'Generate' },
];

const CAT_COLORS = {
  internship: '#6366f1', iv: '#8b5cf6', course: '#ec4899', other: '#14b8a6',
};

const DEFAULT_CONTENT = {
  certTitle:           '',
  department:        '',
  college:           '',
  companyName:       '',
  courseName:        '',
  description:       '',
  dateOfIssue:       new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  place:             '',
  certNumberStart:   null, // null = use type's default
  sealDataUrl:       null,
  sealFileName:      null,
};

// ── Live Certificate Preview ──────────────────────────────────────────────────
function CertPreview({ certType, content, previewName }) {
  const [src, setSrc]         = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const timerRef              = useRef(null);

  useEffect(() => {
    if (!certType || !previewName) { setSrc(null); return; }

    clearTimeout(timerRef.current);
    setLoading(true);
    setError(null);

    timerRef.current = setTimeout(() => {
      const startNum   = content.certNumberStart ?? (certType.certNumberStart ?? 1);
      const certNumber = `${certType.certNumberPrefix || ''}${String(startNum).padStart(3, '0')}`;

      generateCertificate({
        // ── Per-student content ─────────────────────────────────────────────
        name:            previewName,
        studentName:     previewName,       // explicit alias for textElements mapping
        certNumber,
        // ── Batch content (same for all) ─────────────────────────────────────
        certTitle:       content.certTitle || certType.certTitle || 'Certificate',
        department:      content.department   || '',
        college:         content.college      || '',
        companyName:     content.companyName  || '',
        courseName:      content.courseName   || '',
        description:     content.description  || '',
        dateOfIssue:     content.dateOfIssue  || '',
        place:           content.place        || '',
        // ── Cert type settings ───────────────────────────────────────────────
        templateDataUrl: certType.templateDataUrl   || null,
        textElements:    certType.textElements      || null,
        registrationId:  certType.registrationId   || '',
        ceoName:         certType.ceoName           || '',
        ceoTitle:        certType.ceoTitle          || '',
        logoDataUrl:     certType.logoDataUrl       || null,
        signatureDataUrl: content.sealDataUrl || certType.signatureDataUrl || null,
        primaryColor:    certType.primaryColor      || '#1B3264',
        accentColor:     certType.accentColor       || '#F47B20',
        bgColor:         certType.bgColor           || '#CECCBF',
      })
        .then(canvas => { setSrc(canvas.toDataURL('image/png')); setLoading(false); })
        .catch(e => { setError(e.message); setLoading(false); });
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [certType, content, previewName]);

  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/20">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400">Rendering…</p>
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="p-6 text-center text-red-400 text-xs">{error}</div>
      )}
      {src && !error
        ? <img src={src} alt="Certificate preview" className="w-full block" />
        : !loading && !error && (
          <div className="h-52 flex flex-col items-center justify-center text-slate-600 gap-2">
            <Award size={28} className="opacity-30" />
            <p className="text-sm">Preview will appear here</p>
          </div>
        )}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label, color, children }) {
  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        <Icon size={15} style={{ color }} /> {label}
      </h3>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Generate() {
  const { certTypes, addHistory } = useApp();

  const [step,         setStep]        = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [excelFile,    setExcelFile]   = useState(null);
  const [parseData,    setParseData]   = useState(null);
  const [selectedCol,  setSelectedCol] = useState(null);
  const [names,        setNames]       = useState([]);
  const [parsing,      setParsing]     = useState(false);
  const [content,      setContent]     = useState(DEFAULT_CONTENT);
  const [showPreview,  setShowPreview] = useState(true);
  const [generating,   setGenerating]  = useState(false);
  const [progress,     setProgress]    = useState(0);
  const [genDone,      setGenDone]     = useState(false);
  const [genError,     setGenError]    = useState(null);

  const set = useCallback((key, val) => setContent(p => ({ ...p, [key]: val })), []);

  // When a type is selected, pre-fill certNumberStart from type settings
  const handleSelectType = (type) => {
    setSelectedType(type);
    setContent(p => ({ ...p, certNumberStart: type.certNumberStart ?? 1 }));
    setStep(2);
  };

  // Excel parsing
  const handleExcel = async (file) => {
    setExcelFile(file);
    setParsing(true);
    try {
      const result = await parseExcel(file);
      setParseData(result);
      const col = result.detectedNameCol ?? 0;
      setSelectedCol(col);
      setNames(result.names.length ? result.names : extractColumn(result.dataRows, col));
      setStep(3);
    } catch (e) { toast.error(e.message); }
    finally { setParsing(false); }
  };

  const handleColumnChange = colIdx => {
    setSelectedCol(colIdx);
    if (parseData) setNames(extractColumn(parseData.dataRows, colIdx));
  };

  // Seal upload
  const handleSealFile = file => {
    if (file.type === 'application/pdf') {
      toast.error('PDF cannot be placed on the certificate. Please use PNG or JPG.', { duration: 4000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = e => set('sealDataUrl', e.target.result);
    reader.readAsDataURL(file);
    set('sealFileName', file.name);
    toast.success(`${file.name} ready as seal`);
  };

  // Generate all
  const handleGenerate = async () => {
    if (!selectedType || names.length === 0) return;
    if (!content.courseName.trim()) { toast.error('Please enter the course/internship name'); return; }

    setGenerating(true); setGenDone(false); setGenError(null); setProgress(0); setStep(4);

    try {
      const zip   = new JSZip();
      const startNum = content.certNumberStart ?? (selectedType.certNumberStart ?? 1);

      for (let i = 0; i < names.length; i++) {
        const name      = names[i];
        const certNum   = startNum + i;
        const certNumber = `${selectedType.certNumberPrefix || ''}${String(certNum).padStart(3, '0')}`;

        const canvas = await generateCertificate({
          name, studentName: name, certNumber,
          certTitle:       content.certTitle || selectedType.certTitle || 'Certificate',
          department:      content.department,
          college:         content.college,
          companyName:     content.companyName,
          courseName:      content.courseName,
          description:     content.description,
          dateOfIssue:     content.dateOfIssue,
          place:           content.place,
          templateDataUrl: selectedType.templateDataUrl  || null,
          textElements:    selectedType.textElements     || null,
          registrationId:  selectedType.registrationId  || '',
          ceoName:         selectedType.ceoName,
          ceoTitle:        selectedType.ceoTitle,
          logoDataUrl:     selectedType.logoDataUrl      || null,
          signatureDataUrl: content.sealDataUrl || selectedType.signatureDataUrl || null,
          primaryColor:    selectedType.primaryColor,
          accentColor:     selectedType.accentColor,
          bgColor:         selectedType.bgColor,
        });

        const blob     = await canvasToBlob(canvas);
        const safeName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_');
        zip.file(`${certNumber}_${safeName}_certificate.png`, blob);
        setProgress(Math.round(((i + 1) / names.length) * 100));
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `CertStudio_${selectedType.name.replace(/\s+/g, '_')}_${Date.now()}.zip`);

      addHistory({
        typeId: selectedType.id, typeName: selectedType.name,
        category: selectedType.category, namesCount: names.length, names,
        certTitle: content.certTitle || selectedType.certTitle || 'Certificate',
        companyName: content.companyName,
        department: content.department, college: content.college,
        courseName: content.courseName, description: content.description,
        dateOfIssue: content.dateOfIssue, place: content.place,
        certNumberPrefix: selectedType.certNumberPrefix,
      });

      setGenDone(true);
      toast.success(`${names.length} certificates generated!`);
    } catch (e) {
      console.error(e);
      setGenError(e.message);
      toast.error('Generation failed: ' + e.message);
    } finally { setGenerating(false); }
  };

  const resetAll = () => {
    setStep(1); setSelectedType(null); setExcelFile(null); setParseData(null);
    setNames([]); setContent(DEFAULT_CONTENT); setGenDone(false); setGenError(null); setProgress(0);
  };

  const inputCls  = 'w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all';
  const inputStyle = { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' };
  const labelCls  = 'block text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider';

  return (
    <div className="p-8 max-w-7xl mx-auto">

      {/* ── Header with generate_banner image ── */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl mb-8">
        <img src="/generate_banner.jpg" alt="Generate banner"
          className="w-full h-40 object-cover object-center" />
        <div className="absolute inset-0 flex items-center px-8"
          style={{ background: 'linear-gradient(90deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.4) 60%, transparent 100%)' }}>
          <div>
            <h1 className="text-3xl font-bold text-white">Generate Certificates</h1>
            <p className="text-slate-300 mt-1">Fill in the details and bulk-generate personalized certificates.</p>
          </div>
        </div>
      </motion.div>

      {/* ── Stepper ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <motion.div animate={{
                background: step > s.id  ? 'linear-gradient(135deg,#059669,#10b981)'
                          : step === s.id ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
                          : 'rgba(255,255,255,0.08)',
              }} className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white">
                {step > s.id ? <CheckCircle size={18} /> : s.id}
              </motion.div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${step >= s.id ? 'text-slate-300' : 'text-slate-600'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 mb-5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#4f46e5,#7c3aed)' }}
                  animate={{ width: step > s.id ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }} />
              </div>
            )}
          </div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: Select Type ── */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-5 flex items-center gap-2">
                <Award size={20} className="text-indigo-400" /> Select Certificate Type
              </h2>
              {certTypes.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <Award size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No certificate types found. <a href="/templates" className="text-indigo-400">Create one first →</a></p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {certTypes.map(type => {
                    const color = CAT_COLORS[type.category] || '#14b8a6';
                    return (
                      <motion.button key={type.id} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectType(type)}
                        className="text-left p-4 rounded-2xl flex items-center gap-4 transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${color}25` }}>
                          <Award size={22} style={{ color }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">{type.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{type.certTitle}</p>
                          <p className="text-xs text-slate-500 mt-1">{type.ceoName}</p>
                        </div>
                        <ChevronRight size={18} className="text-slate-500" />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Upload Excel ── */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white transition-colors text-sm">← Back</button>
                <span className="text-slate-600">|</span>
                <span className="text-sm font-medium text-white">{selectedType?.certTitle}</span>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-indigo-400" /> Upload Student Names
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Upload an Excel or CSV file with student names. First row = headers. We'll auto-detect the name column.
              </p>
              {parsing ? (
                <div className="flex flex-col items-center py-16 gap-4">
                  <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Parsing your file…</p>
                </div>
              ) : (
                <FileUploadZone
                  accept={{
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/vnd.ms-excel': ['.xls'],
                    'text/csv': ['.csv'],
                  }}
                  label="Drop Excel or CSV here"
                  subLabel=".xlsx · .xls · .csv (any spreadsheet)"  
                  onFileAccepted={handleExcel}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Certificate Content ── */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* ── LEFT: Content form ── */}
              <div className="space-y-4">

                {/* Names banner */}
                <div className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setStep(2)} className="text-slate-400 hover:text-white text-sm">← Re-upload</button>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={14} className="text-indigo-400" />
                      <strong className="text-white">{names.length}</strong>
                      <span className="text-slate-400">names loaded</span>
                    </div>
                  </div>
                  {parseData && (
                    <select value={selectedCol ?? 0}
                      onChange={e => handleColumnChange(Number(e.target.value))}
                      className="text-xs px-2 py-1.5 rounded-lg text-white outline-none"
                      style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
                      {parseData.headers.map(h => (
                        <option key={h.index} value={h.index} style={{ background: '#1e293b' }}>{h.label}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* ── Student / Institution Info ── */}
                <SectionHeader icon={GraduationCap} label="Student / Institution" color="#6366f1">
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>
                        <Award size={10} className="inline mr-1" />
                        Certificate Title
                        <span className="text-slate-500 ml-1 normal-case font-normal">(e.g. Internship Certificate, Guard of Honour, Voluntary…)</span>
                      </label>
                      <input className={inputCls} style={inputStyle}
                        placeholder={selectedType?.certTitle || 'Certificate'}
                        value={content.certTitle}
                        onChange={e => set('certTitle', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>
                        <Building2 size={10} className="inline mr-1" />
                        Department
                        <span className="text-slate-500 ml-1 normal-case font-normal">(replaces "from _____ department")</span>
                      </label>
                      <input className={inputCls} style={inputStyle}
                        placeholder="Robotics and Artificial Intelligence department"
                        value={content.department}
                        onChange={e => set('department', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>College / Institution Name</label>
                      <input className={inputCls} style={inputStyle}
                        placeholder="Rajiv Gandhi Institute of Technology, Kottayam"
                        value={content.college}
                        onChange={e => set('college', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>
                        <Building2 size={10} className="inline mr-1" />
                        Company Name
                        <span className="text-slate-500 ml-1 normal-case font-normal">(shown after "at")</span>
                      </label>
                      <input className={inputCls} style={inputStyle}
                        placeholder="Inker Robotics Solutions Pvt. Ltd."
                        value={content.companyName}
                        onChange={e => set('companyName', e.target.value)} />
                    </div>
                  </div>
                </SectionHeader>

                {/* ── Course / Program ── */}
                <SectionHeader icon={BookOpen} label="Course / Program" color="#ec4899">
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>
                        Course / Internship Name *
                        <span className="text-pink-400 ml-1 normal-case font-normal">(shown large & bold)</span>
                      </label>
                      <input className={inputCls} style={inputStyle}
                        placeholder="TECH Foundation Internship"
                        value={content.courseName}
                        onChange={e => set('courseName', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>
                        <AlignLeft size={10} className="inline mr-1" />
                        Description / Program Details
                      </label>
                      <textarea rows={4} className={`${inputCls} resize-none leading-relaxed`} style={inputStyle}
                        placeholder="Covering the basics of IoT, Robotics, AI, and Software Development through a 2-Week Hybrid Program conducted from May 25, 2026 to June 05, 2026 at Inker Robotics Solutions Pvt. Ltd."
                        value={content.description}
                        onChange={e => set('description', e.target.value)} />
                    </div>
                  </div>
                </SectionHeader>

                {/* ── Date, Place & Number ── */}
                <SectionHeader icon={Calendar} label="Date, Place & Numbering" color="#10b981">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}><Calendar size={10} className="inline mr-1" />Date of Issue</label>
                      <input className={inputCls} style={inputStyle}
                        placeholder="11-06-2026"
                        value={content.dateOfIssue}
                        onChange={e => set('dateOfIssue', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}><MapPin size={10} className="inline mr-1" />Place</label>
                      <input className={inputCls} style={inputStyle}
                        placeholder="Thrissur"
                        value={content.place}
                        onChange={e => set('place', e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}><Hash size={10} className="inline mr-1" />Cert Number Start</label>
                      {/* Custom number spinner */}
                      <div className="flex rounded-xl overflow-hidden"
                        style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.07)' }}>
                        <input
                          type="number" min="1"
                          className="flex-1 px-3 py-2.5 bg-transparent text-sm text-white outline-none
                                     [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none
                                     [&::-webkit-inner-spin-button]:appearance-none"
                          value={content.certNumberStart ?? (selectedType?.certNumberStart ?? 1)}
                          onChange={e => {
                            const v = parseInt(e.target.value, 10);
                            set('certNumberStart', isNaN(v) || v < 1 ? 1 : v);
                          }}
                        />
                        {/* ▲▼ arrow column */}
                        <div className="flex flex-col border-l" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                          <button
                            type="button"
                            onClick={() => set('certNumberStart', Math.max(1, (content.certNumberStart ?? (selectedType?.certNumberStart ?? 1)) + 1))}
                            className="flex-1 px-2.5 flex items-center justify-center hover:bg-indigo-500/20 transition-colors group"
                            title="Increase">
                            <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                              <path d="M1 6L5 1L9 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-indigo-400" />
                            </svg>
                          </button>
                          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                          <button
                            type="button"
                            onClick={() => set('certNumberStart', Math.max(1, (content.certNumberStart ?? (selectedType?.certNumberStart ?? 1)) - 1))}
                            className="flex-1 px-2.5 flex items-center justify-center hover:bg-indigo-500/20 transition-colors group"
                            title="Decrease">
                            <svg width="10" height="7" viewBox="0 0 10 7" fill="none">
                              <path d="M1 1L5 6L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 group-hover:text-indigo-400" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Will generate: <span className="text-indigo-400 font-mono">
                          {selectedType?.certNumberPrefix || ''}{String(content.certNumberStart ?? (selectedType?.certNumberStart ?? 1)).padStart(3,'0')}
                        </span>
                        {names.length > 1 && <span> … to {selectedType?.certNumberPrefix || ''}{String((content.certNumberStart ?? (selectedType?.certNumberStart ?? 1)) + names.length - 1).padStart(3,'0')}</span>}
                      </p>
                    </div>
                    <div>
                      <label className={labelCls}><Stamp size={10} className="inline mr-1" />Extra Seal / Stamp</label>
                      <FileUploadZone
                        accept={{
                          'image/*': ['.png','.jpg','.jpeg','.webp','.bmp','.gif','.svg'],
                          'application/pdf': ['.pdf'],
                        }}
                        label="Upload Seal" subLabel="PNG · JPG · PDF · SVG"
                        currentFile={content.sealFileName ? { name: content.sealFileName } : null}
                        onFileAccepted={handleSealFile}
                        onRemove={() => { set('sealDataUrl', null); set('sealFileName', null); }}
                        compact
                      />
                    </div>
                  </div>
                </SectionHeader>

              </div>

              {/* ── RIGHT: Live Preview ── */}
              <div className="space-y-4">
                <div className="glass-card p-5 sticky top-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <Eye size={15} className="text-indigo-400" /> Live Preview
                    </h3>
                    <button onClick={() => setShowPreview(v => !v)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                      {showPreview ? <EyeOff size={12} /> : <Eye size={12} />}
                      {showPreview ? 'Hide' : 'Show'}
                    </button>
                  </div>

                  {showPreview && (
                    <>
                      <p className="text-xs text-slate-500 mb-3">
                        Previewing: <span className="text-indigo-300 font-medium">{names[0] || 'Enter names first'}</span>
                      </p>
                      <CertPreview
                        certType={selectedType}
                        content={content}
                        previewName={names[0] || 'Sample Name'}
                      />
                    </>
                  )}

                  {/* Name chips */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                      All Names ({names.length})
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {names.slice(0, 40).map((n, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full text-slate-300"
                          style={{ background: 'rgba(255,255,255,0.07)' }}>{n}</span>
                      ))}
                      {names.length > 40 && (
                        <span className="text-xs px-2 py-0.5 rounded-full text-slate-500"
                          style={{ background: 'rgba(255,255,255,0.04)' }}>+{names.length - 40} more</span>
                      )}
                    </div>
                  </div>

                  {/* Generate button */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleGenerate}
                    disabled={names.length === 0 || !content.courseName.trim()}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white mt-5 disabled:opacity-40 disabled:cursor-not-allowed text-base"
                    style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                    <Zap size={20} />
                    Generate {names.length} Certificate{names.length !== 1 ? 's' : ''}
                  </motion.button>
                  {!content.courseName.trim() && (
                    <p className="text-xs text-amber-400 text-center mt-2">⚠ Enter the course/internship name above</p>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Generating / Done ── */}
        {step === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="glass-card p-12 flex flex-col items-center text-center">
              {generating ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                    <Zap size={36} className="text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">Generating Certificates…</h2>
                  <p className="text-slate-400 mb-8">
                    Creating <strong className="text-white">{names.length}</strong> certificates for <strong className="text-indigo-300">{content.courseName}</strong>
                  </p>
                  <div className="w-full max-w-sm">
                    <div className="flex justify-between text-xs text-slate-500 mb-2">
                      <span>{progress < 100 ? `Processing ${Math.round(progress * names.length / 100)} of ${names.length}…` : 'Packaging ZIP…'}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.2)' }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg,#4f46e5,#8b5cf6,#ec4899)' }}
                        animate={{ width: `${progress}%` }} transition={{ duration: 0.2 }} />
                    </div>
                  </div>
                </>
              ) : genDone ? (
                <>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                    <CheckCircle size={40} className="text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white mb-2">🎉 {names.length} Certificates Ready!</h2>
                  <p className="text-slate-400 mb-2">Your ZIP file has been downloaded automatically.</p>
                  <p className="text-xs text-slate-500 mb-8">
                    Each file named: <code className="text-indigo-300">CertNumber_StudentName_certificate.png</code>
                  </p>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={resetAll}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                    <RefreshCw size={18} /> Generate Another Batch
                  </motion.button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                    style={{ background: 'rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={40} className="text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Generation Failed</h2>
                  <p className="text-slate-400 mb-4 max-w-md">{genError}</p>
                  <button onClick={() => setStep(3)}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>← Try Again</button>
                </>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
