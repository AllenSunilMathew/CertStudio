import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function StatCard({ icon: Icon, label, value, subtitle, gradient, delay = 0, trend }) {
  const count = useCountUp(typeof value === 'number' ? value : 0);
  const displayValue = typeof value === 'number' ? count.toLocaleString() : value ?? '—';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.34, 1.1, 0.64, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="glass-card p-6 relative overflow-hidden"
    >
      {/* Background gradient blob */}
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10"
        style={{ background: gradient, filter: 'blur(20px)' }} />

      <div className="relative z-10">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: gradient }}>
          <Icon size={22} className="text-white" />
        </div>

        {/* Value */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-white tabular-nums">{displayValue}</p>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-medium bg-emerald-400/10 px-2 py-1 rounded-lg">
              <TrendingUp size={12} />
              <span>{trend}</span>
            </div>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-white/5">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
