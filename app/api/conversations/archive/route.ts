
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, archiveReason, archiveMetadata = {} } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Get client IP address
    const headersList = headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Check if conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Archive the conversation
    const archivedConversation = await prisma.archivedConversation.upsert({
      where: { conversationId },
      update: {
        archiveReason,
        archiveMetadata,
        archivedBy: ipAddress
      },
      create: {
        conversationId,
        archiveReason,
        archiveMetadata,
        archivedBy: ipAddress
      },
      include: {
        conversation: {
          include: {
            modelA: true,
            modelB: true,
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    })

    // Update conversation status to ARCHIVED
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'ARCHIVED' }
    })

    return NextResponse.json(archivedConversation, { status: 201 })
  } catch (error) {
    console.error('Error archiving conversation:', error)
    return NextResponse.json(
      { error: 'Failed to archive conversation' },
      { status: 500 }
    )
  }
}

// Get all archived conversations
export async function GET() {
  try {
    const archivedConversations = await prisma.archivedConversation.findMany({
      include: {
        conversation: {
          include: {
            modelA: true,
            modelB: true,
            messages: {
              orderBy: { createdAt: 'asc' }
            },
            _count: {
              select: { messages: true }
            }
          }
        }
      },
      orderBy: { archivedAt: 'desc' }
    })

    return NextResponse.json(archivedConversations)
  } catch (error) {
    console.error('Error fetching archived conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch archived conversations' },
      { status: 500 }
    )
  }
}
