
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

const REGULAR_PASSPHRASE = 'theydontspeakforus'
const STOIC_PASSPHRASE = 'stoicstone'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { passphrase } = body

    if (!passphrase) {
      return NextResponse.json(
        { error: 'Passphrase is required' },
        { status: 400 }
      )
    }

    // Get client IP address
    const headersList = headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Determine application mode based on passphrase
    let applicationMode = 'REGULAR'
    if (passphrase === REGULAR_PASSPHRASE) {
      applicationMode = 'REGULAR'
    } else if (passphrase === STOIC_PASSPHRASE) {
      applicationMode = 'STOIC'
    } else {
      return NextResponse.json(
        { error: 'Invalid passphrase' },
        { status: 401 }
      )
    }

    // Generate session token
    const sessionToken = randomUUID()
    const expiresAt = new Date(Date.now() + SESSION_DURATION)

    // Create or update IP session
    const ipSession = await prisma.ipSession.upsert({
      where: { ipAddress },
      update: {
        isAuthenticated: true,
        sessionToken,
        expiresAt,
        lastActivity: new Date(),
        applicationMode: applicationMode as any
      },
      create: {
        ipAddress,
        isAuthenticated: true,
        sessionToken,
        expiresAt,
        lastActivity: new Date(),
        applicationMode: applicationMode as any
      }
    })

    // Set session cookie
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Authentication successful',
        sessionToken,
        expiresAt,
        applicationMode
      },
      { status: 200 }
    )

    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION / 1000,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Error in login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
