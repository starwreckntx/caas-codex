
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionId, modelId, personaName, personaType, personaData } = body

    if (!sessionId || !modelId || !personaName || !personaType) {
      return NextResponse.json(
        { error: 'Session ID, model ID, persona name, and persona type are required' },
        { status: 400 }
      )
    }

    // Check if this persona is already assigned to this session
    const existingAssignment = await prisma.personaAssignment.findFirst({
      where: {
        sessionId,
        personaName
      }
    })

    if (existingAssignment) {
      return NextResponse.json(
        { error: 'This persona is already assigned to this session' },
        { status: 400 }
      )
    }

    const assignment = await prisma.personaAssignment.create({
      data: {
        sessionId,
        modelId,
        personaName,
        personaType,
        personaData: personaData || {}
      },
      include: {
        model: true,
        session: true
      }
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error('Error creating persona assignment:', error)
    return NextResponse.json(
      { error: 'Failed to create persona assignment' },
      { status: 500 }
    )
  }
}
