import { createPublicClient, http, type Address } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import crypto from 'crypto'
import { getAdminDb } from './supabase'

const nonces = new Map<string, number>() // nonce → expiresAt

export function generateNonce(): string {
  const nonce = crypto.randomBytes(16).toString('hex')
  nonces.set(nonce, Date.now() + 5 * 60 * 1000)
  return nonce
}

export function consumeNonce(nonce: string): boolean {
  const exp = nonces.get(nonce)
  if (!exp || exp < Date.now()) return false
  nonces.delete(nonce)
  return true
}

export function buildSIWEMessage(p: {
  domain: string; address: string; nonce: string; issuedAt: string
}): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return [
    `${p.domain} wants you to sign in with your Ethereum account:`,
    p.address, '',
    'Sign in to Coinway. No password. No email. Just your wallet.',
    '',
    `URI: ${appUrl}`,
    'Version: 1',
    'Chain ID: 8453',
    `Nonce: ${p.nonce}`,
    `Issued At: ${p.issuedAt}`,
  ].join('\n')
}

const chain = process.env.X402_NETWORK === 'base' ? base : baseSepolia
const client = createPublicClient({ chain, transport: http() })

export async function verifySIWE(message: string, signature: `0x${string}`, address: Address): Promise<boolean> {
  try {
    return await client.verifyMessage({ address, message, signature })
  } catch { return false }
}

export async function createSession(wallet: string): Promise<string> {
  const db      = getAdminDb()
  const token   = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
  await db.from('sessions').insert({ token, wallet: wallet.toLowerCase(), expires_at: expires })
  return token
}

export async function getSessionWallet(token: string): Promise<string | null> {
  const db = getAdminDb()
  const { data } = await db.from('sessions').select('wallet, expires_at').eq('token', token).maybeSingle()
  if (!data) return null
  if (new Date(data.expires_at) < new Date()) return null
  return data.wallet
}

export async function deleteSession(token: string): Promise<void> {
  await getAdminDb().from('sessions').delete().eq('token', token)
}
