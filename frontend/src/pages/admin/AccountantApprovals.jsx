import { useEffect, useState, useCallback } from 'react'
import {
  Search, X, Loader2, Eye, CheckCircle, XCircle,
  FileCheck, Clock, UserCheck, UserX, AlertTriangle,
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

export default function AccountantApprovals() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedApp, setSelectedApp] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectTarget, setRejectTarget] = useState(null)
  const [tabCounts, setTabCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 })

  const loadApplications = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('accountant_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab)
      }

      const { data, error } = await query
      if (error) throw error
      setApplications(data || [])
    } catch (err) {
      console.error('Failed to load applications:', err)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  const loadTabCounts = useCallback(async () => {
    try {
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        supabase.from('accountant_applications').select('id', { count: 'exact', head: true }),
        supabase.from('accountant_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('accountant_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('accountant_applications').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
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
    loadApplications()
  }, [loadApplications])

  useEffect(() => {
    loadTabCounts()
  }, [loadTabCounts])

  const handleApprove = async (appId, fromModal = false) => {
    setActionLoading(appId)
    try {
      const { error } = await supabase
        .from('accountant_applications')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', appId)
      if (error) throw error

      setApplications((prev) =>
        prev.map((a) =>
          a.id === appId
            ? { ...a, status: 'approved', reviewed_by: user?.id, reviewed_at: new Date().toISOString() }
            : a
        )
      )
      if (fromModal && selectedApp?.id === appId) {
        setSelectedApp((prev) => ({
          ...prev,
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        }))
      }
      loadTabCounts()
    } catch (err) {
      console.error('Failed to approve application:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectDialog = (app) => {
    setRejectTarget(app)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return
    setActionLoading(rejectTarget.id)
    try {
      const { error } = await supabase
        .from('accountant_applications')
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
      setApplications((prev) =>
        prev.map((a) => (a.id === rejectTarget.id ? { ...a, ...updated } : a))
      )
      if (selectedApp?.id === rejectTarget.id) {
        setSelectedApp((prev) => ({ ...prev, ...updated }))
      }
      loadTabCounts()
      setRejectModalOpen(false)
      setRejectTarget(null)
      setRejectReason('')
    } catch (err) {
      console.error('Failed to reject application:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const openDetailModal = (app) => {
    setSelectedApp(app)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedApp(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Accountant Approvals</h1>
        <p className="text-[#64748B] mt-1">Review and manage accountant registration applications</p>
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

      {/* Applications Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <FileCheck className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
            <p className="text-sm">No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden lg:table-cell">Reg #</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden lg:table-cell">Body</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden xl:table-cell">Country</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden xl:table-cell">Experience</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden sm:table-cell">Date</th>
                  <th className="text-right px-5 py-3 font-medium text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#1E293B]">{app.full_name || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden md:table-cell">{app.email || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell font-mono text-xs">{app.registration_number || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell">{app.registration_body || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden xl:table-cell">{app.country || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden xl:table-cell">{app.years_experience ? `${app.years_experience} yrs` : '\u2014'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                        {app.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#64748B] hidden sm:table-cell">{formatDate(app.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetailModal(app)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#1978E5] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(app.id)}
                              disabled={actionLoading === app.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-[#22C55E] rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                              Approve
                            </button>
                            <button
                              onClick={() => openRejectDialog(app)}
                              disabled={actionLoading === app.id}
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

      {/* Application Detail Modal */}
      {modalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header with Status */}
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-[#1E293B]">Application Details</h3>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedApp.status] || 'bg-neutral-100 text-neutral-600'}`}>
                    {(() => {
                      const StatusIcon = STATUS_ICONS[selectedApp.status] || Clock
                      return <StatusIcon className="h-3 w-3" />
                    })()}
                    {selectedApp.status?.charAt(0).toUpperCase() + selectedApp.status?.slice(1)}
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
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Full Name</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedApp.full_name || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Email</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedApp.email || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Phone</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedApp.phone || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Company</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedApp.company_name || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Registration Number</label>
                  <p className="text-sm text-[#1E293B] font-mono mt-1">{selectedApp.registration_number || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Registration Body</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedApp.registration_body || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Country</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedApp.country || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Years of Experience</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedApp.years_experience ?? '\u2014'}</p>
                </div>
                {selectedApp.website && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Website</label>
                    <p className="text-sm text-[#1978E5] mt-1">
                      <a href={selectedApp.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {selectedApp.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              {/* Specializations */}
              {selectedApp.specializations && selectedApp.specializations.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Specializations</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(Array.isArray(selectedApp.specializations)
                      ? selectedApp.specializations
                      : [selectedApp.specializations]
                    ).map((spec, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-[#7C3AED] border border-purple-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted At */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-neutral-100">
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Submitted</label>
                  <p className="text-sm text-[#1E293B] mt-1">{formatDateTime(selectedApp.created_at)}</p>
                </div>
                {selectedApp.reviewed_at && (
                  <div>
                    <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Reviewed</label>
                    <p className="text-sm text-[#1E293B] mt-1">{formatDateTime(selectedApp.reviewed_at)}</p>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              {selectedApp.status === 'rejected' && selectedApp.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-[#EF4444]" />
                    <label className="text-xs font-medium text-[#EF4444] uppercase tracking-wider">Rejection Reason</label>
                  </div>
                  <p className="text-sm text-red-700">{selectedApp.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedApp.status === 'pending' && (
              <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3">
                <button
                  onClick={() => openRejectDialog(selectedApp)}
                  disabled={actionLoading === selectedApp.id}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-[#EF4444] bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedApp.id, true)}
                  disabled={actionLoading === selectedApp.id}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#22C55E] rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === selectedApp.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Approve Application
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
              <h3 className="text-lg font-semibold text-[#1E293B]">Reject Application</h3>
              <p className="text-sm text-[#64748B] mt-0.5">Provide a reason for rejecting {rejectTarget.full_name}'s application</p>
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
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
