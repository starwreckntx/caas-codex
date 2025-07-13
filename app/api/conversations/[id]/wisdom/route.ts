
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
    const { wisdomId, contextNote } = body

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

    // Verify wisdom exists
    const wisdom = await prisma.stoicWisdom.findUnique({
      where: { id: wisdomId }
    })

    if (!wisdom) {
      return NextResponse.json(
        { error: 'Wisdom not found' },
        { status: 404 }
      )
    }

    // Check if wisdom is already added to conversation
    const existing = await prisma.conversationWisdom.findUnique({
      where: {
        conversationId_wisdomId: {
          conversationId: params.id,
          wisdomId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Wisdom already added to conversation' },
        { status: 400 }
      )
    }

    // Add wisdom to conversation
    const conversationWisdom = await prisma.conversationWisdom.create({
      data: {
        conversationId: params.id,
        wisdomId,
        contextNote
      },
      include: {
        wisdom: {
          include: {
            sourceText: true
          }
        }
      }
    })

    return NextResponse.json(conversationWisdom, { status: 201 })
  } catch (error) {
    console.error('Error adding wisdom to conversation:', error)
    return NextResponse.json(
      { error: 'Failed to add wisdom to conversation' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationWisdom = await prisma.conversationWisdom.findMany({
      where: { conversationId: params.id },
      include: {
        wisdom: {
          include: {
            sourceText: true
          }
        }
      },
      orderBy: { addedAt: 'desc' }
    })

    return NextResponse.json(conversationWisdom)
  } catch (error) {
    console.error('Error fetching conversation wisdom:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation wisdom' },
      { status: 500 }
    )
  }
}
