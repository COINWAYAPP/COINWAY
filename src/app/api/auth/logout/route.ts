import { NextRequest, NextResponse } from 'next/server'
import { deleteSession } from '@/lib/siwe'

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.slice(7)
  if (token) await deleteSession(token)
  return NextResponse.json({ ok: true })
}
