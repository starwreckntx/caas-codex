
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        modelA: true,
        modelB: true,
        messages: {
          include: {
            model: true,
            truthAssessment: {
              include: {
                detectedIssues: true,
                truthAlerts: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        documents: {
          include: {
            document: true
          }
        },
        savedConversation: true,
        archivedConversation: true,
        knowledgeDocuments: true
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, status } = body

    const conversation = await prisma.conversation.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(status && { status }),
        updatedAt: new Date()
      },
      include: {
        modelA: true,
        modelB: true,
        messages: true,
        documents: {
          include: {
            document: true
          }
        },
        savedConversation: true,
        archivedConversation: true,
        knowledgeDocuments: true
      }
    })

    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.conversation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Conversation deleted successfully' })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' },
      { status: 500 }
    )
  }
}
