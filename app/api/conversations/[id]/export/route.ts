
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { exportFormat, includeMetadata, includeTexts, includeWisdom, customFileName } = body

    // Fetch conversation with all related data
    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        modelA: true,
        modelB: true,
        messages: {
          include: {
            model: true,
            truthAssessment: true
          },
          orderBy: { createdAt: 'asc' }
        },
        roundTableConversation: {
          include: {
            participants: {
              include: {
                model: true
              }
            }
          }
        },
        conversationTexts: includeTexts ? {
          include: {
            text: true
          }
        } : undefined,
        conversationWisdom: includeWisdom ? {
          include: {
            wisdom: {
              include: {
                sourceText: true
              }
            }
          }
        } : undefined
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0]
    const fileName = customFileName || 
      `stoic_dialogue_${conversation.title.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.${exportFormat.toLowerCase()}`

    // Generate export content based on format
    let exportContent = ''
    let contentType = 'text/plain'

    switch (exportFormat) {
      case 'MARKDOWN':
        exportContent = generateMarkdownExport(conversation, includeMetadata, includeTexts, includeWisdom)
        contentType = 'text/markdown'
        break
      case 'TXT':
        exportContent = generateTextExport(conversation, includeMetadata, includeTexts, includeWisdom)
        contentType = 'text/plain'
        break
      case 'HTML':
        exportContent = generateHtmlExport(conversation, includeMetadata, includeTexts, includeWisdom)
        contentType = 'text/html'
        break
      case 'JSON':
        exportContent = JSON.stringify(conversation, null, 2)
        contentType = 'application/json'
        break
      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        )
    }

    // Save export record
    const exportRecord = await prisma.conversationExport.create({
      data: {
        conversationId: params.id,
        exportFormat,
        fileName,
        metadata: {
          includeMetadata,
          includeTexts,
          includeWisdom,
          generatedAt: new Date(),
          messageCount: conversation.messages?.length || 0
        }
      }
    })

    // Return file as download
    return new NextResponse(exportContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'X-Export-Id': exportRecord.id
      }
    })
  } catch (error) {
    console.error('Error exporting conversation:', error)
    return NextResponse.json(
      { error: 'Failed to export conversation' },
      { status: 500 }
    )
  }
}

function generateMarkdownExport(conversation: any, includeMetadata: boolean, includeTexts: boolean, includeWisdom: boolean): string {
  let content = `# ${conversation.title}\n\n`

  if (includeMetadata) {
    content += `## Conversation Details\n\n`
    content += `**Created:** ${new Date(conversation.createdAt).toLocaleString()}\n`
    content += `**Status:** ${conversation.status}\n`
    
    if (conversation.roundTableConversation) {
      content += `**Type:** Round Table Discussion\n`
      content += `**Participants:** ${conversation.roundTableConversation.participants?.map((p: any) => p.model?.name || 'Human User').join(', ')}\n`
      content += `**Moderation Style:** ${conversation.roundTableConversation.moderationStyle}\n`
    } else {
      content += `**Type:** Dialogue\n`
      content += `**Participants:** ${conversation.modelA?.name}, ${conversation.modelB?.name}\n`
    }
    content += `\n---\n\n`
  }

  if (includeTexts && conversation.conversationTexts?.length > 0) {
    content += `## Referenced Texts\n\n`
    conversation.conversationTexts.forEach((ct: any) => {
      content += `- **${ct.text.title}** by ${ct.text.author} (${ct.text.work})\n`
      if (ct.relevanceNote) {
        content += `  *${ct.relevanceNote}*\n`
      }
    })
    content += `\n---\n\n`
  }

  if (includeWisdom && conversation.conversationWisdom?.length > 0) {
    content += `## Referenced Wisdom\n\n`
    conversation.conversationWisdom.forEach((cw: any) => {
      content += `- **${cw.wisdom.title}** by ${cw.wisdom.author}\n`
      content += `  *${cw.wisdom.content}*\n`
      if (cw.contextNote) {
        content += `  Note: ${cw.contextNote}\n`
      }
    })
    content += `\n---\n\n`
  }

  content += `## Dialogue\n\n`
  
  conversation.messages?.forEach((message: any, index: number) => {
    const speaker = message.model?.name || 'Human User'
    const timestamp = new Date(message.createdAt).toLocaleTimeString()
    
    content += `### ${speaker} (${timestamp})\n\n`
    content += `${message.content}\n\n`
    
    if (message.truthAssessment) {
      content += `*Truth Reliability: ${(message.truthAssessment.overallScore * 100).toFixed(1)}%*\n\n`
    }
  })

  return content
}

