import React from 'react';

export const UserIcon = (): React.ReactNode => (
  <div className="w-8 h-8 rounded-full bg-green-900 border-2 border-green-500 flex items-center justify-center font-bold text-green-300 flex-shrink-0">
    &gt;
  </div>
);

export const ModelIcon = (): React.ReactNode => (
  <div className="w-8 h-8 rounded-full bg-black border-2 border-green-500 flex items-center justify-center flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/>
      <path d="M19 17v4"/>
      <path d="M3 5h4"/>
      <path d="M17 19h4"/>
    </svg>
  </div>
);

export const SendIcon = (): React.ReactNode => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="m22 2-7 20-4-9-9-4Z"/>
        <path d="M22 2 11 13"/>
    </svg>
);

export const UploadIcon = (): React.ReactNode => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-green-700 group-hover:text-green-400 transition-colors">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" x2="12" y1="3" y2="15"/>
    </svg>
);


export const FileIcon = (): React.ReactNode => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-600">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
    </svg>
);

export const PlusIcon = (): React.ReactNode => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

export const GithubIcon = (): React.ReactNode => (
    <svg fill="currentColor" className="h-5 w-5 mr-2" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
    </svg>
);

export const MagicWandIcon = (): React.ReactNode => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/>
        <path d="M19 17v4"/>
        <path d="M3 5h4"/>
        <path d="M17 19h4"/>
    </svg>
);

export const DownloadIcon = (): React.ReactNode => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);

export const SaveIcon = (): React.ReactNode => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

export const LoadIcon = (): React.ReactNode => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        <path d="M12 22V12" />
        <path d="M18 12v-2a4 4 0 0 0-4-4H8" />
    </svg>
);

export const BrainIcon = (): React.ReactNode => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-600">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.23a.5.5 0 0 0 .3.45L18 9l-2.73 1.64a.5.5 0 0 0-.3.44v2.73a2.5 2.5 0 0 1-5 0v-1.23a.5.5 0 0 0-.3-.45L4 9l5.7-3.42A.5.5 0 0 0 10 5.12V4.5A2.5 2.5 0 0 1 9.5 2z"/>
        <path d="M5 14.5A2.5 2.5 0 0 0 7.5 17h1"/>
        <path d="M15.5 17a2.5 2.5 0 0 0 2.5-2.5"/>
        <path d="M19 14.5a2.5 2.5 0 0 1-2.5 2.5h-1"/>
        <path d="M8.5 17a2.5 2.5 0 0 1-2.5-2.5"/>
        <path d="M12 22a2.5 2.5 0 0 0 2.5-2.5"/>
        <path d="M12 22a2.5 2.5 0 0 1-2.5-2.5"/>
    </svg>
);

export const SyncIcon = (): React.ReactNode => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-green-600">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M3 21v-5h5"/>
    </svg>
);
