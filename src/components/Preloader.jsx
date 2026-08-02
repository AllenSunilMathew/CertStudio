import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

// Floating particle definition
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1.5,
  duration: Math.random() * 8 + 6,
  delay: Math.random() * 4,
  opacity: Math.random() * 0.5 + 0.2,
}));

export default function Preloader({ onComplete }) {
  const [phase, setPhase]       = useState(0); // 0=logo, 1=bar, 2=done
  const [progress, setProgress] = useState(0);
  const [tagline, setTagline]   = useState(0);

  const taglines = [
    'Loading resources…',
    'Preparing templates…',
    'Almost ready…',
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 700);
    const t2 = setTimeout(() => setTagline(1), 1800);
    const t3 = setTimeout(() => setTagline(2), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    if (phase !== 1) return;
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 14 + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => { setPhase(2); setTimeout(onComplete, 550); }, 350);
      }
      setProgress(Math.min(p, 100));
    }, 90);
    return () => clearInterval(interval);
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase < 2 && (
        <motion.div key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: '#060c1a' }}>

          {/* ── Full-bleed background image ── */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'url(/preloader_bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.45,
            }} />

          {/* ── Dark overlay gradient ── */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg,rgba(6,12,26,0.85) 0%,rgba(20,10,50,0.75) 50%,rgba(6,12,26,0.9) 100%)' }} />

          {/* ── Animated glowing orbs ── */}
          <motion.div className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.35) 0%,transparent 70%)', filter: 'blur(60px)', top: '5%', left: '10%' }}
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div className="absolute w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(168,85,247,0.3) 0%,transparent 70%)', filter: 'blur(50px)', bottom: '10%', right: '10%' }}
            animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />
          <motion.div className="absolute w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(236,72,153,0.2) 0%,transparent 70%)', filter: 'blur(40px)', top: '40%', right: '5%' }}
            animate={{ x: [0, 20, 0], y: [0, -40, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

          {/* ── Floating particles ── */}
          {PARTICLES.map(p => (
            <motion.div key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: `${p.x}%`, top: `${p.y}%`,
                width: p.size, height: p.size,
                background: p.id % 3 === 0 ? '#818cf8' : p.id % 3 === 1 ? '#a78bfa' : '#f0abfc',
                opacity: p.opacity,
                boxShadow: `0 0 ${p.size * 3}px currentColor`,
              }}
              animate={{ y: [0, -30, 0], opacity: [p.opacity, p.opacity * 1.6, p.opacity] }}
              transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }} />
          ))}

          {/* ── Central content ── */}
          <motion.div className="relative z-10 flex flex-col items-center gap-8 px-4"
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}>

            {/* Medal image + icon badge */}
            <div className="relative">
              {/* Background medal glow */}
              <motion.div className="absolute inset-0 w-32 h-32 rounded-full"
                style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.5) 0%,transparent 70%)', filter: 'blur(20px)', transform: 'scale(1.8)' }}
                animate={{ scale: [1.8, 2.2, 1.8] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />

              {/* Main icon */}
              <motion.div className="relative w-28 h-28 rounded-3xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#6d28d9 100%)', boxShadow: '0 0 60px rgba(99,102,241,0.6), 0 0 120px rgba(99,102,241,0.2)' }}
                animate={{ boxShadow: ['0 0 60px rgba(99,102,241,0.6), 0 0 120px rgba(99,102,241,0.2)', '0 0 80px rgba(139,92,246,0.8), 0 0 140px rgba(139,92,246,0.3)', '0 0 60px rgba(99,102,241,0.6), 0 0 120px rgba(99,102,241,0.2)'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
                  <rect x="6" y="8" width="36" height="28" rx="4" fill="white" fillOpacity="0.15"/>
                  <rect x="6" y="8" width="36" height="28" rx="4" stroke="white" strokeWidth="2"/>
                  <circle cx="24" cy="18" r="4" fill="white"/>
                  <path d="M12 32c0-6.627 5.373-8 12-8s12 1.373 12 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M34 4l2 2-2 2M38 6H30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="40" cy="38" r="6" fill="#4f46e5" stroke="white" strokeWidth="2"/>
                  <path d="M37.5 38l1.5 1.5 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>

              {/* Orbiting ring */}
              <motion.div className="absolute inset-0 w-28 h-28"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <div className="absolute -top-2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2"
                  style={{ background: 'linear-gradient(135deg,#a78bfa,#ec4899)', boxShadow: '0 0 12px #a78bfa' }} />
              </motion.div>
              <motion.div className="absolute inset-0 w-28 h-28"
                animate={{ rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}>
                <div className="absolute -bottom-2 left-1/2 w-3 h-3 rounded-full -translate-x-1/2"
                  style={{ background: 'linear-gradient(135deg,#34d399,#10b981)', boxShadow: '0 0 8px #34d399' }} />
              </motion.div>
            </div>

            {/* Title */}
            <div className="text-center">
              <motion.h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight"
                style={{ background: 'linear-gradient(135deg,#e0e7ff,#a5b4fc,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                initial={{ opacity: 0, letterSpacing: '0.3em' }}
                animate={{ opacity: 1, letterSpacing: '-0.02em' }}
                transition={{ duration: 0.9, delay: 0.2 }}>
                CertStudio
              </motion.h1>
              <motion.p className="text-slate-400 text-sm mt-2 tracking-[0.3em] uppercase"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                Certificate Generation Platform
              </motion.p>
            </div>

            {/* Progress section */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="w-72 sm:w-80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <motion.span className="text-slate-400" key={tagline}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                      {taglines[tagline]}
                    </motion.span>
                    <span className="text-indigo-400 font-mono font-semibold tabular-nums">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.2)' }}>
                    <motion.div className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg,#4f46e5,#8b5cf6,#ec4899,#f59e0b)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.1, ease: 'linear' }} />
                  </div>
                  {/* Shimmer dots */}
                  <div className="flex justify-center gap-2 pt-1">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                        style={{ background: '#6366f1' }}
                        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Bottom watermark */}
          <motion.p className="absolute bottom-6 text-[11px] text-slate-600 tracking-widest"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            © {new Date().getFullYear()} Allen Sunil Mathew
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
