
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const conversationId = url.searchParams.get('conversationId')
    const messageId = url.searchParams.get('messageId')
    const severityLevel = url.searchParams.get('severityLevel')
    const alertType = url.searchParams.get('alertType')
    const acknowledged = url.searchParams.get('acknowledged')
    const dismissed = url.searchParams.get('dismissed')

    const where: any = {}

    if (conversationId) where.conversationId = conversationId
    if (messageId) where.messageId = messageId
    if (severityLevel) where.severityLevel = severityLevel
    if (alertType) where.alertType = alertType
    if (acknowledged !== null) where.isAcknowledged = acknowledged === 'true'
    if (dismissed !== null) where.isDismissed = dismissed === 'true'

    const alerts = await prisma.truthAlert.findMany({
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
      orderBy: { triggeredAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      alerts
    })

  } catch (error) {
    console.error('Error fetching truth alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch truth alerts' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId, action, userId } = body

    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'Alert ID and action are required' },
        { status: 400 }
      )
    }

    const updateData: any = {}

    switch (action) {
      case 'acknowledge':
        updateData.isAcknowledged = true
        updateData.acknowledgedAt = new Date()
        if (userId) updateData.acknowledgedBy = userId
        break
      case 'dismiss':
        updateData.isDismissed = true
        updateData.dismissedAt = new Date()
        if (userId) updateData.dismissedBy = userId
        break
      case 'unacknowledge':
        updateData.isAcknowledged = false
        updateData.acknowledgedAt = null
        updateData.acknowledgedBy = null
        break
      case 'restore':
        updateData.isDismissed = false
        updateData.dismissedAt = null
        updateData.dismissedBy = null
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const updatedAlert = await prisma.truthAlert.update({
      where: { id: alertId },
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
      alert: updatedAlert
    })

  } catch (error) {
    console.error('Error updating truth alert:', error)
    return NextResponse.json(
      { error: 'Failed to update truth alert' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const alertId = url.searchParams.get('alertId')

    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      )
    }

    await prisma.truthAlert.delete({
      where: { id: alertId }
    })

    return NextResponse.json({
      success: true,
      message: 'Alert deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting truth alert:', error)
    return NextResponse.json(
      { error: 'Failed to delete truth alert' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
