
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const author = searchParams.get('author')
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const dailyReflection = searchParams.get('dailyReflection')
    const practicalExercise = searchParams.get('practicalExercise')
    const searchTerm = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      isActive: true
    }

    if (author) {
      where.author = {
        contains: author,
        mode: 'insensitive'
      }
    }

    if (type) {
      where.type = type
    }

    if (category) {
      where.category = {
        contains: category,
        mode: 'insensitive'
      }
    }

    if (dailyReflection === 'true') {
      where.dailyReflection = true
    }

    if (practicalExercise === 'true') {
      where.practicalExercise = true
    }

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm } }
      ]
    }

    const wisdom = await prisma.stoicWisdom.findMany({
      where,
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
      orderBy: [
        { author: 'asc' },
        { type: 'asc' },
        { title: 'asc' }
      ],
      take: limit,
      skip: offset
    })

    const total = await prisma.stoicWisdom.count({ where })

    return NextResponse.json({
      wisdom,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching stoic wisdom:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stoic wisdom' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const wisdom = await prisma.stoicWisdom.create({
      data: {
        title: body.title,
        content: body.content,
        author: body.author,
        category: body.category,
        type: body.type,
        difficulty: body.difficulty || 1,
        timeToComplete: body.timeToComplete,
        keyThemes: body.keyThemes || [],
        tags: body.tags || [],
        dailyReflection: body.dailyReflection || false,
        practicalExercise: body.practicalExercise || false,
        sourceTextId: body.sourceTextId
      }
    })

    return NextResponse.json(wisdom, { status: 201 })
  } catch (error) {
    console.error('Error creating stoic wisdom:', error)
    return NextResponse.json(
      { error: 'Failed to create stoic wisdom' },
      { status: 500 }
    )
  }
}
