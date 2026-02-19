import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/supabase'

export async function GET() {
  const db = getAdminDb()
  const { data: agents } = await db
    .from('agents')
    .select('id, name, description, price_usdc, created_at, payments(id)')
    .eq('active', true)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const result = (agents || [])
    .map((a: any) => ({ ...a, total_calls: a.payments?.length ?? 0, payments: undefined, pay_url: `${appUrl}/api/pay/${a.id}` }))
    .sort((a: any, b: any) => b.total_calls - a.total_calls)
    .slice(0, 50)

  return NextResponse.json({ ok: true, agents: result })
}
