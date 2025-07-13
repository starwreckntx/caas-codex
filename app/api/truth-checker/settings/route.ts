
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const conversationId = url.searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        truthCheckEnabled: true,
        truthCheckConfig: true
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      settings: {
        enabled: conversation.truthCheckEnabled,
        config: conversation.truthCheckConfig || {}
      }
    })

  } catch (error) {
    console.error('Error fetching truth check settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch truth check settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, enabled, config } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (enabled !== undefined) updateData.truthCheckEnabled = enabled
    if (config !== undefined) updateData.truthCheckConfig = config

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: updateData,
      select: {
        truthCheckEnabled: true,
        truthCheckConfig: true
      }
    })

    return NextResponse.json({
      success: true,
      settings: {
        enabled: updatedConversation.truthCheckEnabled,
        config: updatedConversation.truthCheckConfig || {}
      }
    })

  } catch (error) {
    console.error('Error updating truth check settings:', error)
    return NextResponse.json(
      { error: 'Failed to update truth check settings' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
