// fixes-web/app/layout.tsx

import type { Metadata } from 'next'
import { Nunito_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const nunitoSans = Nunito_Sans({ 
  subsets: ["latin"],
  variable: '--font-nunito-sans',
  weight: ['300', '400', '500', '600', '700', '800']
});

export const metadata: Metadata = {
  title: 'Fixes | Hire Trusted Tradies Instantly',
  description: 'Access skilled, verified tradies ready to help you build and fix — matched instantly via AI-powered quoting.',
  icons: {
    icon: [
      {
        url: '/fav-icon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/fav-icon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/fav-icon.png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${nunitoSans.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
