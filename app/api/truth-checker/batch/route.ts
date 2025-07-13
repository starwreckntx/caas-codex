
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { truthCheckerService } from '@/lib/truth-checker-service'
import { TruthAssessmentType } from '@/lib/types'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { conversationId, messageIds, assessmentType = 'COMPREHENSIVE' } = body

    // Validate required fields
    if (!conversationId || !messageIds || !Array.isArray(messageIds)) {
      return NextResponse.json(
        { error: 'Conversation ID and message IDs array are required' },
        { status: 400 }
      )
    }

    // Get messages to analyze
    const messages = await prisma.message.findMany({
      where: { 
        id: { in: messageIds },
        conversationId: conversationId,
        truthCheckEnabled: true
      },
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
      },
      orderBy: { createdAt: 'asc' }
    })

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'No eligible messages found for truth checking' },
        { status: 404 }
      )
    }

    // Update all message statuses to processing
    await prisma.message.updateMany({
      where: { id: { in: messages.map(m => m.id) } },
      data: { truthCheckStatus: 'PROCESSING' }
    })

    const results = []
    const errors = []

    // Process each message
    for (const message of messages) {
      try {
        // Get conversation context up to this message
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
          messageId: message.id,
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
          where: { id: message.id },
          data: { truthCheckStatus: 'COMPLETED' }
        })

        results.push({
          messageId: message.id,
          assessment: savedAssessment,
          issues: savedIssues,
          alerts: savedAlerts
        })

      } catch (error) {
        console.error(`Error processing message ${message.id}:`, error)
        
        // Update message status on error
        await prisma.message.update({
          where: { id: message.id },
          data: { truthCheckStatus: 'FAILED' }
        }).catch(() => {})

        errors.push({
          messageId: message.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      processed: results.length,
      failed: errors.length,
      total: messages.length
    })

  } catch (error) {
    console.error('Batch truth checking error:', error)
    return NextResponse.json(
      { error: 'Batch truth checking failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
