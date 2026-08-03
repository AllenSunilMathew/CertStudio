import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Award, Zap, Layers, Clock, ArrowRight,
  TrendingUp, FileCheck, Users
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatCard from '../components/StatCard';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

const CATEGORY_CONFIG = {
  internship: { label: 'Internship',       color: '#6366f1', bg: 'linear-gradient(135deg,#4f46e5,#6366f1)' },
  iv:         { label: 'Industrial Visit',  color: '#8b5cf6', bg: 'linear-gradient(135deg,#7c3aed,#8b5cf6)' },
  course:     { label: 'Course',            color: '#ec4899', bg: 'linear-gradient(135deg,#db2777,#ec4899)' },
  other:      { label: 'Other',             color: '#14b8a6', bg: 'linear-gradient(135deg,#0d9488,#14b8a6)' },
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 text-sm">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-bold text-white">{payload[0].value} certificates</p>
    </div>
  );
}

export default function Dashboard() {
  const { stats, certTypes } = useApp();
  const chartData   = stats?.chartData   || [];
  const byCategory  = stats?.byCategory  || [];
  const recentGens  = stats?.recentGenerations || [];

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 max-w-7xl mx-auto">
      {/* Scan line effect */}
      <div className="scan-line" />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Certificate generation overview</p>
        </div>
        {/* <Link to="/generate">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
            <Zap size={15} /> <span className="hidden sm:inline">geen</span><span className="sm:hidden">Go</span>
          </motion.button>
        </Link> */}
      </motion.div>

      {/* Hero Banner */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl mb-4 sm:mb-5"
        style={{ background: 'linear-gradient(135deg,#312e81 0%,#4c1d95 50%,#1e1b4b 100%)', minHeight: 160 }}>
        {/* Hero image */}
        <img src="/dashboard_hero.jpg" alt="CertStudio hero"
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity" />
        {/* Animated gradient overlay */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg,rgba(79,70,229,0.4) 0%,transparent 60%)' }} />
        <div className="relative z-10 p-5 sm:p-8 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-white mb-1.5">Generate certificates in seconds ⚡</h2>
            <p className="text-indigo-200 text-sm max-w-md hidden sm:block">
              Upload your template, import names from Excel, and generate personalized certificates instantly.
            </p>
            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-5 flex-wrap">
              <Link to="/generate">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 bg-white text-indigo-700 font-semibold rounded-xl text-sm shadow-lg">
                  Start Generating
                </motion.button>
              </Link>
              <Link to="/templates">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 sm:px-5 sm:py-2.5 text-white font-semibold rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.15)' }}>
                  Templates
                </motion.button>
              </Link>
            </div>
          </div>
          {/* Medal image */}
          <div className="hidden md:block relative w-28 h-28 lg:w-40 lg:h-40 shrink-0">
            <img src="/cert_medal.jpg" alt="certificate medal"
              className="w-full h-full object-cover rounded-2xl float-anim"
              style={{ opacity: 0.85, boxShadow: '0 0 50px rgba(245,158,11,0.4), 0 0 100px rgba(245,158,11,0.15)' }} />
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="relative rounded-2xl overflow-hidden mb-4 sm:mb-5 p-0.5"
        style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(168,85,247,0.15),rgba(99,102,241,0.3))' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(/dashboard_stats_bg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 16 }} />
        <div className="relative grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4">
          <StatCard icon={FileCheck} label="Total Certificates" value={stats?.totalCertificates}
            subtitle="All time" gradient="linear-gradient(135deg,#4f46e5,#6366f1)" delay={0.1} />
          <StatCard icon={Layers} label="Certificate Types" value={stats?.totalTypes}
            subtitle={`${certTypes.length} templates`} gradient="linear-gradient(135deg,#7c3aed,#8b5cf6)" delay={0.15} />
          <StatCard icon={Users} label="Batches Generated" value={stats?.totalBatches}
            subtitle="Total batch runs" gradient="linear-gradient(135deg,#db2777,#ec4899)" delay={0.2} />
          <StatCard icon={TrendingUp} label="This Week"
            value={chartData.reduce((s, d) => s + d.count, 0)}
            subtitle="Last 7 days" gradient="linear-gradient(135deg,#0d9488,#14b8a6)" delay={0.25} />
        </div>
      </div>

      {/* Chart + Category */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }} className="xl:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Activity (Last 7 Days)</h3>
            <span className="text-xs text-slate-400 px-3 py-1 rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)' }}>Certificates generated</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="certGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5}
                fill="url(#certGrad)" dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-5">By Category</h3>
          {byCategory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
              <Award size={32} className="mb-3 opacity-40" />
              <p>No data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {byCategory.map((cat) => {
                const cfg = CATEGORY_CONFIG[cat._id] || CATEGORY_CONFIG.other;
                const pct = stats?.totalCertificates
                  ? Math.round((cat.count / stats.totalCertificates) * 100)
                  : 0;
                return (
                  <div key={cat._id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-300 font-medium">{cfg.label}</span>
                      <span className="text-slate-400">{cat.count}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ background: cfg.bg }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }} className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Recent Generations</h3>
          <Link to="/history" className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {!recentGens.length ? (
          <div className="text-center py-12 text-slate-500">
            <Clock size={40} className="mx-auto mb-3 opacity-30" />
            <p>No certificates generated yet.</p>
            <Link to="/generate" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
              Generate your first batch →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <th className="text-left py-3 pr-4">Type</th>
                  <th className="text-left py-3 pr-4">Category</th>
                  <th className="text-left py-3 pr-4">Course</th>
                  <th className="text-left py-3 pr-4">Count</th>
                  <th className="text-left py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentGens.map((g, i) => {
                  const cfg = CATEGORY_CONFIG[g.category] || CATEGORY_CONFIG.other;
                  return (
                    <motion.tr key={g.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + i * 0.05 }}
                      className="border-b hover:bg-white/3 transition-colors"
                      style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="py-3 pr-4 text-sm font-medium text-white">{g.typeName}</td>
                      <td className="py-3 pr-4">
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                          style={{ background: `${cfg.color}22`, color: cfg.color }}>{cfg.label}</span>
                      </td>
                      <td className="py-3 pr-4 text-sm text-slate-400 truncate max-w-[120px]">{g.courseName || '—'}</td>
                      <td className="py-3 pr-4 text-sm text-slate-300">{g.namesCount} certs</td>
                      <td className="py-3 text-sm text-slate-400">
                        {new Date(g.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
