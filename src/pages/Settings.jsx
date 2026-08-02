import { motion } from 'framer-motion';
import { Server, Database, Globe, Info } from 'lucide-react';

export default function Settings() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Application configuration and system info.</p>
      </motion.div>

      <div className="space-y-5">
        {/* Backend config */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <Server size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Backend API</h2>
              <p className="text-xs text-slate-400">Node.js + Express server configuration</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'API Base URL', value: 'http://localhost:5000' },
              { label: 'Framework', value: 'Express.js 4.x' },
              { label: 'Image Processing', value: 'Jimp (pure JS)' },
              { label: 'PDF Generation', value: 'pdf-lib' },
              { label: 'File Archives', value: 'Archiver (ZIP)' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="text-sm text-white font-medium font-mono">{row.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* DB config */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
              <Database size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Database</h2>
              <p className="text-xs text-slate-400">MongoDB connection settings</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Connection URI', value: 'mongodb://localhost:27017/certstudio' },
              { label: 'ORM', value: 'Mongoose 8.x' },
              { label: 'Collections', value: 'certificatetypes, generations' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="text-sm text-white font-medium font-mono break-all text-right ml-4">{row.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Frontend */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #db2777, #ec4899)' }}>
              <Globe size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Frontend</h2>
              <p className="text-xs text-slate-400">React application details</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Framework', value: 'React 18 + Vite' },
              { label: 'Styling', value: 'Tailwind CSS v4' },
              { label: 'Animations', value: 'Framer Motion' },
              { label: 'Charts', value: 'Recharts' },
              { label: 'Dev Port', value: 'http://localhost:3000' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center py-2 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="text-sm text-white font-medium font-mono">{row.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}>
              <Info size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">About CertStudio</h2>
              <p className="text-xs text-slate-400">Version 1.0.0</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4 leading-relaxed">
            CertStudio is a professional certificate generation platform built for educational institutions.
            Upload certificate templates, import names from Excel spreadsheets, and instantly generate
            personalized certificates for courses, internships, and industrial visits.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
