
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get round table conversation
    const roundTable = await prisma.roundTableConversation.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          where: { isActive: true },
          include: { model: true },
          orderBy: { speakingOrder: 'asc' }
        },
        conversation: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!roundTable) {
      return NextResponse.json(
        { error: 'Round table conversation not found' },
        { status: 404 }
      )
    }

    // Determine next speaker based on moderation style
    let nextSpeaker: string | null = null

    switch (roundTable.moderationStyle) {
      case 'DEMOCRATIC':
        // Round-robin speaking order
        const currentIndex = roundTable.participants.findIndex(p => 
          (p.modelId || 'human') === roundTable.currentSpeaker
        )
        const nextIndex = (currentIndex + 1) % roundTable.participants.length
        const nextParticipant = roundTable.participants[nextIndex]
        nextSpeaker = nextParticipant.modelId || 'human'
        break

      case 'MODERATED':
        // System determines next speaker based on context
        // For now, use simple round-robin but could be enhanced with AI moderation
        const moderatedIndex = roundTable.participants.findIndex(p => 
          (p.modelId || 'human') === roundTable.currentSpeaker
        )
        const moderatedNext = (moderatedIndex + 1) % roundTable.participants.length
        nextSpeaker = roundTable.participants[moderatedNext].modelId || 'human'
        break

      case 'FREE_FLOW':
        // Allow any participant to speak
        // For API consistency, we'll still designate a next speaker but UI can allow any
        const freeIndex = roundTable.participants.findIndex(p => 
          (p.modelId || 'human') === roundTable.currentSpeaker
        )
        const freeNext = (freeIndex + 1) % roundTable.participants.length
        nextSpeaker = roundTable.participants[freeNext].modelId || 'human'
        break

      default:
        nextSpeaker = roundTable.participants[0]?.modelId || 'human'
    }

    // Update round table with next speaker
    const updatedRoundTable = await prisma.roundTableConversation.update({
      where: { id: params.id },
      data: {
        currentSpeaker: nextSpeaker,
        roundNumber: roundTable.currentSpeaker === nextSpeaker ? 
          roundTable.roundNumber + 1 : roundTable.roundNumber
      },
      include: {
        participants: {
          include: { model: true }
        }
      }
    })

    return NextResponse.json({
      nextSpeaker,
      roundNumber: updatedRoundTable.roundNumber,
      participant: updatedRoundTable.participants.find(p => 
        (p.modelId || 'human') === nextSpeaker
      )
    })
  } catch (error) {
    console.error('Error determining next speaker:', error)
    return NextResponse.json(
      { error: 'Failed to determine next speaker' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const roundTable = await prisma.roundTableConversation.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          include: { model: true }
        }
      }
    })

    if (!roundTable) {
      return NextResponse.json(
        { error: 'Round table conversation not found' },
        { status: 404 }
      )
    }

    const currentParticipant = roundTable.participants.find(p => 
      (p.modelId || 'human') === roundTable.currentSpeaker
    )

    return NextResponse.json({
      currentSpeaker: roundTable.currentSpeaker,
      roundNumber: roundTable.roundNumber,
      participant: currentParticipant,
      moderationStyle: roundTable.moderationStyle
    })
  } catch (error) {
    console.error('Error fetching current speaker:', error)
    return NextResponse.json(
      { error: 'Failed to fetch current speaker' },
      { status: 500 }
    )
  }
}
