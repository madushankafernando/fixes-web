'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Mail,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { NotificationsProvider } from '@/contexts/notifications-context'
import { CleaningAdminRealtimeProvider } from '@/contexts/cleaning-admin-realtime-context'
import CleaningAdminInbox from '@/components/admin/CleaningAdminInbox'

const sidebarLinks = [
  { href: '/cleaning-admin',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/cleaning-admin/jobs',     label: 'Job Queue',  icon: Briefcase },
  { href: '/cleaning-admin/cleaners', label: 'Cleaners',   icon: Users },
  { href: '/cleaning-admin/invites',  label: 'Invites',    icon: Mail },
  { href: '/cleaning-admin/rates',    label: 'Rates',      icon: DollarSign },
  { href: '/cleaning-admin/revenue',  label: 'Revenue',    icon: BarChart3 },
  { href: '/cleaning-admin/settings', label: 'Settings',   icon: Settings },
]

const ACCENT = '#0d9488'

export default function CleaningAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const hasAccess = user?.role === 'admin' && (user?.isCleaningAdmin || user?.isFullAdmin !== false)

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.replace('/login')
    }
  }, [hasAccess, isLoading, router])

  if (isLoading || !hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isActive = (href: string) =>
    href === '/cleaning-admin' ? pathname === '/cleaning-admin' : pathname.startsWith(href)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const NavLinks = ({ mobile }: { mobile?: boolean }) => (
    <nav className="flex flex-col gap-1 flex-1">
      {sidebarLinks.map((link) => {
        const Icon = link.icon
        const active = isActive(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={mobile ? () => setSidebarOpen(false) : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-teal-600 text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <NotificationsProvider>
      <CleaningAdminRealtimeProvider>
        <div className="h-screen overflow-hidden bg-gray-50">
          <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-4 lg:px-6 h-14">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <Link href="/cleaning-admin" className="flex items-center gap-2.5">
                  <Image src="/logo.svg" alt="Fixes" width={80} height={28} className="h-6 w-auto" priority />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-600 text-white uppercase tracking-wider">
                    Cleaning
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={user?.isCleaningAdmin ? '/admin-select' : '/admin'}
                  className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  {user?.isCleaningAdmin ? 'Switch Panel' : 'Main Admin'}
                </Link>
                <CleaningAdminInbox />
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium text-gray-700 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-gray-400">Cleaning Admin</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <div className="flex h-[calc(100vh-56px)] overflow-hidden">
            <aside className="hidden lg:flex flex-col w-52 bg-white border-r border-gray-200 py-5 px-3">
              <NavLinks />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mt-auto"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </aside>

            {sidebarOpen && (
              <>
                <div className="lg:hidden fixed inset-0 bg-black/30 z-40" onClick={() => setSidebarOpen(false)} />
                <aside className="lg:hidden fixed left-0 top-14 bottom-0 w-60 bg-white border-r border-gray-200 py-5 px-3 z-50 flex flex-col">
                  <NavLinks mobile />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mt-auto"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </aside>
              </>
            )}

            <main className="flex-1 p-4 lg:p-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {children}
            </main>
          </div>
        </div>
      </CleaningAdminRealtimeProvider>
    </NotificationsProvider>
  )
}
