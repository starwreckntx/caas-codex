
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, customName, description, tags = [], metadata = {} } = body

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

    // Create or update saved conversation
    const savedConversation = await prisma.savedConversation.upsert({
      where: { conversationId },
      update: {
        customName,
        description,
        tags,
        metadata,
        lastModified: new Date()
      },
      create: {
        conversationId,
        customName,
        description,
        tags,
        metadata,
        savedBy: ipAddress
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

    return NextResponse.json(savedConversation, { status: 201 })
  } catch (error) {
    console.error('Error saving conversation:', error)
    return NextResponse.json(
      { error: 'Failed to save conversation' },
      { status: 500 }
    )
  }
}

// Get all saved conversations
export async function GET() {
  try {
    const savedConversations = await prisma.savedConversation.findMany({
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
      orderBy: { lastModified: 'desc' }
    })

    return NextResponse.json(savedConversations)
  } catch (error) {
    console.error('Error fetching saved conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved conversations' },
      { status: 500 }
    )
  }
}
