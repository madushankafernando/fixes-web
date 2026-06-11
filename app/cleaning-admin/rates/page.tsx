'use client'

import { useEffect, useState, useCallback } from 'react'
import { DollarSign, Loader2, Save, AlertCircle, Info } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { CLEANING_TYPE_LABELS } from '@/lib/constants'
import AdminActionConfirmDialog from '@/components/admin/AdminActionConfirmDialog'
import { useCleaningAdminSubscription } from '@/contexts/cleaning-admin-realtime-context'

interface Rate {
  cleaningType: string
  ratePerHour: number
  minimumHours: number
  label?: string
}

interface ApiRate {
  cleaningType: string
  ratePerHour: number
  minHours?: number
  label?: string
}

const DEFAULT_TYPES = Object.keys(CLEANING_TYPE_LABELS)

export default function RatesPage() {
  const [rates, setRates] = useState<Rate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const fetchRates = useCallback(() => {
    api.get<ApiRate[]>('/api/cleaning-admin/rates')
      .then((res) => {
        const existing = res.data ?? []
        const merged = existing.length > 0
          ? existing.map((r) => ({
              cleaningType: r.cleaningType,
              ratePerHour: r.ratePerHour ?? 0,
              minimumHours: r.minHours ?? 2,
              label: r.label,
            }))
          : DEFAULT_TYPES.map((t) => ({ cleaningType: t, ratePerHour: 0, minimumHours: 2 }))
        setRates(merged)
      })
      .catch(() => {
        setRates(DEFAULT_TYPES.map((t) => ({ cleaningType: t, ratePerHour: 0, minimumHours: 1 })))
      })
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => { fetchRates() }, [fetchRates])

  useCleaningAdminSubscription(['rates'], () => {
    fetchRates()
  })

  const calculateClientRate = (cleanerRate: number, minHours: number) => {
    if (!cleanerRate) return 0;
    const platformCommission = 0.20;
    const stripePercent = 0.017;
    const stripeFlatFee = 0.30;
    const hours = minHours || 2;
    const spread = stripeFlatFee / hours;
    return Math.round(((cleanerRate + spread) / (1 - platformCommission - stripePercent)) * 100) / 100;
  };

  const updateRate = (idx: number, field: 'ratePerHour' | 'minimumHours', value: string) => {
    setRates((prev) => prev.map((r, i) => i === idx ? { ...r, [field]: Number(value) || 0 } : r))
  }

  const handleSave = () => {
    setSaveError('')
    setSaveSuccess(false)
    setShowPasswordDialog(true)
  }

  const executeSave = async (token: string) => {
    await api.raw('/api/cleaning-admin/rates', {
      method: 'PATCH',
      body: {
        rates: rates.map((r) => ({
          cleaningType: r.cleaningType,
          ratePerHour: r.ratePerHour,
          minHours: r.minimumHours,
        })),
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
        <h1 className="text-xl font-bold text-gray-800">Hourly Rates</h1>
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
        title="Update Hourly Rates"
        description="This will change the cleaning rates used for all future job quotes. Enter your password to confirm."
        action="cleaning_rates:update"
        variant="destructive"
        confirmLabel="Save Rates"
        onConfirm={executeSave}
        onSuccess={() => {
          setSaveSuccess(true)
          setTimeout(() => setSaveSuccess(false), 3000)
        }}
        onError={(err) => setSaveError(err.message)}
      />

      {saveSuccess && (
        <div className="mb-4 flex items-center gap-2 bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl">
          <DollarSign className="w-4 h-4" /> Rates updated successfully
        </div>
      )}
      {saveError && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4" /> {saveError}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Cleaning Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-56">
                <div className="flex items-center gap-1">
                  Cleaner Base Rate/hr ($)
                  <div className="relative group flex items-center">
                    <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-64 bg-gray-800 text-white text-xs rounded-lg p-2.5 shadow-lg z-50 normal-case tracking-normal font-normal pointer-events-none">
                      This is the amount the cleaner earns. The system automatically adds ~28% on top of this to cover Platform Commission (20%) and Stripe Fees (1.7% + 30c) when quoting the client.
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
                    </div>
                  </div>
                </div>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">Est. Client Pays/hr</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">Min. Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rates.map((rate, idx) => (
              <tr key={rate.cleaningType} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-800">
                  {CLEANING_TYPE_LABELS[rate.cleaningType] || rate.cleaningType}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={rate.ratePerHour || ''}
                    onChange={(e) => updateRate(idx, 'ratePerHour', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-transparent">
                    ${calculateClientRate(rate.ratePerHour, rate.minimumHours).toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={rate.minimumHours || ''}
                    onChange={(e) => updateRate(idx, 'minimumHours', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
