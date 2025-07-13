
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const author = searchParams.get('author')
    const work = searchParams.get('work')
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
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

    if (work) {
      where.work = {
        contains: work,
        mode: 'insensitive'
      }
    }

    if (category) {
      where.category = category
    }

    if (difficulty) {
      where.difficulty = parseInt(difficulty)
    }

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { content: { contains: searchTerm, mode: 'insensitive' } },
        { excerpt: { contains: searchTerm, mode: 'insensitive' } }
      ]
    }

    const texts = await prisma.stoicText.findMany({
      where,
      orderBy: [
        { author: 'asc' },
        { work: 'asc' },
        { bookNumber: 'asc' },
        { sectionNumber: 'asc' }
      ],
      take: limit,
      skip: offset
    })

    const total = await prisma.stoicText.count({ where })

    return NextResponse.json({
      texts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })
  } catch (error) {
    console.error('Error fetching stoic texts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stoic texts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const text = await prisma.stoicText.create({
      data: {
        title: body.title,
        author: body.author,
        work: body.work,
        category: body.category,
        content: body.content,
        excerpt: body.excerpt,
        bookNumber: body.bookNumber,
        sectionNumber: body.sectionNumber,
        originalLanguage: body.originalLanguage || 'Greek',
        translation: body.translation,
        historicalContext: body.historicalContext,
        keyThemes: body.keyThemes || [],
        difficulty: body.difficulty || 1
      }
    })

    return NextResponse.json(text, { status: 201 })
  } catch (error) {
    console.error('Error creating stoic text:', error)
    return NextResponse.json(
      { error: 'Failed to create stoic text' },
      { status: 500 }
    )
  }
}
