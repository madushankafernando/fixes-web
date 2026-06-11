'use client'

import { useEffect, useState, useCallback } from 'react'
import { Settings, Loader2, Save, AlertCircle, Info } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'
import { useCleaningAdminSubscription } from '@/contexts/cleaning-admin-realtime-context'

interface CleaningConfigData {
  dispatchMode: 'manual' | 'auto'
  autoAssignRules: {
    maxRadius: number
    preferredRating: number
  }
}

export default function SettingsPage() {
  const [config, setConfig] = useState<CleaningConfigData>({
    dispatchMode: 'manual',
    autoAssignRules: { maxRadius: 30, preferredRating: 4 },
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const fetchConfig = useCallback(() => {
    api.get<{
      dispatchMode: 'manual' | 'auto'
      autoAssignRules?: { maxRadiusKm?: number; minRating?: number }
    }>('/api/cleaning-admin/config')
      .then((res) => {
        const d = res.data
        setConfig({
          dispatchMode: d.dispatchMode ?? 'manual',
          autoAssignRules: {
            maxRadius: d.autoAssignRules?.maxRadiusKm ?? 30,
            preferredRating: d.autoAssignRules?.minRating ?? 3.5,
          },
        })
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { fetchConfig() }, [fetchConfig])

  useCleaningAdminSubscription(['settings'], () => {
    fetchConfig()
  })

  const handleSave = () => {
    setSaveError('')
    setSaveSuccess(false)
    setShowPasswordDialog(true)
  }

  const executeSave = async (token: string) => {
    await api.raw('/api/cleaning-admin/config', {
      method: 'PATCH',
      body: {
        dispatchMode: config.dispatchMode,
        autoAssignRules: {
          maxRadiusKm: config.autoAssignRules.maxRadius,
          minRating: config.autoAssignRules.preferredRating,
        },
      },
      headers: { 'X-Admin-Action-Token': token },
    })
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 text-teal-600 animate-spin" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Settings</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 bg-teal-600 text-white text-sm font-medium py-2 px-4 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <AdminActionConfirmDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        title="Update Dispatch Settings"
        description="This will change how cleaners are dispatched to jobs. Enter your password to confirm."
        action="cleaning_config:update"
        variant="default"
        confirmLabel="Save Settings"
        onConfirm={executeSave}
        onSuccess={() => {
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        }}
        onError={(err) => setSaveError(err.message)}
      />

      {saveSuccess && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">
          <Settings className="w-4 h-4" /> Settings saved successfully
        </div>
      )}
      {saveError && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4" /> {saveError}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Dispatch Mode</h2>
          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="dispatchMode"
                value="manual"
                checked={config.dispatchMode === 'manual'}
                onChange={() => setConfig({ ...config, dispatchMode: 'manual' })}
                className="mt-0.5 accent-teal-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">Manual Dispatch</p>
                <p className="text-xs text-gray-500 mt-0.5">Admin manually selects and assigns cleaners to each job from the job detail page.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="dispatchMode"
                value="auto"
                checked={config.dispatchMode === 'auto'}
                onChange={() => setConfig({ ...config, dispatchMode: 'auto' })}
                className="mt-0.5 accent-teal-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">Auto Dispatch</p>
                <p className="text-xs text-gray-500 mt-0.5">System automatically assigns the nearest available cleaner when payment is confirmed. Admin can still override.</p>
              </div>
            </label>
          </div>
        </div>

        {config.dispatchMode === 'auto' && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Auto-Assign Rules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Max Radius (km)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={config.autoAssignRules.maxRadius}
                  onChange={(e) => setConfig({
                    ...config,
                    autoAssignRules: { ...config.autoAssignRules, maxRadius: Number(e.target.value) || 30 },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum distance to search for available cleaners</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Minimum Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.5"
                  value={config.autoAssignRules.preferredRating}
                  onChange={(e) => setConfig({
                    ...config,
                    autoAssignRules: { ...config.autoAssignRules, preferredRating: Number(e.target.value) || 4 },
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-400 mt-1">Prefer cleaners with at least this rating</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Dispatch Behavior</h3>
              <ul className="text-xs text-blue-700 mt-1 space-y-1 list-disc ml-4">
                <li><strong>Manual:</strong> After client payment, job enters "scheduled" state. Admin assigns a cleaner from the job detail page.</li>
                <li><strong>Auto:</strong> After client payment, the system automatically finds and dispatches the best available cleaner. The cleaner must accept (no decline option).</li>
                <li>In both modes, cleaners receive a mandatory-accept dispatch notification.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
