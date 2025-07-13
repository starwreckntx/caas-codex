
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const models = await prisma.model.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(models)
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      persona, 
      baseModel, 
      provider, 
      description, 
      capabilities, 
      contextWindow, 
      category, 
      isActive, 
      systemInstructions 
    } = body

    if (!name || !persona || !baseModel || !provider || !description || !capabilities || !category || !systemInstructions) {
      return NextResponse.json(
        { error: 'Name, persona, baseModel, provider, description, capabilities, category, and systemInstructions are required' },
        { status: 400 }
      )
    }

    const model = await prisma.model.create({
      data: {
        name,
        persona,
        baseModel,
        provider,
        description,
        capabilities,
        contextWindow: contextWindow || 8192,
        category,
        isActive: isActive ?? true,
        systemInstructions
      }
    })

    return NextResponse.json(model, { status: 201 })
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    )
  }
}
