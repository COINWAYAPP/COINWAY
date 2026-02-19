import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/supabase'
import { getWallet } from '@/lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const wallet = await getWallet(req)
  if (!wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminDb()
  const { data: agent } = await db.from('agents').select('owner_wallet').eq('id', params.id).maybeSingle()
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (agent.owner_wallet !== wallet) return NextResponse.json({ error: 'Not your agent' }, { status: 403 })

  const body   = await req.json()
  const update: any = { updated_at: new Date().toISOString() }
  if (body.name        !== undefined) update.name        = body.name.trim()
  if (body.description !== undefined) update.description = body.description.trim()
  if (body.target_url  !== undefined) update.target_url  = body.target_url.trim()
  if (body.price_usdc  !== undefined) update.price_usdc  = parseFloat(body.price_usdc)
  if (body.active      !== undefined) update.active      = Boolean(body.active)

  await db.from('agents').update(update).eq('id', params.id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const wallet = await getWallet(req)
  if (!wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminDb()
  const { data: agent } = await db.from('agents').select('owner_wallet').eq('id', params.id).maybeSingle()
  if (!agent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (agent.owner_wallet !== wallet) return NextResponse.json({ error: 'Not your agent' }, { status: 403 })

  await db.from('agents').update({ active: false }).eq('id', params.id)
  return NextResponse.json({ ok: true })
}
