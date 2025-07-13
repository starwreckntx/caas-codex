
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { MindDojoModerator } from '@/lib/moderator-service'
import { ModeratorInput } from '@/lib/types'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// POST endpoint for moderator intervention
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    // Fetch conversation with full context
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        modelA: true,
        modelB: true,
        messages: {
          include: {
            model: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        documents: {
          include: {
            document: true
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (!conversation.moderatorEnabled) {
      return NextResponse.json(
        { error: 'Moderator is not enabled for this conversation' },
        { status: 400 }
      )
    }

    if (!conversation.sessionGoal) {
      return NextResponse.json(
        { error: 'Session goal is required for moderator functionality' },
        { status: 400 }
      )
    }

    // Get the last non-moderator message for context
    const lastMessage = conversation.messages
      .filter(msg => msg.messageType !== 'MODERATOR')
      .pop()

    if (!lastMessage) {
      return NextResponse.json(
        { error: 'No messages found to moderate' },
        { status: 400 }
      )
    }

    // Determine last speaker ID (modelA or modelB)
    let lastSpeakerId = null
    if (lastMessage.modelId === conversation.modelAId) {
      lastSpeakerId = 'modelA'
    } else if (lastMessage.modelId === conversation.modelBId) {
      lastSpeakerId = 'modelB'
    }

    // Prepare enhanced moderator input with conversation context
    const moderatorInput: ModeratorInput = {
      sessionGoal: conversation.sessionGoal,
      conversationHistory: conversation.messages as any[], // Cast to avoid type mismatch
      lastSpeakerId,
      lastMessageText: lastMessage.content,
      conversationContext: {
        ...(conversation.moderatorContext as any || {}),
        conversationId: conversation.id,
        modelAName: conversation.modelA?.name || 'Participant A',
        modelBName: conversation.modelB?.name || 'Participant B'
      }
    }

    // Process with Mind Dojo Moderator
    const moderatorOutput = await MindDojoModerator.processConversation(moderatorInput)

    // Create moderator message
    const moderatorMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        modelId: null, // Moderator has no model
        content: moderatorOutput.moderatorStatement,
        messageType: 'MODERATOR',
        isApproved: true, // Moderator messages are auto-approved
        moderatorAction: moderatorOutput.action,
        nextSpeaker: moderatorOutput.nextSpeaker,
        promptForNext: moderatorOutput.promptForNextSpeaker,
        chainOfThought: moderatorOutput.chainOfThought,
        thoughtSteps: JSON.stringify(moderatorOutput.chainOfThought),
        reasoningMeta: {
          action: moderatorOutput.action,
          nextSpeaker: moderatorOutput.nextSpeaker,
          timestamp: new Date().toISOString()
        }
      }
    })

    // Update conversation with moderator context and last speaker
    const currentContext = conversation.moderatorContext as any || {}
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastSpeakerId,
        moderatorContext: {
          ...currentContext,
          lastModeratorAction: moderatorOutput.action,
          lastModeratorTime: new Date().toISOString(),
          totalModeratorMessages: (currentContext.totalModeratorMessages || 0) + 1
        },
        updatedAt: new Date()
      }
    })

    // AUTOMATIC HANDOFF: Trigger next speaker based on moderator's guidance
    let nextAIMessage = null
    let handoffError = null
    
    try {
      console.log('Starting automatic handoff for conversation:', conversationId)
      console.log('Next speaker:', moderatorOutput.nextSpeaker)
      
      // Determine next model based on moderator's nextSpeaker designation
      const nextModelId = moderatorOutput.nextSpeaker === 'modelA' ? conversation.modelAId : conversation.modelBId
      const nextModel = moderatorOutput.nextSpeaker === 'modelA' ? conversation.modelA : conversation.modelB

      console.log('Next model ID:', nextModelId)
      console.log('Next model:', nextModel?.name)

      if (!nextModel) {
        handoffError = `Next model not found for ${moderatorOutput.nextSpeaker}`
        console.error(handoffError)
      } else {
        // Prepare conversation history for the next AI model
        const allMessages = [...conversation.messages, moderatorMessage]
        console.log('Total messages in conversation:', allMessages.length)
        
        const conversationHistory = allMessages
          .filter(msg => msg.messageType !== 'MODERATOR' || msg.id === moderatorMessage.id) // Include only the latest moderator message
          .map(msg => {
            if (msg.messageType === 'MODERATOR') {
              return {
                role: 'system',
                content: `[MODERATOR GUIDANCE] ${msg.content}\n\nInstructions for you: ${moderatorOutput.promptForNextSpeaker}`
              }
            }
            
            // Determine if this message is from the current model or the other model
            const isFromCurrentModel = msg.modelId === nextModelId
            return {
              role: isFromCurrentModel ? 'assistant' : 'user',
              content: msg.content
            }
          })

        // Prepare system instructions with moderator guidance
        const systemInstructions = `${nextModel.systemInstructions}

IMPORTANT: You are now responding to moderator guidance. The moderator has provided specific instructions for your next response. Please follow this guidance while maintaining your character and contributing meaningfully to the conversation goal.

Session Goal: ${conversation.sessionGoal}
Moderator Action: ${moderatorOutput.action}
Specific Guidance: ${moderatorOutput.promptForNextSpeaker}`

        console.log('Calling LLM API for next speaker...')
        
        // Map model names to valid Abacus AI models
        const modelMapping: Record<string, string> = {
          'pplx-70b-online': 'gpt-4.1-mini',
          'mistral-large-2407': 'gpt-4.1-mini',
          'claude-3-5-sonnet-20241022': 'gpt-4.1-mini',
          'gpt-4o': 'gpt-4.1-mini',
          'gpt-4.1-mini': 'gpt-4.1-mini'
        }
        
        const validModel = modelMapping[nextModel.baseModel] || 'gpt-4.1-mini'
        
        console.log(`Using model: ${validModel} (mapped from ${nextModel.baseModel})`)

        // Generate AI response using the LLM API
        const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
          },
          body: JSON.stringify({
            model: validModel,
            messages: [
              {
                role: 'system',
                content: systemInstructions
              },
              ...conversationHistory.slice(-10) // Use last 10 messages for context
            ],
            max_tokens: 2000,
            temperature: 0.7
          })
        })

        if (!response.ok) {
          handoffError = `LLM API error: ${response.status} ${response.statusText}`
          console.error(handoffError)
          const errorText = await response.text()
          console.error('API Error Details:', errorText)
        } else {
          const llmData = await response.json()
          const aiContent = llmData.choices?.[0]?.message?.content || 'No response generated'

          console.log('LLM API response received, creating message...')

          // Create the next AI message
          nextAIMessage = await prisma.message.create({
            data: {
              conversationId: conversation.id,
              modelId: nextModelId,
              content: aiContent,
              messageType: 'AI',
              isApproved: true, // Auto-approve for seamless flow
              reasoningMeta: {
                triggeredByModerator: true,
                moderatorAction: moderatorOutput.action,
                guidance: moderatorOutput.promptForNextSpeaker,
                timestamp: new Date().toISOString()
              }
            }
          })

          // Update conversation timestamp
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { 
              updatedAt: new Date(),
              lastSpeakerId: moderatorOutput.nextSpeaker
            }
          })

          console.log('Automatic handoff completed successfully')
        }
      }
    } catch (error) {
      handoffError = `Automatic handoff failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error('Error in automatic handoff:', error)
    }

    return NextResponse.json({
      message: moderatorMessage,
      nextAIMessage,
      moderatorOutput,
      success: true,
      automaticHandoff: nextAIMessage ? true : false,
      handoffError: handoffError || null
    })

  } catch (error) {
    console.error('Error in moderator processing:', error)
    return NextResponse.json(
      { error: 'Failed to process moderator response' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if moderator should intervene
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (!conversation.moderatorEnabled) {
      return NextResponse.json({ shouldIntervene: false })
    }

    // Check if moderator should intervene based on message count and patterns
    const totalMessages = conversation.messages.length
    const lastModeratorMessage = conversation.messages.find(msg => msg.messageType === 'MODERATOR')
    const messagesSinceLastModerator = lastModeratorMessage ? 
      conversation.messages.findIndex(msg => msg.id === lastModeratorMessage.id) : totalMessages

    // Simple intervention logic - can be made more sophisticated
    const shouldIntervene = messagesSinceLastModerator >= 3 || 
                           (totalMessages > 0 && totalMessages % 5 === 0)

    return NextResponse.json({
      shouldIntervene,
      messagesSinceLastModerator,
      totalMessages,
      moderatorEnabled: conversation.moderatorEnabled
    })

  } catch (error) {
    console.error('Error checking moderator intervention:', error)
    return NextResponse.json(
      { error: 'Failed to check moderator intervention' },
      { status: 500 }
    )
  }
}
