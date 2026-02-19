'use client'
import { useEffect, useState } from 'react'
import { DashLayout } from '@/components/DashLayout'

export default function DirectoryPage() {
  const [agents,  setAgents]  = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/directory').then(r => r.json()).then(d => setAgents(d.agents || [])).finally(() => setLoading(false))
  }, [])

  return (
    <DashLayout>
      <div style={{ marginBottom:'28px', paddingBottom:'20px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'20px', fontWeight:600 }}>Agent Directory</div>
        <div style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--muted2)', marginTop:'4px' }}>All active agents on the Coinway gateway</div>
      </div>
      <div style={{ background:'var(--bg1)', border:'1px solid var(--border)', borderRadius:'3px' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr>{['Agent','Description','Price','Calls','Pay URL'].map(h => <th key={h} style={{ fontFamily:'var(--mono)', fontSize:'9px', letterSpacing:'1.5px', color:'var(--muted)', textTransform:'uppercase', textAlign:'left', padding:'8px 12px', borderBottom:'1px solid var(--border)', fontWeight:500 }}>{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} style={{ padding:'40px', textAlign:'center', color:'var(--muted2)', fontFamily:'var(--mono)', fontSize:'12px' }}>Loading...</td></tr>
            : agents.length === 0 ? <tr><td colSpan={5} style={{ padding:'40px', textAlign:'center', color:'var(--muted2)', fontFamily:'var(--mono)', fontSize:'12px' }}>No agents yet</td></tr>
            : agents.map((a: any) => (
              <tr key={a.id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'12px', fontWeight:500 }}>{a.name}</td>
                <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'11px', color:'var(--muted2)', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.description||'—'}</td>
                <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'12px', color:'var(--accent)' }}>${parseFloat(a.price_usdc).toFixed(3)}</td>
                <td style={{ padding:'10px 12px', fontFamily:'var(--mono)', fontSize:'12px' }}>{a.total_calls}</td>
                <td style={{ padding:'10px 12px' }}><button onClick={() => navigator.clipboard.writeText(a.pay_url)} style={{ fontFamily:'var(--mono)', fontSize:'10px', background:'transparent', border:'1px solid var(--border2)', color:'var(--muted2)', padding:'3px 10px', cursor:'pointer' }}>Copy</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashLayout>
  )
}
