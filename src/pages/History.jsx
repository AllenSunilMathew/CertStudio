import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Filter, Users, Award,
  CheckCircle, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { historyStore } from '../utils/storage';
import toast from 'react-hot-toast';

const CATEGORIES = {
  internship: { label: 'Internship',      color: '#6366f1' },
  iv:         { label: 'Industrial Visit', color: '#8b5cf6' },
  course:     { label: 'Course',           color: '#ec4899' },
  other:      { label: 'Other',            color: '#14b8a6' },
};

const PER_PAGE = 10;

export default function History() {
  const { history, refresh } = useApp();
  const [catFilter, setCatFilter] = useState('all');
  const [page,      setPage]      = useState(1);
  const [expanded,  setExpanded]  = useState(null);

  const filtered = catFilter === 'all'
    ? history
    : history.filter((h) => h.category === catFilter);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged      = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilter = (cat) => { setCatFilter(cat); setPage(1); };

  const handleClear = () => {
    if (!confirm('Clear all history? This cannot be undone.')) return;
    historyStore.clear();
    refresh();
    toast.success('History cleared');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Generation History</h1>
            <p className="text-slate-400 mt-1">{filtered.length} total batch{filtered.length !== 1 ? 'es' : ''}</p>
          </div>
          {history.length > 0 && (
            <button onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 text-sm hover:bg-red-400/10 transition-colors border border-red-400/20">
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={14} className="text-slate-400 mr-1" />
        {['all', 'internship', 'iv', 'course', 'other'].map((cat) => {
          const cfg = cat === 'all' ? { label: 'All', color: '#94a3b8' } : CATEGORIES[cat];
          const active = catFilter === cat;
          return (
            <button key={cat} onClick={() => handleFilter(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{
                background: active ? `${cfg.color}25` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${active ? cfg.color : 'rgba(255,255,255,0.08)'}`,
                color: active ? cfg.color : '#94a3b8',
              }}>
              {cfg.label}
            </button>
          );
        })}
      </motion.div>

      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="px-6 py-4 border-b grid grid-cols-12 gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="col-span-4">Certificate Type</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Count</div>
          <div className="col-span-2">Course</div>
          <div className="col-span-2">Date</div>
        </div>

        {paged.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-slate-500">
            <Clock size={40} className="mb-3 opacity-30" />
            <p>No history yet. Generate some certificates!</p>
          </div>
        ) : (
          paged.map((gen, i) => {
            const cfg = CATEGORIES[gen.category] || CATEGORIES.other;
            const isExpanded = expanded === gen.id;
            return (
              <div key={gen.id}>
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="px-6 py-4 border-b grid grid-cols-12 gap-4 items-center hover:bg-white/3 transition-colors cursor-pointer"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                  onClick={() => setExpanded(isExpanded ? null : gen.id)}>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${cfg.color}20` }}>
                      <Award size={16} style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white truncate">{gen.typeName}</p>
                      <p className="text-xs text-slate-500">{gen.id.slice(-6)}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: `${cfg.color}20`, color: cfg.color }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 text-slate-300">
                    <Users size={13} className="text-slate-500" />
                    <span className="text-sm font-semibold">{gen.namesCount}</span>
                  </div>
                  <div className="col-span-2 text-xs text-slate-400 truncate">
                    {gen.courseName || '—'}
                  </div>
                  <div className="col-span-2 text-xs text-slate-500">
                    {new Date(gen.createdAt).toLocaleDateString('en', { day: '2-digit', month: 'short' })}
                  </div>
                </motion.div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="overflow-hidden"
                      style={{ background: 'rgba(99,102,241,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div className="px-6 py-5">
                        <div className="grid grid-cols-4 gap-4 mb-3 text-xs text-slate-400">
                          {gen.date   && <div><span className="text-slate-500">Date:</span> {gen.date}</div>}
                          {gen.place  && <div><span className="text-slate-500">Place:</span> {gen.place}</div>}
                          {gen.ceoName && <div><span className="text-slate-500">CEO:</span> {gen.ceoName}</div>}
                          {gen.ceoTitle && <div><span className="text-slate-500">Title:</span> {gen.ceoTitle}</div>}
                        </div>
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                          Names ({gen.namesCount})
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                          {gen.names.map((n, ni) => (
                            <span key={ni} className="text-xs px-2.5 py-1 rounded-full text-slate-300"
                              style={{ background: 'rgba(255,255,255,0.07)' }}>
                              {n}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-600 mt-3">
                          Generated {new Date(gen.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400">
            <ChevronLeft size={18} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className="w-9 h-9 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: page === i + 1 ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'rgba(255,255,255,0.05)',
                color: page === i + 1 ? 'white' : '#94a3b8',
              }}>
              {i + 1}
            </button>
          ))}
          <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400">
            <ChevronRight size={18} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
