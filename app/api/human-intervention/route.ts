
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { MindDojoModerator } from '@/lib/moderator-service'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// POST endpoint for enhanced human interventions
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, interventionType, message, context } = body

    if (!conversationId || !interventionType || !message) {
      return NextResponse.json(
        { error: 'conversationId, interventionType, and message are required' },
        { status: 400 }
      )
    }

    // Validate intervention type
    const validTypes = Object.values(MindDojoModerator.HUMAN_INTERVENTION_TYPES)
    if (!validTypes.includes(interventionType)) {
      return NextResponse.json(
        { error: 'Invalid intervention type' },
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
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Generate context-aware intervention message
    const enhancedMessage = generateEnhancedInterventionMessage(interventionType, message, context)

    // Create human intervention message
    const humanMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        modelId: null, // Human message
        content: enhancedMessage,
        messageType: 'HUMAN',
        isApproved: true,
        reasoningMeta: {
          interventionType,
          originalMessage: message,
          contextProvided: context,
          timestamp: new Date().toISOString()
        }
      }
    })

    // Update conversation with human intervention context
    const currentContext = conversation.moderatorContext as any || {}
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        moderatorContext: {
          ...currentContext,
          lastHumanIntervention: {
            type: interventionType,
            timestamp: new Date().toISOString(),
            messageId: humanMessage.id
          },
          totalHumanInterventions: (currentContext.totalHumanInterventions || 0) + 1
        },
        updatedAt: new Date()
      }
    })

    // Generate follow-up moderator guidance based on intervention type
    const followUpGuidance = generateFollowUpGuidance(interventionType, conversation, enhancedMessage)

    return NextResponse.json({
      humanMessage,
      followUpGuidance,
      interventionType,
      success: true
    })

  } catch (error) {
    console.error('Error in human intervention processing:', error)
    return NextResponse.json(
      { error: 'Failed to process human intervention' },
      { status: 500 }
    )
  }
}

/**
 * Generates enhanced intervention message based on type and context
 */
function generateEnhancedInterventionMessage(interventionType: string, message: string, context?: any): string {
  const typeMap = {
    [MindDojoModerator.HUMAN_INTERVENTION_TYPES.SUGGEST_DIRECTION]: '🎯 **New Direction Suggestion**',
    [MindDojoModerator.HUMAN_INTERVENTION_TYPES.INJECT_CREATIVITY]: '💡 **Creative Input**',
    [MindDojoModerator.HUMAN_INTERVENTION_TYPES.CHALLENGE_THINKING]: '🤔 **Challenge to Current Thinking**',
    [MindDojoModerator.HUMAN_INTERVENTION_TYPES.NEW_PERSPECTIVE]: '👁️ **New Perspective**'
  }

  const header = typeMap[interventionType] || '💬 **Human Input**'
  
  return `${header}

${message}

*[This intervention is designed to ${getInterventionPurpose(interventionType)}]*`
}

/**
 * Gets the purpose description for each intervention type
 */
function getInterventionPurpose(interventionType: string): string {
  switch (interventionType) {
    case MindDojoModerator.HUMAN_INTERVENTION_TYPES.SUGGEST_DIRECTION:
      return 'guide the conversation toward a specific direction or focus area'
    case MindDojoModerator.HUMAN_INTERVENTION_TYPES.INJECT_CREATIVITY:
      return 'introduce creative thinking and innovative approaches'
    case MindDojoModerator.HUMAN_INTERVENTION_TYPES.CHALLENGE_THINKING:
      return 'challenge current assumptions and reasoning patterns'
    case MindDojoModerator.HUMAN_INTERVENTION_TYPES.NEW_PERSPECTIVE:
      return 'introduce a fresh perspective or alternative viewpoint'
    default:
      return 'enhance the conversation flow'
  }
}

/**
 * Generates follow-up guidance for the moderator based on intervention type
 */
function generateFollowUpGuidance(interventionType: string, conversation: any, message: string): string {
  const modelA = conversation.modelA?.name || 'Participant A'
  const modelB = conversation.modelB?.name || 'Participant B'
  
  switch (interventionType) {
    case MindDojoModerator.HUMAN_INTERVENTION_TYPES.SUGGEST_DIRECTION:
      return `The moderator should guide both ${modelA} and ${modelB} to explore this new direction while maintaining focus on the session goal.`
    
    case MindDojoModerator.HUMAN_INTERVENTION_TYPES.INJECT_CREATIVITY:
      return `The moderator should encourage ${modelA} and ${modelB} to build on this creative input with innovative thinking and unconventional approaches.`
    
    case MindDojoModerator.HUMAN_INTERVENTION_TYPES.CHALLENGE_THINKING:
      return `The moderator should ensure both ${modelA} and ${modelB} address this challenge thoughtfully and use it to strengthen their reasoning.`
    
    case MindDojoModerator.HUMAN_INTERVENTION_TYPES.NEW_PERSPECTIVE:
      return `The moderator should help ${modelA} and ${modelB} integrate this new perspective into their ongoing discussion and explore its implications.`
    
    default:
      return `The moderator should facilitate productive responses to this human input from both participants.`
  }
}
