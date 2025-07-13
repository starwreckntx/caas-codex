
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const messageId = url.searchParams.get('messageId')
    const assessmentId = url.searchParams.get('assessmentId')
    const issueType = url.searchParams.get('issueType')
    const severityLevel = url.searchParams.get('severityLevel')
    const resolved = url.searchParams.get('resolved')

    const where: any = {}

    if (messageId) where.messageId = messageId
    if (assessmentId) where.assessmentId = assessmentId
    if (issueType) where.issueType = issueType
    if (severityLevel) where.severityLevel = severityLevel
    if (resolved !== null) where.isResolved = resolved === 'true'

    const issues = await prisma.detectedIssue.findMany({
      where,
      include: {
        assessment: {
          include: {
            message: {
              include: {
                model: true
              }
            }
          }
        }
      },
      orderBy: { detectedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      issues
    })

  } catch (error) {
    console.error('Error fetching detected issues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch detected issues' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { issueId, action, userId } = body

    if (!issueId || !action) {
      return NextResponse.json(
        { error: 'Issue ID and action are required' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    switch (action) {
      case 'resolve':
        updateData.isResolved = true
        updateData.resolvedAt = new Date()
        if (userId) updateData.resolvedBy = userId
        break
      case 'unresolve':
        updateData.isResolved = false
        updateData.resolvedAt = null
        updateData.resolvedBy = null
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedIssue = await prisma.detectedIssue.update({
      where: { id: issueId },
      data: updateData,
      include: {
        assessment: {
          include: {
            message: {
              include: {
                model: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      issue: updatedIssue
    })

  } catch (error) {
    console.error('Error updating detected issue:', error)
    return NextResponse.json(
      { error: 'Failed to update detected issue' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const issueId = url.searchParams.get('issueId')

    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      )
    }

    await prisma.detectedIssue.delete({
      where: { id: issueId }
    })

    return NextResponse.json({
      success: true,
      message: 'Issue deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting detected issue:', error)
    return NextResponse.json(
      { error: 'Failed to delete detected issue' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
