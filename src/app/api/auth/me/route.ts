import { NextRequest, NextResponse } from 'next/server'
import { getSessionWallet } from '@/lib/siwe'

export async function GET(req: NextRequest) {
  const token  = req.headers.get('authorization')?.slice(7)
  if (!token)  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const wallet = await getSessionWallet(token)
  if (!wallet) return NextResponse.json({ error: 'Session expired' }, { status: 401 })
  return NextResponse.json({ wallet })
}
