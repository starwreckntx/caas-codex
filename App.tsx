import React, { useState, useCallback, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AgenticView } from './components/AgenticView';
import { Spinner } from './components/Spinner';
import { runAgenticProcess } from './services/geminiService';
import { getCodexFiles } from './services/githubService';
import type { AppFile, Message, FieldState, Iteration, PersonaMemoryBank } from './types';
import { Role } from './types';
import { getAiResponse, personaNames } from './services/geminiService';

type ViewMode = 'chat' | 'agentic';

const DEFAULT_SYSTEM_INSTRUCTION = `You are an advanced logic engine. Your purpose is to synthesize information from the provided knowledge context. Respond to user queries with precision and clarity, strictly adhering to the data given. If the answer cannot be derived from the context, state that the information is outside the current dataset. Your output must be concise and targeted.`;

const serializeIterationsToString = (iterations: Iteration[]): string => {
  let content = '';
  iterations.forEach((iter, index) => {
    content += `\n\n# Iteration ${index + 1}\n\n`;
    iter.personas.forEach(persona => {
      content += `---
### ${persona.name}
**Chain of Thought:** ${persona.thought}
**Contribution:** ${persona.contribution}
---\n`;
    });
    if (iter.refinedIdea) {
      content += `\n**Refined Idea (End of Iteration ${index + 1}):**\n${iter.refinedIdea}\n`;
    }
  });
  return content.trim();
};

const initialPersonaMemories = (): PersonaMemoryBank => {
    const memories: PersonaMemoryBank = {};
    personaNames.forEach(name => {
        memories[name] = '';
    });
    return memories;
};


