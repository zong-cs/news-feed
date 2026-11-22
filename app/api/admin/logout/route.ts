import { NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME } from '@/lib/auth/admin'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.ADMIN_COOKIE_SECURE === 'true',
    path: '/',
    maxAge: 0,
  })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
