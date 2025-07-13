
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/google-drive/auth/callback`
)

export async function POST(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const { accessToken, refreshToken } = await request.json()
    const { fileId } = params

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    // Get file metadata first
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents, owners(emailAddress)'
    })

    const file = fileMetadata.data
    let content = ''

    // Handle different file types
    if (file.mimeType?.startsWith('application/vnd.google-apps.')) {
      // Google Workspace files need to be exported
      let exportMimeType = 'text/plain'
      
      if (file.mimeType === 'application/vnd.google-apps.document') {
        exportMimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      } else if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
        exportMimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      } else if (file.mimeType === 'application/vnd.google-apps.presentation') {
        exportMimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      }

      const response = await drive.files.export({
        fileId,
        mimeType: exportMimeType
      }, { responseType: 'arraybuffer' })

      // Convert to base64 for binary files
      if (exportMimeType.includes('officedocument')) {
        content = Buffer.from(response.data as ArrayBuffer).toString('base64')
      } else {
        content = Buffer.from(response.data as ArrayBuffer).toString('utf-8')
      }
    } else {
      // Regular files
      const response = await drive.files.get({
        fileId,
        alt: 'media'
      }, { responseType: 'arraybuffer' })

      if (file.mimeType === 'text/plain' || file.mimeType?.startsWith('text/')) {
        content = Buffer.from(response.data as ArrayBuffer).toString('utf-8')
      } else {
        // Binary files (PDFs, Word docs, etc.) - store as base64
        content = Buffer.from(response.data as ArrayBuffer).toString('base64')
      }
    }

    return NextResponse.json({
      file: {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
        parents: file.parents,
        ownerEmail: file.owners?.[0]?.emailAddress
      },
      content
    })
  } catch (error) {
    console.error('Google Drive download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
