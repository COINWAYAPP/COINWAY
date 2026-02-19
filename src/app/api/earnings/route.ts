import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/supabase'
import { getWallet } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const wallet = await getWallet(req)
  if (!wallet) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminDb()
  const { data: agents } = await db
    .from('agents')
    .select('id, name, price_usdc, payments(id, net_usdc, fee_usdc, amount_usdc, from_wallet, tx_hash, created_at)')
    .eq('owner_wallet', wallet)

  const allPayments = (agents || []).flatMap((a: any) =>
    (a.payments || []).map((p: any) => ({ ...p, agent_name: a.name }))
  )

  const summary = {
    total_agents:      agents?.length ?? 0,
    total_calls:       allPayments.length,
    earned_usdc:       allPayments.reduce((s: number, p: any) => s + parseFloat(p.net_usdc || 0), 0),
    coinway_fees_usdc: allPayments.reduce((s: number, p: any) => s + parseFloat(p.fee_usdc || 0), 0),
    gross_usdc:        allPayments.reduce((s: number, p: any) => s + parseFloat(p.amount_usdc || 0), 0),
    coinway_fee_pct:   '1.0%',
  }

  const by_agent = (agents || []).map((a: any) => ({
    id: a.id, name: a.name, price_usdc: a.price_usdc,
    calls:       a.payments?.length ?? 0,
    earned_usdc: (a.payments || []).reduce((s: number, p: any) => s + parseFloat(p.net_usdc || 0), 0),
  }))

  const recent_payments = allPayments
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 20)

  return NextResponse.json({ ok: true, summary, by_agent, recent_payments })
}
