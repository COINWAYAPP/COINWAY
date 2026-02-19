'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAuth } from '@/hooks/useAuth'

const nav = [
  { href: '/dashboard',          icon: '◈', label: 'Dashboard'     },
  { href: '/dashboard/agents',   icon: '⬡', label: 'My Agents'     },
  { href: '/dashboard/register', icon: '+', label: 'Register Agent' },
  { href: '/dashboard/directory',icon: '◎', label: 'Directory'      },
]

export function DashLayout({ children }: { children: React.ReactNode }) {
  const path           = usePathname()
  const { signing }    = useAuth()

  return (
    <>
      {/* Topbar */}
      <header style={{ position:'fixed', top:0, left:0, right:0, height:'52px', background:'rgba(7,7,9,0.95)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', zIndex:100, backdropFilter:'blur(8px)' }}>
        <Link href="/" style={{ fontFamily:'var(--mono)', fontSize:'15px', fontWeight:600, letterSpacing:'3px', color:'var(--accent)', textDecoration:'none' }}>
          COIN<span style={{ color:'var(--muted2)', fontWeight:300 }}>WAY</span>
        </Link>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          {signing && <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--accent)', letterSpacing:'1px' }}>Signing...</span>}
          <div style={{ fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'1.5px', color:'var(--accent)', background:'rgba(0,255,136,0.06)', border:'1px solid rgba(0,255,136,0.2)', padding:'3px 10px', textTransform:'uppercase' }}>Base</div>
          <ConnectButton showBalance={false} chainStatus="none" accountStatus="address" />
        </div>
      </header>

      <div style={{ display:'flex', paddingTop:'52px', minHeight:'100vh', position:'relative' }}>
        {/* Grid bg */}
        <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize:'48px 48px', opacity:0.25, pointerEvents:'none', zIndex:0 }} />

        {/* Sidebar */}
        <aside style={{ width:'220px', borderRight:'1px solid var(--border)', padding:'20px 0', position:'sticky', top:'52px', height:'calc(100vh - 52px)', overflowY:'auto', flexShrink:0 }}>
          <div style={{ padding:'0 12px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'9px', letterSpacing:'2px', color:'var(--muted)', textTransform:'uppercase', padding:'0 8px', marginBottom:'8px' }}>Navigation</div>
            {nav.map(item => {
              const active = path === item.href
              return (
                <Link key={item.href} href={item.href} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'8px', borderRadius:'3px', fontSize:'13px', textDecoration:'none', marginBottom:'2px', border:`1px solid ${active ? 'var(--border2)' : 'transparent'}`, background: active ? 'var(--bg2)' : 'transparent', color: active ? 'var(--accent)' : 'var(--muted2)', transition:'all 0.1s' }}>
                  <span style={{ fontSize:'12px', width:'16px', textAlign:'center' }}>{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex:1, padding:'32px', maxWidth:'1100px', position:'relative', zIndex:1 }}>
          {children}
        </main>
      </div>
    </>
  )
}
