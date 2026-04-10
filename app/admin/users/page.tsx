// fixes-web/app/admin/users/page.tsx

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
    } catch { /* silent */ } finally { setIsLoading(false) }
  }, [page, roleFilter, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleBan = async (userId: string) => {
    try { await api.patch(`/api/admin/users/${userId}/ban`); fetchUsers() } catch { /* silent */ }
  }

  const roleColors: Record<string, string> = {
    client: 'bg-blue-50 text-blue-600',
    tradie: 'bg-emerald-50 text-emerald-600',
    admin: 'bg-[#EFF6FF] text-[#2563EB]',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage platform accounts</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1) } }}
              placeholder="Search name, email, or FIX-ID..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
            />
          </div>
          <button
            onClick={() => { setSearch(searchInput); setPage(1) }}
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {(['all', 'client', 'tradie', 'admin'] as RoleFilter[]).map((role) => (
            <button
              key={role}
              onClick={() => { setRoleFilter(role); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                roleFilter === role
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {!isLoading && <p className="text-xs text-gray-400 mb-3">{total} user{total !== 1 ? 's' : ''}</p>}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 text-[#2563EB] animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <UserIcon className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">ID</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u._id}`} className="group">
                        <p className="text-sm font-medium text-gray-800 group-hover:text-[#2563EB] transition-colors">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{u.email}</p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${roleColors[u.role] || ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-[10px] text-gray-400 font-mono">{u.fixId}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] text-red-500">
                          <Ban className="w-3 h-3" />Banned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/users/${u._id}`}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-200 transition-colors">
                          View
                        </Link>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleBan(u._id)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg transition-colors ${
                              u.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            }`}>
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

      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors">Previous</button>
          <span className="px-3 py-1.5 text-xs text-gray-400">Page {page} of {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / 20)}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-colors">Next</button>
        </div>
      )}
    </div>
  )
}
