import { useEffect, useState, useCallback } from 'react'
import {
  Search, X, ChevronLeft, ChevronRight, Loader2,
  Eye, Trash2, ArrowUpCircle, Users, Filter,
  Save, AlertTriangle,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const STATUSES = ['new', 'contacted', 'qualified', 'converted', 'lost']
const PER_PAGE = 25

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  qualified: 'bg-green-100 text-green-700 border-green-200',
  converted: 'bg-purple-100 text-purple-700 border-purple-200',
  lost: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_DOT_COLORS = {
  new: 'bg-[#3B82F6]',
  contacted: 'bg-[#F59E0B]',
  qualified: 'bg-[#22C55E]',
  converted: 'bg-[#7C3AED]',
  lost: 'bg-[#EF4444]',
}

function formatDate(date) {
  if (!date) return '\u2014'
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date))
}

function formatDateTime(date) {
  if (!date) return '\u2014'
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date))
}

export default function LeadManagement() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusCounts, setStatusCounts] = useState({})
  const [selectedLead, setSelectedLead] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editNotes, setEditNotes] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const loadLeads = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1)

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }
      if (searchTerm.trim()) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      const { data, count, error } = await query
      if (error) throw error
      setLeads(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Failed to load leads:', err)
    } finally {
      setLoading(false)
    }
  }, [page, filterStatus, searchTerm])

  const loadStatusCounts = useCallback(async () => {
    try {
      const results = await Promise.all(
        STATUSES.map((status) =>
          supabase
            .from('leads')
            .select('id', { count: 'exact', head: true })
            .eq('status', status)
        )
      )
      const counts = {}
      STATUSES.forEach((status, i) => {
        counts[status] = results[i].count || 0
      })
      setStatusCounts(counts)
    } catch (err) {
      console.error('Failed to load status counts:', err)
    }
  }, [])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  useEffect(() => {
    loadStatusCounts()
  }, [loadStatusCounts])

  const handleInlineStatusChange = async (leadId, newStatus) => {
    try {
      const updates = { status: newStatus }
      if (newStatus === 'converted') {
        updates.converted_at = new Date().toISOString()
      }
      await supabase.from('leads').update(updates).eq('id', leadId)
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, ...updates } : l))
      )
      loadStatusCounts()
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const openDetailModal = (lead) => {
    setSelectedLead(lead)
    setEditNotes(lead.notes || '')
    setEditStatus(lead.status || 'new')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedLead(null)
    setDeleteConfirm(null)
  }

  const handleSaveDetail = async () => {
    if (!selectedLead) return
    setSaving(true)
    try {
      const updates = { notes: editNotes, status: editStatus }
      if (editStatus === 'converted' && selectedLead.status !== 'converted') {
        updates.converted_at = new Date().toISOString()
      }
      await supabase.from('leads').update(updates).eq('id', selectedLead.id)
      setLeads((prev) =>
        prev.map((l) => (l.id === selectedLead.id ? { ...l, ...updates } : l))
      )
      loadStatusCounts()
      closeModal()
    } catch (err) {
      console.error('Failed to save lead:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleMarkConverted = async () => {
    if (!selectedLead) return
    setSaving(true)
    try {
      const updates = { status: 'converted', converted_at: new Date().toISOString() }
      await supabase.from('leads').update(updates).eq('id', selectedLead.id)
      setLeads((prev) =>
        prev.map((l) => (l.id === selectedLead.id ? { ...l, ...updates } : l))
      )
      setEditStatus('converted')
      loadStatusCounts()
    } catch (err) {
      console.error('Failed to convert lead:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedLead) return
    setSaving(true)
    try {
      await supabase.from('leads').delete().eq('id', selectedLead.id)
      setLeads((prev) => prev.filter((l) => l.id !== selectedLead.id))
      setTotalCount((prev) => prev - 1)
      loadStatusCounts()
      closeModal()
    } catch (err) {
      console.error('Failed to delete lead:', err)
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.ceil(totalCount / PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Lead Management</h1>
        <p className="text-[#64748B] mt-1">Track and manage all incoming leads</p>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-3">
        {STATUSES.map((status) => (
          <div
            key={status}
            className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
            <span className="text-sm text-[#64748B] capitalize">{status}:</span>
            <span className="text-sm font-semibold text-[#1E293B]">{statusCounts[status] || 0}</span>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(0)
            }}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5] transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => { setSearchTerm(''); setPage(0) }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-[#64748B] hover:text-[#1E293B]" />
            </button>
          )}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setPage(0)
            }}
            className="pl-10 pr-8 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5] appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <Users className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
            <p className="text-sm">No leads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden md:table-cell">Phone</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden lg:table-cell">Company</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden lg:table-cell">Country</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden xl:table-cell">Source</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden sm:table-cell">Created</th>
                  <th className="text-right px-5 py-3 font-medium text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#1E293B]">{lead.full_name || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B]">{lead.email || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden md:table-cell">{lead.phone || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell">{lead.company_name || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell">{lead.country || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden xl:table-cell">{lead.source || '\u2014'}</td>
                    <td className="px-5 py-3">
                      <select
                        value={lead.status || 'new'}
                        onChange={(e) => handleInlineStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${STATUS_COLORS[lead.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-[#64748B] hidden sm:table-cell">{formatDate(lead.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openDetailModal(lead)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1978E5] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100">
            <p className="text-sm text-[#64748B]">
              Showing {page * PER_PAGE + 1}\u2013{Math.min((page + 1) * PER_PAGE, totalCount)} of {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-[#64748B]" />
              </button>
              <span className="text-sm text-[#64748B]">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-[#64748B]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {modalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#1E293B]">Lead Details</h3>
                <p className="text-sm text-[#64748B]">{selectedLead.full_name}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                <X className="h-5 w-5 text-[#64748B]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Full Name</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedLead.full_name || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Email</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedLead.email || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Phone</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedLead.phone || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Company</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedLead.company_name || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Country</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedLead.country || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Source</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedLead.source || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Interest</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedLead.interest || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Created</label>
                  <p className="text-sm text-[#1E293B] mt-1">{formatDateTime(selectedLead.created_at)}</p>
                </div>
                {selectedLead.converted_at && (
                  <div>
                    <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Converted At</label>
                    <p className="text-sm text-[#1E293B] mt-1">{formatDateTime(selectedLead.converted_at)}</p>
                  </div>
                )}
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about this lead..."
                  className="mt-1 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5] resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4 rounded-b-2xl flex flex-col sm:flex-row items-center gap-3">
              {editStatus !== 'converted' && (
                <button
                  onClick={handleMarkConverted}
                  disabled={saving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#7C3AED] rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  Mark Converted
                </button>
              )}
              <div className="flex-1" />
              {deleteConfirm === selectedLead.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#EF4444] font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Confirm delete?
                  </span>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-[#EF4444] rounded-lg hover:bg-red-600 disabled:opacity-50"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-3 py-1.5 text-xs font-medium text-[#64748B] bg-neutral-100 rounded-lg hover:bg-neutral-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(selectedLead.id)}
                  className="inline-flex items-center gap-1 px-4 py-2.5 text-sm font-medium text-[#EF4444] bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              )}
              <button
                onClick={handleSaveDetail}
                disabled={saving}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1978E5] rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
