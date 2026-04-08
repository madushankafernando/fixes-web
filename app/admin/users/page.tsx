'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Search, User as UserIcon, Ban, CheckCircle2, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import type { User } from '@/lib/types'

type RoleFilter = 'all' | 'client' | 'tradie' | 'admin'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [searchInput, setSearchInput] = useState('')

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set('page', String(page))
      qs.set('limit', '20')
      if (roleFilter !== 'all') qs.set('role', roleFilter)
      if (search) qs.set('search', search)

      const res = await api.getPaginated<User>(`/api/admin/users?${qs.toString()}`)
      setUsers(res.data)
      setTotal(res.pagination.total)
    } catch {
      // Silent
    } finally {
      setIsLoading(false)
    }
  }, [page, roleFilter, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleBan = async (userId: string) => {
    try {
      await api.patch(`/api/admin/users/${userId}/ban`)
      fetchUsers()
    } catch {
      // Silent
    }
  }

  const roleColors: Record<string, string> = {
    client: 'bg-blue-500/15 text-blue-400',
    tradie: 'bg-emerald-500/15 text-emerald-400',
    admin: 'bg-cyan-500/15 text-cyan-400',
  }

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-6">Users</h1>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search name, email, or ID..."
              className="w-full pl-9 pr-3 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'client', 'tradie', 'admin'] as RoleFilter[]).map((role) => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1) }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                roleFilter === role
                  ? 'bg-cyan-500 text-white'
                  : 'bg-[#1e293b] text-white/50 border border-white/10 hover:bg-white/5'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="text-[10px] text-white/30 mb-3">{total} user{total !== 1 ? 's' : ''}</p>
      )}

      {/* Table */}
      <div className="bg-[#1e293b] rounded-xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <UserIcon className="w-8 h-8 text-white/20 mb-2" />
            <p className="text-sm text-white/40">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-white/40 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-white/40 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-white/40 uppercase tracking-wider hidden sm:table-cell">ID</th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-white/40 uppercase tracking-wider hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-[10px] font-medium text-white/40 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] font-medium text-white/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u._id}`} className="hover:text-cyan-400 transition-colors">
                        <p className="text-sm font-medium text-white">{u.name}</p>
                        <p className="text-[10px] text-white/40">{u.email}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${roleColors[u.role] || ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[10px] text-white/40 font-mono">{u.fixId}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-white/40">
                        {new Date(u.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-red-400">
                          <Ban className="w-3 h-3" />
                          Banned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/users/${u._id}`}
                          className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          View
                        </Link>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleBan(u._id)}
                            className={`text-[10px] px-2 py-1 rounded transition-colors ${
                              u.isActive
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {u.isActive ? 'Ban' : 'Unban'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-[#1e293b] border border-white/10 text-xs text-white/50 disabled:opacity-30 hover:bg-white/5 transition-colors"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs text-white/30">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1.5 rounded-lg bg-[#1e293b] border border-white/10 text-xs text-white/50 disabled:opacity-30 hover:bg-white/5 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