function generateTextExport(conversation: any, includeMetadata: boolean, includeTexts: boolean, includeWisdom: boolean): string {
  let content = `${conversation.title}\n${'='.repeat(conversation.title.length)}\n\n`

  if (includeMetadata) {
    content += `Conversation Details:\n`
    content += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`
    content += `Status: ${conversation.status}\n`
    
    if (conversation.roundTableConversation) {
      content += `Type: Round Table Discussion\n`
      content += `Participants: ${conversation.roundTableConversation.participants?.map((p: any) => p.model?.name || 'Human User').join(', ')}\n`
    } else {
      content += `Type: Dialogue\n`
      content += `Participants: ${conversation.modelA?.name}, ${conversation.modelB?.name}\n`
    }
    content += `\n${'='.repeat(50)}\n\n`
  }

  content += `Dialogue:\n\n`
  
  conversation.messages?.forEach((message: any) => {
    const speaker = message.model?.name || 'Human User'
    const timestamp = new Date(message.createdAt).toLocaleTimeString()
    
    content += `${speaker} (${timestamp}):\n`
    content += `${message.content}\n\n`
  })

  return content
}

function generateHtmlExport(conversation: any, includeMetadata: boolean, includeTexts: boolean, includeWisdom: boolean): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conversation.title}</title>
    <style>
        body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1 { color: #92400e; border-bottom: 2px solid #d97706; }
        h2 { color: #b45309; }
        .message { margin: 20px 0; padding: 15px; border-left: 4px solid #d97706; background-color: #fef3c7; }
        .speaker { font-weight: bold; color: #92400e; }
        .timestamp { font-size: 0.9em; color: #78716c; }
        .truth-score { font-style: italic; color: #059669; }
        .metadata { background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>${conversation.title}</h1>`

  if (includeMetadata) {
    html += `<div class="metadata">
        <h2>Conversation Details</h2>
        <p><strong>Created:</strong> ${new Date(conversation.createdAt).toLocaleString()}</p>
        <p><strong>Status:</strong> ${conversation.status}</p>`
    
    if (conversation.roundTableConversation) {
      html += `<p><strong>Type:</strong> Round Table Discussion</p>
               <p><strong>Participants:</strong> ${conversation.roundTableConversation.participants?.map((p: any) => p.model?.name || 'Human User').join(', ')}</p>`
    } else {
      html += `<p><strong>Type:</strong> Dialogue</p>
               <p><strong>Participants:</strong> ${conversation.modelA?.name}, ${conversation.modelB?.name}</p>`
    }
    html += `</div>`
  }

  html += `<h2>Dialogue</h2>`
  
  conversation.messages?.forEach((message: any) => {
    const speaker = message.model?.name || 'Human User'
    const timestamp = new Date(message.createdAt).toLocaleTimeString()
    
    html += `<div class="message">
        <div class="speaker">${speaker} <span class="timestamp">(${timestamp})</span></div>
        <p>${message.content.replace(/\n/g, '<br>')}</p>`
    
    if (message.truthAssessment) {
      html += `<div class="truth-score">Truth Reliability: ${(message.truthAssessment.overallScore * 100).toFixed(1)}%</div>`
    }
    
    html += `</div>`
  })

  html += `</body></html>`
  return html
}
