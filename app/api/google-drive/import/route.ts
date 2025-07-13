
import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/google-drive/auth/callback`
)

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken, selectedFiles } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }

    if (!selectedFiles || !Array.isArray(selectedFiles) || selectedFiles.length === 0) {
      return NextResponse.json(
        { error: 'At least one file must be selected' },
        { status: 400 }
      )
    }

    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    const importedDocuments = []

    for (const selectedFile of selectedFiles) {
      try {
        // Download file content
        const downloadResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/google-drive/download/${selectedFile.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ accessToken, refreshToken })
        })

        if (!downloadResponse.ok) {
          console.error(`Failed to download file ${selectedFile.id}`)
          continue
        }

        const { file, content } = await downloadResponse.json()

        // Create document in database
        const document = await prisma.document.create({
          data: {
            filename: `drive-${file.id}-${file.name}`,
            originalName: file.name,
            fileType: file.mimeType,
            fileSize: parseInt(file.size || '0'),
            content,
            isGoogleDrive: true,
            driveFileId: file.id,
            driveFileName: file.name,
            driveMimeType: file.mimeType,
            driveParentId: file.parents?.[0] || null,
            driveWebViewLink: file.webViewLink,
            driveDownloadLink: null, // Google Drive doesn't provide direct download links
            driveOwnerEmail: file.ownerEmail,
            driveCreatedTime: file.createdTime ? new Date(file.createdTime) : null,
            driveModifiedTime: file.modifiedTime ? new Date(file.modifiedTime) : null,
            driveFileSize: file.size ? BigInt(file.size) : null
          }
        })

        // Convert BigInt to string for JSON serialization
        const serializedDocument = {
          ...document,
          driveFileSize: document.driveFileSize?.toString() || null
        }

        importedDocuments.push(serializedDocument)
      } catch (fileError) {
        console.error(`Error importing file ${selectedFile.id}:`, fileError)
        // Continue with other files even if one fails
      }
    }

    if (importedDocuments.length === 0) {
      return NextResponse.json(
        { error: 'Failed to import any files' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      importedDocuments,
      totalImported: importedDocuments.length,
      totalRequested: selectedFiles.length
    }, { status: 201 })
  } catch (error) {
    console.error('Google Drive import error:', error)
    return NextResponse.json(
      { error: 'Failed to import files' },
      { status: 500 }
    )
  }
}
