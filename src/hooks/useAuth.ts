'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAccount, useSignMessage, useDisconnect } from 'wagmi'

async function api(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('cw_token')
  const res   = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Error')
  return data
}

export function useAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync }     = useSignMessage()
  const { disconnect }           = useDisconnect()
  const [wallet,  setWallet]  = useState<string | null>(null)
  const [token,   setToken]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)

  // Restore session
  useEffect(() => {
    const t = localStorage.getItem('cw_token')
    if (t) {
      api('/auth/me').then(({ wallet: w }) => { setWallet(w); setToken(t) }).catch(() => localStorage.removeItem('cw_token')).finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [])

  // Auto sign when wallet connects
  useEffect(() => {
    if (isConnected && address && !token && !signing) signIn()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address])

  const signIn = useCallback(async () => {
    if (!address) return
    setSigning(true)
    try {
      const { nonce }         = await api('/auth/nonce')
      const domain            = window.location.host
      const issuedAt          = new Date().toISOString()
      const message           = [
        `${domain} wants you to sign in with your Ethereum account:`,
        address, '',
        'Sign in to Coinway. No password. No email. Just your wallet.',
        '',
        `URI: ${window.location.origin}`,
        'Version: 1',
        'Chain ID: 8453',
        `Nonce: ${nonce}`,
        `Issued At: ${issuedAt}`,
      ].join('\n')
      const signature         = await signMessageAsync({ message })
      const { token: t, wallet: w } = await api('/auth/verify', { method: 'POST', body: JSON.stringify({ message, signature, address }) })
      localStorage.setItem('cw_token', t)
      setToken(t); setWallet(w)
    } catch (e) { console.error('Sign in failed', e) }
    finally { setSigning(false) }
  }, [address, signMessageAsync])

  const signOut = useCallback(async () => {
    try { await api('/auth/logout', { method: 'POST' }) } catch {}
    localStorage.removeItem('cw_token')
    setToken(null); setWallet(null)
    disconnect()
  }, [disconnect])

  return { wallet, token, isAuth: !!token, loading, signing, signIn, signOut }
}
