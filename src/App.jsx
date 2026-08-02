import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Award } from 'lucide-react';
import { AppProvider } from './context/AppContext';
import Preloader from './components/Preloader';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Generate from './pages/Generate';
import History from './pages/History';
import Settings from './pages/Settings';

// ── Animated page wrapper ─────────────────────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } }}
        exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
        className="flex-1 h-full">
        <Routes location={location}>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/generate"  element={<Generate />} />
          <Route path="/history"   element={<History />} />
          <Route path="/settings"  element={<Settings />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Mobile top bar ────────────────────────────────────────────────────────────
function MobileTopBar({ onMenuClick }) {
  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3"
      style={{
        background: 'rgba(8,12,28,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(99,102,241,0.15)',
      }}>
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
          <Award size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold text-white">
          Cert<span className="text-indigo-400">Studio</span>
        </span>
      </div>
      {/* Hamburger */}
      <button onClick={onMenuClick}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all">
        <Menu size={20} />
      </button>
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative z-10 shrink-0 px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-1.5"
      style={{
        background: 'rgba(8,12,24,0.8)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(99,102,241,0.12)',
      }}>
      {/* Left: brand */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
          <svg width="11" height="11" viewBox="0 0 48 48" fill="none">
            <rect x="6" y="8" width="36" height="28" rx="4" stroke="white" strokeWidth="3.5"/>
            <circle cx="24" cy="18" r="4" fill="white"/>
            <path d="M12 32c0-6.627 5.373-8 12-8s12 1.373 12 8" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Cert<span className="text-indigo-400">Studio</span>
        </span>
      </div>

      {/* Center: copyright */}
      <p className="text-[11px] text-slate-500 text-center">
        © {new Date().getFullYear()}&nbsp;
        <span className="text-slate-300 font-medium">Allen Sunil Mathew</span>
        &nbsp;·&nbsp;All rights reserved
      </p>

      {/* Right: version */}
      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono hidden sm:inline-block"
        style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
        v1.0.0
      </span>
    </footer>
  );
}

// ── Background animated particles (pure CSS) ──────────────────────────────────
function BackgroundLayers() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Particle star field */}
      <div className="absolute inset-0 bg-particles" />
      {/* Animated orbs */}
      <div className="absolute inset-0 bg-orbs">
        <div className="orb-1" /><div className="orb-2" /><div className="orb-3" />
        <div className="orb-4" /><div className="orb-5" />
      </div>
      {/* Grid */}
      <div className="absolute inset-0 bg-grid-layer" />
      {/* Floating cert texture */}
      <div className="bg-cert-float" />
      {/* Medal decorative right edge */}
      <div className="absolute right-0 bottom-16 w-40 h-40 sm:w-56 sm:h-56 opacity-[0.04]"
        style={{ backgroundImage: 'url(/cert_medal.jpg)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center right' }} />
    </div>
  );
}

// ── App layout ────────────────────────────────────────────────────────────────
function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  const location = useLocation();
  useEffect(() => setDrawerOpen(false), [location]);

  return (
    <>
      <BackgroundLayers />

      {/* Mobile top bar */}
      <MobileTopBar onMenuClick={() => setDrawerOpen(true)} />

      {/* Mobile sidebar drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div className="lg:hidden fixed inset-0 z-50 flex"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Backdrop */}
            <motion.div className="absolute inset-0 bg-black/70"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)} />
            {/* Drawer */}
            <motion.div className="relative z-10 w-64 shrink-0"
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <Sidebar onClose={() => setDrawerOpen(false)} showCloseBtn />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <div className="relative z-10 flex h-screen overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Content column */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Mobile spacer for top bar */}
          <div className="lg:hidden h-14 shrink-0" />
          <main className="flex-1 overflow-y-auto">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [loaded, setLoaded] = useState(false);
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', fontSize: '13px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }} />
        <AnimatePresence>
          {!loaded && <Preloader onComplete={() => setLoaded(true)} />}
        </AnimatePresence>
        {loaded && <AppLayout />}
      </AppProvider>
    </BrowserRouter>
  );
}
