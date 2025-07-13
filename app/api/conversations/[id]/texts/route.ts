
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
    const { textId, relevanceNote } = body

    // Verify conversation exists
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Verify text exists
    const text = await prisma.stoicText.findUnique({
      where: { id: textId }
    })

    if (!text) {
      return NextResponse.json(
        { error: 'Text not found' },
        { status: 404 }
      )
    }

    // Check if text is already added to conversation
    const existing = await prisma.conversationText.findUnique({
      where: {
        conversationId_textId: {
          conversationId: params.id,
          textId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Text already added to conversation' },
        { status: 400 }
      )
    }

    // Add text to conversation
    const conversationText = await prisma.conversationText.create({
      data: {
        conversationId: params.id,
        textId,
        relevanceNote
      },
      include: {
        text: true
      }
    })

    return NextResponse.json(conversationText, { status: 201 })
  } catch (error) {
    console.error('Error adding text to conversation:', error)
    return NextResponse.json(
      { error: 'Failed to add text to conversation' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationTexts = await prisma.conversationText.findMany({
      where: { conversationId: params.id },
      include: {
        text: true
      },
      orderBy: { addedAt: 'desc' }
    })

    return NextResponse.json(conversationTexts)
  } catch (error) {
    console.error('Error fetching conversation texts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation texts' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const textId = searchParams.get('textId')

    if (!textId) {
      return NextResponse.json(
        { error: 'Text ID is required' },
        { status: 400 }
      )
    }

    await prisma.conversationText.delete({
      where: {
        conversationId_textId: {
          conversationId: params.id,
          textId
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing text from conversation:', error)
    return NextResponse.json(
      { error: 'Failed to remove text from conversation' },
      { status: 500 }
    )
  }
}
