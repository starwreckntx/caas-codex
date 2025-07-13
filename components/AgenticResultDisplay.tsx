import React from 'react';
import type { Iteration, PersonaOutput } from '../types';

interface AgenticResultDisplayProps {
  iterations: Iteration[];
}

const PersonaCard: React.FC<{ persona: PersonaOutput }> = ({ persona }) => {
    return (
        <div className="bg-black/40 rounded-lg p-4 mb-4 border border-green-900/50">
            <h4 className="font-bold text-green-400 text-lg mb-2">// {persona.name}</h4>
            <div className="prose prose-invert prose-sm max-w-none">
                <p className="text-green-500 italic mb-2"><strong className="text-green-300 not-italic">Chain of Thought:</strong> {persona.thought}</p>
                <p className="text-green-300"><strong className="text-green-300">Contribution:</strong> {persona.contribution}</p>
            </div>
        </div>
    );
};

const FinalResultCard: React.FC<{ persona: PersonaOutput }> = ({ persona }) => {
    return (
        <div className="bg-gradient-to-br from-green-900/70 to-black/70 rounded-lg p-6 my-6 border-2 border-green-500 shadow-[0_0_20px_rgba(0,255,65,0.4)]">
            <h3 className="font-bold text-white text-2xl mb-3 text-center">// Final Synthesized Concept</h3>
            <div className="prose prose-invert max-w-none text-green-200 leading-relaxed whitespace-pre-wrap">
                {persona.contribution}
            </div>
        </div>
    );
};

export const AgenticResultDisplay: React.FC<AgenticResultDisplayProps> = ({ iterations }) => {
  return (
    <div className="space-y-8">
      {iterations.map((iter, index) => {
        const isFinalIteration = index === iterations.length - 1;

        return (
          <div key={iter.iteration} className="p-4 border-l-4 border-green-800/70">
            <h2 className="text-3xl font-bold text-white mb-6">// Iteration {iter.iteration}</h2>
            {iter.personas.map((persona, pIndex) => {
              const isFinalClerk = isFinalIteration && persona.name.includes('Canvas Log Clerk');
              
              if(isFinalClerk) {
                  return <FinalResultCard key={pIndex} persona={persona} />;
              }
              
              return <PersonaCard key={pIndex} persona={persona} />;
            })}
            {iter.refinedIdea && !isFinalIteration && (
                <div className="mt-6 bg-black/50 p-4 rounded-lg border border-green-900">
                     <h4 className="font-semibold text-green-400 text-lg mb-2">// Refined Concept (Cycle {iter.iteration} complete)</h4>
                     <p className="text-green-300 whitespace-pre-wrap">{iter.refinedIdea}</p>
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
};