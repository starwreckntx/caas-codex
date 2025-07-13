
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      originalConversationId, 
      title, 
      content, 
      summary, 
      keyInsights = [], 
      tags = [], 
      documentType = 'CONVERSATION_SUMMARY' 
    } = body

    if (!originalConversationId || !title || !content) {
      return NextResponse.json(
        { error: 'Original conversation ID, title, and content are required' },
        { status: 400 }
      )
    }

    // Get client IP address
    const headersList = headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Get conversation details
    const conversation = await prisma.conversation.findUnique({
      where: { id: originalConversationId },
      include: {
        modelA: true,
        modelB: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Extract participants and metadata
    const participants = [conversation.modelA.name, conversation.modelB.name]
    const sourceMetadata = {
      messageCount: conversation.messages.length,
      conversationTitle: conversation.title,
      moderatorEnabled: conversation.moderatorEnabled,
      createdAt: conversation.createdAt,
      modelAProvider: conversation.modelA.provider,
      modelBProvider: conversation.modelB.provider
    }

    // Create knowledge document
    const knowledgeDocument = await prisma.knowledgeDocument.create({
      data: {
        originalConversationId,
        title,
        content,
        summary,
        keyInsights,
        tags,
        participants,
        sessionGoal: conversation.sessionGoal,
        documentType,
        sourceMetadata,
        createdBy: ipAddress
      },
      include: {
        conversation: {
          include: {
            modelA: true,
            modelB: true
          }
        }
      }
    })

    return NextResponse.json(knowledgeDocument, { status: 201 })
  } catch (error) {
    console.error('Error creating knowledge document:', error)
    return NextResponse.json(
      { error: 'Failed to create knowledge document' },
      { status: 500 }
    )
  }
}

// Get all knowledge documents
export async function GET() {
  try {
    const knowledgeDocuments = await prisma.knowledgeDocument.findMany({
      include: {
        conversation: {
          include: {
            modelA: true,
            modelB: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(knowledgeDocuments)
  } catch (error) {
    console.error('Error fetching knowledge documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge documents' },
      { status: 500 }
    )
  }
}
