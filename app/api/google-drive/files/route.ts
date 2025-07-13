
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/google-drive/auth/callback`
)

// Supported MIME types for document processing
const SUPPORTED_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'text/csv',
  'application/rtf',
  'text/markdown',
  'application/json',
  // Google Workspace types
  'application/vnd.google-apps.document',
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.google-apps.presentation'
]

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken, folderId, searchQuery, pageToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    // Build query parameters
    let query = "trashed=false"
    
    // Add MIME type filter for supported documents
    const mimeTypeQuery = SUPPORTED_MIME_TYPES.map(type => `mimeType='${type}'`).join(' or ')
    query += ` and (${mimeTypeQuery})`

    // Add folder filter if specified
    if (folderId && folderId !== 'root') {
      query += ` and '${folderId}' in parents`
    }

    // Add search query if specified
    if (searchQuery) {
      query += ` and name contains '${searchQuery.replace(/'/g, "\\'")}'`
    }

    const response = await drive.files.list({
      q: query,
      pageSize: 50,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, parents, owners(emailAddress))',
      orderBy: 'modifiedTime desc'
    })

    const files = response.data.files?.map(file => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      createdTime: file.createdTime,
      modifiedTime: file.modifiedTime,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
      parents: file.parents,
      ownerEmail: file.owners?.[0]?.emailAddress,
      shared: file.owners?.length ? file.owners.length > 1 : false
    })) || []

    return NextResponse.json({
      files,
      nextPageToken: response.data.nextPageToken,
      total: files.length
    })
  } catch (error) {
    console.error('Google Drive files error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    )
  }
}
