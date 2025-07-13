
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Check if conversation exists and is archived
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Remove from archived conversations
    await prisma.archivedConversation.delete({
      where: { conversationId }
    })

    // Update conversation status back to ACTIVE
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'ACTIVE' },
      include: {
        modelA: true,
        modelB: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    return NextResponse.json(updatedConversation)
  } catch (error) {
    console.error('Error unarchiving conversation:', error)
    return NextResponse.json(
      { error: 'Failed to unarchive conversation' },
      { status: 500 }
    )
  }
}
