'use client'
import { useEffect } from 'react'

// Landing page — loads the static HTML from /public/landing.html
export default function LandingPage() {
  useEffect(() => {
    // Replace the entire page with the landing HTML
    window.location.replace('/landing.html')
  }, [])
  return null
}
