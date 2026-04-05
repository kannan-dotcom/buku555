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

// Common currencies shown first, then full ISO 4217 list
export const COMMON_CURRENCIES = [
  'MYR', 'USD', 'SGD', 'EUR', 'GBP', 'AUD', 'JPY', 'CNY', 'HKD', 'IDR', 'THB', 'PHP', 'INR', 'AED',
]

export const ALL_CURRENCIES = [
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'AFN', label: 'AFN - Afghan Afghani' },
  { value: 'ALL', label: 'ALL - Albanian Lek' },
  { value: 'AMD', label: 'AMD - Armenian Dram' },
  { value: 'ANG', label: 'ANG - Netherlands Antillean Guilder' },
  { value: 'AOA', label: 'AOA - Angolan Kwanza' },
  { value: 'ARS', label: 'ARS - Argentine Peso' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'AWG', label: 'AWG - Aruban Florin' },
  { value: 'AZN', label: 'AZN - Azerbaijani Manat' },
  { value: 'BAM', label: 'BAM - Bosnia-Herzegovina Convertible Mark' },
  { value: 'BBD', label: 'BBD - Barbadian Dollar' },
  { value: 'BDT', label: 'BDT - Bangladeshi Taka' },
  { value: 'BGN', label: 'BGN - Bulgarian Lev' },
  { value: 'BHD', label: 'BHD - Bahraini Dinar' },
  { value: 'BIF', label: 'BIF - Burundian Franc' },
  { value: 'BMD', label: 'BMD - Bermudan Dollar' },
  { value: 'BND', label: 'BND - Brunei Dollar' },
  { value: 'BOB', label: 'BOB - Bolivian Boliviano' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'BSD', label: 'BSD - Bahamian Dollar' },
  { value: 'BTN', label: 'BTN - Bhutanese Ngultrum' },
  { value: 'BWP', label: 'BWP - Botswanan Pula' },
  { value: 'BYN', label: 'BYN - Belarusian Ruble' },
  { value: 'BZD', label: 'BZD - Belize Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'CDF', label: 'CDF - Congolese Franc' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CLP', label: 'CLP - Chilean Peso' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'COP', label: 'COP - Colombian Peso' },
  { value: 'CRC', label: 'CRC - Costa Rican Colón' },
  { value: 'CUP', label: 'CUP - Cuban Peso' },
  { value: 'CVE', label: 'CVE - Cape Verdean Escudo' },
  { value: 'CZK', label: 'CZK - Czech Koruna' },
  { value: 'DJF', label: 'DJF - Djiboutian Franc' },
  { value: 'DKK', label: 'DKK - Danish Krone' },
  { value: 'DOP', label: 'DOP - Dominican Peso' },
  { value: 'DZD', label: 'DZD - Algerian Dinar' },
  { value: 'EGP', label: 'EGP - Egyptian Pound' },
  { value: 'ERN', label: 'ERN - Eritrean Nakfa' },
  { value: 'ETB', label: 'ETB - Ethiopian Birr' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'FJD', label: 'FJD - Fijian Dollar' },
  { value: 'FKP', label: 'FKP - Falkland Islands Pound' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'GEL', label: 'GEL - Georgian Lari' },
  { value: 'GHS', label: 'GHS - Ghanaian Cedi' },
  { value: 'GIP', label: 'GIP - Gibraltar Pound' },
  { value: 'GMD', label: 'GMD - Gambian Dalasi' },
  { value: 'GNF', label: 'GNF - Guinean Franc' },
  { value: 'GTQ', label: 'GTQ - Guatemalan Quetzal' },
  { value: 'GYD', label: 'GYD - Guyanaese Dollar' },
  { value: 'HKD', label: 'HKD - Hong Kong Dollar' },
  { value: 'HNL', label: 'HNL - Honduran Lempira' },
  { value: 'HRK', label: 'HRK - Croatian Kuna' },
  { value: 'HTG', label: 'HTG - Haitian Gourde' },
  { value: 'HUF', label: 'HUF - Hungarian Forint' },
  { value: 'IDR', label: 'IDR - Indonesian Rupiah' },
  { value: 'ILS', label: 'ILS - Israeli New Shekel' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'IQD', label: 'IQD - Iraqi Dinar' },
  { value: 'IRR', label: 'IRR - Iranian Rial' },
  { value: 'ISK', label: 'ISK - Icelandic Króna' },
  { value: 'JMD', label: 'JMD - Jamaican Dollar' },
  { value: 'JOD', label: 'JOD - Jordanian Dinar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'KES', label: 'KES - Kenyan Shilling' },
  { value: 'KGS', label: 'KGS - Kyrgystani Som' },
  { value: 'KHR', label: 'KHR - Cambodian Riel' },
  { value: 'KMF', label: 'KMF - Comorian Franc' },
  { value: 'KPW', label: 'KPW - North Korean Won' },
  { value: 'KRW', label: 'KRW - South Korean Won' },
  { value: 'KWD', label: 'KWD - Kuwaiti Dinar' },
  { value: 'KYD', label: 'KYD - Cayman Islands Dollar' },
  { value: 'KZT', label: 'KZT - Kazakhstani Tenge' },
  { value: 'LAK', label: 'LAK - Laotian Kip' },
  { value: 'LBP', label: 'LBP - Lebanese Pound' },
  { value: 'LKR', label: 'LKR - Sri Lankan Rupee' },
  { value: 'LRD', label: 'LRD - Liberian Dollar' },
  { value: 'LSL', label: 'LSL - Lesotho Loti' },
  { value: 'LYD', label: 'LYD - Libyan Dinar' },
  { value: 'MAD', label: 'MAD - Moroccan Dirham' },
  { value: 'MDL', label: 'MDL - Moldovan Leu' },
  { value: 'MGA', label: 'MGA - Malagasy Ariary' },
  { value: 'MKD', label: 'MKD - Macedonian Denar' },
  { value: 'MMK', label: 'MMK - Myanmar Kyat' },
  { value: 'MNT', label: 'MNT - Mongolian Tugrik' },
  { value: 'MOP', label: 'MOP - Macanese Pataca' },
  { value: 'MRU', label: 'MRU - Mauritanian Ouguiya' },
  { value: 'MUR', label: 'MUR - Mauritian Rupee' },
  { value: 'MVR', label: 'MVR - Maldivian Rufiyaa' },
  { value: 'MWK', label: 'MWK - Malawian Kwacha' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'MYR', label: 'MYR - Malaysian Ringgit' },
  { value: 'MZN', label: 'MZN - Mozambican Metical' },
  { value: 'NAD', label: 'NAD - Namibian Dollar' },
  { value: 'NGN', label: 'NGN - Nigerian Naira' },
  { value: 'NIO', label: 'NIO - Nicaraguan Córdoba' },
  { value: 'NOK', label: 'NOK - Norwegian Krone' },
  { value: 'NPR', label: 'NPR - Nepalese Rupee' },
  { value: 'NZD', label: 'NZD - New Zealand Dollar' },
  { value: 'OMR', label: 'OMR - Omani Rial' },
  { value: 'PAB', label: 'PAB - Panamanian Balboa' },
  { value: 'PEN', label: 'PEN - Peruvian Sol' },
  { value: 'PGK', label: 'PGK - Papua New Guinean Kina' },
  { value: 'PHP', label: 'PHP - Philippine Peso' },
  { value: 'PKR', label: 'PKR - Pakistani Rupee' },
  { value: 'PLN', label: 'PLN - Polish Zloty' },
  { value: 'PYG', label: 'PYG - Paraguayan Guarani' },
  { value: 'QAR', label: 'QAR - Qatari Riyal' },
  { value: 'RON', label: 'RON - Romanian Leu' },
  { value: 'RSD', label: 'RSD - Serbian Dinar' },
  { value: 'RUB', label: 'RUB - Russian Ruble' },
  { value: 'RWF', label: 'RWF - Rwandan Franc' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
  { value: 'SBD', label: 'SBD - Solomon Islands Dollar' },
  { value: 'SCR', label: 'SCR - Seychellois Rupee' },
  { value: 'SDG', label: 'SDG - Sudanese Pound' },
  { value: 'SEK', label: 'SEK - Swedish Krona' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'SHP', label: 'SHP - Saint Helena Pound' },
  { value: 'SLE', label: 'SLE - Sierra Leonean Leone' },
  { value: 'SOS', label: 'SOS - Somali Shilling' },
  { value: 'SRD', label: 'SRD - Surinamese Dollar' },
  { value: 'SSP', label: 'SSP - South Sudanese Pound' },
  { value: 'STN', label: 'STN - São Tomé and Príncipe Dobra' },
  { value: 'SYP', label: 'SYP - Syrian Pound' },
  { value: 'SZL', label: 'SZL - Swazi Lilangeni' },
  { value: 'THB', label: 'THB - Thai Baht' },
  { value: 'TJS', label: 'TJS - Tajikistani Somoni' },
  { value: 'TMT', label: 'TMT - Turkmenistani Manat' },
  { value: 'TND', label: 'TND - Tunisian Dinar' },
  { value: 'TOP', label: 'TOP - Tongan Paʻanga' },
  { value: 'TRY', label: 'TRY - Turkish Lira' },
  { value: 'TTD', label: 'TTD - Trinidad and Tobago Dollar' },
  { value: 'TWD', label: 'TWD - New Taiwan Dollar' },
  { value: 'TZS', label: 'TZS - Tanzanian Shilling' },
  { value: 'UAH', label: 'UAH - Ukrainian Hryvnia' },
  { value: 'UGX', label: 'UGX - Ugandan Shilling' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'UYU', label: 'UYU - Uruguayan Peso' },
  { value: 'UZS', label: 'UZS - Uzbekistan Som' },
  { value: 'VES', label: 'VES - Venezuelan Bolívar' },
  { value: 'VND', label: 'VND - Vietnamese Dong' },
  { value: 'VUV', label: 'VUV - Vanuatu Vatu' },
  { value: 'WST', label: 'WST - Samoan Tala' },
  { value: 'XAF', label: 'XAF - CFA Franc BEAC' },
  { value: 'XCD', label: 'XCD - East Caribbean Dollar' },
  { value: 'XOF', label: 'XOF - CFA Franc BCEAO' },
  { value: 'XPF', label: 'XPF - CFP Franc' },
  { value: 'YER', label: 'YER - Yemeni Rial' },
  { value: 'ZAR', label: 'ZAR - South African Rand' },
  { value: 'ZMW', label: 'ZMW - Zambian Kwacha' },
  { value: 'ZWL', label: 'ZWL - Zimbabwean Dollar' },
]

// Sorted with common currencies first, then alphabetical
export const CURRENCIES = [
  ...ALL_CURRENCIES.filter(c => COMMON_CURRENCIES.includes(c.value)),
  { value: '__divider__', label: '──────────────', disabled: true },
  ...ALL_CURRENCIES.filter(c => !COMMON_CURRENCIES.includes(c.value)),
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

export const COMPANY_TYPES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sdn_bhd', label: 'Sdn Bhd' },
  { value: 'berhad', label: 'Berhad' },
]

export const COMPANY_ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'user', label: 'User' },
]

export const MOA_REQUIRED_TYPES = ['sdn_bhd', 'berhad']
