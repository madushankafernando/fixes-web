'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, ChevronRight, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

type DisputeStatus = 'open' | 'under_review' | 'resolved_paid' | 'resolved_refunded' | 'resolved_split'

interface Dispute {
  _id: string
  jobId: { _id: string; jobCode: string; title: string }
  initiatorId: { _id: string; name: string; email: string }
  againstId: { _id: string; name: string; email: string }
  status: DisputeStatus
  reason: string
  description: string
  initiatorEvidence: { url: string }[]
  createdAt: string
  resolutionNotes?: string
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  
  const [resolveAction, setResolveAction] = useState<'payout_tradie' | 'refund_client' | 'split'>('payout_tradie')
  const [splitAmount, setSplitAmount] = useState<number>(0)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  const fetchDisputes = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<any>('/api/disputes/admin/all')
      setDisputes(data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDisputes()
  }, [])

  const handleResolve = async () => {
    if (!selectedDispute || !resolutionNotes) return
    setIsResolving(true)
    try {
      await api.post(`/api/disputes/${selectedDispute._id}/resolve`, {
        action: resolveAction,
        tradieSplitAmount: resolveAction === 'split' ? splitAmount : undefined,
        resolutionNotes
      })
      alert('Dispute resolved successfully')
      setSelectedDispute(null)
      fetchDisputes()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Resolution failed')
    } finally {
      setIsResolving(false)
    }
  }

  if (selectedDispute) {
    const isResolved = selectedDispute.status.startsWith('resolved')

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <button onClick={() => setSelectedDispute(null)} className="flex items-center text-sm text-(--upwork-gray) hover:text-(--upwork-navy)">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Disputes
        </button>
        
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold text-(--upwork-navy)">
                Dispute for Job {selectedDispute.jobId.jobCode}
              </h1>
              <p className="text-sm text-(--upwork-gray)">{selectedDispute.reason}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isResolved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {selectedDispute.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <span className="text-gray-500 font-semibold block mb-1">Initiator (Client)</span>
              <p className="text-(--upwork-navy)">{selectedDispute.initiatorId?.name} ({selectedDispute.initiatorId?.email})</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <span className="text-gray-500 font-semibold block mb-1">Against (Tradie)</span>
              <p className="text-(--upwork-navy)">{selectedDispute.againstId?.name} ({selectedDispute.againstId?.email})</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-(--upwork-navy) mb-2">Description</h3>
            <p className="text-sm border border-gray-200 p-4 rounded-xl text-(--upwork-gray) min-h-[100px]">{selectedDispute.description}</p>
          </div>

          {selectedDispute.initiatorEvidence?.length > 0 && (
            <div>
              <h3 className="font-semibold text-(--upwork-navy) mb-2">Evidence</h3>
              <div className="flex gap-2">
                {selectedDispute.initiatorEvidence.map((ev, i) => (
                  <img key={i} src={ev.url} alt="Evidence" className="w-32 h-32 object-cover rounded-xl border border-gray-200" />
                ))}
              </div>
            </div>
          )}

          {!isResolved && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <h2 className="text-lg font-bold text-(--upwork-navy)">Resolve Dispute</h2>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'refund_client', label: 'Refund Client (Cancel Stripe)' },
                  { value: 'payout_tradie', label: 'Payout Tradie (Capture All)' },
                  { value: 'split', label: 'Split Funds (Partial Capture)' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setResolveAction(opt.value as any)}
                    className={`p-3 border rounded-xl text-sm font-medium ${resolveAction === opt.value ? 'bg-(--upwork-green) border-(--upwork-green) text-white' : 'bg-white border-gray-200 text-(--upwork-navy)'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {resolveAction === 'split' && (
                <div>
                  <label className="block text-sm font-semibold text-(--upwork-navy) mb-2">Tradie Split Amount ($)</label>
                  <input type="number" value={splitAmount} onChange={e => setSplitAmount(Number(e.target.value))} className="w-full border border-gray-200 rounded-lg p-2" placeholder="e.g. 150" />
                  <p className="text-xs text-gray-400 mt-1">Stripe will only capture this amount, the rest will be refunded to the client.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-(--upwork-navy) mb-2">Resolution Notes</label>
                <textarea 
                  value={resolutionNotes} 
                  onChange={e => setResolutionNotes(e.target.value)} 
                  className="w-full border border-gray-200 rounded-lg p-3 min-h-[100px]" 
                  placeholder="Explain why this decision was made..."
                />
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleResolve}
                  disabled={isResolving || !resolutionNotes || (resolveAction === 'split' && !splitAmount)}
                  className="bg-(--upwork-navy) text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
                >
                  {isResolving ? 'Resolving...' : 'Finalize Resolution'}
                </button>
              </div>
            </div>
          )}

          {isResolved && (
             <div className="border border-green-200 bg-green-50 p-4 rounded-xl">
               <h3 className="text-green-800 font-bold mb-1">Dispute Resolved: {selectedDispute.status}</h3>
               <p className="text-green-700 text-sm whitespace-pre-wrap">{selectedDispute.resolutionNotes}</p>
             </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-(--upwork-navy)">Disputes Center</h1>
        <p className="text-sm text-(--upwork-gray)">Manage and resolve pending job disputes.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-400 w-8 h-8" /></div>
        ) : disputes.length === 0 ? (
          <div className="py-20 text-center text-(--upwork-gray)">No disputes found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-(--upwork-gray) uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Job Code</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {disputes.map(d => (
                <tr key={d._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-(--upwork-navy)">{d.jobId?.jobCode}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-(--upwork-gray)">{d.reason}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${d.status.startsWith('resolved') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {d.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-(--upwork-gray)">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedDispute(d)}
                      className="text-sm font-semibold text-(--upwork-green) hover:underline"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
