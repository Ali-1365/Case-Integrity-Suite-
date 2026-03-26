
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
    if (files && files.length > 0) {
      setSelectedCount(files.length);
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

  const borderColor = isDragging ? 'border-indigo-500' : 'border-slate-200 dark:border-slate-800';
  const bgColor = isDragging ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : 'bg-slate-50 dark:bg-slate-950';

  return (
    <div className="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border-2 border-slate-100 dark:border-slate-800 transition-all duration-1000 hover:border-indigo-500/30 group/container relative overflow-hidden hover:shadow-[0_60px_150px_rgba(0,0,0,0.12)]">
       <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-indigo-500/5 rounded-full blur-[100px] group-hover/container:bg-indigo-500/10 transition-colors duration-1000"></div>
       
       <div className="flex justify-between items-center mb-10 relative z-10">
         <div>
           <h3 className="text-3xl font-serif font-black text-slate-900 dark:text-white tracking-tighter leading-none">Ladda upp dokument</h3>
           <p className="text-[12px] text-indigo-600 dark:text-indigo-400 uppercase font-black tracking-[0.4em] mt-4 opacity-100">Stöder PDF, Word, Excel, JSON, CSV</p>
         </div>
         {selectedCount > 0 && !isParsing && (
           <span className="text-[11px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-6 py-2.5 rounded-full font-black uppercase tracking-[0.3em] border-2 border-indigo-500/30 shadow-lg shadow-indigo-500/10">
             {selectedCount} valda
           </span>
         )}
       </div>
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center w-full h-80 border-4 border-dashed ${borderColor} ${bgColor} rounded-[3.5rem] cursor-pointer transition-all duration-1000 group overflow-hidden shadow-inner`}
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
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full animate-pulse"></div>
              <Spinner className="h-16 w-16 text-indigo-500 relative z-10 mx-auto" />
            </div>
            <p className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.5em] text-sm animate-pulse">Bearbetar dokument...</p>
          </div>
        ) : (
          <div className="text-center text-slate-400 relative z-20">
            <div className={`p-8 rounded-[2.5rem] mb-8 mx-auto w-fit transition-all duration-1000 ${isDragging ? 'bg-indigo-600 text-white scale-125 rotate-12 shadow-[0_30px_70px_rgba(79,70,229,0.5)]' : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-100 dark:border-slate-700 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 group-hover:shadow-2xl group-hover:shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-6'}`}>
                <UploadIcon className="h-12 w-12" />
            </div>
            <p className={`text-4xl font-serif font-black px-10 transition-colors duration-1000 tracking-tighter leading-none ${isDragging ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {isDragging ? 'Släpp filerna nu' : 'Dra och släpp filer här'}
            </p>
            <p className="text-base mt-5 text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.3em] opacity-60">eller klicka för att bläddra i systemet</p>
            
            <div className="flex flex-wrap gap-4 justify-center mt-10 px-8">
                {['PDF', 'DOCX', 'XLSX', 'JSON', 'CSV'].map(ext => (
                  <span key={ext} className="text-[11px] font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-5 py-2 rounded-2xl border-2 border-slate-100 dark:border-slate-700 uppercase tracking-[0.3em] shadow-sm group-hover:border-indigo-400/50 transition-colors duration-500">
                    {ext}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
      {parsingError && (
        <div className="mt-8 flex items-center gap-6 px-8 py-5 bg-rose-500/5 border-2 border-rose-500/30 rounded-[2.5rem] animate-in shake duration-700 shadow-lg shadow-rose-500/5">
          <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
          <p className="text-base text-rose-600 dark:text-rose-400 font-black leading-relaxed tracking-tight uppercase tracking-[0.1em]">{parsingError}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
