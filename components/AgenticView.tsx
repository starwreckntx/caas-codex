import React, { useState, useEffect } from 'react';
import { AgenticResultDisplay } from './AgenticResultDisplay';
import { Spinner } from './Spinner';
import { MagicWandIcon, SendIcon, DownloadIcon } from '../constants';
import type { Iteration } from '../types';

interface AgenticViewProps {
  onStartProcess: (seedIdea: string) => void;
  state: {
    isLoading: boolean;
    result: Iteration[] | null;
    error: string | null;
  };
  agenticSeedIdea: string | null;
}

const serializeResultForDownload = (iterations: Iteration[], seedIdea: string): string => {
    let content = `# Seed Input:\n${seedIdea}\n\n---\n\n# Cognitive Synthesis Log:\n`;
    iterations.forEach((iter, index) => {
      content += `\n\n## Iteration ${index + 1}\n\n`;
      iter.personas.forEach(persona => {
        content += `### ${persona.name}\n**Chain of Thought:** ${persona.thought}\n**Contribution:** ${persona.contribution}\n\n---\n`;
      });
      if (iter.refinedIdea) {
        content += `\n**Refined Idea (End of Iteration ${index + 1}):**\n${iter.refinedIdea}\n`;
      }
    });
    return content;
}

export const AgenticView: React.FC<AgenticViewProps> = ({ onStartProcess, state, agenticSeedIdea }) => {
  const [seedIdea, setSeedIdea] = useState('');

  useEffect(() => {
    if (agenticSeedIdea && !seedIdea) {
        setSeedIdea(agenticSeedIdea);
    }
  }, [agenticSeedIdea, seedIdea]);

  const handleStart = () => {
    if (seedIdea.trim() && !state.isLoading) {
      onStartProcess(seedIdea);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStart();
    }
  };
  
  const handleDownload = () => {
    if (!state.result) return;
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const content = serializeResultForDownload(state.result, agenticSeedIdea || seedIdea);
    
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hue-and-logic-synthesis-${timestamp}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col bg-black/80 h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {!state.isLoading && !state.result && !state.error && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/30">
                 <div className="text-green-400">
                    <MagicWandIcon />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-green-300 mb-2">Cognitive Synthesis Process</h2>
              <p className="text-green-500 mb-6">
                // Input a seed concept. The engine will run a 5-iteration agentic loop to evolve the concept. Full process chain will be logged.
              </p>
            </div>
          )}
          
          {state.isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <Spinner />
              <p className="text-green-400 mt-4 text-lg animate-pulse">// Cognitive process initiated...</p>
              <p className="text-green-700 mt-1 text-sm">// This may require extended cycles.</p>
            </div>
          )}

          {state.error && <p className="text-red-500 text-center text-lg mb-4">{state.error}</p>}
          
          {state.result && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-green-400">// Synthesis Complete</h2>
                <button
                  onClick={handleDownload}
                  className="flex items-center bg-black/50 hover:bg-green-900/50 text-green-400 font-bold py-2 px-3 rounded-md text-sm transition-colors border-2 border-green-900/50 hover:border-green-500"
                >
                  <DownloadIcon />
                  <span className="ml-2">Export Log</span>
                </button>
              </div>
              <AgenticResultDisplay iterations={state.result} />
            </>
          )}

        </div>
      </div>
      <div className="p-4 bg-black/50 border-t-2 border-green-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center bg-black/80 rounded-lg p-2 border-2 border-green-900/50 focus-within:border-green-500 focus-within:shadow-[0_0_10px_rgba(0,255,65,0.5)] transition-all">
            <textarea
              value={seedIdea}
              onChange={(e) => setSeedIdea(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter seed concept to initiate synthesis..."
              className="flex-1 bg-transparent text-green-300 placeholder-green-700 focus:outline-none resize-none"
              rows={2}
              disabled={state.isLoading}
            />
            <button
              onClick={handleStart}
              disabled={state.isLoading || !seedIdea.trim()}
              className="ml-4 p-3 rounded-md bg-green-900 text-green-300 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors self-end"
              aria-label="Start Synthesis"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};