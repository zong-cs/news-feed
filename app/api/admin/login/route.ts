import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isAdminAuthConfigured,
  verifyAdminCredentials,
} from '@/lib/auth/admin'

export async function POST(request: NextRequest) {
  if (!isAdminAuthConfigured()) {
    return NextResponse.json({ error: '后台登录尚未配置' }, { status: 503 })
  }

  const body = await request.json().catch(() => null)
  const username = typeof body?.username === 'string' ? body.username : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!verifyAdminCredentials(username, password)) {
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.ADMIN_COOKIE_SECURE === 'true',
    path: '/',
    maxAge: 12 * 60 * 60,
  })
  response.headers.set('Cache-Control', 'no-store')
  return response
}
