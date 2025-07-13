
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const message = await prisma.message.update({
      where: { id: params.id },
      data: { isApproved: true },
      include: {
        model: true,
        conversation: true
      }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Error approving message:', error)
    return NextResponse.json(
      { error: 'Failed to approve message' },
      { status: 500 }
    )
  }
}
