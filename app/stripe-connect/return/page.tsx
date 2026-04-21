// app/stripe-connect/return/page.tsx

'use client'

import { CheckCircle } from 'lucide-react'

export default function StripeConnectReturnPage() {
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
        <CheckCircle 
          size={56} 
          color="#22C55E" 
          style={{ display: 'block', margin: '0 auto 20px auto' }} 
        />
        <h1 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', margin: '0 0 12px' }}>
          Account setup complete
        </h1>
        <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.6', margin: '0 0 28px' }}>
          Your payout account has been connected. Earnings from completed jobs will be
          transferred to your bank account automatically.
        </p>
        <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>
          You can close this tab and return to the Fixer app.
        </p>

        <div style={{
          marginTop: '28px',
          padding: '16px',
          backgroundColor: '#0d1f12',
          borderRadius: '12px',
          border: '1px solid #1a3a1f',
        }}>
          <p style={{ color: '#22C55E', fontSize: '13px', margin: 0 }}>
            Powered by Stripe · Your bank details are never stored by Fixes
          </p>
        </div>
      </div>
    </div>
  )
}