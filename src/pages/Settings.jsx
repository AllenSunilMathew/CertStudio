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
