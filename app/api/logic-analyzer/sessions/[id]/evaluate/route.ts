
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id

    // Fetch the session with assignments
    const session = await prisma.logicAnalyzerSession.findUnique({
      where: { id: sessionId },
      include: {
        assignments: {
          include: {
            model: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (!session.assignments || session.assignments.length === 0) {
      return NextResponse.json(
        { error: 'No persona assignments found for this session' },
        { status: 400 }
      )
    }

    // Get the next loop number
    const existingResults = await prisma.logicAnalyzerResult.findMany({
      where: { sessionId }
    })

    const nextLoopNumber = existingResults.length > 0 
      ? Math.max(...existingResults.map(r => r.loopNumber)) + 1 
      : 1

    const results = []

    // Run evaluation for each persona assignment
    for (const assignment of session.assignments) {
      try {
        // Build the prompt for this persona
        const personaData = assignment.personaData as any
        const basePrompt = `You are evaluating the following seed idea through the lens of the "${assignment.personaName}" persona.

SEED IDEA: ${session.seedIdea}

PERSONA TYPE: ${assignment.personaType}

EVALUATION INSTRUCTIONS:
${personaData?.instructions || 'Provide a thorough analysis of the seed idea from your persona perspective.'}

${personaData?.customInstructions ? `ADDITIONAL INSTRUCTIONS: ${personaData.customInstructions}` : ''}

Please provide a comprehensive evaluation of this seed idea, including:
1. Your persona's perspective on the concept
2. Strengths and weaknesses you identify
3. Potential improvements or variations
4. Overall assessment

Use the recursive logic framework and chain of thought reasoning as appropriate for your persona type.`

        // Call the LLM API
        const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
          },
          body: JSON.stringify({
            model: assignment.model.baseModel,
            messages: [
              {
                role: 'system',
                content: assignment.model.systemInstructions
              },
              {
                role: 'user',
                content: basePrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          })
        })

        if (!llmResponse.ok) {
          throw new Error(`LLM API error: ${llmResponse.statusText}`)
        }

        const llmData = await llmResponse.json()
        const response = llmData.choices?.[0]?.message?.content || 'No response generated'

        // Create chain of thought data
        const chainOfThought = {
          personaLens: assignment.personaName,
          personaType: assignment.personaType,
          evaluationFocus: personaData?.instructions || 'General evaluation',
          seedIdea: session.seedIdea,
          loopNumber: nextLoopNumber,
          timestamp: new Date().toISOString()
        }

        // Store the result
        const result = await prisma.logicAnalyzerResult.create({
          data: {
            sessionId,
            assignmentId: assignment.id,
            loopNumber: nextLoopNumber,
            response,
            chainOfThought,
            metadata: {
              executionTime: Date.now(),
              modelUsed: assignment.model.baseModel,
              personaContext: assignment.personaData,
              model: assignment.model.baseModel,
              persona: assignment.personaName,
              evaluationTime: new Date().toISOString(),
              promptTokens: llmData.usage?.prompt_tokens || 0,
              completionTokens: llmData.usage?.completion_tokens || 0
            }
          }
        })

        results.push(result)
      } catch (error) {
        console.error(`Error evaluating with persona ${assignment.personaName}:`, error)
        // Continue with other personas even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      loopNumber: nextLoopNumber,
      resultsCount: results.length,
      results
    })
  } catch (error) {
    console.error('Error running evaluation:', error)
    return NextResponse.json(
      { error: 'Failed to run evaluation' },
      { status: 500 }
    )
  }
}
