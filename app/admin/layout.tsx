'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/admin/tradies', label: 'Verification', icon: ShieldCheck },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f172a]">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0f172a]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#1e293b] border-b border-white/10">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/admin" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="Fixes" width={80} height={28} className="h-6 w-auto brightness-0 invert" priority />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 uppercase tracking-wider">
                Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1 text-xs text-white/50 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Main Site
            </Link>
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-white leading-tight">{user.name}</p>
              <p className="text-[10px] text-white/40">{user.fixId}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-49px)] overflow-hidden">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex flex-col w-52 bg-[#1e293b] border-r border-white/10 py-4 px-3">
          <nav className="flex flex-col gap-1 flex-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-400'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-auto"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </aside>

        {/* Sidebar — mobile overlay */}
        {sidebarOpen && (
          <>
            <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
            <aside className="lg:hidden fixed left-0 top-[49px] bottom-0 w-60 bg-[#1e293b] border-r border-white/10 py-4 px-3 z-50 flex flex-col">
              <nav className="flex flex-col gap-1 flex-1">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-cyan-500/15 text-cyan-400'
                          : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-auto"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </aside>
          </>
        )}

        {/* Main */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
