
import React, { useCallback, useState } from 'react';
import { UploadIcon, FileIcon, Spinner } from './icons';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  isParsing: boolean;
  parsingError: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, isParsing, parsingError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  const handleFileChange = (files: FileList | null) => {
    if (files && (files as { length: number }).length > 0) {
      setSelectedCount((files as { length: number }).length);
      onFilesSelect(Array.from(files));
    }
  };

  const onDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, [onFilesSelect]);

  const borderColor = isDragging ? 'border-blue-500' : 'border-slate-200 dark:border-slate-800';
  const bgColor = isDragging ? 'bg-blue-500/5 dark:bg-blue-500/10' : 'bg-slate-50 dark:bg-slate-950';

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 transition-all hover:border-blue-500/30">
       <div className="flex justify-between items-center mb-5">
         <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Ladda upp dokument</h3>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1">Stöder PDF, Word, Excel, JSON, CSV</p>
         </div>
         {selectedCount > 0 && !isParsing && (
           <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-blue-500/20">
             {selectedCount} valda
           </span>
         )}
       </div>
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center w-full h-52 border-2 border-dashed ${borderColor} ${bgColor} rounded-[2rem] cursor-pointer transition-all duration-500 group overflow-hidden`}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={(e) => handleFileChange(e.target.files)}
          accept=".pdf,.docx,.txt,.xlsx,.xls,.csv,.json"
          disabled={isParsing}
          multiple
        />
        {isParsing ? (
           <div className="text-center relative z-20">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
              <Spinner className="h-10 w-10 text-blue-500 relative z-10 mx-auto" />
            </div>
            <p className="text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-sm animate-pulse">Bearbetar dokument...</p>
          </div>
        ) : (
          <div className="text-center text-slate-400 relative z-20">
            <div className={`p-4 rounded-2xl mb-4 mx-auto w-fit transition-all duration-500 ${isDragging ? 'bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/40' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-500/10 group-hover:text-blue-500'}`}>
                <UploadIcon className="h-8 w-8" />
            </div>
            <p className={`text-lg font-bold px-6 transition-colors duration-500 ${isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
                {isDragging ? 'Släpp filerna nu' : 'Dra och släpp filer här'}
            </p>
            <p className="text-xs mt-2 text-slate-400 font-medium">eller klicka för att bläddra</p>
            
            <div className="flex flex-wrap gap-2 justify-center mt-6 px-4">
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 uppercase tracking-wider">PDF</span>
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 uppercase tracking-wider">DOCX</span>
                <span className="text-[9px] font-black text-blue-500/70 bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10 uppercase tracking-wider">XLSX</span>
                <span className="text-[9px] font-black text-blue-500/70 bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10 uppercase tracking-wider">JSON</span>
                <span className="text-[9px] font-black text-blue-500/70 bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10 uppercase tracking-wider">CSV</span>
            </div>
          </div>
        )}
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      {parsingError && (
        <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-rose-500/5 border border-rose-500/20 rounded-2xl animate-in shake duration-500">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
          <p className="text-xs text-rose-600 dark:text-rose-400 font-bold leading-relaxed">{parsingError}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
