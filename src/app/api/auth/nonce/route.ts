import { NextResponse } from 'next/server'
import { generateNonce } from '@/lib/siwe'

export async function GET() {
  return NextResponse.json({ nonce: generateNonce() })
}
