import 'server-only'

import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

export const ADMIN_COOKIE_NAME = 'news_feed_admin'
const SESSION_PURPOSE = 'news-feed-admin-session-v1'

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  )
}

function getAdminConfig() {
  const username = process.env.ADMIN_USERNAME?.trim()
  const password = process.env.ADMIN_PASSWORD
  const passwordHash = process.env.ADMIN_PASSWORD_HASH
  const sessionSecret = process.env.ADMIN_SESSION_SECRET

  if (!username || (!password && !passwordHash) || !sessionSecret) return null
  return { username, password, passwordHash, sessionSecret }
}

function verifyScryptPassword(password: string, encodedHash: string): boolean {
  const [algorithm, saltHex, hashHex] = encodedHash.split(':')
  if (algorithm !== 'scrypt' || !saltHex || !hashHex) return false

  try {
    const expectedHash = Buffer.from(hashHex, 'hex')
    if (expectedHash.length !== 64) return false
    const actualHash = scryptSync(password, Buffer.from(saltHex, 'hex'), expectedHash.length)
    return timingSafeEqual(actualHash, expectedHash)
  } catch {
    return false
  }
}

export function isAdminAuthConfigured(): boolean {
  return getAdminConfig() !== null
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const config = getAdminConfig()
  if (!config) return false

  const passwordMatches = config.passwordHash
    ? verifyScryptPassword(password, config.passwordHash)
    : safeEqual(password, config.password ?? '')

  return safeEqual(username, config.username) && passwordMatches
}

export function createAdminSessionToken(): string {
  const config = getAdminConfig()
  if (!config) throw new Error('Admin authentication is not configured')

  return createHmac('sha256', config.sessionSecret)
    .update(`${SESSION_PURPOSE}:${config.username}`)
    .digest('base64url')
}

export function isValidAdminSession(token: string | undefined): boolean {
  if (!token || !isAdminAuthConfigured()) return false
  return safeEqual(token, createAdminSessionToken())
}

export function isAdminRequest(request: NextRequest): boolean {
  return isValidAdminSession(request.cookies.get(ADMIN_COOKIE_NAME)?.value)
}
