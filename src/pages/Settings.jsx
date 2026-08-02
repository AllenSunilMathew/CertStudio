import { motion } from "framer-motion";
import { Info, Sparkles, Coffee } from "lucide-react";

export default function Settings() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">
          Nothing much to configure... just good vibes. 😎
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #0d9488, #14b8a6)",
            }}
          >
            <Info size={22} className="text-white" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              About CertStudio
            </h2>
            <p className="text-sm text-slate-400">Version 1.0.0 🚀</p>
          </div>
        </div>

        <p className="text-slate-300 leading-8">
          <strong>CertStudio</strong> is your friendly certificate factory.
          Upload a template, import names from Excel, click a button, and watch
          certificates appear faster than students asking,
          <span className="text-cyan-400">
            {" "}
            "Sir, when will we get our certificate?"
          </span>
          😅
        </p>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-3 text-slate-300">
            <Sparkles className="text-yellow-400" size={18} />
            <span>No copy-paste nightmares.</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <Sparkles className="text-pink-400" size={18} />
            <span>Excel goes in. Beautiful certificates come out.</span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <Coffee className="text-amber-400" size={18} />
            <span>
              Saves hours of work... leaving more time for coffee. ☕
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-300">
            <Sparkles className="text-green-400" size={18} />
            <span>Powered by pixels, patience, and a tiny bit of magic. ✨</span>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-center text-slate-300 italic">
            "Generating certificates since people realized doing them manually
            was a terrible life choice." 😂
          </p>
        </div>
      </motion.div>
    </div>
  );
}
