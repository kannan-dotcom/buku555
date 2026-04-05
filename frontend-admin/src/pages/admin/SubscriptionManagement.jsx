import { useEffect, useState, useCallback } from 'react'
import {
  CreditCard, Users, DollarSign, Loader2, Save,
  X, AlertTriangle, CheckCircle, XCircle, Edit3,
  TrendingUp, Zap, Building2, Crown,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

function formatCurrency(amount) {
  if (amount == null) return '\u2014'
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(date) {
  if (!date) return '\u2014'
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(date))
}

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-neutral-100 text-neutral-600',
  trialing: 'bg-blue-100 text-blue-700',
  past_due: 'bg-yellow-100 text-yellow-700',
}

const PLAN_ICONS = {
  free: Zap,
  team: Users,
  business: Building2,
  enterprise: Crown,
}

function StatCard({ icon: Icon, label, value, color, loading }) {
  const colorMap = {
    blue: 'bg-blue-50 text-[#1978E5]',
    green: 'bg-green-50 text-[#22C55E]',
    purple: 'bg-purple-50 text-[#7C3AED]',
    amber: 'bg-amber-50 text-[#F59E0B]',
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
            <p className="text-2xl font-bold text-[#1E293B] mt-1">{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

export default function SubscriptionManagement() {
  const [loading, setLoading] = useState(true)
  const [subscriptions, setSubscriptions] = useState([])
  const [plans, setPlans] = useState([])
  const [stats, setStats] = useState({
    totalActive: 0,
    totalFree: 0,
    totalTeam: 0,
    totalBusiness: 0,
    mrr: 0,
  })
  const [editingPlan, setEditingPlan] = useState(null)
  const [planEdits, setPlanEdits] = useState({})
  const [savingPlan, setSavingPlan] = useState(null)
  const [cancelConfirm, setCancelConfirm] = useState(null)
  const [changingPlan, setChangingPlan] = useState(null)

  const loadSubscriptions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*, profiles(*), subscription_plans(*)')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubscriptions(data || [])
    } catch (err) {
      console.error('Failed to load subscriptions:', err)
    }
  }, [])

  const loadPlans = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('monthly_price', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (err) {
      console.error('Failed to load plans:', err)
    }
  }, [])

  const calculateStats = useCallback(async () => {
    try {
      const [activeRes, allSubsRes] = await Promise.all([
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_subscriptions').select('*, subscription_plans(*)').eq('status', 'active'),
      ])

      const subs = allSubsRes.data || []
      let totalFree = 0
      let totalTeam = 0
      let totalBusiness = 0
      let mrr = 0

      subs.forEach((sub) => {
        const planSlug = sub.subscription_plans?.slug || ''
        const monthlyPrice = sub.subscription_plans?.monthly_price || 0
        const annualPrice = sub.subscription_plans?.annual_price || 0

        if (planSlug === 'free' || monthlyPrice === 0) {
          totalFree++
        } else if (planSlug === 'team') {
          totalTeam++
        } else if (planSlug === 'business' || planSlug === 'enterprise') {
          totalBusiness++
        }

        // MRR calculation
        if (sub.billing_cycle === 'annual' && annualPrice > 0) {
          mrr += annualPrice / 12
        } else if (monthlyPrice > 0) {
          mrr += monthlyPrice
        }
      })

      setStats({
        totalActive: activeRes.count || 0,
        totalFree,
        totalTeam,
        totalBusiness,
        mrr,
      })
    } catch (err) {
      console.error('Failed to calculate stats:', err)
    }
  }, [])

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true)
      await Promise.all([loadSubscriptions(), loadPlans(), calculateStats()])
      setLoading(false)
    }
    loadAll()
  }, [loadSubscriptions, loadPlans, calculateStats])

  const handleChangePlan = async (subscriptionId, newPlanId) => {
    setChangingPlan(subscriptionId)
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ plan_id: newPlanId })
        .eq('id', subscriptionId)
      if (error) throw error
      await Promise.all([loadSubscriptions(), calculateStats()])
    } catch (err) {
      console.error('Failed to change plan:', err)
    } finally {
      setChangingPlan(null)
    }
  }

  const handleCancelSubscription = async (subscriptionId) => {
    setChangingPlan(subscriptionId)
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', subscriptionId)
      if (error) throw error
      await Promise.all([loadSubscriptions(), calculateStats()])
      setCancelConfirm(null)
    } catch (err) {
      console.error('Failed to cancel subscription:', err)
    } finally {
      setChangingPlan(null)
    }
  }

  const startEditPlan = (plan) => {
    setEditingPlan(plan.id)
    setPlanEdits({
      name: plan.name || '',
      slug: plan.slug || '',
      max_users: plan.max_users ?? '',
      monthly_price: plan.monthly_price ?? '',
      annual_price: plan.annual_price ?? '',
      is_active: plan.is_active ?? true,
    })
  }

  const cancelEditPlan = () => {
    setEditingPlan(null)
    setPlanEdits({})
  }

  const handleSavePlan = async (planId) => {
    setSavingPlan(planId)
    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          name: planEdits.name,
          slug: planEdits.slug,
          max_users: planEdits.max_users === '' ? null : Number(planEdits.max_users),
          monthly_price: planEdits.monthly_price === '' ? 0 : Number(planEdits.monthly_price),
          annual_price: planEdits.annual_price === '' ? 0 : Number(planEdits.annual_price),
          is_active: planEdits.is_active,
        })
        .eq('id', planId)
      if (error) throw error
      await loadPlans()
      setEditingPlan(null)
      setPlanEdits({})
    } catch (err) {
      console.error('Failed to save plan:', err)
    } finally {
      setSavingPlan(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Subscription Management</h1>
        <p className="text-[#64748B] mt-1">Manage user subscriptions and pricing plans</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={CheckCircle} label="Total Active" value={stats.totalActive} color="green" loading={loading} />
        <StatCard icon={Zap} label="Free Plans" value={stats.totalFree} color="slate" loading={loading} />
        <StatCard icon={Users} label="Team Plans" value={stats.totalTeam} color="blue" loading={loading} />
        <StatCard icon={Building2} label="Business Plans" value={stats.totalBusiness} color="purple" loading={loading} />
        <StatCard icon={TrendingUp} label="MRR" value={formatCurrency(stats.mrr)} color="amber" loading={loading} />
      </div>

      {/* Users / Subscriptions Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-[#1E293B]">User Subscriptions</h2>
          <p className="text-sm text-[#64748B] mt-0.5">All user subscription records</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <CreditCard className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
            <p className="text-sm">No subscriptions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">User</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Plan</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden lg:table-cell">Billing</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden sm:table-cell">Start Date</th>
                  <th className="text-right px-5 py-3 font-medium text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const profile = sub.profiles || {}
                  const plan = sub.subscription_plans || {}
                  return (
                    <tr key={sub.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-[#1E293B]">{profile.full_name || '\u2014'}</td>
                      <td className="px-5 py-3 text-[#64748B] hidden md:table-cell">{profile.email || '\u2014'}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const PlanIcon = PLAN_ICONS[plan.slug] || CreditCard
                            return <PlanIcon className="h-4 w-4 text-[#7C3AED]" />
                          })()}
                          <span className="text-[#1E293B] font-medium">{plan.name || '\u2014'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#64748B] hidden lg:table-cell capitalize">{sub.billing_cycle || '\u2014'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[sub.status] || 'bg-neutral-100 text-neutral-600'}`}>
                          {sub.status || '\u2014'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#64748B] hidden sm:table-cell">{formatDate(sub.start_date || sub.created_at)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* Change Plan Dropdown */}
                          <select
                            value={sub.plan_id || ''}
                            onChange={(e) => handleChangePlan(sub.id, e.target.value)}
                            disabled={changingPlan === sub.id || sub.status === 'cancelled'}
                            className="text-xs px-2 py-1.5 border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5] disabled:opacity-50 cursor-pointer"
                          >
                            {plans.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                          {/* Cancel */}
                          {sub.status === 'active' && (
                            cancelConfirm === sub.id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleCancelSubscription(sub.id)}
                                  disabled={changingPlan === sub.id}
                                  className="px-2 py-1 text-xs font-medium text-white bg-[#EF4444] rounded-md hover:bg-red-600 disabled:opacity-50"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setCancelConfirm(null)}
                                  className="px-2 py-1 text-xs font-medium text-[#64748B] bg-neutral-100 rounded-md hover:bg-neutral-200"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCancelConfirm(sub.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-[#EF4444] bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <XCircle className="h-3 w-3" />
                                Cancel
                              </button>
                            )
                          )}
                          {changingPlan === sub.id && (
                            <Loader2 className="h-4 w-4 animate-spin text-[#1978E5]" />
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

      {/* Plan Editor */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100">
          <h2 className="text-lg font-semibold text-[#1E293B]">Subscription Plans</h2>
          <p className="text-sm text-[#64748B] mt-0.5">Edit plan details and pricing</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-neutral-300" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <DollarSign className="h-10 w-10 mx-auto mb-2 text-neutral-300" />
            <p className="text-sm">No plans configured</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Name</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Slug</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden md:table-cell">Max Users</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Monthly</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B] hidden sm:table-cell">Annual</th>
                  <th className="text-left px-5 py-3 font-medium text-[#64748B]">Active</th>
                  <th className="text-right px-5 py-3 font-medium text-[#64748B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => {
                  const isEditing = editingPlan === plan.id
                  return (
                    <tr key={plan.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={planEdits.name}
                            onChange={(e) => setPlanEdits((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5]"
                          />
                        ) : (
                          <span className="font-medium text-[#1E293B]">{plan.name}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <input
                            type="text"
                            value={planEdits.slug}
                            onChange={(e) => setPlanEdits((prev) => ({ ...prev, slug: e.target.value }))}
                            className="w-full px-2 py-1.5 text-sm font-mono border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5]"
                          />
                        ) : (
                          <span className="text-[#64748B] font-mono text-xs">{plan.slug}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        {isEditing ? (
                          <input
                            type="number"
                            value={planEdits.max_users}
                            onChange={(e) => setPlanEdits((prev) => ({ ...prev, max_users: e.target.value }))}
                            className="w-20 px-2 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5]"
                          />
                        ) : (
                          <span className="text-[#1E293B]">{plan.max_users ?? '\u221E'}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={planEdits.monthly_price}
                            onChange={(e) => setPlanEdits((prev) => ({ ...prev, monthly_price: e.target.value }))}
                            className="w-24 px-2 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5]"
                          />
                        ) : (
                          <span className="text-[#1E293B]">{formatCurrency(plan.monthly_price)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={planEdits.annual_price}
                            onChange={(e) => setPlanEdits((prev) => ({ ...prev, annual_price: e.target.value }))}
                            className="w-24 px-2 py-1.5 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1978E5]/20 focus:border-[#1978E5]"
                          />
                        ) : (
                          <span className="text-[#1E293B]">{formatCurrency(plan.annual_price)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <label className="inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={planEdits.is_active}
                              onChange={(e) => setPlanEdits((prev) => ({ ...prev, is_active: e.target.checked }))}
                              className="sr-only"
                            />
                            <div className={`relative w-10 h-5 rounded-full transition-colors ${planEdits.is_active ? 'bg-[#22C55E]' : 'bg-neutral-300'}`}>
                              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${planEdits.is_active ? 'translate-x-5' : ''}`} />
                            </div>
                          </label>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                            {plan.is_active ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={cancelEditPlan}
                                className="px-3 py-1.5 text-xs font-medium text-[#64748B] bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSavePlan(plan.id)}
                                disabled={savingPlan === plan.id}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#1978E5] rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                              >
                                {savingPlan === plan.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                                Save
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startEditPlan(plan)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1978E5] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <Edit3 className="h-3 w-3" />
                              Edit
                            </button>
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
    </div>
  )
}
