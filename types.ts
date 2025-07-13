export enum Role {
  User = 'user',
  Model = 'model',
}

export interface Message {
  role: Role;
  text: string;
}

export interface AppFile {
  name: string;
  content: string;
  isSynthesisLog?: boolean;
}

export interface PersonaOutput {
    name: string;
    thought: string;
    contribution: string;
}

export interface Iteration {
    iteration: number;
    personas: PersonaOutput[];
    refinedIdea?: string;
}

export type PersonaMemoryBank = Record<string, string>;

export interface FieldState {
  files: AppFile[];
  messages: Message[];
  systemInstruction: string;
  viewMode: 'chat' | 'agentic';
  agenticState: {
    isLoading: boolean;
    result: Iteration[] | null;
    error: string | null;
  };
  agenticSeedIdea: string | null;
  personaMemories: PersonaMemoryBank;
  logicStreamMemory: string;
}
