import { NextRequest, NextResponse } from 'next/server'
import { consumeNonce, verifySIWE, createSession } from '@/lib/siwe'

export async function POST(req: NextRequest) {
  const { message, signature, address } = await req.json()
  if (!message || !signature || !address)
    return NextResponse.json({ error: 'message, signature, address required' }, { status: 400 })

  const nonceMatch = message.match(/Nonce: ([a-f0-9]+)/)
  if (!nonceMatch || !consumeNonce(nonceMatch[1]))
    return NextResponse.json({ error: 'Invalid or expired nonce' }, { status: 400 })

  const valid = await verifySIWE(message, signature, address)
  if (!valid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  const token = await createSession(address)
  return NextResponse.json({ ok: true, token, wallet: address.toLowerCase() })
}
