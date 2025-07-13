
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, modelId, systemInstructions, messages, contextDocuments = [] } = body

    if (!conversationId || !modelId || !systemInstructions) {
      return NextResponse.json(
        { error: 'conversationId, modelId, and systemInstructions are required' },
        { status: 400 }
      )
    }

    // Get the model details
    const model = await prisma.model.findUnique({
      where: { id: modelId }
    })

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Prepare context from documents
    let contextText = ''
    if (contextDocuments.length > 0) {
      const documents = await prisma.document.findMany({
        where: {
          id: { in: contextDocuments }
        }
      })
      
      contextText = documents.map(doc => 
        `Document: ${doc.originalName}\n${doc.content || ''}`
      ).join('\n\n')
    }

    // Prepare the system message with context
    const systemMessage = `${systemInstructions}

${contextText ? `\n\nContext Documents:\n${contextText}` : ''}

You are participating in a research conversation. Respond thoughtfully and stay in character according to your persona.`

    // Prepare messages for the LLM API
    const llmMessages = [
      {
        role: 'system',
        content: systemMessage
      },
      ...messages.map((msg: any) => ({
        role: msg.role || 'user',
        content: msg.content
      }))
    ]

    // Map model names to valid Abacus AI models
    const modelMapping: Record<string, string> = {
      'pplx-70b-online': 'gpt-4.1-mini',
      'mistral-large-2407': 'gpt-4.1-mini',
      'claude-3-5-sonnet-20241022': 'gpt-4.1-mini',
      'gpt-4o': 'gpt-4.1-mini',
      'gpt-4.1-mini': 'gpt-4.1-mini'
    }
    
    const validModel = modelMapping[model.baseModel] || 'gpt-4.1-mini'

    // Call the LLM API
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: validModel,
        messages: llmMessages,
        max_tokens: 2000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`)
    }

    const llmData = await response.json()
    const aiMessage = llmData.choices?.[0]?.message?.content || 'No response generated'

    // Save the AI message to the database
    const messageRecord = await prisma.message.create({
      data: {
        conversationId,
        modelId,
        content: aiMessage,
        messageType: 'AI',
        isApproved: false
      }
    })

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({
      message: messageRecord,
      content: aiMessage
    })
  } catch (error) {
    console.error('Error in LLM chat:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}
