import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getAdminDb } from '@/lib/supabase'
import { getWallet } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const wallet = await getWallet(req)
  if (!wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminDb()
  const { data: agents } = await db
    .from('agents')
    .select('*, payments(id, net_usdc)')
    .eq('owner_wallet', wallet)
    .order('created_at', { ascending: false })

  const result = (agents || []).map((a: any) => ({
    ...a,
    total_calls:   a.payments?.length ?? 0,
    earnings_usdc: (a.payments || []).reduce((s: number, p: any) => s + parseFloat(p.net_usdc || 0), 0),
    payments:      undefined,
  }))

  return NextResponse.json({ ok: true, agents: result })
}

export async function POST(req: NextRequest) {
  const wallet = await getWallet(req)
  if (!wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, description, target_url, price_usdc } = await req.json()
  if (!name?.trim())       return NextResponse.json({ error: 'name is required' }, { status: 400 })
  if (!target_url?.trim()) return NextResponse.json({ error: 'target_url is required' }, { status: 400 })
  if (!price_usdc)         return NextResponse.json({ error: 'price_usdc is required' }, { status: 400 })

  try { new URL(target_url) } catch {
    return NextResponse.json({ error: 'target_url must be a valid URL' }, { status: 400 })
  }

  const price = parseFloat(price_usdc)
  if (price < 0.001 || price > 1000)
    return NextResponse.json({ error: 'price must be between 0.001 and 1000' }, { status: 400 })

  const id = uuid()
  const db = getAdminDb()
  const { error } = await db.from('agents').insert({
    id, name: name.trim(), description: (description || '').trim(),
    owner_wallet: wallet, target_url: target_url.trim(), price_usdc: price,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return NextResponse.json({ ok: true, pay_url: `${appUrl}/api/pay/${id}` }, { status: 201 })
}
