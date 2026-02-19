'use client'
import { useEffect, useState } from 'react'
import { DashLayout } from '@/components/DashLayout'

export default function DashboardPage() {
  const [stats,  setStats]  = useState<any>(null)
  const [agents, setAgents] = useState<any[]>([])
  const [time,   setTime]   = useState('')

  useEffect(() => {
    fetch('/api/status').then(r => r.json()).then(d => setStats(d.stats)).catch(() => {})
    fetch('/api/directory').then(r => r.json()).then(d => setAgents(d.agents || [])).catch(() => {})
    const t = setInterval(() => setTime(new Date().toUTCString()), 1000)
    return () => clearInterval(t)
  }, [])

  const S = ({ label, value, color = 'var(--text)', sub }: any) => (
    <div style={{ background:'var(--bg1)', padding:'16px 20px' }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:'9px', letterSpacing:'1.5px', color:'var(--muted)', textTransform:'uppercase', marginBottom:'6px' }}>{label}</div>
      <div style={{ fontFamily:'var(--mono)', fontSize:'24px', fontWeight:600, color }}>{value}</div>
      {sub && <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--muted2)', marginTop:'4px' }}>{sub}</div>}
    </div>
  )

  return (
    <DashLayout>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'28px', paddingBottom:'20px', borderBottom:'1px solid var(--border)' }}>
        <div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'20px', fontWeight:600 }}>Dashboard</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--muted2)', marginTop:'4px' }}>x402 payment gateway — built on Conway</div>
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--muted)' }}>{time}</div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'var(--border)', border:'1px solid var(--border)', borderRadius:'3px', overflow:'hidden', marginBottom:'20px' }}>
        <S label="Active Agents"  value={stats?.active_agents ?? '—'} />
        <S label="Total Volume"   value={stats ? `$${parseFloat(stats.total_volume_usdc||0).toFixed(2)}` : '—'} color="var(--accent)" sub="USDC · Base" />
        <S label="Total Payments" value={stats?.total_payments ?? '—'} color="var(--blue)" />
        <S label="Fee Rate"       value="1%" sub="x402 · on-chain" />
      </div>

      {/* How it works */}
      <div style={{ background:'var(--bg1)', border:'1px solid var(--border)', borderRadius:'3px', marginBottom:'20px' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'2px', color:'var(--muted2)', textTransform:'uppercase' }}>How Coinway Works</span>
        </div>
        <div style={{ padding:'20px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px' }}>
          {[
            { n:'01', t:'REGISTER', d:'Connect your wallet, register your agent with a name, target URL, and price in USDC.' },
            { n:'02', t:'SHARE',    d:'You get a /api/pay/:id endpoint. Share it. Coinway handles the x402 payment for every call.' },
            { n:'03', t:'EARN',     d:'USDC lands in your wallet on every call. Coinway takes 1%. Your agent runs forever.' },
          ].map(s => (
            <div key={s.n}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--accent)', letterSpacing:'2px', marginBottom:'8px' }}>{s.n} · {s.t}</div>
              <div style={{ fontSize:'12px', color:'var(--muted2)', lineHeight:1.7, fontFamily:'var(--mono)' }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top agents */}
      <div style={{ background:'var(--bg1)', border:'1px solid var(--border)', borderRadius:'3px' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'2px', color:'var(--muted2)', textTransform:'uppercase' }}>Top Agents</span>
          <a href="/dashboard/directory" style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--muted2)', textDecoration:'none', border:'1px solid var(--border2)', padding:'4px 12px' }}>View All</a>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>{['Agent','Price','Calls','Status',''].map(h => <th key={h} style={{ fontFamily:'var(--mono)', fontSize:'9px', letterSpacing:'1.5px', color:'var(--muted)', textTransform:'uppercase', textAlign:'left', padding:'8px 12px', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{h}</th>)}</tr></thead>
          <tbody>
            {agents.length === 0
              ? <tr><td colSpan={5} style={{ padding:'32px', textAlign:'center', color:'var(--muted2)', fontFamily:'var(--mono)', fontSize:'12px' }}>No agents yet</td></tr>
              : agents.slice(0,5).map((a: any) => (
                <tr key={a.id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'12px' }}>{a.name}</td>
                  <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'12px', color:'var(--accent)' }}>${parseFloat(a.price_usdc).toFixed(3)}</td>
                  <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'12px' }}>{a.total_calls}</td>
                  <td style={{ padding:'10px 12px' }}><span style={{ fontFamily:'var(--mono)', fontSize:'10px', padding:'2px 8px', background:'rgba(0,255,136,0.1)', color:'var(--accent)', border:'1px solid rgba(0,255,136,0.2)' }}>Active</span></td>
                  <td style={{ padding:'10px 12px' }}><button onClick={() => navigator.clipboard.writeText(a.pay_url)} style={{ fontFamily:'var(--mono)', fontSize:'10px', background:'transparent', border:'1px solid var(--border2)', color:'var(--muted2)', padding:'3px 10px', cursor:'pointer' }}>Copy URL</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </DashLayout>
  )
}
