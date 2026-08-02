import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, X, FileText, Image, FileSpreadsheet, File } from 'lucide-react';

const EXT_ICON_MAP = {
  png: Image, jpg: Image, jpeg: Image, webp: Image,
  svg: Image, bmp: Image, gif: Image,
  pdf: FileText,
  xlsx: FileSpreadsheet, xls: FileSpreadsheet, csv: FileSpreadsheet,
};

function getFileIcon(filename) {
  if (!filename) return File;
  const ext = filename.split('.').pop()?.toLowerCase();
  return EXT_ICON_MAP[ext] || File;
}

export default function FileUploadZone({
  onFileAccepted,
  accept,
  label,
  subLabel,
  currentFile,
  onRemove,
  disabled,
  compact = false,
}) {
  // Build a friendl list of accepted extensions from the accept object
  const acceptedExts = accept
    ? Object.values(accept).flat().join('  ·  ')
    : '';

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop: (accepted) => accepted[0] && onFileAccepted(accepted[0]),
    accept,
    maxFiles: 1,
    disabled,
  });

  const hasRejection = fileRejections.length > 0;
  const FileIcon = currentFile ? getFileIcon(currentFile.name || currentFile) : Upload;

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {currentFile ? (
          <motion.div
            key="file-selected"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
              <FileIcon size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentFile.name || currentFile}
              </p>
              {currentFile.size && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {(currentFile.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
            <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            {onRemove && (
              <button onClick={onRemove}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            className={`upload-zone flex flex-col items-center justify-center text-center cursor-pointer select-none
              ${compact ? 'p-3' : 'p-8'}
              ${isDragActive ? 'drag-active' : ''}
              ${hasRejection ? '!border-red-500/50' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />

            {/* Icon */}
            {!compact ? (
              <motion.div
                animate={isDragActive ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: isDragActive
                    ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                    : hasRejection
                    ? 'rgba(239,68,68,0.15)'
                    : 'rgba(99,102,241,0.15)',
                }}
              >
                <Upload size={28} className={isDragActive ? 'text-white' : hasRejection ? 'text-red-400' : 'text-indigo-400'} />
              </motion.div>
            ) : (
              <Upload size={18} className="text-indigo-400 mb-1" />
            )}

            {/* Label */}
            <p className={`font-semibold text-white ${compact ? 'text-xs' : 'text-base mb-1'}`}>
              {isDragActive
                ? '✓ Drop it here!'
                : hasRejection
                ? '✗ File type not supported'
                : label || 'Upload file'}
            </p>

            {/* Sub-label: show accepted extensions */}
            {!compact && (
              <p className={`text-xs mt-0.5 ${hasRejection ? 'text-red-400' : 'text-slate-400'}`}>
                {hasRejection
                  ? `Accepted: ${acceptedExts || 'specific formats only'}`
                  : subLabel || acceptedExts || 'Drag & drop or click to browse'}
              </p>
            )}

            {/* Accepted badges (non-compact, no current file, no rejection) */}
            {!compact && !hasRejection && acceptedExts && (
              <div className="flex flex-wrap justify-center gap-1 mt-3">
                {Object.values(accept || {}).flat().slice(0, 8).map(ext => (
                  <span key={ext} className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                    {ext}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
