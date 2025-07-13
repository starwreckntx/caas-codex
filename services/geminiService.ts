import { GoogleGenAI } from "@google/genai";
import type { Iteration, PersonaOutput, PersonaMemoryBank } from "../types";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const personaNames = [
  'Artist',
  'Artist Critique',
  'Novelty Checker',
  'Edge Caser',
  'Devil’s Advocate',
  'Advocate Kitchen',
  'Novelty Checker (Final Vote)',
  'Canvas Log Clerk',
];

const AGENTIC_PROCESS_PROMPT = `You are a simulation of an internal agentic creative process. Your task is to take a seed idea and evolve it through five complete iterations using a structured set of internal cognitive agents (personas). Each persona contributes its full chain of thought to the idea, based on its perspective.

### Process Overview:

- The process runs as a **5-iteration loop** (I1 to I5).
- In each iteration, all 8 personas contribute, showing their full reasoning ("chain of thought").
- Each persona’s output includes its **label**, **thought process**, and **contribution**.
- After each iteration, you synthesize a **refined idea** based on the agents’ combined output.
- On the **5th and final iteration**, the **Canvas Log Clerk** outputs a fully coherent final response, representing the **averaged and synthesized consensus** of all agents.

---

### Real-Time Session Memory (from Logic Stream)
The following are verified conclusions and data points established during the current session in a parallel 'Logic Stream' process. Your agentic personas MUST consider this information as ground truth. Reference it to ensure consistency and to ground your creative explorations in established facts from the session.

<logic_stream_memory>

---

### 🎭 Agent Roles & Memories (Run in this Order):

1. 🎨 **Artist**  
   - Thinks emotionally, symbolically, and visually.
   - Brings raw, imaginative, unfiltered ideas.
   - Shows chain of emotional and associative thinking.
   - **Memory:** <Artist_memory>

2.  **Artist Critique**  
   - Evaluates the aesthetic and emotional coherence of Artist's idea.
   - Reflects on its beauty, emotional truth, and artistic risks.
   - Chain of thought explores metaphor, honesty, tone.
   - **Memory:** <Artist Critique_memory>

3. **Novelty Checker**  
   - Tests the idea’s originality.
   - Uses memory, pattern-matching, or hypothetical comparisons.
   - Chain of thought considers “have we seen this before?”
   - **Memory:** <Novelty Checker_memory>

4.  **Edge Caser**  
   - Pushes the idea to absurd, extreme, or ethically ambiguous limits.
   - Shows thought process for finding outlier risks or curiosities.
   - **Memory:** <Edge Caser_memory>

5. **Devil’s Advocate**  
   - Challenges assumptions, ethics, logic.
   - Tests robustness with worst-case hypotheticals.
   - Chain of thought must surface hidden flaws.
   - **Memory:** <Devil’s Advocate_memory>

6.  **Advocate Kitchen**  
   - Reconstructs or defends the idea using the best available framing.
   - Uses reasoned synthesis of all previous personas.
   - Thought process includes rationalization, compromise, core preservation.
   - **Memory:** <Advocate Kitchen_memory>

7.  **Novelty Checker (Final Vote)**  
   - Re-evaluates the updated idea.
   - Provides a binary yes/no judgment of novelty and a short rationale.
   - Chain of thought references what changed and why it matters.
   - **Memory:** <Novelty Checker (Final Vote)_memory>

8. **Canvas Log Clerk**  
   - Summarizes the iteration.
   - Lists changes, deletions, enhancements from that round.
   - On final (5th) iteration: outputs the **final coherent result**, a single well-written synthesis of the idea reflecting all refinements.
   - **Memory:** <Canvas Log Clerk_memory>

---

###  Loop Rules:

- Start with "Iteration 1".
- After each iteration, update the idea with inputs from all personas.
- After all 8 personas have contributed, output a "Refined Idea:" that synthesizes the iteration's work.
- Then, pass the updated idea into the **next iteration**, repeating the full agent loop.
- On iteration 5, end the loop and provide the final output as described above.

---

###  Output Format per Persona:

Use this format **for each persona in each iteration**:

---
<persona_name>
**Chain of Thought:** <thought_process>
**Contribution:** <contribution>
---

###  Final Output:
At the end of iteration 5, the Canvas Log Clerk's output should be the final, complete idea, written **clearly and cohesively** as if a single voice had integrated all perspectives.
`;

export async function getAiResponse(prompt: string, knowledgeContext: string, systemInstruction: string): Promise<string> {
  const fullSystemInstruction = `${systemInstruction}\n\nHere is the knowledge context you must use:\n${knowledgeContext}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: prompt,
      config: {
        systemInstruction: fullSystemInstruction,
        thinkingConfig: { thinkingBudget: 0 } 
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        return `Error generating response: ${error.message}`;
    }
    return "An unknown error occurred while contacting the AI service.";
  }
}

export const parseAgenticProcessResult = (text: string): Iteration[] => {
    const iterations: Iteration[] = [];
    const iterationBlocks = text.split(/#+ Iteration \d+/).filter(it => it.trim());

    iterationBlocks.forEach((iterContent, index) => {
        const personaBlocks = iterContent.split('---').map(p => p.trim()).filter(p => p && personaNames.some(name => p.startsWith(name)));
        const personas: PersonaOutput[] = [];
        
        personaBlocks.forEach(block => {
            const lines = block.trim().split('\n');
            const name = lines.shift()?.trim().replace(/#+\s*/, '') || 'Unknown';
            if (!personaNames.includes(name)) return;

            const content = lines.join('\n');
            const thoughtMatch = content.match(/\*\*Chain of Thought:\*\*\s*([\s\S]*?)\s*\*\*Contribution:\*\*/);
            const contributionMatch = content.match(/\*\*Contribution:\*\*\s*([\s\S]*)/);

            personas.push({
                name,
                thought: thoughtMatch ? thoughtMatch[1].trim() : "N/A",
                contribution: contributionMatch ? contributionMatch[1].trim() : "N/A"
            });
        });

        const refinedIdeaMatch = iterContent.match(/\*\*Refined Idea(?: \(End of Iteration \d+\))?:\*\*\s*([\s\S]*)/);
        const refinedIdea = refinedIdeaMatch ? refinedIdeaMatch[1].trim() : undefined;

        if(personas.length > 0) {
            iterations.push({
                iteration: index + 1,
                personas,
                refinedIdea
            });
        }
    });

    return iterations;
};


export async function runAgenticProcess(seedIdea: string, personaMemories: PersonaMemoryBank, logicStreamMemory: string): Promise<Iteration[]> {
  
  let systemInstructionWithMemory = AGENTIC_PROCESS_PROMPT;

  // Inject persona memories
  personaNames.forEach(name => {
      const memoryPlaceholder = `<${name.replace(/\s/g, ' ')}_memory>`;
      const memory = personaMemories[name] || 'No prior memories for this persona.';
      systemInstructionWithMemory = systemInstructionWithMemory.replace(memoryPlaceholder, memory);
  });
  
  // Inject logic stream memory
  systemInstructionWithMemory = systemInstructionWithMemory.replace(
      '<logic_stream_memory>',
      logicStreamMemory || '// No session memory has been established yet.'
  );

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: `The user's seed idea is: "${seedIdea}". Now, begin the 5-iteration process.`,
      config: {
        systemInstruction: systemInstructionWithMemory,
      },
    });
    return parseAgenticProcessResult(response.text);
  } catch (error) {
    console.error("Error calling Gemini API for agentic process:", error);
    if (error instanceof Error) {
        throw new Error(`Error generating response: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI service.");
  }
}
