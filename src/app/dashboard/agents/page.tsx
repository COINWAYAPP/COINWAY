'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashLayout } from '@/components/DashLayout'
import { AuthWall }   from '@/components/AuthWall'
import { useAuth }    from '@/hooks/useAuth'

export default function AgentsPage() {
  const { isAuth, wallet, loading, token } = useAuth()
  const [agents,   setAgents]   = useState<any[]>([])
  const [earnings, setEarnings] = useState<any>(null)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    if (!isAuth || !token) return
    setFetching(true)
    Promise.all([
      fetch('/api/agents',   { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/earnings', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([a, e]) => { setAgents(a.agents || []); setEarnings(e.summary) })
      .catch(console.error).finally(() => setFetching(false))
  }, [isAuth, token])

  const deactivate = async (id: string) => {
    if (!confirm('Deactivate this agent?')) return
    await fetch(`/api/agents/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setAgents(prev => prev.map(a => a.id === id ? { ...a, active: false } : a))
  }

  return (
    <DashLayout>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'28px', paddingBottom:'20px', borderBottom:'1px solid var(--border)' }}>
        <div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'20px', fontWeight:600 }}>My Agents</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--muted2)', marginTop:'4px' }}>{wallet ?? 'Connect wallet to view'}</div>
        </div>
        <Link href="/dashboard/register" style={{ fontFamily:'var(--mono)', fontSize:'11px', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', padding:'9px 20px', background:'var(--accent)', color:'var(--bg)', textDecoration:'none' }}>
          + Register Agent
        </Link>
      </div>

      {loading ? null : !isAuth ? <AuthWall icon="⬡" title="Connect Your Wallet" sub="Sign in to manage your agents and view earnings." /> : (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1px', background:'var(--border)', border:'1px solid var(--border)', borderRadius:'3px', overflow:'hidden', marginBottom:'20px' }}>
            {[
              { l:'Active Agents', v: agents.filter(a=>a.active).length.toString() },
              { l:'Total Earned',  v: earnings ? `$${parseFloat(earnings.earned_usdc||0).toFixed(4)}` : '—', c:'var(--accent)', s:'USDC net' },
              { l:'Total Calls',   v: earnings?.total_calls?.toString() ?? '—', c:'var(--blue)' },
            ].map(s => (
              <div key={s.l} style={{ background:'var(--bg1)', padding:'16px 20px' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'9px', letterSpacing:'1.5px', color:'var(--muted)', textTransform:'uppercase', marginBottom:'6px' }}>{s.l}</div>
                <div style={{ fontFamily:'var(--mono)', fontSize:'24px', fontWeight:600, color:(s as any).c||'var(--text)' }}>{s.v}</div>
                {(s as any).s && <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--muted2)', marginTop:'4px' }}>{(s as any).s}</div>}
              </div>
            ))}
          </div>

          <div style={{ background:'var(--bg1)', border:'1px solid var(--border)', borderRadius:'3px' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'2px', color:'var(--muted2)', textTransform:'uppercase' }}>Your Agents</span>
            </div>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead><tr>{['Name','Price','Calls','Earned','Status','Pay URL',''].map(h => <th key={h} style={{ fontFamily:'var(--mono)', fontSize:'9px', letterSpacing:'1.5px', color:'var(--muted)', textTransform:'uppercase', textAlign:'left', padding:'8px 12px', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{h}</th>)}</tr></thead>
              <tbody>
                {fetching ? <tr><td colSpan={7} style={{ padding:'32px', textAlign:'center', color:'var(--muted2)', fontFamily:'var(--mono)', fontSize:'12px' }}>Loading...</td></tr>
                : agents.length === 0 ? <tr><td colSpan={7} style={{ padding:'32px', textAlign:'center', color:'var(--muted2)', fontFamily:'var(--mono)', fontSize:'12px' }}>No agents yet — <Link href="/dashboard/register" style={{ color:'var(--accent)' }}>register your first one</Link></td></tr>
                : agents.map((a: any) => (
                  <tr key={a.id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'12px' }}>{a.name}</td>
                    <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'12px', color:'var(--accent)' }}>${parseFloat(a.price_usdc).toFixed(3)}</td>
                    <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'12px' }}>{a.total_calls||0}</td>
                    <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'12px', color:'var(--accent)' }}>${parseFloat(a.earnings_usdc||0).toFixed(4)}</td>
                    <td style={{ padding:'10px 12px' }}><span style={{ fontFamily:'var(--mono)', fontSize:'10px', padding:'2px 8px', background: a.active?'rgba(0,255,136,0.1)':'rgba(255,107,53,0.1)', color:a.active?'var(--accent)':'var(--warn)', border:`1px solid ${a.active?'rgba(0,255,136,0.2)':'rgba(255,107,53,0.2)'}` }}>{a.active?'Active':'Off'}</span></td>
                    <td style={{ padding:'10px 12px' }}><button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/api/pay/${a.id}`)} style={{ fontFamily:'var(--mono)', fontSize:'10px', background:'transparent', border:'1px solid var(--border2)', color:'var(--muted2)', padding:'3px 10px', cursor:'pointer' }}>Copy URL</button></td>
                    <td style={{ padding:'10px 12px' }}>{a.active && <button onClick={() => deactivate(a.id)} style={{ fontFamily:'var(--mono)', fontSize:'10px', background:'transparent', border:'1px solid rgba(255,107,53,0.3)', color:'var(--warn)', padding:'3px 10px', cursor:'pointer' }}>Deactivate</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashLayout>
  )
}
