
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, participantIds, maxParticipants, moderationStyle, topicFocus, userParticipation, userRole } = body

    if (!participantIds || participantIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 participants are required for a round table discussion' },
        { status: 400 }
      )
    }

    if (participantIds.length > (maxParticipants || 5)) {
      return NextResponse.json(
        { error: `Too many participants. Maximum allowed: ${maxParticipants || 5}` },
        { status: 400 }
      )
    }

    // Verify all participants exist and are stoic philosophers
    const participants = await prisma.model.findMany({
      where: {
        id: { in: participantIds },
        category: 'stoic',
        isActive: true
      }
    })

    if (participants.length !== participantIds.length) {
      return NextResponse.json(
        { error: 'One or more participants are invalid or not active stoic philosophers' },
        { status: 400 }
      )
    }

    // Create the conversation first
    const conversation = await prisma.conversation.create({
      data: {
        title,
        modelAId: participantIds[0],
        modelBId: participantIds[1],
        moderatorEnabled: false,
        truthCheckEnabled: true
      }
    })

    // Create speaking order (random initial order)
    const shuffledParticipants = [...participantIds].sort(() => Math.random() - 0.5)
    
    // Create round table conversation
    const roundTable = await prisma.roundTableConversation.create({
      data: {
        conversationId: conversation.id,
        maxParticipants: maxParticipants || 5,
        speakingOrder: shuffledParticipants,
        moderationStyle: moderationStyle || 'DEMOCRATIC',
        topicFocus,
        userParticipation: userParticipation || false,
        userRole: userRole || 'OBSERVER',
        currentSpeaker: shuffledParticipants[0]
      }
    })

    // Create participant records
    const participantRecords = await Promise.all(
      participantIds.map((modelId: string, index: number) =>
        prisma.roundTableParticipant.create({
          data: {
            roundTableId: roundTable.id,
            modelId,
            participantType: 'AI_STOIC',
            speakingOrder: shuffledParticipants.indexOf(modelId),
            isActive: true
          }
        })
      )
    )

    // If user participation is enabled, add user participant
    if (userParticipation) {
      await prisma.roundTableParticipant.create({
        data: {
          roundTableId: roundTable.id,
          modelId: null, // null for human participant
          participantType: 'HUMAN_USER',
          speakingOrder: shuffledParticipants.length,
          isActive: true
        }
      })
    }

    // Fetch complete conversation with round table details
    const completeConversation = await prisma.conversation.findUnique({
      where: { id: conversation.id },
      include: {
        modelA: true,
        modelB: true,
        messages: true,
        roundTableConversation: {
          include: {
            participants: {
              include: {
                model: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(completeConversation, { status: 201 })
  } catch (error) {
    console.error('Error creating round table conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create round table conversation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const roundTables = await prisma.roundTableConversation.findMany({
      include: {
        conversation: {
          include: {
            modelA: true,
            modelB: true,
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        participants: {
          include: {
            model: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    })

    const total = await prisma.roundTableConversation.count()

    return NextResponse.json({
      roundTables,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching round table conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch round table conversations' },
      { status: 500 }
    )
  }
}
