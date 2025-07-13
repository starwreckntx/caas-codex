import React from 'react';
import { UploadIcon } from '../constants';

interface WelcomeScreenProps {
  onFilesAdded: (files: File[]) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onFilesAdded }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files && files.length > 0) {
      onFilesAdded(files);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/80">
      <div className="max-w-md">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/30">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-green-300 mb-2">Welcome to Hue and Logic</h2>
        <p className="text-green-500 mb-6">
          // Begin by ingesting data streams to construct a knowledge base.
        </p>
        <label htmlFor="welcome-file-upload" className="inline-flex items-center justify-center bg-green-900/80 hover:bg-green-800 border-2 border-green-700 hover:border-green-500 text-green-300 font-bold py-2 px-6 rounded-md transition-colors duration-200 cursor-pointer">
          <UploadIcon />
          <span className="ml-2">Ingest Data</span>
        </label>
        <input id="welcome-file-upload" type="file" className="hidden" multiple onChange={handleFileChange} accept=".txt,.md,.json,.csv,.pdf" />
      </div>
    </div>
  );
};