const FACILITATOR    = process.env.X402_FACILITATOR  || 'https://facilitator.openx402.ai'
const USDC_BASE      = process.env.USDC_BASE         || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const COINWAY_WALLET = process.env.COINWAY_WALLET_ADDRESS!
const FEE_BPS        = parseInt(process.env.COINWAY_FEE_BPS || '100')

export interface X402Header {
  txHash: string; from: string; amount: string
  token: string; network: string; nonce: string; signature: string
}

export interface VerifyResult {
  valid: boolean; reason?: string; payload?: X402Header
}

export async function verifyPayment(header: string, expectedUsdc: number): Promise<VerifyResult> {
  let payload: X402Header
  try { payload = JSON.parse(Buffer.from(header, 'base64').toString('utf8')) }
  catch { return { valid: false, reason: 'Cannot decode X-Payment header' } }

  const expectedMicro = Math.floor(expectedUsdc * 1_000_000).toString()

  try {
    const res = await fetch(`${FACILITATOR}/verify`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        payload,
        expected: { amount: expectedMicro, token: USDC_BASE, network: process.env.X402_NETWORK || 'base', recipient: COINWAY_WALLET },
      }),
    })
    const data = await res.json()
    return { valid: data.valid === true, reason: data.reason, payload }
  } catch {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[x402] Facilitator unreachable — dev mode accept')
      return { valid: true, payload }
    }
    return { valid: false, reason: 'Facilitator unreachable' }
  }
}

export function buildPaymentRequired(agentId: string, priceUsdc: number, agentName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return {
    error: 'Payment Required',
    x402: {
      version:   1,
      scheme:    'exact',
      network:   process.env.X402_NETWORK || 'base',
      maxAmount: Math.floor(priceUsdc * 1_000_000).toString(),
      resource:  `${appUrl}/api/pay/${agentId}`,
      recipient: COINWAY_WALLET,
      asset:     { address: USDC_BASE, decimals: 6, symbol: 'USDC' },
      extra:     { description: `Coinway — ${agentName}`, agentId, priceUsdc },
    },
  }
}

export function calcSplit(priceUsdc: number) {
  const fee = parseFloat(((priceUsdc * FEE_BPS) / 10_000).toFixed(6))
  return { fee, net: parseFloat((priceUsdc - fee).toFixed(6)) }
}
