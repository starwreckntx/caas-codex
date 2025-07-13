import React, { useState } from 'react';
import { personaNames } from '../services/geminiService';
import type { PersonaMemoryBank } from '../types';
import { BrainIcon } from '../constants';

interface PersonaMemoryViewerProps {
  personaMemories: PersonaMemoryBank;
}

export const PersonaMemoryViewer: React.FC<PersonaMemoryViewerProps> = ({ personaMemories }) => {
  const [selectedPersona, setSelectedPersona] = useState(personaNames[0]);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
        <h2 
            className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-2 cursor-pointer"
            onClick={() => setIsOpen(!isOpen)}
        >
            <BrainIcon />
            // Persona Memory Banks
            <span className={`transition-transform transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}>&gt;</span>
        </h2>
        {isOpen && (
            <div className="space-y-2 bg-black/30 p-2 rounded-md border border-green-900/50">
            <select
                value={selectedPersona}
                onChange={(e) => setSelectedPersona(e.target.value)}
                className="w-full bg-black/80 border-2 border-green-900/50 rounded-md p-2 text-sm text-green-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
            >
                {personaNames.map(name => (
                <option key={name} value={name}>{name}</option>
                ))}
            </select>
            <textarea
                value={personaMemories[selectedPersona] || '// No memories recorded for this persona yet.'}
                readOnly
                rows={8}
                className="w-full bg-black/80 border-2 border-green-900/50 rounded-md p-2 text-xs text-green-400 focus:ring-2 focus:ring-green-500 focus:outline-none focus:bg-black"
            />
            </div>
        )}
    </div>
  );
};
