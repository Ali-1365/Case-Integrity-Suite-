
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

  const borderColor = isDragging ? 'border-cyan-400' : 'border-gray-600';
  const bgColor = isDragging ? 'bg-cyan-900/10' : 'bg-gray-800/50';

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-700">
       <div className="flex justify-between items-center mb-3">
         <h3 className="text-lg font-semibold text-white">Ladda upp dokument</h3>
         {selectedCount > 0 && !isParsing && (
           <span className="text-[10px] bg-cyan-900/40 text-cyan-400 px-2 py-1 rounded-md font-bold uppercase tracking-wider border border-cyan-800/50">
             {selectedCount} valda
           </span>
         )}
       </div>
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed ${borderColor} ${bgColor} rounded-lg cursor-pointer transition-all duration-300 hover:border-cyan-500/50`}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => handleFileChange(e.target.files)}
          accept=".pdf,.docx,.txt,.xlsx,.xls,.csv,.json"
          disabled={isParsing}
          multiple
        />
        {isParsing ? (
           <div className="text-center">
            <Spinner className="h-8 w-8 text-cyan-400 mb-2" />
            <p className="text-cyan-400 font-bold animate-pulse">Bearbetar dokument...</p>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <div className={`p-3 rounded-full mb-3 mx-auto w-fit transition-colors ${isDragging ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                <UploadIcon className="h-8 w-8" />
            </div>
            <p className={`font-semibold px-4 transition-colors ${isDragging ? 'text-cyan-400' : 'text-gray-300'}`}>
                {isDragging ? 'Släpp filerna nu' : 'Dra och släpp filer här'}
            </p>
            <p className="text-sm mt-1">Stöd för PDF, Word, Excel, JSON, CSV</p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-3 px-2">
                <span className="text-[8px] font-black text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700">PDF</span>
                <span className="text-[8px] font-black text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700">DOCX</span>
                <span className="text-[8px] font-black text-cyan-500/70 bg-gray-900 px-1.5 py-0.5 rounded border border-cyan-900/30">XLSX</span>
                <span className="text-[8px] font-black text-cyan-500/70 bg-gray-900 px-1.5 py-0.5 rounded border border-cyan-900/30">JSON</span>
                <span className="text-[8px] font-black text-cyan-500/70 bg-gray-900 px-1.5 py-0.5 rounded border border-cyan-900/30">CSV</span>
            </div>
          </div>
        )}
      </div>
      {parsingError && <p className="mt-2 text-sm text-red-400 font-medium px-2 py-1 bg-red-950/20 border border-red-900/30 rounded">{parsingError}</p>}
    </div>
  );
};

export default FileUpload;
