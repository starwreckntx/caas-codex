
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { truthCheckerService } from '@/lib/truth-checker-service'
import { TruthAssessmentType } from '@/lib/types'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messageId, conversationId, assessmentType = 'COMPREHENSIVE' } = body

    // Validate required fields
    if (!messageId || !conversationId) {
      return NextResponse.json(
        { error: 'Message ID and conversation ID are required' },
        { status: 400 }
      )
    }

    // Get the message to analyze
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        model: true,
        conversation: {
          include: {
            documents: {
              include: {
                document: true
              }
            }
          }
        }
      }
    })

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Check if message should be truth-checked
    if (!message.truthCheckEnabled) {
      return NextResponse.json(
        { error: 'Truth checking is disabled for this message' },
        { status: 400 }
      )
    }

    // Update message status
    await prisma.message.update({
      where: { id: messageId },
      data: { truthCheckStatus: 'PROCESSING' }
    })

    // Get conversation context for analysis
    const conversationContext = await prisma.message.findMany({
      where: { 
        conversationId: conversationId,
        createdAt: { lt: message.createdAt }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { model: true }
    })

    // Get document context
    const documentContext = message.conversation.documents?.map(doc => 
      doc.document.content || doc.document.filename
    ).filter(Boolean) || []

    // Perform truth check
    const result = await truthCheckerService.performTruthCheck({
      messageId,
      conversationId,
      content: message.content,
      messageType: message.messageType,
      conversationContext: conversationContext.reverse(),
      documentContext,
      assessmentType: assessmentType as TruthAssessmentType
    })

    // Save assessment to database
    const savedAssessment = await prisma.truthAssessment.create({
      data: {
        messageId: result.assessment.messageId,
        conversationId: result.assessment.conversationId,
        assessmentType: result.assessment.assessmentType,
        overallScore: result.assessment.overallScore,
        reliabilityScore: result.assessment.reliabilityScore,
        accuracyScore: result.assessment.accuracyScore,
        consistencyScore: result.assessment.consistencyScore,
        analysisContent: result.assessment.analysisContent,
        confidenceLevel: result.assessment.confidenceLevel,
        methodology: result.assessment.methodology,
        processingTime: result.assessment.processingTime,
        checkedBy: result.assessment.checkedBy
      }
    })

    // Save detected issues
    const savedIssues = await Promise.all(
      result.issues.map(issue => 
        prisma.detectedIssue.create({
          data: {
            assessmentId: savedAssessment.id,
            messageId: issue.messageId,
            issueType: issue.issueType,
            severityLevel: issue.severityLevel,
            title: issue.title,
            description: issue.description,
            explanation: issue.explanation,
            suggestedAction: issue.suggestedAction,
            confidence: issue.confidence,
            textLocation: issue.textLocation,
            contextBefore: issue.contextBefore,
            contextAfter: issue.contextAfter
          }
        })
      )
    )

    // Save alerts
    const savedAlerts = await Promise.all(
      result.alerts.map(alert => 
        prisma.truthAlert.create({
          data: {
            assessmentId: savedAssessment.id,
            messageId: alert.messageId,
            conversationId: alert.conversationId,
            alertType: alert.alertType,
            severityLevel: alert.severityLevel,
            title: alert.title,
            message: alert.message,
            triggerThreshold: alert.triggerThreshold,
            actualValue: alert.actualValue,
            isActionRequired: alert.isActionRequired
          }
        })
      )
    )

    // Update message status
    await prisma.message.update({
      where: { id: messageId },
      data: { truthCheckStatus: 'COMPLETED' }
    })

    // Return complete assessment
    const completeAssessment = await prisma.truthAssessment.findUnique({
      where: { id: savedAssessment.id },
      include: {
        detectedIssues: true,
        truthAlerts: true
      }
    })

    return NextResponse.json({
      success: true,
      assessment: completeAssessment,
      issues: savedIssues,
      alerts: savedAlerts,
      processingTime: result.assessment.processingTime
    })

  } catch (error) {
    console.error('Truth checking error:', error)
    
    // Update message status on error
    const body = await request.json().catch(() => ({}))
    if (body.messageId) {
      await prisma.message.update({
        where: { id: body.messageId },
        data: { truthCheckStatus: 'FAILED' }
      }).catch(() => {})
    }

    return NextResponse.json(
      { error: 'Truth checking failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const messageId = url.searchParams.get('messageId')
    const conversationId = url.searchParams.get('conversationId')

    if (!messageId && !conversationId) {
      return NextResponse.json(
        { error: 'Message ID or conversation ID is required' },
        { status: 400 }
      )
    }

    let assessments

    if (messageId) {
      // Get assessment for specific message
      assessments = await prisma.truthAssessment.findUnique({
        where: { messageId },
        include: {
          detectedIssues: true,
          truthAlerts: {
            where: { isDismissed: false }
          }
        }
      })
    } else if (conversationId) {
      // Get all assessments for conversation
      assessments = await prisma.truthAssessment.findMany({
        where: { conversationId },
        include: {
          detectedIssues: true,
          truthAlerts: {
            where: { isDismissed: false }
          }
        },
        orderBy: { checkedAt: 'desc' }
      })
    }

    return NextResponse.json({
      success: true,
      assessments
    })

  } catch (error) {
    console.error('Error fetching truth assessments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch truth assessments' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