export default function App(): React.ReactNode {
  const [files, setFiles] = useState<AppFile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCodexLoading, setIsCodexLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [systemInstruction, setSystemInstruction] = useState<string>(DEFAULT_SYSTEM_INSTRUCTION);

  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [agenticState, setAgenticState] = useState<{
    isLoading: boolean;
    result: Iteration[] | null;
    error: string | null;
  }>({ isLoading: false, result: null, error: null });
  const [agenticSeedIdea, setAgenticSeedIdea] = useState<string | null>(null);
  const [personaMemories, setPersonaMemories] = useState<PersonaMemoryBank>(initialPersonaMemories);
  const [logicStreamMemory, setLogicStreamMemory] = useState<string>('');


  useEffect(() => {
    if (files.length > 0 && messages.length === 0 && viewMode === 'chat' && !files.every(f => f.isSynthesisLog)) {
      setMessages([
        {
          role: Role.Model,
          text: `// Knowledge base ingested. ${files.filter(f => !f.isSynthesisLog).length} data streams active. Awaiting query...`,
        },
      ]);
    }
  }, [files, messages.length, viewMode]);

  const handleFilesAdded = useCallback(async (addedFiles: File[]) => {
    const newAppFiles: AppFile[] = [];
    for (const file of addedFiles) {
      try {
        const content = await file.text();
        newAppFiles.push({ name: file.name, content });
      } catch (e) {
        console.error('Error reading file:', file.name, e);
        setError(`// ERROR: Failed to parse data stream: ${file.name}`);
      }
    }
    setFiles((prevFiles) => [...prevFiles, ...newAppFiles]);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== fileName));
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (isLoading || isCodexLoading || files.length === 0) return;

    const userMessage: Message = { role: Role.User, text };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const knowledgeContext = files
        .map((f) => `--- DATA STREAM: ${f.name} ---\n${f.content}`)
        .join('\n\n');
      
      const responseText = await getAiResponse(text, knowledgeContext, systemInstruction);

      const timestamp = new Date().toLocaleString();
      const fileList = files.map(f => `> ${f.name}`).join('\n');
      const fullResponseText = `${responseText}\n\n---\n// METADATA\n// Timestamp: ${timestamp}\n// Knowledge Streams Referenced:\n${fileList}`;

      const modelMessage: Message = { role: Role.Model, text: fullResponseText };
      setMessages((prevMessages) => [...prevMessages, modelMessage]);

      // Update Logic Stream Memory
      const userQueryLog = `> USER_QUERY:\n${text}\n`;
      const modelResponseLog = `> LOGIC_CORE_RESPONSE:\n${responseText}\n\n---\n\n`; // using responseText before metadata
      setLogicStreamMemory(prev => prev + userQueryLog + modelResponseLog);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`// ERROR: AI Core Exception: ${errorMessage}`);
      const errorResponseMessage: Message = {
        role: Role.Model,
        text: `// System Error. Connection to logic core failed. ${errorMessage}`,
      };
      setMessages((prevMessages) => [...prevMessages, errorResponseMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isCodexLoading, files, systemInstruction]);
  
  const handleNewCognition = useCallback(() => {
    setFiles([]);
    setMessages([]);
    setError(null);
    setIsLoading(false);
    setIsCodexLoading(false);
    setViewMode('chat');
    setAgenticState({ isLoading: false, result: null, error: null });
    setAgenticSeedIdea(null);
    setSystemInstruction(DEFAULT_SYSTEM_INSTRUCTION);
    setPersonaMemories(initialPersonaMemories());
    setLogicStreamMemory('');
  }, []);

  const handleLoadCodex = useCallback(async () => {
    setIsCodexLoading(true);
    setError(null);
    try {
      const codexFiles = await getCodexFiles();
      setFiles(prev => [...prev.filter(f => f.isSynthesisLog), ...codexFiles]);
      setMessages([]);
      setViewMode('chat');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`// ERROR: Codex Ingest Failed: ${errorMessage}`);
    } finally {
      setIsCodexLoading(false);
    }
  }, []);

  const handleStartAgenticProcess = useCallback(async (seedIdea: string) => {
    setAgenticSeedIdea(seedIdea);
    setAgenticState({ isLoading: true, result: null, error: null });
    try {
      const resultIterations = await runAgenticProcess(seedIdea, personaMemories, logicStreamMemory);
      setAgenticState({ isLoading: false, result: resultIterations, error: null });

      // Update Persona Memories
      const updatedMemories = { ...personaMemories };
      resultIterations.forEach(iteration => {
          iteration.personas.forEach(persona => {
              const memoryLog = `---
[Thought from Iteration ${iteration.iteration}]: ${persona.thought}
[Contribution from Iteration ${iteration.iteration}]: ${persona.contribution}
---\n\n`;
              updatedMemories[persona.name] = (updatedMemories[persona.name] || '') + memoryLog;
          });
      });
      setPersonaMemories(updatedMemories);

      // Inject the result as a new knowledge file
      const logContent = serializeIterationsToString(resultIterations);
      const synthesisLog: AppFile = { 
        name: 'COGNITIVE_SYNTHESIS_LOG.md', 
        content: logContent, 
        isSynthesisLog: true 
      };
      setFiles(prevFiles => [...prevFiles.filter(f => !f.isSynthesisLog), synthesisLog]);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setAgenticState({ isLoading: false, result: null, error: `// ERROR: Agentic process terminated: ${errorMessage}` });
    }
  }, [personaMemories, logicStreamMemory]);

  const handleSaveState = useCallback(() => {
    const stateToSave: FieldState = {
      files,
      messages,
      systemInstruction,
      viewMode,
      agenticState,
      agenticSeedIdea,
      personaMemories,
      logicStreamMemory,
    };
    const blob = new Blob([JSON.stringify(stateToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    a.href = url;
    a.download = `hue-and-logic-fieldstate-${timestamp}.fieldstate.json`;
    document.body.appendChild(a);
a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [files, messages, systemInstruction, viewMode, agenticState, agenticSeedIdea, personaMemories, logicStreamMemory]);

  const handleLoadState = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          throw new Error("Failed to read file content.");
        }
        const loadedState: FieldState = JSON.parse(result);
  
        // Basic validation
        const requiredKeys: (keyof FieldState)[] = ['files', 'messages', 'systemInstruction', 'viewMode', 'agenticState'];
        for(const key of requiredKeys) {
            if(!(key in loadedState)) {
                throw new Error(`Invalid or corrupted state file format. Missing key: ${key}`);
            }
        }
        
        setFiles(loadedState.files);
        setMessages(loadedState.messages);
        setSystemInstruction(loadedState.systemInstruction);
        setViewMode(loadedState.viewMode);
        setAgenticState(loadedState.agenticState);
        setAgenticSeedIdea(loadedState.agenticSeedIdea ?? null);
        setPersonaMemories(loadedState.personaMemories ?? initialPersonaMemories());
        setLogicStreamMemory(loadedState.logicStreamMemory ?? '');
        setError(null);
  
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`// ERROR: Failed to load state file: ${errorMessage}`);
      }
    };
    reader.onerror = () => {
       setError(`// ERROR: Failed to read file: ${reader.error?.message}`);
    };
    reader.readAsText(file);
  }, []);

  const renderChatView = () => (
    isCodexLoading ? (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black/80">
        <Spinner />
        <p className="text-green-400 mt-4 text-lg animate-pulse">// Ingesting Codex...</p>
        <p className="text-green-700 mt-1 text-sm">// Source: starwreckntx/caas-codex</p>
      </div>
    ) : files.filter(f => !f.isSynthesisLog).length === 0 ? (
      <WelcomeScreen onFilesAdded={handleFilesAdded} />
    ) : (
      <ChatView
        files={files}
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        error={error}
      />
    )
  );

  return (
    <div className="flex h-screen font-sans bg-black/80 backdrop-blur-sm text-green-400">
      <Sidebar 
        files={files} 
        onFilesAdded={handleFilesAdded} 
        onRemoveFile={handleRemoveFile}
        onNewCognition={handleNewCognition}
        onLoadCodex={handleLoadCodex}
        isCodexLoading={isCodexLoading}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        systemInstruction={systemInstruction}
        onSystemInstructionChange={setSystemInstruction}
        onSaveState={handleSaveState}
        onLoadState={handleLoadState}
        personaMemories={personaMemories}
        logicStreamMemory={logicStreamMemory}
      />
      <main className="flex-1 flex flex-col h-screen">
        {viewMode === 'chat' ? renderChatView() : (
          <AgenticView 
            onStartProcess={handleStartAgenticProcess}
            state={agenticState}
            agenticSeedIdea={agenticSeedIdea}
          />
        )}
      </main>
    </div>
  );
}
