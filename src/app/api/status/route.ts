import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/supabase'

export async function GET() {
  try {
    const db = getAdminDb()
    const [{ count: ac }, { data: payments }] = await Promise.all([
      db.from('agents').select('*', { count: 'exact', head: true }).eq('active', true),
      db.from('payments').select('amount_usdc, fee_usdc').eq('status', 'confirmed'),
    ])
    const vol = (payments || []).reduce((s: number, p: any) => s + parseFloat(p.amount_usdc || 0), 0)
    const fee = (payments || []).reduce((s: number, p: any) => s + parseFloat(p.fee_usdc || 0), 0)
    return NextResponse.json({
      status: 'alive', service: 'Coinway',
      stats: { active_agents: ac ?? 0, total_payments: payments?.length ?? 0, total_volume_usdc: vol, coinway_revenue_usdc: fee },
    })
  } catch {
    return NextResponse.json({ status: 'alive', service: 'Coinway', stats: { active_agents: 0, total_payments: 0, total_volume_usdc: 0 } })
  }
}
