
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const model = await prisma.model.findUnique({
      where: { id: params.id }
    })

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(model)
  } catch (error) {
    console.error('Error fetching model:', error)
    return NextResponse.json(
      { error: 'Failed to fetch model' },
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

    const model = await prisma.model.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(persona && { persona }),
        ...(baseModel && { baseModel }),
        ...(provider && { provider }),
        ...(description && { description }),
        ...(capabilities && { capabilities }),
        ...(contextWindow !== undefined && { contextWindow }),
        ...(category && { category }),
        ...(isActive !== undefined && { isActive }),
        ...(systemInstructions && { systemInstructions }),
        updatedAt: new Date()
      }
    })

    return NextResponse.json(model)
  } catch (error) {
    console.error('Error updating model:', error)
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.model.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Model deleted successfully' })
  } catch (error) {
    console.error('Error deleting model:', error)
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    )
  }
}
