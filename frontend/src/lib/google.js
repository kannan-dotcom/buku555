const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.send',
].join(' ')

export function getGoogleAuthUrl() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state: 'gdrive_connect',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForTokens(code) {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gdrive-auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, redirect_uri: GOOGLE_REDIRECT_URI }),
  })
  if (!response.ok) throw new Error('Failed to exchange authorization code')
  return response.json()
}

export async function createGDriveFolders(accessToken) {
  const rootFolder = await createFolder(accessToken, 'Buku 555', null)
  const folderNames = [
    'Receipts',
    'Bank Statements',
    'Invoices Sent',
    'Company Documents',
    'Financial Statements',
    'Reference',
  ]
  const folders = {}
  for (const name of folderNames) {
    const folder = await createFolder(accessToken, name, rootFolder.id)
    const key = name.toLowerCase().replace(/ /g, '_')
    folders[key] = folder.id
  }
  return { rootFolderId: rootFolder.id, folders }
}

async function createFolder(accessToken, name, parentId) {
  const metadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  }
  if (parentId) metadata.parents = [parentId]

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  })
  if (!response.ok) throw new Error(`Failed to create folder: ${name}`)
  return response.json()
}

export async function createLedgerSpreadsheet(accessToken, rootFolderId) {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: 'Buku 555 — Account Ledger' },
      sheets: [
        {
          properties: { title: 'Expenses', index: 0 },
          data: [{
            startRow: 0, startColumn: 0,
            rowData: [{
              values: [
                'Date', 'Merchant', 'Tax Reg No', 'E-Invoice No',
                'Currency', 'Payment Type', 'Amount', 'SST/VAT', 'Total',
                'Category', 'Status',
              ].map(v => ({ userEnteredValue: { stringValue: v } })),
            }],
          }],
        },
        {
          properties: { title: 'Income', index: 1 },
          data: [{
            startRow: 0, startColumn: 0,
            rowData: [{
              values: [
                'Date', 'Client', 'Invoice No', 'Currency',
                'Amount', 'Tax', 'Total', 'Status',
              ].map(v => ({ userEnteredValue: { stringValue: v } })),
            }],
          }],
        },
        {
          properties: { title: 'Bank Reconciliation', index: 2 },
          data: [{
            startRow: 0, startColumn: 0,
            rowData: [{
              values: [
                'Date', 'Description', 'Debit', 'Credit',
                'Balance', 'Matched Entry', 'Status',
              ].map(v => ({ userEnteredValue: { stringValue: v } })),
            }],
          }],
        },
        {
          properties: { title: 'Suspense List', index: 3 },
          data: [{
            startRow: 0, startColumn: 0,
            rowData: [{
              values: [
                'Date', 'Description', 'Amount', 'Issue', 'Action Needed',
              ].map(v => ({ userEnteredValue: { stringValue: v } })),
            }],
          }],
        },
        { properties: { title: 'Summary', index: 4 } },
      ],
    }),
  })
  if (!response.ok) throw new Error('Failed to create ledger spreadsheet')
  const sheet = await response.json()

  // Move spreadsheet to Buku 555 root folder
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${sheet.spreadsheetId}?addParents=${rootFolderId}&fields=id,parents`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  return sheet.spreadsheetId
}

export async function uploadToGDrive(accessToken, folderId, file) {
  const metadata = {
    name: file.name,
    parents: [folderId],
  }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', file)

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,thumbnailLink',
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    }
  )
  if (!response.ok) throw new Error('Failed to upload file to Google Drive')
  return response.json()
}

export async function listGDriveFiles(accessToken, folderId) {
  const query = `'${folderId}' in parents and trashed = false`
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,createdTime,webViewLink,thumbnailLink)&orderBy=createdTime desc`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )
  if (!response.ok) throw new Error('Failed to list Google Drive files')
  const data = await response.json()
  return data.files || []
}
