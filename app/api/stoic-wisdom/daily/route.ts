
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get daily reflection
    const dailyReflections = await prisma.stoicWisdom.findMany({
      where: {
        isActive: true,
        dailyReflection: true
      },
      include: {
        sourceText: {
          select: {
            id: true,
            title: true,
            author: true,
            work: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get random daily quote
    const quotes = await prisma.stoicWisdom.findMany({
      where: {
        isActive: true,
        type: 'QUOTE'
      },
      include: {
        sourceText: {
          select: {
            id: true,
            title: true,
            author: true,
            work: true
          }
        }
      }
    })

    // Select random quote based on current date
    const today = new Date()
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    const dailyQuote = quotes[dayOfYear % quotes.length]

    // Get practical exercises
    const exercises = await prisma.stoicWisdom.findMany({
      where: {
        isActive: true,
        practicalExercise: true
      },
      include: {
        sourceText: {
          select: {
            id: true,
            title: true,
            author: true,
            work: true
          }
        }
      },
      take: 5,
      orderBy: {
        difficulty: 'asc'
      }
    })

    return NextResponse.json({
      dailyQuote,
      dailyReflections,
      practicalExercises: exercises
    })
  } catch (error) {
    console.error('Error fetching daily wisdom:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily wisdom' },
      { status: 500 }
    )
  }
}
