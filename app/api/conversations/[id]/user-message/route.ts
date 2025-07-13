
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { content } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      )
    }

    // Verify conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        roundTableConversation: true
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Check if user participation is allowed
    if (conversation.roundTableConversation && !conversation.roundTableConversation.userParticipation) {
      return NextResponse.json(
        { error: 'User participation is not enabled for this conversation' },
        { status: 403 }
      )
    }

    // Create user message
    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        modelId: null, // null for human messages
        content: content.trim(),
        messageType: 'HUMAN',
        isApproved: true, // User messages are automatically approved
        truthCheckEnabled: false // Don't truth-check human messages
      }
    })

    // Update round table if applicable
    if (conversation.roundTableConversation) {
      // Update user participant's message count
      await prisma.roundTableParticipant.updateMany({
        where: {
          roundTableId: conversation.roundTableConversation.id,
          participantType: 'HUMAN_USER'
        },
        data: {
          messageCount: { increment: 1 },
          lastSpoke: new Date()
        }
      })
    }

    // Fetch the complete message with relationships
    const completeMessage = await prisma.message.findUnique({
      where: { id: message.id },
      include: {
        model: true
      }
    })

    return NextResponse.json(completeMessage, { status: 201 })
  } catch (error) {
    console.error('Error creating user message:', error)
    return NextResponse.json(
      { error: 'Failed to create user message' },
      { status: 500 }
    )
  }
}
