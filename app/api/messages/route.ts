
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      conversationId, 
      modelId, 
      content, 
      messageType, 
      isApproved = false,
      chainOfThought,
      thoughtSteps,
      reasoningMeta
    } = body

    if (!conversationId || !content || !messageType) {
      return NextResponse.json(
        { error: 'conversationId, content, and messageType are required' },
        { status: 400 }
      )
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        modelId,
        content,
        messageType,
        isApproved,
        chainOfThought,
        thoughtSteps,
        reasoningMeta
      },
      include: {
        model: true
      }
    })

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    )
  }
}
