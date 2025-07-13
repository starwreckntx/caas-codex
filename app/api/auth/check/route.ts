
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { headers } from 'next/headers'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Get client IP address
    const headersList = headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // Get session token from cookie
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('session-token')?.value

    // Check IP session
    const ipSession = await prisma.ipSession.findUnique({
      where: { ipAddress }
    })

    if (!ipSession || !ipSession.isAuthenticated || !sessionToken) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      )
    }

    // Check if session token matches
    if (ipSession.sessionToken !== sessionToken) {
      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      )
    }

    // Check if session has expired
    if (ipSession.expiresAt && ipSession.expiresAt < new Date()) {
      // Clean up expired session
      await prisma.ipSession.update({
        where: { ipAddress },
        data: {
          isAuthenticated: false,
          sessionToken: null,
          expiresAt: null
        }
      })

      return NextResponse.json(
        { isAuthenticated: false },
        { status: 401 }
      )
    }

    // Update last activity
    await prisma.ipSession.update({
      where: { ipAddress },
      data: {
        lastActivity: new Date()
      }
    })

    return NextResponse.json(
      { 
        isAuthenticated: true,
        ipAddress,
        sessionToken,
        expiresAt: ipSession.expiresAt,
        applicationMode: ipSession.applicationMode
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error checking authentication:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
