
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const text = await prisma.stoicText.findUnique({
      where: { id: params.id },
      include: {
        wisdomReferences: true,
        conversationTexts: {
          include: {
            conversation: {
              select: {
                id: true,
                title: true,
                createdAt: true
              }
            }
          }
        }
      }
    })

    if (!text) {
      return NextResponse.json(
        { error: 'Text not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(text)
  } catch (error) {
    console.error('Error fetching stoic text:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stoic text' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const text = await prisma.stoicText.update({
      where: { id: params.id },
      data: {
        title: body.title,
        author: body.author,
        work: body.work,
        category: body.category,
        content: body.content,
        excerpt: body.excerpt,
        bookNumber: body.bookNumber,
        sectionNumber: body.sectionNumber,
        originalLanguage: body.originalLanguage,
        translation: body.translation,
        historicalContext: body.historicalContext,
        keyThemes: body.keyThemes,
        difficulty: body.difficulty,
        isActive: body.isActive
      }
    })

    return NextResponse.json(text)
  } catch (error) {
    console.error('Error updating stoic text:', error)
    return NextResponse.json(
      { error: 'Failed to update stoic text' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.stoicText.update({
      where: { id: params.id },
      data: { isActive: false }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting stoic text:', error)
    return NextResponse.json(
      { error: 'Failed to delete stoic text' },
      { status: 500 }
    )
  }
}
