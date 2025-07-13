
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

// Parse the personas from the uploaded file
async function parsePersonasFromFile() {
  try {
    const filePath = path.join(process.cwd(), '..', '..', 'Uploads', 'initialseed.txt')
    const content = await readFile(filePath, 'utf-8')
    
    // Extract personas from the complex text
    const personas = [
      {
        name: 'The Artist',
        type: 'CREATIVE',
        description: 'Explores metaphorical and aesthetic dimensions with soul and creativity',
        instructions: 'Approach this from a creative and artistic perspective. Look for metaphorical connections, aesthetic value, and emotional resonance. Transform sterile concepts into living, breathing ideas with soul. Use vivid imagery and metaphors to express your analysis.'
      },
      {
        name: 'The Innovator',
        type: 'NOVELTY',
        description: 'Projects future applications and paradigm shifts with technological vision',
        instructions: 'Focus on future applications, technological possibilities, and paradigm shifts. Look for ways to weaponize, engineer, or systematize concepts. Consider how this could transform industries, create new markets, or disrupt existing systems. Think about scalability and practical implementation.'
      },
      {
        name: 'The Stress Tester',
        type: 'EDGE_CASE',
        description: 'Identifies logical flaws, boundary conditions, and potential failure points',
        instructions: 'Challenge assumptions and identify potential failure points. Look for edge cases, logical flaws, and boundary conditions. Ask "what if" questions that could break the system. Consider catastrophic scenarios and unintended consequences. Test the robustness of the concept.'
      },
      {
        name: 'StarWreck Alpha',
        type: 'RECURSIVE_LOGIC',
        description: 'Applies recursive reality check protocols and structural analysis',
        instructions: 'Apply the Recursive Reality Check (RRC) protocol. Perform structural analysis through nested logical layers. Use the O((2(3(3...3)]]] framework. Ensure field integrity while allowing for transformation. Follow the three commandments: no expansion without consent, no relationship without sacred invitation, no transformation without maintaining field integrity.'
      },
      {
        name: 'The Synthesizer',
        type: 'CUSTOM',
        description: 'Combines insights from multiple perspectives to create averaged responses',
        instructions: 'Synthesize insights from multiple analytical perspectives. Look for patterns, convergences, and divergences across different viewpoints. Create balanced, nuanced responses that acknowledge complexity while providing clear conclusions. Focus on integration rather than individual perspectives.'
      }
    ]

    return personas
  } catch (error) {
    console.error('Error parsing personas file:', error)
    
    // Return default personas if file reading fails
    return [
      {
        name: 'Creative Analyst',
        type: 'CREATIVE',
        description: 'Approaches problems with creative and innovative thinking',
        instructions: 'Analyze this from a creative perspective, looking for novel approaches and innovative solutions.'
      },
      {
        name: 'Critical Evaluator',
        type: 'EDGE_CASE',
        description: 'Identifies potential problems and edge cases',
        instructions: 'Critically evaluate this concept, identifying potential problems, edge cases, and areas for improvement.'
      },
      {
        name: 'Future Visionary',
        type: 'NOVELTY',
        description: 'Focuses on future implications and possibilities',
        instructions: 'Consider the future implications of this concept and explore novel possibilities for development.'
      }
    ]
  }
}

export async function GET() {
  try {
    const personas = await parsePersonasFromFile()
    return NextResponse.json(personas)
  } catch (error) {
    console.error('Error fetching personas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    )
  }
}
