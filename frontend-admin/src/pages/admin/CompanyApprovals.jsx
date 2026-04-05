import { useEffect, useState, useCallback } from 'react'
import {
  Search, X, Loader2, Eye, CheckCircle, XCircle,
  Building2, Clock, FileCheck, AlertTriangle, Download,
  UserCheck, UserX,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected']

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
}

const STATUS_ICONS = {
  pending: Clock,
  approved: UserCheck,
  rejected: UserX,
}

const COMPANY_TYPE_LABELS = {
  sole_proprietor: 'Sole Proprietor',
  partnership: 'Partnership',
  sdn_bhd: 'Sdn Bhd',
  berhad: 'Berhad',
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

export default function CompanyApprovals() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedReg, setSelectedReg] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [tabCounts, setTabCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 })
  const [docUrls, setDocUrls] = useState({ ssm: null, moa: null })

  const loadRegistrations = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('company_registrations')
        .select('*, profiles!company_registrations_user_id_fkey(email, full_name)')
        .order('created_at', { ascending: false })

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }

      const { data, error } = await query
      if (error) throw error
      setRegistrations(data || [])
    } catch (err) {
      console.error('Failed to load registrations:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  const loadTabCounts = useCallback(async () => {
    try {
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        supabase.from('company_registrations').select('id', { count: 'exact', head: true }),
        supabase.from('company_registrations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('company_registrations').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('company_registrations').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
      ])
      setTabCounts({
        all: allRes.count || 0,
        pending: pendingRes.count || 0,
        approved: approvedRes.count || 0,
        rejected: rejectedRes.count || 0,
      })
    } catch (err) {
      console.error('Failed to load tab counts:', err)
    }
  }, [])

  useEffect(() => {
    loadRegistrations()
  }, [loadRegistrations])

  useEffect(() => {
    loadTabCounts()
  }, [loadTabCounts])

  const getDocUrl = async (path) => {
    if (!path) return null
    const { data } = await supabase.storage.from('registrations').createSignedUrl(path, 3600)
    return data?.signedUrl
  }

  const handleApprove = async (regId, fromModal = false) => {
    setActionLoading(regId)
    try {
      const { error } = await supabase.rpc('approve_company_registration', {
        registration_id: regId,
        admin_id: user?.id,
      })
      if (error) throw error

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId
            ? { ...r, status: 'approved', reviewed_by: user?.id, reviewed_at: new Date().toISOString() }
            : r
        )
      )
      if (fromModal && selectedReg?.id === regId) {
        setSelectedReg((prev) => ({
          ...prev,
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        }))
      }
      loadTabCounts()
    } catch (err) {
      console.error('Failed to approve:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectDialog = (reg) => {
    setRejectTarget(reg)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return
    setActionLoading(rejectTarget.id)
    try {
      const { error } = await supabase
        .from('company_registrations')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectReason,
        })
        .eq('id', rejectTarget.id)
      if (error) throw error

      const updated = {
        status: 'rejected',
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectReason,
      }
      setRegistrations((prev) =>
        prev.map((r) => (r.id === rejectTarget.id ? { ...r, ...updated } : r))
      )
      if (selectedReg?.id === rejectTarget.id) {
        setSelectedReg((prev) => ({ ...prev, ...updated }))
      }
      loadTabCounts()
      setRejectModalOpen(false)
      setRejectTarget(null)
      setRejectReason('')
    } catch (err) {
      console.error('Failed to reject registration:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const openDetailModal = async (reg) => {
    setSelectedReg(reg)
    setModalOpen(true)

    // Load signed URLs for documents
    const [ssmUrl, moaUrl] = await Promise.all([
      getDocUrl(reg.ssm_certificate_path),
      getDocUrl(reg.moa_document_path),
    ])
    setDocUrls({ ssm: ssmUrl, moa: moaUrl })
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedReg(null)
    setDocUrls({ ssm: null, moa: null })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Company Approvals</h1>
        <p className="text-[#64748B] mt-1">Review and manage company registration applications</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 bg-neutral-100 rounded-lg p-1 w-fit">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white text-[#1E293B] shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            {tab}
            <span className={`ml-1.5 text-xs ${activeTab === tab ? 'text-[#1978E5]' : 'text-[#64748B]'}`}>
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <Building2 className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
            <p className="text-sm">No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Company Name</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden md:table-cell">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden lg:table-cell">Reg Number</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden lg:table-cell">Submitted By</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden sm:table-cell">Date</th>
                  <th className="text-right px-5 py-3 font-medium text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#1E293B]">{reg.company_name || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden md:table-cell">{COMPANY_TYPE_LABELS[reg.company_type] || reg.company_type || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell font-mono text-xs">{reg.registration_number || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell">{reg.profiles?.email || reg.profiles?.full_name || '\u2014'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[reg.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                        {reg.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#64748B] hidden sm:table-cell">{formatDate(reg.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetailModal(reg)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#1978E5] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                        {reg.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(reg.id)}
                              disabled={actionLoading === reg.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-[#22C55E] rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === reg.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectDialog(reg)}
                              disabled={actionLoading === reg.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-[#EF4444] rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </button>
                          </>
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

      {/* Registration Detail Modal */}
      {modalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header with Status */}
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-[#1E293B]">Registration Details</h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedReg.status] || 'bg-neutral-100 text-neutral-600'}`}>
                    {(() => {
                      const StatusIcon = STATUS_ICONS[selectedReg.status] || Clock
                      return <StatusIcon className="h-3 w-3" />
                    })()}
                    {selectedReg.status?.charAt(0).toUpperCase() + selectedReg.status?.slice(1)}
                  </span>
                </div>
                <button onClick={closeModal} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                  <X className="h-5 w-5 text-[#64748B]" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Company Name</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedReg.company_name || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Registration Number</label>
                  <p className="text-sm text-[#1E293B] font-mono mt-1">{selectedReg.registration_number || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Company Type</label>
                  <p className="text-sm text-[#1E293B] mt-1">{COMPANY_TYPE_LABELS[selectedReg.company_type] || selectedReg.company_type || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Submitted By</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedReg.profiles?.full_name || selectedReg.profiles?.email || '\u2014'}</p>
                </div>
              </div>

              {/* Documents */}
              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Documents</label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {selectedReg.ssm_certificate_path ? (
                    <a
                      href={docUrls.ssm || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        docUrls.ssm
                          ? 'text-[#1978E5] bg-blue-50 border-blue-200 hover:bg-blue-100'
                          : 'text-neutral-400 bg-neutral-50 border-neutral-200 cursor-wait'
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      SSM Certificate
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-lg">
                      <FileCheck className="h-4 w-4" />
                      No SSM Certificate
                    </span>
                  )}
                  {selectedReg.moa_document_path ? (
                    <a
                      href={docUrls.moa || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        docUrls.moa
                          ? 'text-[#1978E5] bg-blue-50 border-blue-200 hover:bg-blue-100'
                          : 'text-neutral-400 bg-neutral-50 border-neutral-200 cursor-wait'
                      }`}
                    >
                      <Download className="h-4 w-4" />
                      MOA Document
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-lg">
                      <FileCheck className="h-4 w-4" />
                      No MOA Document
                    </span>
                  )}
                </div>
              </div>

              {/* Shareholders */}
              <div>
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Shareholders</label>
                {selectedReg.shareholders && Array.isArray(selectedReg.shareholders) && selectedReg.shareholders.length > 0 ? (
                  <div className="mt-2 border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200">
                          <th className="text-left px-4 py-2.5 font-medium text-[#64748B]">Name</th>
                          <th className="text-left px-4 py-2.5 font-medium text-[#64748B]">IC Number</th>
                          <th className="text-right px-4 py-2.5 font-medium text-[#64748B]">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedReg.shareholders.map((sh, i) => (
                          <tr key={i} className="border-b border-neutral-50 last:border-b-0">
                            <td className="px-4 py-2.5 text-[#1E293B]">{sh.name || '\u2014'}</td>
                            <td className="px-4 py-2.5 text-[#64748B] font-mono text-xs">{sh.ic_number || '\u2014'}</td>
                            <td className="px-4 py-2.5 text-[#1E293B] text-right">{sh.percentage != null ? `${sh.percentage}%` : '\u2014'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-[#64748B] mt-2">No shareholders listed</p>
                )}
              </div>

              {/* Submitted At */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Submitted</label>
                  <p className="text-sm text-[#1E293B] mt-1">{formatDateTime(selectedReg.created_at)}</p>
                </div>
                {selectedReg.reviewed_at && (
                  <div>
                    <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Reviewed</label>
                    <p className="text-sm text-[#1E293B] mt-1">{formatDateTime(selectedReg.reviewed_at)}</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {selectedReg.status === 'rejected' && selectedReg.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                    <label className="text-xs font-medium text-[#EF4444] uppercase tracking-wider">Rejection Reason</label>
                  </div>
                  <p className="text-sm text-red-700">{selectedReg.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedReg.status === 'pending' && (
              <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3">
                <button
                  onClick={() => openRejectDialog(selectedReg)}
                  disabled={actionLoading === selectedReg.id}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#EF4444] bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedReg.id, true)}
                  disabled={actionLoading === selectedReg.id}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#22C55E] rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === selectedReg.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Approve Registration
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && rejectTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setRejectModalOpen(false); setRejectTarget(null) }} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h3 className="text-lg font-semibold text-[#1E293B]">Reject Registration</h3>
              <p className="text-sm text-[#64748B] mt-0.5">Provide a reason for rejecting {rejectTarget.company_name}'s registration</p>
            </div>
            <div className="px-6 py-4">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#EF4444]/20 focus:border-[#EF4444] resize-none"
              />
            </div>
            <div className="px-6 py-4 border-t border-neutral-100 flex justify-end gap-3">
              <button
                onClick={() => { setRejectModalOpen(false); setRejectTarget(null) }}
                className="px-4 py-2.5 text-sm font-medium text-[#64748B] bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={actionLoading === rejectTarget.id}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#EF4444] rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {actionLoading === rejectTarget.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Reject Registration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
