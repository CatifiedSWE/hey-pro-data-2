import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'HeyProData API v2.0 - Modular Architecture',
    timestamp: new Date().toISOString()
  })
}
