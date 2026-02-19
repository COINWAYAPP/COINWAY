import { NextRequest } from 'next/server'
import { getSessionWallet } from './siwe'

export async function getWallet(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('authorization')?.slice(7)
  if (!token) return null
  return getSessionWallet(token)
}
