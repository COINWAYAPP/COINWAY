'use client'
import { ConnectButton } from '@rainbow-me/rainbowkit'

export function AuthWall({ icon = '⬡', title = 'Connect Your Wallet', sub = 'Sign in with Ethereum to continue.' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', textAlign:'center', gap:'16px' }}>
      <div style={{ fontSize:'40px', marginBottom:'8px' }}>{icon}</div>
      <div style={{ fontFamily:'var(--mono)', fontSize:'18px', fontWeight:600 }}>{title}</div>
      <div style={{ color:'var(--muted2)', fontSize:'13px', maxWidth:'360px', lineHeight:1.7, fontFamily:'var(--mono)' }}>{sub}</div>
      <ConnectButton />
    </div>
  )
}
