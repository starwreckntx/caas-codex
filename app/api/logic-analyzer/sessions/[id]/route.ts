
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.logicAnalyzerSession.findUnique({
      where: { id: params.id },
      include: {
        assignments: {
          include: {
            model: true
          }
        },
        results: {
          include: {
            assignment: {
              include: {
                model: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error fetching logic analyzer session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
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
    const { title, seedIdea, status } = body

    const session = await prisma.logicAnalyzerSession.update({
      where: { id: params.id },
      data: {
        title,
        seedIdea,
        status
      },
      include: {
        assignments: {
          include: {
            model: true
          }
        },
        results: {
          include: {
            assignment: {
              include: {
                model: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('Error updating logic analyzer session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.logicAnalyzerSession.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting logic analyzer session:', error)
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
