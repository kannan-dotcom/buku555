export const APP_NAME = 'Buku 555'
export const APP_TAGLINE = 'AI-Powered Accounting'

export const GDRIVE_FOLDER_TYPES = {
  RECEIPTS: 'receipts',
  BANK_STATEMENTS: 'bank_statements',
  INVOICES_SENT: 'invoices_sent',
  COMPANY_DOCUMENTS: 'company_documents',
  FINANCIAL_STATEMENTS: 'financial_statements',
  REFERENCE: 'reference',
}

export const GDRIVE_FOLDER_NAMES = {
  [GDRIVE_FOLDER_TYPES.RECEIPTS]: 'Receipts',
  [GDRIVE_FOLDER_TYPES.BANK_STATEMENTS]: 'Bank Statements',
  [GDRIVE_FOLDER_TYPES.INVOICES_SENT]: 'Invoices Sent',
  [GDRIVE_FOLDER_TYPES.COMPANY_DOCUMENTS]: 'Company Documents',
  [GDRIVE_FOLDER_TYPES.FINANCIAL_STATEMENTS]: 'Financial Statements',
  [GDRIVE_FOLDER_TYPES.REFERENCE]: 'Reference',
}

export const PAYMENT_TYPES = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'ewallet', label: 'E-Wallet' },
  { value: 'cheque', label: 'Cheque' },
]

export const CURRENCIES = [
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'THB', label: 'THB - Thai Baht' },
  { value: 'PHP', label: 'PHP - Philippine Peso' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'AED', label: 'AED - UAE Dirham' },
]

export const LEDGER_STATUS = {
  COMPLETE: 'complete',
  UPDATE_NEEDED: 'update_needed',
  SUSPENSE: 'suspense',
}

export const RECONCILIATION_STATUS = {
  MATCHED: 'matched',
  UNMATCHED: 'unmatched',
  PARTIAL: 'partial',
  INCOMPLETE: 'incomplete',
}

export const ENTRY_TYPES = {
  EXPENSE: 'expense',
  INCOME: 'income',
  TRANSFER: 'transfer',
}

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
}

export const COMPANY_DOC_TYPES = [
  { value: 'ssm', label: 'SSM Registration' },
  { value: 'tax_registration', label: 'Tax Registration' },
  { value: 'moa', label: 'Memorandum of Association' },
  { value: 'director_id', label: "Director's ID" },
  { value: 'director_passport', label: "Director's Passport" },
  { value: 'business_license', label: 'Business License' },
  { value: 'bank_mandate', label: 'Bank Mandate' },
  { value: 'other', label: 'Other' },
]

export const STATEMENT_TYPES = {
  CASHFLOW: 'cashflow',
  INCOME: 'income',
  PROFIT_LOSS: 'profit_loss',
  BALANCE_SHEET: 'balance_sheet',
}

export const ACCEPTED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/webp'],
  documents: ['application/pdf'],
  spreadsheets: [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
}

export const MAX_FILE_SIZE_MB = 25
