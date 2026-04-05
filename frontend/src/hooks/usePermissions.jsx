import { useAuth } from './useAuth'

export function usePermissions() {
  const { companyRole } = useAuth()

  return {
    canView: !!companyRole,
    canUpload: !!companyRole,
    canEdit: ['owner', 'admin', 'accountant'].includes(companyRole),
    canDelete: ['owner', 'admin'].includes(companyRole),
    canManageUsers: ['owner', 'admin'].includes(companyRole),
    canManageBilling: companyRole === 'owner',
    canExport: ['owner', 'admin', 'accountant'].includes(companyRole),
    canGenerateStatements: ['owner', 'admin', 'accountant'].includes(companyRole),
    role: companyRole,
  }
}
