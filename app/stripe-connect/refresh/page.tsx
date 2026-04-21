// app/stripe-connect/refresh/page.tsx

'use client'

import { RefreshCw } from 'lucide-react'

export default function StripeConnectRefreshPage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        backgroundColor: '#111',
        border: '1px solid #1e1e1e',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
      }}>
        <RefreshCw 
          size={56} 
          color="#F59E0B" 
          style={{ display: 'block', margin: '0 auto 20px auto' }} 
        />
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 12px' }}>
          Setup link expired
        </h1>
        <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px' }}>
          Your setup link has expired. This is normal — Stripe links are only valid for 10 minutes.
        </p>
        <p style={{ color: '#aaa', fontSize: '14px', margin: '0 0 28px' }}>
          Return to the Fixer app and tap{' '}
          <strong style={{ color: '#fff' }}>Menu → Payout Account</strong>{' '}
          to generate a new setup link.
        </p>
        <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>
          You can close this tab.
        </p>
      </div>
    </div>
  )
}