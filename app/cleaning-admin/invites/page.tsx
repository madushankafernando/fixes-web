'use client'

import { useEffect, useState } from 'react'
import { Mail, Loader2, Copy, Check, XCircle, Plus } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'
import { useCleaningAdminSubscription } from '@/contexts/cleaning-admin-realtime-context'

interface Invite {
  _id: string
  token: string
  category: string
  email?: string
  phone?: string
  name?: string
  status: 'pending' | 'used' | 'revoked'
  expiresAt: string
  usedAt?: string
  createdAt: string
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const [formEmail, setFormEmail] = useState('')
  const [formName, setFormName] = useState('')
  const [formCategory, setFormCategory] = useState<'cleaning' | 'waste_removal'>('cleaning')
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null)

  const fetchInvites = () => {
    setIsLoading(true)
    api.getPaginated<Invite>('/api/cleaning-admin/invites?limit=100')
      .then((res) => setInvites(res.data ?? []))
      .catch(() => setInvites([]))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { fetchInvites() }, [])

  useCleaningAdminSubscription(['invites'], () => {
    fetchInvites()
  })

  const handleCreate = () => {
    if (!formEmail.trim()) {
      setCreateError('Email is required so we can send the invitation link')
      return
    }
    setCreateError('')
    setCreateSuccess('')
    setShowCreateDialog(true)
  }

  const executeCreate = async (token: string) => {
    setIsCreating(true)
    const recipientEmail = formEmail.trim()
    try {
      const res = await api.raw<{ success: boolean; data: { invite: Invite; inviteUrl: string; emailSent?: boolean }; message: string }>(
        '/api/cleaning-admin/invites',
        {
          method: 'POST',
          body: {
            category: formCategory,
            email: recipientEmail,
            name: formName.trim() || undefined,
          },
          headers: { 'X-Admin-Action-Token': token },
        }
      )
      setShowForm(false)
      setFormEmail('')
      setFormName('')
      setCreateSuccess(
        res.data.emailSent
          ? `Invite created and email sent to ${recipientEmail}`
          : `Invite created for ${recipientEmail} — copy the link below (email could not be sent)`
      )
      fetchInvites()
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : 'Failed to create invite')
    } finally {
      setIsCreating(false)
    }
  }

  const handleRevoke = (id: string) => {
    setPendingRevoke(id)
  }

  const executeRevoke = async (token: string) => {
    if (!pendingRevoke) return
    await api.raw(`/api/cleaning-admin/invites/${pendingRevoke}/revoke`, {
      method: 'PATCH',
      headers: { 'X-Admin-Action-Token': token },
    })
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/register/cleaner?token=${token}`
    navigator.clipboard.writeText(url)
    setCopied(token)
    setTimeout(() => setCopied(null), 2000)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    used: 'bg-green-50 text-green-700',
    revoked: 'bg-red-50 text-red-500',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Invite Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 bg-teal-600 text-white text-sm font-medium py-2 px-4 rounded-xl hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Generate Invite
        </button>
      </div>

      {createSuccess && (
        <div className="bg-teal-50 border border-teal-200 text-teal-800 text-sm px-4 py-3 rounded-xl mb-4">
          {createSuccess}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">New Invite</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Category</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="cleaning">Cleaning</option>
                <option value="waste_removal">Waste Removal</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Email (required)</label>
              <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                placeholder="cleaner@example.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Name (optional)</label>
              <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          {createError && <p className="text-xs text-red-500 mt-2">{createError}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={isCreating}
              className="bg-teal-600 text-white text-sm py-2 px-5 rounded-lg hover:bg-teal-700 disabled:opacity-50">
              {isCreating ? 'Creating...' : 'Create Invite'}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-gray-300 text-gray-600 text-sm py-2 px-5 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 text-teal-600 animate-spin" /></div>
        ) : invites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Mail className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No invites yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {invites.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between px-4 py-3">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-gray-800">{inv.name || inv.email || 'Anonymous'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[inv.status]}`}>{inv.status}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{inv.category.replace('_', ' ')}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Created {new Date(inv.createdAt).toLocaleDateString('en-AU')} · Expires {new Date(inv.expiresAt).toLocaleDateString('en-AU')}
                    {inv.usedAt && ` · Used ${new Date(inv.usedAt).toLocaleDateString('en-AU')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {inv.status === 'pending' && (
                    <>
                      <button onClick={() => copyLink(inv.token)}
                        className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium px-2 py-1 rounded-lg hover:bg-teal-50">
                        {copied === inv.token ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy Link</>}
                      </button>
                      <button onClick={() => handleRevoke(inv._id)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50">
                        <XCircle className="w-3 h-3" /> Revoke
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminActionConfirmDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="Create Cleaner Invite"
        description={`This will generate an invite link and send it to ${formEmail || 'the cleaner'}. Enter your password to confirm.`}
        action="cleaning_invite:create"
        variant="default"
        confirmLabel="Create Invite"
        onConfirm={executeCreate}
        onSuccess={() => setShowCreateDialog(false)}
      />

      <AdminActionConfirmDialog
        open={!!pendingRevoke}
        onOpenChange={(open) => { if (!open) setPendingRevoke(null) }}
        title="Revoke Invite"
        description="This will invalidate the invite link. The cleaner will no longer be able to register with it. Enter your password to confirm."
        action="cleaning_invite:revoke"
        variant="destructive"
        confirmLabel="Revoke Invite"
        onConfirm={executeRevoke}
        onSuccess={() => { setPendingRevoke(null); fetchInvites() }}
      />
    </div>
  )
}
