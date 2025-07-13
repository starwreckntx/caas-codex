
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        modelA: true,
        modelB: true,
        messages: {
          select: {
            id: true,
            messageType: true,
            createdAt: true,
            isApproved: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Only get the last message for preview
        },
        savedConversation: true,
        archivedConversation: true,
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      title, 
      modelAId, 
      modelBId, 
      documentIds = [], 
      moderatorEnabled = false, 
      sessionGoal 
    } = body

    if (!title || !modelAId || !modelBId) {
      return NextResponse.json(
        { error: 'Title, modelAId, and modelBId are required' },
        { status: 400 }
      )
    }

    // Validate moderator configuration
    if (moderatorEnabled && !sessionGoal) {
      return NextResponse.json(
        { error: 'Session goal is required when moderator is enabled' },
        { status: 400 }
      )
    }

    // Check if models exist
    const modelA = await prisma.model.findUnique({ where: { id: modelAId } })
    const modelB = await prisma.model.findUnique({ where: { id: modelBId } })

    if (!modelA || !modelB) {
      return NextResponse.json(
        { error: 'One or both models not found' },
        { status: 404 }
      )
    }

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        title,
        modelAId,
        modelBId,
        status: 'ACTIVE',
        moderatorEnabled,
        sessionGoal: moderatorEnabled ? sessionGoal : null,
        moderatorContext: moderatorEnabled ? {
          initialized: true,
          startTime: new Date().toISOString(),
          totalModeratorMessages: 0
        } : undefined
      },
      include: {
        modelA: true,
        modelB: true,
        messages: true,
        documents: {
          include: {
            document: true
          }
        }
      }
    })

    // Attach documents if provided
    if (documentIds.length > 0) {
      await prisma.conversationDocument.createMany({
        data: documentIds.map((documentId: string) => ({
          conversationId: conversation.id,
          documentId
        }))
      })
    }

    // Create initial session
    await prisma.session.create({
      data: {
        conversationId: conversation.id,
        isActive: true
      }
    })

    // If moderator is enabled, create initial moderator message
    if (moderatorEnabled && sessionGoal) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          modelId: null,
          content: `Welcome to this moderated conversation. I'm the Mind Dojo Moderator, and I'll be facilitating this structured dialogue between ${modelA.name} and ${modelB.name}. Our session goal is: "${sessionGoal}". Let's begin with ${modelA.name} making the first contribution.`,
          messageType: 'MODERATOR',
          isApproved: true,
          moderatorAction: 'FLOW_CONTROL',
          nextSpeaker: 'modelA',
          promptForNext: `Please begin our discussion by addressing the session goal: "${sessionGoal}". Provide your initial thoughts and perspective.`,
          chainOfThought: {
            action: 'FLOW_CONTROL',
            reasoning: 'Initial moderator message to establish session context and guide first speaker',
            sessionGoal,
            timestamp: new Date().toISOString()
          },
          thoughtSteps: 'Established session context and provided initial guidance',
          reasoningMeta: {
            action: 'FLOW_CONTROL',
            nextSpeaker: 'modelA',
            isInitial: true
          }
        }
      })
    }

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
