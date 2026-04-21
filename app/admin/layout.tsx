// fixes-web/app/admin/layout.tsx

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
  User,
  Bug,
  Bell,
  Bot,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { NotificationsProvider, useWebNotifications } from '@/contexts/notifications-context'

const sidebarLinks = [
  { href: '/admin',                label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/users',          label: 'Users',          icon: Users },
  { href: '/admin/jobs',           label: 'Jobs',           icon: Briefcase },
  { href: '/admin/tradies',        label: 'Verification',   icon: ShieldCheck },
  { href: '/admin/bug-reports',    label: 'Bug Reports',    icon: Bug },
  { href: '/admin/notifications',  label: 'Notifications',  icon: Bell },
  { href: '/admin/ai-analytics',   label: 'AI Analytics',   icon: Bot },
  { href: '/admin/profile',        label: 'My Profile',     icon: User },
]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (days  > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins  > 0) return `${mins}m ago`
  return 'just now'
}

function AdminBellMenu() {
  const { notifications, unreadCount, markRead, markAllRead } = useWebNotifications()
  const [open, setOpen] = useState(false)
  const top10 = notifications.slice(0, 10)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {top10.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No notifications yet</p>
              ) : (
                top10.map(n => (
                  <button
                    key={n._id}
                    onClick={() => markRead(n._id)}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${ !n.isRead ? 'bg-blue-50/60' : '' }`}
                  >
                    <p className={`text-sm leading-snug ${ !n.isRead ? 'font-semibold text-gray-800' : 'text-gray-600' }`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{n.body}</p>
                    <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AdminLayout({ children }: { children: React.ReactNode }) {
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
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
            <Link href="/admin" className="flex items-center gap-2.5">
              <Image src="/logo.svg" alt="Fixes" width={80} height={28} className="h-6 w-auto" priority />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2563EB] text-white uppercase tracking-wider">
                Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              Main Site
            </Link>
            <AdminBellMenu />
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-gray-700 leading-tight">{user.name}</p>
              <p className="text-[10px] text-gray-400">{user.fixId}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)] overflow-hidden">
        <aside className="hidden lg:flex flex-col w-52 bg-white border-r border-gray-200 py-5 px-3">
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
                      ? 'bg-[#2563EB] text-white'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
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
                          ? 'bg-[#2563EB] text-white'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
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
  )
}

export default function AdminLayoutWithNotifications({ children }: { children: React.ReactNode }) {
  return (
    <NotificationsProvider>
      <AdminLayout>{children}</AdminLayout>
    </NotificationsProvider>
  )
}
