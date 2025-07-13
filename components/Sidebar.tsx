import React, { useRef, useState } from 'react';
import type { AppFile, PersonaMemoryBank } from '../types';
import { FileUploader } from './FileUploader';
import { FileIcon, PlusIcon, GithubIcon, MagicWandIcon, SaveIcon, LoadIcon, BrainIcon, SyncIcon } from '../constants';
import { personaNames } from '../services/geminiService';
import { PersonaMemoryViewer } from './PersonaMemoryViewer';

type ViewMode = 'chat' | 'agentic';

const SynthesisLogIcon = (): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-cyan-400">
    <path d="M15.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L15.5 2z"/>
    <path d="m14 2-4.5 4.5"/>
    <path d="m14 2 1.5 5 5 1.5"/>
  </svg>
);


interface SidebarProps {
  files: AppFile[];
  onFilesAdded: (addedFiles: File[]) => void;
  onRemoveFile: (fileName: string) => void;
  onNewCognition: () => void;
  onLoadCodex: () => void;
  isCodexLoading: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  systemInstruction: string;
  onSystemInstructionChange: (instruction: string) => void;
  onSaveState: () => void;
  onLoadState: (file: File) => void;
  personaMemories: PersonaMemoryBank;
  logicStreamMemory: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  files, 
  onFilesAdded, 
  onRemoveFile, 
  onNewCognition, 
  onLoadCodex, 
  isCodexLoading,
  viewMode,
  onViewModeChange,
  systemInstruction,
  onSystemInstructionChange,
  onSaveState,
  onLoadState,
  personaMemories,
  logicStreamMemory,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const baseButtonClass = "w-full flex items-center justify-center font-bold py-2 px-4 rounded-md transition-colors duration-200 border-2 border-green-900/50 hover:border-green-500";
  const activeButtonClass = "bg-green-800/50 text-green-300 shadow-[0_0_10px_rgba(0,255,65,0.5)] border-green-500";
  const inactiveButtonClass = "bg-black/50 hover:bg-green-900/50 text-green-500";

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          onLoadState(file);
      }
      if(e.target) e.target.value = '';
  };

  return (
    <aside className="w-80 bg-black/50 border-r-2 border-green-900/50 flex flex-col p-4 space-y-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center mb-2 h-16">
          <h1 className="glitch text-green-400" data-text="Hue and Logic">Hue and Logic</h1>
        </div>

        <div className="space-y-2">
          <button 
            onClick={onNewCognition}
            className={`${baseButtonClass} bg-green-900/80 hover:bg-green-800 text-green-300`}
          >
            <PlusIcon />
            New Session
          </button>
          <button 
            onClick={() => onViewModeChange('chat')}
            className={`${baseButtonClass} ${viewMode === 'chat' ? activeButtonClass : inactiveButtonClass}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Logic Stream
          </button>
          <button 
            onClick={() => onViewModeChange('agentic')}
            className={`${baseButtonClass} ${viewMode === 'agentic' ? activeButtonClass : inactiveButtonClass}`}
          >
            <MagicWandIcon />
            Cognitive Synthesis
          </button>
          <button
            onClick={onLoadCodex}
            disabled={isCodexLoading}
            className="w-full flex items-center justify-center bg-black/50 hover:bg-green-900/50 text-green-500 font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait border-2 border-green-900/50 hover:border-green-500"
          >
            <GithubIcon />
            {isCodexLoading ? 'Ingesting...' : 'Ingest Codex'}
          </button>
        </div>
      </div>
      
      <div className="flex-shrink-0 space-y-2 pt-4 border-t-2 border-green-900/50">
          <h2 className="text-sm font-bold text-green-600 uppercase tracking-wider">// Session State</h2>
          <button onClick={onSaveState} className={`${baseButtonClass} ${inactiveButtonClass}`}>
              <SaveIcon /> Save State
          </button>
          <button onClick={handleLoadClick} className={`${baseButtonClass} ${inactiveButtonClass}`}>
              <LoadIcon /> Load State
          </button>
          <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".fieldstate.json,application/json"
              onChange={handleFileChange}
          />
      </div>

      <div className="flex-grow flex flex-col min-h-0 pt-4 border-t-2 border-green-900/50">
        
        <div className='space-y-4 overflow-y-auto pr-2'>
            <div>
              <h2 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <SyncIcon />
                // Real-Time Memory
              </h2>
              <textarea
                value={logicStreamMemory || '// No Logic Stream conclusions yet.'}
                readOnly
                rows={6}
                className="w-full bg-black/80 border-2 border-green-900/50 rounded-md p-2 text-xs text-green-400 focus:ring-2 focus:ring-green-500 focus:outline-none focus:bg-black"
              />
            </div>

            <PersonaMemoryViewer personaMemories={personaMemories} />

            <div>
              <h2 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2">// System Directive</h2>
              <textarea
                value={systemInstruction}
                onChange={(e) => onSystemInstructionChange(e.target.value)}
                rows={5}
                className="w-full bg-black/80 border-2 border-green-900/50 rounded-md p-2 text-sm text-green-300 focus:ring-2 focus:ring-green-500 focus:outline-none focus:bg-black mb-4 flex-shrink-0"
                placeholder="// Define AI core behavior..."
                disabled={viewMode !== 'chat'}
              />
            </div>
            
            <div>
              <h2 className="text-sm font-bold text-green-600 uppercase tracking-wider mb-3">// Knowledge Base</h2>
              <div className="flex-shrink-0">
                  <FileUploader onFilesAdded={onFilesAdded} />
              </div>
              
              <div className="mt-4">
                {files.map((file) => (
                  <div key={file.name} className={`flex items-center justify-between bg-black/40 border-2 ${file.isSynthesisLog ? 'border-cyan-700/50' : 'border-transparent'} hover:border-green-700/50 p-2 rounded-md mb-2 group`}>
                    <div className="flex items-center overflow-hidden">
                      <div className="flex-shrink-0 mr-3">{file.isSynthesisLog ? <SynthesisLogIcon /> : <FileIcon />}</div>
                      <span className={`text-sm ${file.isSynthesisLog ? 'text-cyan-300' : 'text-green-400'} truncate`} title={file.name}>{file.name}</span>
                    </div>
                    <button 
                      onClick={() => onRemoveFile(file.name)} 
                      className="text-green-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0 disabled:opacity-0 disabled:cursor-not-allowed"
                      aria-label={`Remove ${file.name}`}
                      disabled={!!file.isSynthesisLog}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {files.length === 0 && (
                  <div className="text-center text-sm text-green-700 py-4">
                      {viewMode === 'chat' ? '// Ingest data streams to begin.' : '// Knowledge base not utilized.'}
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>
    </aside>
  );
};
