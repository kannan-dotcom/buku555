import { useEffect, useState, useCallback } from 'react'
import {
  Search, X, ChevronLeft, ChevronRight, Loader2,
  Eye, Users, Filter, Save, Shield, Building2, Mail, Phone,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const ROLES = ['user', 'admin', 'accountant']
const PER_PAGE = 25

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  accountant: 'bg-blue-100 text-blue-700 border-blue-200',
  user: 'bg-neutral-100 text-neutral-700 border-neutral-200',
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

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)
  const [filterRole, setFilterRole] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleCounts, setRoleCounts] = useState({})
  const [selectedUser, setSelectedUser] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRole, setEditRole] = useState('')
  const [saving, setSaving] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*, company:companies(id, name, status)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1)

      if (filterRole !== 'all') {
        query = query.eq('role', filterRole)
      }
      if (searchTerm.trim()) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      }

      const { data, count, error } = await query
      if (error) throw error
      setUsers(data || [])
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }, [page, filterRole, searchTerm])

  const loadRoleCounts = useCallback(async () => {
    try {
      const results = await Promise.all(
        ROLES.map((role) =>
          supabase
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('role', role)
        )
      )
      const counts = {}
      ROLES.forEach((role, i) => {
        counts[role] = results[i].count || 0
      })
      setRoleCounts(counts)
    } catch (err) {
      console.error('Failed to load role counts:', err)
    }
  }, [])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    loadRoleCounts()
  }, [loadRoleCounts])

  const openDetailModal = (user) => {
    setSelectedUser(user)
    setEditRole(user.role || 'user')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedUser(null)
  }

  const handleSaveRole = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: editRole, updated_at: new Date().toISOString() })
        .eq('id', selectedUser.id)
      if (error) throw error
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: editRole } : u))
      )
      loadRoleCounts()
      closeModal()
    } catch (err) {
      console.error('Failed to update role:', err)
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.ceil(totalCount / PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">User Management</h1>
        <p className="text-[#64748B] mt-1">View and manage all registered users</p>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-3">
        {ROLES.map((role) => (
          <div
            key={role}
            className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-4 py-2"
          >
            <span className={`inline-block h-2 w-2 rounded-full ${
              role === 'admin' ? 'bg-purple-500' : role === 'accountant' ? 'bg-blue-500' : 'bg-neutral-400'
            }`} />
            <span className="text-sm text-[#64748B] capitalize">{role}s:</span>
            <span className="text-sm font-semibold text-[#1E293B]">{roleCounts[role] || 0}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg px-4 py-2">
          <Users className="h-3.5 w-3.5 text-[#64748B]" />
          <span className="text-sm text-[#64748B]">Total:</span>
          <span className="text-sm font-semibold text-[#1E293B]">
            {Object.values(roleCounts).reduce((a, b) => a + b, 0)}
          </span>
        </div>
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
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value)
              setPage(0)
            }}
            className="pl-10 pr-8 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5] appearance-none cursor-pointer transition-colors"
          >
            <option value="all">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <Users className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
            <p className="text-sm">No users found</p>
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
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Role</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden sm:table-cell">Joined</th>
                  <th className="text-right px-5 py-3 font-medium text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">
                            {(u.full_name || u.email || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-[#1E293B]">{u.full_name || '\u2014'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#64748B]">{u.email || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden md:table-cell">{u.phone || '\u2014'}</td>
                    <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell">
                      {u.company?.name || '\u2014'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#64748B] hidden sm:table-cell">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => openDetailModal(u)}
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
              Showing {page * PER_PAGE + 1}&ndash;{Math.min((page + 1) * PER_PAGE, totalCount)} of {totalCount}
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
      {modalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600">
                    {(selectedUser.full_name || selectedUser.email || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-[#1E293B]">{selectedUser.full_name || 'Unnamed User'}</h3>
                  <p className="text-sm text-[#64748B]">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                <X className="h-5 w-5 text-[#64748B]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Email
                  </label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedUser.email || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> Phone
                  </label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedUser.phone || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" /> Company
                  </label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedUser.company?.name || '\u2014'}</p>
                  {selectedUser.company?.status && (
                    <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full border capitalize ${
                      selectedUser.company.status === 'active'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}>
                      {selectedUser.company.status}
                    </span>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Country</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedUser.country_code || '\u2014'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Currency</label>
                  <p className="text-sm text-[#1E293B] mt-1">{selectedUser.preferred_currency || 'MYR'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Google Drive</label>
                  <p className="text-sm mt-1">
                    {selectedUser.gdrive_connected ? (
                      <span className="text-green-600 font-medium">Connected</span>
                    ) : (
                      <span className="text-neutral-400">Not connected</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Joined</label>
                  <p className="text-sm text-[#1E293B] mt-1">{formatDateTime(selectedUser.created_at)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider">Last Updated</label>
                  <p className="text-sm text-[#1E293B] mt-1">{formatDateTime(selectedUser.updated_at)}</p>
                </div>
              </div>

              {/* Role Edit */}
              <div className="pt-2 border-t border-neutral-100">
                <label className="text-xs font-medium text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="h-3 w-3" /> Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="mt-2 w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5]"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-6 py-4 rounded-b-2xl flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2.5 text-sm font-medium text-[#64748B] bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRole}
                disabled={saving || editRole === selectedUser.role}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1978E5] rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
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
