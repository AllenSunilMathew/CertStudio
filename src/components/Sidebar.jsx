import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Award, Zap, History, Settings,
  X, ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/templates', icon: Award,           label: 'Templates'  },
  { to: '/generate',  icon: Zap,             label: 'Generate'   },
  { to: '/history',   icon: History,         label: 'History'    },
];

export default function Sidebar({ onClose, showCloseBtn }) {
  const { stats } = useApp();
  const location  = useLocation();

  return (
    <aside className="flex flex-col w-64 h-full min-h-screen shrink-0 relative overflow-hidden"
      style={{ borderRight: '1px solid rgba(99,102,241,0.12)' }}>

      {/* ── Background layers ── */}
      <div className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(180deg,#0a0f1e 0%,#0f1729 50%,#120f2b 100%)' }} />
      <div className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/bg_sidebar.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.22,
          mixBlendMode: 'luminosity',
        }} />
      {/* Purple orb top-left */}
      <div className="absolute -top-16 -left-16 w-48 h-48 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/bg_orb_purple.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
          borderRadius: '50%',
          filter: 'blur(30px)',
        }} />
      {/* Orange orb bottom */}
      <div className="absolute -bottom-10 -right-10 w-36 h-36 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/bg_orb_orange.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.18,
          borderRadius: '50%',
          filter: 'blur(28px)',
        }} />
      {/* Right edge fade */}
      <div className="absolute top-0 right-0 w-8 h-full z-0 pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(8,12,24,0.6))' }} />

      {/* ── All content above bg ── */}
      <div className="relative z-10 flex flex-col flex-1">

        {/* Logo — click to go to Dashboard */}
        <Link to="/" className="block group">
          <div className="flex items-center gap-3 px-6 py-5 border-b"
            style={{ borderColor: 'rgba(99,102,241,0.15)' }}
            onClick={onClose}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 pulse-glow group-hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <rect x="6" y="8" width="36" height="28" rx="4" fill="white" fillOpacity="0.2"/>
                <rect x="6" y="8" width="36" height="28" rx="4" stroke="white" strokeWidth="2.5"/>
                <circle cx="24" cy="18" r="4" fill="white"/>
                <path d="M12 32c0-6.627 5.373-8 12-8s12 1.373 12 8" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="40" cy="38" r="6" fill="#4f46e5" stroke="white" strokeWidth="2"/>
                <path d="M37.5 38l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-bold text-lg leading-tight tracking-tight group-hover:text-indigo-300 transition-colors">CertStudio</h1>
              <p className="text-xs" style={{ color: 'rgba(148,163,184,0.7)' }}>Certificate Platform</p>
            </div>
            {showCloseBtn && (
              <button onClick={e => { e.preventDefault(); onClose(); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all shrink-0">
                <X size={16} />
              </button>
            )}
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'rgba(148,163,184,0.4)' }}>Main Menu</p>

          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
            return (
              <NavLink key={to} to={to}>
                <motion.div
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                    isActive ? 'sidebar-active' : 'hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'} />
                  <span className={`text-sm font-medium flex-1 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                    {label}
                  </span>
                  {isActive && <ChevronRight size={14} className="text-indigo-400" />}
                </motion.div>
              </NavLink>
            );
          })}

          <div className="pt-4 border-t mt-4" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
            <p className="px-3 text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(148,163,184,0.4)' }}>System</p>
            <NavLink to="/settings">
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                  location.pathname === '/settings' ? 'sidebar-active' : 'hover:bg-white/5'
                }`}
              >
                <Settings size={18} className={location.pathname === '/settings' ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'} />
                <span className={`text-sm font-medium ${location.pathname === '/settings' ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                  Settings
                </span>
                {location.pathname === '/settings' && <ChevronRight size={14} className="text-indigo-400" />}
              </motion.div>
            </NavLink>
          </div>
        </nav>

        {/* Stats summary */}
        <div className="px-3 mb-4 relative">
          <div className="relative rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.25),rgba(124,58,237,0.18))', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'url(/bg_certificate_float.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.07,
                mixBlendMode: 'screen',
              }} />
            <div className="relative z-10 px-4 py-4">
              <p className="text-xs font-semibold text-indigo-300 mb-1">Total Generated</p>
              <p className="text-3xl font-bold text-white">{stats?.totalCertificates ?? '—'}</p>
              <p className="text-xs text-slate-400 mt-1">
                {stats?.totalBatches ?? 0} batches · {stats?.totalTypes ?? 0} types
              </p>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
