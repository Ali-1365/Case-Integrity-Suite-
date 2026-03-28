
import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, Loader2, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  isParsing?: boolean;
  parsingError?: string | null;
  maxFiles?: number;
  acceptedTypes?: string[];
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFilesSelect, 
  isParsing, 
  parsingError,
  maxFiles = 10,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      setSelectedFiles(files);
      onFilesSelect(files);
    }
  }, [onFilesSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      setSelectedFiles(files);
      onFilesSelect(files);
    }
  };

  const removeFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isParsing && fileInputRef.current?.click()}
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-[2rem] p-10
          transition-all duration-500 ease-out
          flex flex-col items-center justify-center text-center
          ${isDragging 
            ? 'border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.02] shadow-2xl shadow-[var(--accent)]/10' 
            : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/50 hover:bg-[var(--bg-main)]'
          }
          ${isParsing ? 'opacity-50 cursor-wait' : ''}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept=".pdf,.docx,.txt,.xlsx,.xls,.csv,.json"
          disabled={isParsing}
        />

        <div className={`
          w-20 h-20 rounded-[1.5rem] mb-6 flex items-center justify-center
          transition-all duration-500
          ${isDragging ? 'bg-[var(--accent)] text-white rotate-12' : 'bg-[var(--bg-main)] text-[var(--ink-muted)] group-hover:text-[var(--accent)] group-hover:scale-110'}
        `}>
          {isParsing ? (
            <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
            <Upload className="w-10 h-10" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-[var(--ink-main)] tracking-tight uppercase">
            {isParsing ? 'Analyserar dokument...' : 'Ladda upp bevisning'}
          </h3>
          <p className="text-sm font-medium text-[var(--ink-muted)] max-w-[280px] mx-auto leading-relaxed">
            Dra och släpp filer här eller klicka för att bläddra. Stöder PDF, Word, Excel och JSON.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <File className="w-12 h-12" />
        </div>
      </div>

      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[1.5rem] p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--accent)]">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-[var(--ink-main)] uppercase tracking-widest">
                  {selectedFiles.length} {selectedFiles.length === 1 ? 'fil' : 'filer'} valda
                </p>
                <p className="text-[10px] font-medium text-[var(--ink-muted)] truncate max-w-[200px]">
                  {selectedFiles.map(f => f.name).join(', ')}
                </p>
              </div>
            </div>
            {!isParsing && (
              <button
                onClick={(e) => { e.stopPropagation(); removeFiles(); }}
                className="p-2 hover:bg-rose-50 text-[var(--ink-muted)] hover:text-rose-500 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
            )}
          </motion.div>
        )}

        {parsingError && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-rose-50 border border-rose-100 rounded-[1.5rem] p-4 flex items-center gap-3 text-rose-600"
          >
            <AlertCircle size={20} />
            <p className="text-xs font-bold uppercase tracking-tight">{parsingError}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUpload;
