
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/google-drive/auth/callback`
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      // Generate authorization URL
      const scopes = [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file'
      ]

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
      })

      return NextResponse.json({ authUrl })
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()

    return NextResponse.json({
      success: true,
      tokens,
      user: userInfo.data
    })
  } catch (error) {
    console.error('Google Drive auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken, refreshToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }

    // Set credentials and test connection
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })
    
    // Test the connection by getting user info
    const about = await drive.about.get({
      fields: 'user(displayName,emailAddress),storageQuota'
    })

    return NextResponse.json({
      success: true,
      user: about.data.user,
      storageQuota: about.data.storageQuota
    })
  } catch (error) {
    console.error('Google Drive validation error:', error)
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}
