import { useState, useEffect, useCallback } from 'react'
import { Users, UserPlus, Mail, Shield, Loader2, X, ChevronDown, Trash2, Crown, AlertTriangle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../components/ui/Toast'

const ROLE_CONFIG = {
  owner: {
    label: 'Owner',
    icon: Crown,
    bgClass: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    bgClass: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  accountant: {
    label: 'Accountant',
    icon: null,
    bgClass: 'bg-green-50 text-green-700 border border-green-200',
  },
  user: {
    label: 'User',
    icon: null,
    bgClass: 'bg-neutral-100 text-neutral-600 border border-neutral-200',
  },
}

const INVITE_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'user', label: 'User' },
]

function RoleBadge({ role }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${config.bgClass}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {config.label}
    </span>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatExpiry(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  if (date < now) return 'Expired'
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
  if (diffDays <= 1) return 'Expires today'
  return `${diffDays} days left`
}

export default function TeamManagementPage() {
  const { user, company, companyRole, canManageUsers } = useAuth()
  const toast = useToast()

  const [members, setMembers] = useState([])
  const [pendingInvitations, setPendingInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [maxUsers, setMaxUsers] = useState(2)
  const [planName, setPlanName] = useState('Starter')

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('user')
  const [inviting, setInviting] = useState(false)

  // Role change dropdown tracking
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(null)

  // ------------------------------------------------------------------
  // Access denied
  // ------------------------------------------------------------------
  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800">Access Denied</h2>
        <p className="text-sm text-neutral-500 mt-2 max-w-md">
          You do not have permission to manage team members. Only Owners and Admins can access this page.
        </p>
      </div>
    )
  }

  // ------------------------------------------------------------------
  // Data loading
  // ------------------------------------------------------------------
  const loadMembers = useCallback(async () => {
    if (!company?.id) return
    const { data, error } = await supabase
      .from('company_members')
      .select('*, profiles(id, email, full_name, avatar_url)')
      .eq('company_id', company.id)
      .order('role', { ascending: true })
    if (error) {
      toast.error('Load Failed', 'Could not load team members')
      return
    }
    setMembers(data || [])
  }, [company?.id])

  const loadInvitations = useCallback(async () => {
    if (!company?.id) return
    const { data, error } = await supabase
      .from('company_invitations')
      .select('*')
      .eq('company_id', company.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) {
      toast.error('Load Failed', 'Could not load pending invitations')
      return
    }
    setPendingInvitations(data || [])
  }, [company?.id])

  const loadPlanLimit = useCallback(async () => {
    if (!company?.subscription_plan_id) {
      setMaxUsers(2)
      setPlanName('Starter')
      return
    }
    const { data } = await supabase
      .from('subscription_plans')
      .select('max_users, name')
      .eq('id', company.subscription_plan_id)
      .single()
    setMaxUsers(data?.max_users || 2)
    setPlanName(data?.name || 'Starter')
  }, [company?.subscription_plan_id])

  useEffect(() => {
    if (!company?.id) return
    setLoading(true)
    Promise.all([loadMembers(), loadInvitations(), loadPlanLimit()]).finally(() =>
      setLoading(false)
    )
  }, [company?.id, loadMembers, loadInvitations, loadPlanLimit])

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------
  const handleRoleChange = async (memberId, newRole) => {
    const { error } = await supabase
      .from('company_members')
      .update({ role: newRole })
      .eq('id', memberId)
    if (error) {
      toast.error('Failed to update role')
      return
    }
    setRoleDropdownOpen(null)
    loadMembers()
    toast.success('Role Updated')
  }

  const handleRemoveMember = async (member) => {
    if (!confirm(`Remove ${member.profiles.full_name || member.profiles.email} from the team?`)) return
    try {
      const { error: delError } = await supabase
        .from('company_members')
        .delete()
        .eq('id', member.id)
      if (delError) throw delError

      await supabase
        .from('profiles')
        .update({ company_id: null })
        .eq('id', member.user_id)

      loadMembers()
      toast.success('Member Removed')
    } catch (err) {
      toast.error('Remove Failed', err.message)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      // Check plan limit
      if (members.length + pendingInvitations.length >= maxUsers) {
        toast.error('Plan Limit', 'Upgrade your plan to add more members')
        return
      }

      // Check if already a member
      const existingMember = members.find(
        (m) => m.profiles?.email?.toLowerCase() === inviteEmail.trim().toLowerCase()
      )
      if (existingMember) {
        toast.error('Already a Member', 'This user is already on your team')
        return
      }

      // Check for duplicate pending invitation
      const existingInvite = pendingInvitations.find(
        (inv) => inv.email?.toLowerCase() === inviteEmail.trim().toLowerCase()
      )
      if (existingInvite) {
        toast.error('Already Invited', 'A pending invitation already exists for this email')
        return
      }

      const { error } = await supabase.from('company_invitations').insert({
        company_id: company.id,
        email: inviteEmail.trim().toLowerCase(),
        role: inviteRole,
        invited_by: user.id,
      })
      if (error) throw error

      toast.success('Invitation Sent', `Invite sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviteRole('user')
      loadInvitations()
    } catch (err) {
      toast.error('Failed', err.message)
    } finally {
      setInviting(false)
    }
  }

  const handleRevokeInvite = async (invId) => {
    try {
      const { error } = await supabase
        .from('company_invitations')
        .update({ status: 'revoked' })
        .eq('id', invId)
      if (error) throw error
      loadInvitations()
      toast.success('Invitation Revoked')
    } catch (err) {
      toast.error('Revoke Failed', err.message)
    }
  }

  // ------------------------------------------------------------------
  // Permission helpers
  // ------------------------------------------------------------------
  const canChangeRole = (member) => {
    // Can't change own role
    if (member.user_id === user.id) return false
    // Can't change owner's role
    if (member.role === 'owner') return false
    // Admin can only change accountant/user roles
    if (companyRole === 'admin' && (member.role === 'admin' || member.role === 'owner')) return false
    return true
  }

  const canRemove = (member) => {
    // Can't remove self
    if (member.user_id === user.id) return false
    // Can't remove owner
    if (member.role === 'owner') return false
    // Admin can't remove other admins
    if (companyRole === 'admin' && member.role === 'admin') return false
    return true
  }

  const getAvailableRoles = (member) => {
    // Owner can assign any role except owner
    if (companyRole === 'owner') {
      return [
        { value: 'admin', label: 'Admin' },
        { value: 'accountant', label: 'Accountant' },
        { value: 'user', label: 'User' },
      ].filter((r) => r.value !== member.role)
    }
    // Admin can only assign accountant/user
    return [
      { value: 'accountant', label: 'Accountant' },
      { value: 'user', label: 'User' },
    ].filter((r) => r.value !== member.role)
  }

  // Close role dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setRoleDropdownOpen(null)
    if (roleDropdownOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [roleDropdownOpen])

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  const totalSlots = members.length + pendingInvitations.length

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Team Management</h1>
          <p className="text-[#64748B] mt-1">Manage your company's team members and invitations</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-[#1E293B]">
            {totalSlots} of {maxUsers} members
          </p>
          <p className="text-xs text-[#64748B]">{planName} plan</p>
        </div>
      </div>

      {/* Plan limit warning */}
      {totalSlots >= maxUsers && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Team limit reached</p>
            <p className="text-sm text-amber-700 mt-0.5">
              You have used all {maxUsers} member slots on the {planName} plan. Upgrade to add more members.
            </p>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100">
          <Users className="h-5 w-5 text-primary-500" />
          <div>
            <h2 className="text-lg font-bold text-[#1E293B]">Team Members</h2>
            <p className="text-sm text-[#64748B]">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 mb-4">
              <Users className="h-8 w-8 text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-700">No team members</h3>
            <p className="text-sm text-neutral-400 mt-1.5 max-w-md">
              Invite team members using the form below to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {members.map((member) => {
                  const profile = member.profiles || {}
                  const displayName = profile.full_name || profile.email || 'Unknown'
                  const isCurrentUser = member.user_id === user.id

                  return (
                    <tr key={member.id} className="hover:bg-neutral-50 transition-colors">
                      {/* Member info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-100 text-primary-600 text-sm font-semibold flex-shrink-0">
                            {(profile.full_name || profile.email || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-800 truncate">
                              {displayName}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs font-normal text-neutral-400">(you)</span>
                              )}
                            </p>
                            {profile.email && (
                              <p className="text-xs text-neutral-400 truncate">{profile.email}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role badge */}
                      <td className="px-6 py-4">
                        <RoleBadge role={member.role} />
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4">
                        <p className="text-sm text-neutral-500">{formatDate(member.created_at)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {/* Role change dropdown */}
                          {canChangeRole(member) && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setRoleDropdownOpen(
                                    roleDropdownOpen === member.id ? null : member.id
                                  )
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                              >
                                Change Role
                                <ChevronDown className="h-3 w-3" />
                              </button>
                              {roleDropdownOpen === member.id && (
                                <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-white rounded-xl border border-neutral-200 shadow-elevated py-1">
                                  {getAvailableRoles(member).map((r) => (
                                    <button
                                      key={r.value}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleRoleChange(member.id, r.value)
                                      }}
                                      className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                    >
                                      {r.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Remove button */}
                          {canRemove(member) && (
                            <button
                              onClick={() => handleRemoveMember(member)}
                              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                          {/* No actions available */}
                          {!canChangeRole(member) && !canRemove(member) && (
                            <span className="text-xs text-neutral-300">&mdash;</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Section */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="h-5 w-5 text-primary-500" />
          <div>
            <h2 className="text-lg font-bold text-[#1E293B]">Invite Team Member</h2>
            <p className="text-sm text-[#64748B]">Send an invitation to add a new member to your team</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Email input */}
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleInvite()
                }}
                placeholder="colleague@company.com"
                className="input pl-10"
                disabled={inviting}
              />
            </div>
          </div>

          {/* Role select */}
          <div className="w-full sm:w-44">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Role
            </label>
            <div className="relative">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="select pr-10"
                disabled={inviting}
              >
                {INVITE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handleInvite}
            disabled={inviting || !inviteEmail.trim()}
            className="btn-primary px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {inviting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Send Invite
          </button>
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100">
          <Mail className="h-5 w-5 text-primary-500" />
          <div>
            <h2 className="text-lg font-bold text-[#1E293B]">Pending Invitations</h2>
            <p className="text-sm text-[#64748B]">
              {pendingInvitations.length} pending {pendingInvitations.length === 1 ? 'invitation' : 'invitations'}
            </p>
          </div>
        </div>

        {pendingInvitations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-neutral-50 mb-3">
              <Mail className="h-6 w-6 text-neutral-300" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-500">No pending invitations</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Invitations you send will appear here until accepted or revoked.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 text-left">
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Invited
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    Expires
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {pendingInvitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-neutral-700">{inv.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <RoleBadge role={inv.role} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-neutral-500">{formatDate(inv.created_at)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-neutral-500">{formatExpiry(inv.expires_at)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevokeInvite(inv.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <X className="h-3 w-3" />
                        Revoke
                      </button>
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
