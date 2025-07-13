
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: {
        uploadDate: 'desc'
      }
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file content
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Extract text content based on file type
    let content = ''
    const fileType = file.type
    
    if (fileType === 'text/plain') {
      content = buffer.toString('utf-8')
    } else if (fileType === 'application/pdf') {
      // For PDF files, we'll store the base64 content for now
      // In a real implementation, you'd use a PDF parser
      content = buffer.toString('base64')
    } else if (fileType.includes('text/')) {
      content = buffer.toString('utf-8')
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name}`

    const document = await prisma.document.create({
      data: {
        filename,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        content
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}
