'use client'

import React, { useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Download, ChevronDown, ChevronUp } from 'lucide-react'
import { api } from '@/lib/api'

interface WaitlistLead {
  _id: string
  name: string
  email: string
  phone?: string
  suburb: string
  postcode: string
  type: 'client' | 'tradie'
  status: string
  createdAt: string
  questionnaire?: { question: string; answer: string }[]
}

export default function WaitlistLeadsPage() {
  const [leads, setLeads] = useState<WaitlistLead[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLeads, setTotalLeads] = useState(0)
  const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'tradie'>('all')
  const [search, setSearch] = useState('')
  const [expandedLead, setExpandedLead] = useState<string | null>(null)

  const fetchLeads = async (pageNumber: number, filter: string, searchQuery: string) => {
    try {
      setLoading(true)
      const res = await api.getPaginated<WaitlistLead>(`/api/admin/waitlist-leads?page=${pageNumber}&limit=20&type=${filter}&search=${encodeURIComponent(searchQuery)}`)
      setLeads(res.data)
      setTotalPages(res.pagination.totalPages)
      setTotalLeads(res.pagination.total)
    } catch (error) {
      console.error('Failed to fetch waitlist leads', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads(page, typeFilter, search)
  }, [page, typeFilter, search])

  const handleExport = () => {
    // Generate CSV including Questionnaire Data
    const headers = ['Name', 'Email', 'Phone', 'Type', 'Suburb', 'Postcode', 'Status', 'Date Joined', 'Q1', 'A1', 'Q2', 'A2', 'Q3', 'A3', 'Q4', 'A4', 'Q5', 'A5']
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => {
        const qData = lead.questionnaire || []
        const qFields = qData.flatMap(q => [
          `"${(q.question || '').replace(/"/g, '""')}"`, 
          `"${(q.answer || '').replace(/"/g, '""')}"`
        ])
        
        // Pad to exactly 10 columns (5 questions * 2 fields) if missing
        while (qFields.length < 10) qFields.push('""')
        
        return [
          `"${lead.name}"`,
          `"${lead.email}"`,
          `"${lead.phone || ''}"`,
          lead.type,
          `"${lead.suburb}"`,
          lead.postcode,
          lead.status,
          new Date(lead.createdAt).toLocaleDateString(),
          ...qFields
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `waitlist-leads-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Waitlist Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and view people who have joined the waitlist.
          </p>
        </div>
        <button
          onClick={handleExport}
          disabled={leads.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters and Search */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 w-full sm:w-auto">
            <button
              onClick={() => { setTypeFilter('all'); setPage(1); }}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${typeFilter === 'all' ? 'bg-[#2563EB] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              All
            </button>
            <button
              onClick={() => { setTypeFilter('client'); setPage(1); }}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${typeFilter === 'client' ? 'bg-[#2563EB] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Clients
            </button>
            <button
              onClick={() => { setTypeFilter('tradie'); setPage(1); }}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${typeFilter === 'tradie' ? 'bg-[#2563EB] text-white shadow' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Tradies
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Date Joined</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                      <p className="mt-2 text-sm text-gray-500">Loading leads...</p>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-gray-500 font-medium">No waitlist leads found.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <React.Fragment key={lead._id}>
                    <tr className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{lead.email}</p>
                        {lead.phone && <p className="text-xs text-gray-400 mt-0.5">{lead.phone}</p>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          lead.type === 'tradie' 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {lead.type === 'tradie' ? 'Tradie' : 'Client'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-gray-700">{lead.suburb}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{lead.postcode}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            lead.status === 'invited' 
                              ? 'bg-purple-50 text-purple-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                          </span>
                          
                          {lead.questionnaire && lead.questionnaire.length > 0 && (
                            <button 
                              onClick={() => setExpandedLead(expandedLead === lead._id ? null : lead._id)}
                              className="text-[#2563EB] hover:bg-blue-50 p-1 rounded transition-colors flex items-center"
                              title="View Questionnaire Answers"
                            >
                              {expandedLead === lead._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable Questionnaire Row */}
                    {expandedLead === lead._id && lead.questionnaire && lead.questionnaire.length > 0 && (
                      <tr className="bg-[#f8fafc]">
                        <td colSpan={5} className="px-6 py-6 border-b border-gray-100 shadow-inner">
                          <div className="max-w-4xl">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                              <span className="w-1 h-4 bg-[#2563EB] rounded-full"></span>
                              Questionnaire Insights
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {lead.questionnaire.map((q, idx) => (
                                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                  <p className="text-[13px] font-semibold text-gray-900 mb-2">{q.question}</p>
                                  <p className="text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                                    {q.answer || <span className="text-gray-400 italic">No answer provided</span>}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && leads.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{(page - 1) * 20 + 1}</span> to{' '}
              <span className="font-medium text-gray-900">{Math.min(page * 20, totalLeads)}</span> of{' '}
              <span className="font-medium text-gray-900">{totalLeads}</span> leads
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
