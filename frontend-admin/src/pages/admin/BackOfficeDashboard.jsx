import { useEffect, useState } from 'react'
import {
  Users, FileCheck, CreditCard, UserCircle, Building2,
  ChevronDown, ChevronRight, Clock, CheckCircle,
  XCircle, AlertCircle, Loader2, RefreshCw,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  qualified: 'bg-green-100 text-green-700',
  converted: 'bg-purple-100 text-purple-700',
  lost: 'bg-red-100 text-red-700',
}

function formatDate(date) {
  if (!date) return '\u2014'
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

function StatCard({ icon: Icon, label, value, color, loading }) {
  const colorMap = {
    blue: 'bg-blue-50 text-[#1978E5]',
    purple: 'bg-purple-50 text-[#7C3AED]',
    green: 'bg-green-50 text-[#22C55E]',
    slate: 'bg-slate-50 text-[#1E293B]',
  }
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#64748B]">{label}</p>
          {loading ? (
            <div className="mt-2">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-300" />
            </div>
          ) : (
            <p className="text-3xl font-bold text-[#1E293B] mt-1">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export default function BackOfficeDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalLeads: 0,
    pendingApplications: 0,
    pendingCompanies: 0,
    activeSubscriptions: 0,
    totalUsers: 0,
  })
  const [recentLeads, setRecentLeads] = useState([])
  const [pendingApps, setPendingApps] = useState([])
  const [pendingCompanyRegs, setPendingCompanyRegs] = useState([])
  const [expandedLead, setExpandedLead] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [
        leadsCountRes,
        pendingAppsCountRes,
        pendingCompaniesCountRes,
        activeSubsRes,
        usersCountRes,
        recentLeadsRes,
        pendingAppsRes,
        pendingCompanyRegsRes,
      ] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('accountant_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('company_registrations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('companies').select('id', { count: 'exact', head: true }).eq('subscription_status', 'active'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('accountant_applications').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
        supabase.from('company_registrations').select('*, profiles(full_name, email)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        totalLeads: leadsCountRes.count || 0,
        pendingApplications: pendingAppsCountRes.count || 0,
        pendingCompanies: pendingCompaniesCountRes.count || 0,
        activeSubscriptions: activeSubsRes.count || 0,
        totalUsers: usersCountRes.count || 0,
      })
      setRecentLeads(recentLeadsRes.data || [])
      setPendingApps(pendingAppsRes.data || [])
      setPendingCompanyRegs(pendingCompanyRegsRes.data || [])
    } catch (err) {
      console.error('Failed to load back office data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (appId) => {
    setActionLoading(appId)
    try {
      await supabase
        .from('accountant_applications')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', appId)
      setPendingApps((prev) => prev.filter((a) => a.id !== appId))
      setStats((prev) => ({ ...prev, pendingApplications: prev.pendingApplications - 1 }))
    } catch (err) {
      console.error('Failed to approve application:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (appId) => {
    setActionLoading(appId)
    try {
      await supabase
        .from('accountant_applications')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', appId)
      setPendingApps((prev) => prev.filter((a) => a.id !== appId))
      setStats((prev) => ({ ...prev, pendingApplications: prev.pendingApplications - 1 }))
    } catch (err) {
      console.error('Failed to reject application:', err)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Back Office Dashboard</h1>
          <p className="text-[#64748B] mt-1">Overview of platform activity and pending actions</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#64748B] bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Total Leads" value={stats.totalLeads} color="blue" loading={loading} />
        <StatCard icon={FileCheck} label="Pending Applications" value={stats.pendingApplications} color="purple" loading={loading} />
        <StatCard icon={Building2} label="Pending Companies" value={stats.pendingCompanies} color="purple" loading={loading} />
        <StatCard icon={CreditCard} label="Active Subscriptions" value={stats.activeSubscriptions} color="green" loading={loading} />
        <StatCard icon={UserCircle} label="Total Users" value={stats.totalUsers} color="slate" loading={loading} />
      </div>

      {/* Recent Leads Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-[#1E293B]">Recent Leads</h2>
          <p className="text-sm text-[#64748B] mt-0.5">Last 10 leads captured</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : recentLeads.length === 0 ? (
          <div className="text-center py-12 text-[#64748B]">
            <Users className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
            <p className="text-sm">No leads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]"></th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden md:table-cell">Company</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden lg:table-cell">Country</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <>
                    <tr
                      key={lead.id}
                      onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                      className="border-b border-neutral-50 hover:bg-blue-50/30 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3">
                        {expandedLead === lead.id ? (
                          <ChevronDown className="h-4 w-4 text-[#64748B]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#64748B]" />
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium text-[#1E293B]">{lead.full_name || '\u2014'}</td>
                      <td className="px-5 py-3 text-[#64748B]">{lead.email || '\u2014'}</td>
                      <td className="px-5 py-3 text-[#64748B] hidden md:table-cell">{lead.company_name || '\u2014'}</td>
                      <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell">{lead.country || '\u2014'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] || 'bg-neutral-100 text-neutral-600'}`}>
                          {lead.status || 'new'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#64748B] hidden sm:table-cell">{formatDate(lead.created_at)}</td>
                    </tr>
                    {expandedLead === lead.id && (
                      <tr key={`${lead.id}-detail`} className="bg-blue-50/20">
                        <td colSpan={7} className="px-5 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-[#64748B] text-xs uppercase tracking-wider mb-1">Phone</p>
                              <p className="text-[#1E293B]">{lead.phone || '\u2014'}</p>
                            </div>
                            <div>
                              <p className="text-[#64748B] text-xs uppercase tracking-wider mb-1">Source</p>
                              <p className="text-[#1E293B]">{lead.source || '\u2014'}</p>
                            </div>
                            <div>
                              <p className="text-[#64748B] text-xs uppercase tracking-wider mb-1">Interest</p>
                              <p className="text-[#1E293B]">{lead.interest || '\u2014'}</p>
                            </div>
                            {lead.notes && (
                              <div className="md:col-span-3">
                                <p className="text-[#64748B] text-xs uppercase tracking-wider mb-1">Notes</p>
                                <p className="text-[#1E293B]">{lead.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Company Registrations */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-[#1E293B]">Pending Company Registrations</h2>
          <p className="text-sm text-[#64748B] mt-0.5">Company registrations awaiting approval</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : pendingCompanyRegs.length === 0 ? (
          <div className="text-center py-12 text-[#64748B]">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-300" />
            <p className="text-sm">No pending company registrations</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Company</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden md:table-cell">Type</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden lg:table-cell">Reg #</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Submitted By</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {pendingCompanyRegs.map((reg) => (
                  <tr key={reg.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#1E293B]">{reg.company_name || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden md:table-cell capitalize">{(reg.company_type || '').replace(/_/g, ' ')}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell">{reg.registration_number || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B]">{reg.profiles?.email || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden sm:table-cell">{formatDate(reg.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Applications */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-[#1E293B]">Pending Accountant Applications</h2>
          <p className="text-sm text-[#64748B] mt-0.5">Applications awaiting review</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : pendingApps.length === 0 ? (
          <div className="text-center py-12 text-[#64748B]">
            <CheckCircle className="h-10 w-10 mx-auto mb-2 text-green-300" />
            <p className="text-sm">No pending applications</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden md:table-cell">Registration #</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden lg:table-cell">Body</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden sm:table-cell">Country</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden sm:table-cell">Date</th>
                  <th className="text-right px-5 py-3 font-medium text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingApps.map((app) => (
                  <tr key={app.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-[#1E293B]">{app.full_name || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden md:table-cell">{app.registration_number || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell">{app.registration_body || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden sm:table-cell">{app.country || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden sm:table-cell">{formatDate(app.created_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(app.id)}
                          disabled={actionLoading === app.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#22C55E] rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === app.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(app.id)}
                          disabled={actionLoading === app.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#EF4444] rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          {actionLoading === app.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
