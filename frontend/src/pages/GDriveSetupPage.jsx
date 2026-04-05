import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FolderOpen, Link2, Unlink, CheckCircle, Loader2,
  HardDrive, FileSpreadsheet, FolderPlus,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { getGoogleAuthUrl, exchangeCodeForTokens, createGDriveFolders, createLedgerSpreadsheet } from '../lib/google'
import Card, { CardTitle, CardDescription } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { GDRIVE_FOLDER_NAMES } from '../lib/constants'

export default function GDriveSetupPage() {
  const { user, profile, company, isGDriveConnected, updateProfile } = useAuth()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    // Handle OAuth callback
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    if (code && state === 'gdrive_connect') {
      handleOAuthCallback(code)
    }
  }, [searchParams])

  useEffect(() => {
    if (profile && isGDriveConnected) loadFolders()
  }, [profile, isGDriveConnected])

  // Auto-setup: if tokens exist from unified sign-in but Drive isn't connected yet
  useEffect(() => {
    if (
      profile &&
      !isGDriveConnected &&
      profile.gdrive_access_token &&
      !connecting &&
      !searchParams.get('code')
    ) {
      autoSetupDrive()
    }
  }, [profile, isGDriveConnected])

  const autoSetupDrive = async () => {
    setConnecting(true)
    try {
      const accessToken = profile.gdrive_access_token
      const { rootFolderId, folders: folderIds } = await createGDriveFolders(accessToken)
      const sheetId = await createLedgerSpreadsheet(accessToken, rootFolderId)

      await updateProfile({
        gdrive_connected: true,
        gdrive_root_folder_id: rootFolderId,
        gsheet_ledger_id: sheetId,
      })

      const folderRecords = Object.entries(folderIds).map(([type, gdriveId]) => ({
        company_id: company.id,
        user_id: profile.id,
        folder_type: type,
        gdrive_folder_id: gdriveId,
        folder_name: GDRIVE_FOLDER_NAMES[type] || type,
      }))
      await supabase.from('gdrive_folders').insert(folderRecords)

      toast.success('Drive Ready', 'Google Drive folders and ledger spreadsheet created')
    } catch (err) {
      toast.error('Setup Failed', err.message)
    } finally {
      setConnecting(false)
    }
  }

  const handleOAuthCallback = async (code) => {
    setConnecting(true)
    try {
      const tokens = await exchangeCodeForTokens(code)
      const { rootFolderId, folders: folderIds } = await createGDriveFolders(tokens.access_token)
      const sheetId = await createLedgerSpreadsheet(tokens.access_token, rootFolderId)

      await updateProfile({
        gdrive_connected: true,
        gdrive_access_token: tokens.access_token,
        gdrive_refresh_token: tokens.refresh_token,
        gdrive_token_expiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        gdrive_root_folder_id: rootFolderId,
        gsheet_ledger_id: sheetId,
      })

      // Save folder records
      const folderRecords = Object.entries(folderIds).map(([type, gdriveId]) => ({
        company_id: company.id,
        user_id: profile.id,
        folder_type: type,
        gdrive_folder_id: gdriveId,
        folder_name: GDRIVE_FOLDER_NAMES[type] || type,
      }))
      await supabase.from('gdrive_folders').insert(folderRecords)

      toast.success('Connected', 'Google Drive connected and folders created')
      window.history.replaceState({}, '', '/gdrive-setup')
    } catch (err) {
      toast.error('Connection Failed', err.message)
    } finally {
      setConnecting(false)
    }
  }

  const loadFolders = async () => {
    const { data } = await supabase
      .from('gdrive_folders')
      .select('*')
      .eq('company_id', company.id)
    setFolders(data || [])
  }

  const handleConnect = () => {
    window.location.href = getGoogleAuthUrl()
  }

  const handleDisconnect = async () => {
    try {
      await updateProfile({
        gdrive_connected: false,
        gdrive_access_token: null,
        gdrive_refresh_token: null,
        gdrive_token_expiry: null,
        gdrive_root_folder_id: null,
        gsheet_ledger_id: null,
      })
      await supabase.from('gdrive_folders').delete().eq('company_id', company.id)
      setFolders([])
      toast.success('Disconnected', 'Google Drive has been disconnected')
    } catch (err) {
      toast.error('Failed', err.message)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Google Drive</h1>
        <p className="text-neutral-500 mt-1">Connect your Google Drive for file sync and cloud storage</p>
      </div>

      {/* Connection status */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isGDriveConnected ? 'bg-green-50 text-green-500' : 'bg-neutral-100 text-neutral-400'}`}>
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Google Drive</CardTitle>
              <CardDescription>
                {isGDriveConnected
                  ? 'Connected and syncing'
                  : 'Connect to enable cloud storage and sync'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isGDriveConnected && (
              <Badge variant="success">
                <CheckCircle className="h-3 w-3 mr-1" />Connected
              </Badge>
            )}
            {isGDriveConnected ? (
              <Button variant="danger" size="sm" icon={Unlink} onClick={handleDisconnect}>
                Disconnect
              </Button>
            ) : (
              <Button icon={Link2} onClick={handleConnect} loading={connecting}>
                Connect Google Drive
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Folders */}
      {isGDriveConnected && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <FolderPlus className="h-5 w-5 text-primary-500" />
            <CardTitle>Drive Folders</CardTitle>
          </div>
          {folders.length === 0 ? (
            <p className="text-sm text-neutral-400">No folders found. They may still be creating.</p>
          ) : (
            <div className="space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200"
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-amber-500" />
                    <span className="text-sm text-neutral-700">{folder.folder_name}</span>
                  </div>
                  <span className="text-xs text-neutral-400 font-mono">{folder.gdrive_folder_id}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Ledger spreadsheet */}
      {isGDriveConnected && profile?.gsheet_ledger_id && (
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle>Account Ledger Spreadsheet</CardTitle>
                <CardDescription>Google Sheet with Expenses, Income, Reconciliation, and Summary tabs</CardDescription>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${profile.gsheet_ledger_id}`, '_blank')}
            >
              Open in Sheets
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
