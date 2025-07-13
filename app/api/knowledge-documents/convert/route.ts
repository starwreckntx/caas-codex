
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { conversationId, title, documentType = 'CONVERSATION_SUMMARY' } = body

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    // Get client IP address
    const headersList = headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Get conversation with messages
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        modelA: true,
        modelB: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            model: true
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Use LLM API to convert conversation to document
    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are a knowledge extraction expert. Convert the following conversation into a structured knowledge document. 

Extract:
1. Key insights and learnings
2. Important conclusions
3. Action items or recommendations
4. Core concepts discussed
5. Areas of agreement and disagreement

Format as a well-structured document with clear sections and bullet points.`
          },
          {
            role: 'user',
            content: `Convert this conversation between ${conversation.modelA.name} and ${conversation.modelB.name} into a knowledge document:

Session Goal: ${conversation.sessionGoal || 'No specific goal set'}

Conversation Messages:
${conversation.messages.map((msg, index) => {
  const speaker = msg.modelId === conversation.modelAId ? conversation.modelA.name : 
                   msg.modelId === conversation.modelBId ? conversation.modelB.name : 
                   msg.messageType === 'MODERATOR' ? 'Moderator' : 'Human'
  return `${index + 1}. ${speaker}: ${msg.content}`
}).join('\n\n')}

Please create a comprehensive knowledge document with the title "${title || `Knowledge from ${conversation.title}`}".`
          }
        ]
      })
    })

    if (!llmResponse.ok) {
      console.error('LLM API failed:', llmResponse.statusText)
      return NextResponse.json(
        { error: 'Failed to process conversation with AI' },
        { status: 500 }
      )
    }

    const llmData = await llmResponse.json()
    const generatedContent = llmData.choices?.[0]?.message?.content

    if (!generatedContent) {
      return NextResponse.json(
        { error: 'Failed to generate knowledge document content' },
        { status: 500 }
      )
    }

    // Extract key insights from the generated content
    const keyInsights = extractKeyInsights(generatedContent)
    const tags = extractTags(conversation, generatedContent)
    const summary = generateSummary(generatedContent)

    // Create knowledge document
    const knowledgeDocument = await prisma.knowledgeDocument.create({
      data: {
        originalConversationId: conversationId,
        title: title || `Knowledge from ${conversation.title}`,
        content: generatedContent,
        summary,
        keyInsights,
        tags,
        participants: [conversation.modelA.name, conversation.modelB.name],
        sessionGoal: conversation.sessionGoal,
        documentType,
        sourceMetadata: {
          messageCount: conversation.messages.length,
          conversationTitle: conversation.title,
          moderatorEnabled: conversation.moderatorEnabled,
          createdAt: conversation.createdAt,
          modelAProvider: conversation.modelA.provider,
          modelBProvider: conversation.modelB.provider
        },
        createdBy: ipAddress
      },
      include: {
        conversation: {
          include: {
            modelA: true,
            modelB: true
          }
        }
      }
    })

    return NextResponse.json(knowledgeDocument, { status: 201 })
  } catch (error) {
    console.error('Error converting conversation to knowledge document:', error)
    return NextResponse.json(
      { error: 'Failed to convert conversation to knowledge document' },
      { status: 500 }
    )
  }
}

function extractKeyInsights(content: string): string[] {
  const insights: string[] = []
  const lines = content.split('\n')
  
  for (const line of lines) {
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      insights.push(line.trim().substring(2))
    }
  }
  
  return insights.slice(0, 10) // Limit to top 10 insights
}

function extractTags(conversation: any, content: string): string[] {
  const tags = []
  
  // Add provider tags
  tags.push(conversation.modelA.provider, conversation.modelB.provider)
  
  // Add category tags
  tags.push(conversation.modelA.category, conversation.modelB.category)
  
  // Extract topic tags from content
  const topicKeywords = ['AI', 'technology', 'discussion', 'analysis', 'research', 'development']
  const lowerContent = content.toLowerCase()
  
  for (const keyword of topicKeywords) {
    if (lowerContent.includes(keyword.toLowerCase())) {
      tags.push(keyword)
    }
  }
  
  return [...new Set(tags)].filter(Boolean) // Remove duplicates and empty values
}

function generateSummary(content: string): string {
  const lines = content.split('\n')
  const firstParagraph = lines.find(line => line.trim().length > 50)
  
  if (firstParagraph) {
    return firstParagraph.trim().substring(0, 200) + '...'
  }
  
  return content.substring(0, 200) + '...'
}
