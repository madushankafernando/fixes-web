'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/jobs', label: 'My Jobs', icon: Briefcase },
  { href: '/post-job', label: 'Post a Job', icon: PlusCircle },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Protect — redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Loading state
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f2f7f2] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-(--upwork-green) border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f9faf9]">
      {/* Top header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3">
          {/* Left: logo + mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Fixes"
                width={100}
                height={32}
                className="h-7 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Right: user info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-(--upwork-navy) leading-tight">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400">{user?.fixId}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-(--upwork-green) flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={36}
                  height={36}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-57px)] overflow-hidden">
        {/* Sidebar — desktop (locked, never scrolls) */}
        <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 py-4 px-3">
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
                      ? 'bg-green-50 text-(--upwork-green)'
                      : 'text-(--upwork-gray) hover:bg-gray-50 hover:text-(--upwork-navy)'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors mt-auto"
          >
            <LogOut className="w-4.5 h-4.5" />
            Log out
          </button>
        </aside>

        {/* Sidebar — mobile overlay */}
        {sidebarOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-black/30 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="lg:hidden fixed left-0 top-14.25 bottom-0 w-64 bg-white border-r border-gray-200 py-4 px-3 z-50 flex flex-col">
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
                          ? 'bg-green-50 text-(--upwork-green)'
                          : 'text-(--upwork-gray) hover:bg-gray-50 hover:text-(--upwork-navy)'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors mt-auto"
              >
                <LogOut className="w-4.5 h-4.5" />
                Log out
              </button>
            </aside>
          </>
        )}

        {/* Main content — only this area scrolls */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
