'use client'
import { useState } from 'react'
import { DashLayout } from '@/components/DashLayout'
import { AuthWall }   from '@/components/AuthWall'
import { useAuth }    from '@/hooks/useAuth'

export default function RegisterPage() {
  const { isAuth, wallet, loading, token } = useAuth()
  const [form, setForm] = useState({ name:'', description:'', target_url:'', price_usdc:'' })
  const [busy, setBusy] = useState(false)
  const [payUrl, setPayUrl] = useState('')
  const [error, setError]   = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.name || !form.target_url || !form.price_usdc) { setError('All fields required'); return }
    setBusy(true); setError('')
    try {
      const res  = await fetch('/api/agents', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ ...form, price_usdc: parseFloat(form.price_usdc) }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPayUrl(data.pay_url)
      setForm({ name:'', description:'', target_url:'', price_usdc:'' })
    } catch (e: any) { setError(e.message) }
    finally { setBusy(false) }
  }

  const inp = { background:'var(--bg)', border:'1px solid var(--border2)', color:'var(--text)', fontFamily:'var(--mono)', fontSize:'13px', padding:'10px 12px', outline:'none', borderRadius:'2px', width:'100%' }
  const lbl = { fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'1px', color:'var(--muted2)', textTransform:'uppercase' as const, marginBottom:'6px', display:'block' }
  const short = wallet ? wallet.slice(0,6)+'...'+wallet.slice(-4) : '—'

  return (
    <DashLayout>
      <div style={{ marginBottom:'28px', paddingBottom:'20px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'20px', fontWeight:600 }}>Register Agent</div>
        <div style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--muted2)', marginTop:'4px' }}>Add an agent to the Coinway gateway</div>
      </div>

      {loading ? null : !isAuth ? <AuthWall icon="+" title="Connect Your Wallet" sub="Sign in to register an agent." /> : (
        <>
          <div style={{ background:'var(--bg1)', border:'1px solid var(--border)', borderRadius:'3px', marginBottom:'20px' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'2px', color:'var(--muted2)', textTransform:'uppercase' }}>Agent Details</span>
            </div>
            <div style={{ padding:'24px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
                <div><label style={lbl}>Agent Name</label><input style={inp} value={form.name} onChange={set('name')} placeholder="My GPT Writer" /></div>
                <div><label style={lbl}>Price (USDC / call)</label><input style={inp} type="number" step="0.001" min="0.001" value={form.price_usdc} onChange={set('price_usdc')} placeholder="0.10" /></div>
                <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Description</label><input style={inp} value={form.description} onChange={set('description')} placeholder="What does your agent do?" /></div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={lbl}>Target URL</label>
                  <input style={inp} value={form.target_url} onChange={set('target_url')} placeholder="https://myagent.conway.run/generate" />
                  <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--muted)', marginTop:'4px' }}>Coinway proxies verified requests here after payment.</div>
                </div>
              </div>

              {error && <div style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--warn)', marginBottom:'16px' }}>{error}</div>}

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize:'12px', color:'var(--muted2)', fontFamily:'var(--mono)' }}>Payments go to: <span style={{ color:'var(--text)' }}>{short}</span></div>
                  <div style={{ fontSize:'11px', color:'var(--muted)', marginTop:'2px', fontFamily:'var(--mono)' }}>Coinway fee: 1% · You keep 99%</div>
                </div>
                <button onClick={submit} disabled={busy} style={{ fontFamily:'var(--mono)', fontSize:'11px', fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', padding:'10px 24px', background:busy?'var(--muted)':'var(--accent)', border:'none', color:'var(--bg)', cursor:busy?'not-allowed':'pointer', borderRadius:'2px' }}>
                  {busy ? 'Registering...' : 'Register Agent'}
                </button>
              </div>
            </div>
          </div>

          {payUrl && (
            <div style={{ background:'var(--bg1)', border:'1px solid rgba(0,255,136,0.3)', borderRadius:'3px', padding:'20px' }}>
              <div style={{ fontFamily:'var(--mono)', color:'var(--accent)', marginBottom:'8px' }}>✓ Agent registered</div>
              <div style={{ fontSize:'12px', color:'var(--muted2)', marginBottom:'12px', fontFamily:'var(--mono)' }}>Share this URL — anyone can pay and use your agent.</div>
              <div style={{ background:'var(--bg)', border:'1px solid rgba(0,255,136,0.2)', borderRadius:'3px', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--accent)', wordBreak:'break-all' }}>{payUrl}</span>
                <button onClick={() => navigator.clipboard.writeText(payUrl)} style={{ fontFamily:'var(--mono)', fontSize:'10px', background:'transparent', border:'1px solid var(--border2)', color:'var(--muted2)', padding:'4px 10px', cursor:'pointer', whiteSpace:'nowrap' }}>Copy</button>
              </div>
            </div>
          )}
        </>
      )}
    </DashLayout>
  )
}
