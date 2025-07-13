
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sessions = await prisma.logicAnalyzerSession.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching logic analyzer sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, seedIdea } = body

    if (!title || !seedIdea) {
      return NextResponse.json(
        { error: 'Title and seed idea are required' },
        { status: 400 }
      )
    }

    const session = await prisma.logicAnalyzerSession.create({
      data: {
        title,
        seedIdea,
        status: 'ACTIVE'
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

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    console.error('Error creating logic analyzer session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}
