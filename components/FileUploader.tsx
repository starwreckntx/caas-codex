import React, { useState, useCallback } from 'react';
import { UploadIcon } from '../constants';

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFilesAdded }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files && files.length > 0) {
      onFilesAdded(files);
    }
  }, [onFilesAdded]);

  return (
    <label
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group flex flex-col items-center justify-center w-full h-32 px-4 transition bg-black/50 border-2 ${isDragOver ? 'border-green-500 shadow-[0_0_15px_rgba(0,255,65,0.5)]' : 'border-green-900/80'} border-dashed rounded-md appearance-none cursor-pointer hover:border-green-600 focus:outline-none`}
    >
      <span className="flex items-center space-x-2">
        <UploadIcon />
        <span className="font-medium text-green-700 group-hover:text-green-400 transition-colors">
          Drop data streams, or
          <span className="text-green-500 underline ml-1">browse</span>
        </span>
      </span>
      <input type="file" name="file_upload" className="hidden" multiple onChange={handleFileChange} accept=".txt,.md,.json,.csv,.pdf" />
    </label>
  );
};