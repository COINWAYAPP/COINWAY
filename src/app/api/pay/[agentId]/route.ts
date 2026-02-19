import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { getAdminDb } from '@/lib/supabase'
import { verifyPayment, buildPaymentRequired, calcSplit } from '@/lib/x402'

export async function POST(req: NextRequest, { params }: { params: { agentId: string } }) {
  const db = getAdminDb()
  const { data: agent } = await db.from('agents').select('*').eq('id', params.agentId).eq('active', true).maybeSingle()
  if (!agent) return NextResponse.json({ error: 'Agent not found or inactive' }, { status: 404 })

  const paymentHeader = req.headers.get('x-payment')

  // No payment → return 402
  if (!paymentHeader)
    return NextResponse.json(buildPaymentRequired(agent.id, agent.price_usdc, agent.name), { status: 402 })

  // Verify payment
  const result = await verifyPayment(paymentHeader, agent.price_usdc)
  if (!result.valid) {
    const spec = buildPaymentRequired(agent.id, agent.price_usdc, agent.name)
    return NextResponse.json({ ...spec, error: 'Payment invalid', reason: result.reason }, { status: 402 })
  }

  // Record payment
  const { fee, net } = calcSplit(agent.price_usdc)
  const paymentId    = uuid()
  const { error: dbErr } = await db.from('payments').insert({
    id: paymentId, agent_id: agent.id, tx_hash: result.payload!.txHash,
    from_wallet: result.payload!.from, amount_usdc: agent.price_usdc, fee_usdc: fee, net_usdc: net,
  })
  if (dbErr) {
    if (dbErr.message.includes('unique') || dbErr.code === '23505')
      return NextResponse.json({ error: 'Payment already used' }, { status: 402 })
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  // Proxy to agent's target_url
  try {
    const body    = await req.text()
    const headers = Object.fromEntries(req.headers.entries())
    delete headers['x-payment']
    headers['x-coinway-from'] = result.payload!.from
    headers['x-coinway-paid'] = agent.price_usdc.toString()
    headers['x-coinway-id']   = paymentId
    headers['host']           = new URL(agent.target_url).host

    const upstream = await fetch(agent.target_url, { method: 'POST', headers, body: body || undefined })
    const upBody   = await upstream.arrayBuffer()

    return new NextResponse(upBody, {
      status:  upstream.status,
      headers: { 'x-coinway-payment-id': paymentId, 'content-type': upstream.headers.get('content-type') || 'application/json' },
    })
  } catch {
    return NextResponse.json({ error: 'Agent unreachable', payment_id: paymentId }, { status: 502 })
  }
}

// Also handle GET for agents that use GET
export { POST as GET }
