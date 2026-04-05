import { useState } from 'react'

const EFFECTIVE_DATE = 'April 5, 2026'
const LAST_UPDATED = 'April 5, 2026'
const CONTACT_EMAIL = 'support@buku555.online'
const SITE_URL = 'buku555.online'

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: [
      `By accessing or using the Buku 555 platform ("Service"), available at ${SITE_URL}, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you must not access or use the Service.`,
      'These Terms constitute a legally binding agreement between you ("User", "you", or "your") and Buku 555 ("we", "us", or "our"). Your continued use of the Service following the posting of any changes to these Terms constitutes acceptance of those changes.',
      'We recommend that you review these Terms periodically. If you are using the Service on behalf of an organisation, you represent and warrant that you have the authority to bind that organisation to these Terms.',
    ],
  },
  {
    id: 'description',
    title: '2. Description of Service',
    content: [
      'Buku 555 is an AI-powered accounting and bookkeeping platform designed to assist individuals and small businesses with their financial record-keeping. The Service provides the following core features:',
    ],
    list: [
      'Document processing and data extraction using artificial intelligence (powered by OpenAI GPT-4o)',
      'Integration with Google Drive for secure document storage and organisation',
      'Receipt scanning, categorisation, and ledger entry creation',
      'Bank statement parsing and transaction categorisation',
      'Bank reconciliation between ledger entries and bank transactions',
      'Invoice creation, management, and delivery',
      'Financial statement generation (cash flow, profit and loss, balance sheet)',
      'Client management for invoicing and record-keeping',
    ],
    additionalContent: [
      'The Service is provided as a tool to assist with bookkeeping tasks and is not a substitute for professional accounting, tax, or financial advice. Features and functionality may change, be updated, or be discontinued at our discretion.',
    ],
  },
  {
    id: 'registration',
    title: '3. Account Registration',
    content: [
      'To use the Service, you must register for an account. Account registration is conducted exclusively through Google OAuth (Sign in with Google). By registering, you agree to the following:',
    ],
    list: [
      'You must be at least 18 years of age to create an account and use the Service.',
      'You may only create and maintain one account per person.',
      'You must provide accurate and complete information during registration and keep your account information up to date.',
      'You are responsible for all activity that occurs under your account.',
      'You must not share your account credentials or allow others to access your account.',
      'By signing in with Google, you authorise us to access your Google profile information (name, email address, and profile picture) for account creation and management.',
    ],
    additionalContent: [
      'We reserve the right to refuse registration, suspend, or terminate any account at our sole discretion if we believe these Terms have been violated.',
    ],
  },
  {
    id: 'gdrive',
    title: '4. Google Drive Integration',
    content: [
      'The Service integrates with Google Drive to provide document storage and organisation. By connecting your Google Drive account, you acknowledge and agree to the following:',
    ],
    list: [
      'We will create a dedicated folder structure in your Google Drive for organising accounting documents, including folders for Receipts, Bank Statements, Invoices, Company Documents, Financial Statements, and Reference materials.',
      'All documents uploaded through the Service are stored in your personal Google Drive account. We do not store copies of your files on our servers beyond what is necessary for temporary processing.',
      'You retain full ownership and control of all files stored in your Google Drive. We do not claim any ownership rights over your documents.',
      'The Service requires Google Drive read and write permissions to upload, organise, and retrieve your documents. You may revoke these permissions at any time through your Google Account settings, though doing so will limit the functionality of the Service.',
      'We also request access to Google Sheets (for financial statement generation) and Gmail (for invoice delivery) as part of the Google integration.',
    ],
    additionalContent: [
      'You are responsible for maintaining sufficient storage space in your Google Drive account. The Service is not responsible for any issues arising from insufficient Google Drive storage or changes to Google Drive APIs or policies.',
    ],
  },
  {
    id: 'ai-processing',
    title: '5. AI Processing',
    content: [
      'The Service uses artificial intelligence, specifically OpenAI GPT-4o, to process documents and extract financial data. By using the Service, you acknowledge and agree to the following:',
    ],
    list: [
      'Documents you upload (receipts, bank statements, invoices, and other financial documents) are sent to OpenAI\'s API for processing and data extraction.',
      'The extracted data (such as merchant names, amounts, dates, categories, and line items) is stored in our database to provide the Service.',
      'AI processing is inherently probabilistic and may produce errors, inaccuracies, or incomplete results. Extracted data may contain incorrect amounts, misidentified merchants, wrong dates, or incorrect categorisation.',
      'You are solely responsible for reviewing, verifying, and correcting all AI-extracted data before relying on it for any financial, tax, or business decisions.',
      'We do not guarantee the accuracy, completeness, or reliability of any AI-generated results.',
      'AI models and processing capabilities may change over time, which could affect the quality or nature of results.',
    ],
    additionalContent: [
      'Important: AI-extracted data should always be treated as a starting point that requires human review. Never rely solely on AI-extracted data for tax filings, financial reporting, or other critical financial decisions without independent verification.',
    ],
  },
  {
    id: 'responsibilities',
    title: '6. User Responsibilities',
    content: [
      'As a user of the Service, you are responsible for the following:',
    ],
    list: [
      'Accuracy of Data: You are responsible for ensuring that all data entered into or processed through the Service is accurate and complete. This includes verifying AI-extracted data and making corrections where necessary.',
      'Legal Compliance: You must comply with all applicable local, state, national, and international laws and regulations relating to taxation, accounting, financial reporting, and business operations in your jurisdiction.',
      'Tax Obligations: The Service does not calculate, file, or remit taxes on your behalf. You are solely responsible for meeting all tax obligations, including but not limited to income tax, goods and services tax (GST/SST), and any other applicable taxes.',
      'Account Security: You are responsible for maintaining the security of your Google account, which is used to access the Service. You must notify us immediately of any unauthorised access to or use of your account.',
      'Backup: While documents are stored in your Google Drive, we recommend maintaining independent backups of all important financial records.',
      'Professional Advice: You should consult qualified accountants, tax advisors, or other financial professionals for advice specific to your circumstances.',
    ],
  },
  {
    id: 'data-ownership',
    title: '7. Data Ownership and Licence',
    content: [
      'You retain all ownership rights to your data. Specifically:',
    ],
    list: [
      'All documents, financial records, and data you upload to or create through the Service remain your property.',
      'All files stored in your Google Drive through the Service belong to you.',
      'We do not claim ownership of any user content or data.',
    ],
    additionalContent: [
      'By using the Service, you grant us a limited, non-exclusive, worldwide, royalty-free licence to access, process, store, and transmit your data solely for the purpose of providing and improving the Service. This licence includes the right to:',
    ],
    additionalList: [
      'Process your documents through AI services (OpenAI) for data extraction.',
      'Store extracted data in our database to provide the Service.',
      'Create and organise folders and files in your Google Drive on your behalf.',
      'Send invoices via email on your behalf when you initiate invoice delivery.',
    ],
    closingContent: [
      'This licence terminates when you delete your account or when we cease providing the Service, except as necessary to comply with legal obligations.',
    ],
  },
  {
    id: 'prohibited',
    title: '8. Prohibited Uses',
    content: [
      'You agree not to use the Service for any of the following purposes:',
    ],
    list: [
      'Fraud or Misrepresentation: Creating false, misleading, or fraudulent financial records, invoices, receipts, or other documents.',
      'Money Laundering: Using the Service to facilitate money laundering or the concealment of illegally obtained funds.',
      'Illegal Financial Activities: Engaging in any financial activity that violates applicable laws, including but not limited to tax evasion, embezzlement, or financial fraud.',
      'Unauthorised Access: Attempting to gain unauthorised access to the Service, other users\' accounts, or our systems and infrastructure.',
      'Reverse Engineering: Reverse engineering, decompiling, disassembling, or otherwise attempting to discover the source code or underlying algorithms of the Service.',
      'Interference: Interfering with or disrupting the Service, servers, or networks connected to the Service.',
      'Automated Access: Using bots, scrapers, or other automated means to access the Service without our prior written consent.',
      'Harmful Content: Uploading files containing viruses, malware, or other harmful code.',
      'Impersonation: Impersonating any person or entity, or falsely claiming an affiliation with any person or entity.',
    ],
    additionalContent: [
      'Violation of these prohibitions may result in immediate termination of your account and may be reported to the relevant authorities.',
    ],
  },
  {
    id: 'payment',
    title: '9. Payment Terms',
    content: [
      'The Service is currently offered free of charge during the beta period. By using the Service, you acknowledge and agree to the following:',
    ],
    list: [
      'The current free offering is provided on an "as is" basis during the beta period and may be subject to limitations, interruptions, or reduced functionality.',
      'We reserve the right to introduce paid plans, subscription tiers, or usage-based pricing at any time in the future.',
      'If paid plans are introduced, we will provide reasonable advance notice of pricing changes and give you the option to continue using the Service under the new terms or to discontinue use.',
      'Any future payment terms will be clearly communicated and will require your explicit acceptance before charges are applied.',
      'We reserve the right to offer different pricing plans with varying features and usage limits.',
    ],
  },
  {
    id: 'liability',
    title: '10. Limitation of Liability',
    content: [
      'To the maximum extent permitted by applicable law:',
    ],
    list: [
      'The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, whether express, implied, or statutory, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, and non-infringement.',
      'The Service is not a substitute for professional accounting, tax, or financial advice. We strongly recommend that you consult qualified professionals for all important financial decisions and tax matters.',
      'We are not liable for any errors, inaccuracies, or omissions in AI-processed data, including but not limited to incorrect amounts, misidentified merchants, wrong categorisations, or other data extraction errors.',
      'We are not liable for any financial losses, tax penalties, regulatory fines, or other damages resulting from your use of or reliance on the Service.',
      'We are not liable for any issues arising from Google Drive, Google Sheets, Gmail, or other third-party services, including but not limited to service outages, data loss, or changes to third-party APIs or terms.',
      'We are not liable for any indirect, incidental, special, consequential, or punitive damages, regardless of the cause of action or the theory of liability.',
      'All financial decisions, tax filings, and business operations undertaken based on data from the Service are entirely your responsibility.',
    ],
    additionalContent: [
      'In no event shall our total aggregate liability to you exceed the amount you have paid to us for the Service in the twelve (12) months preceding the event giving rise to the claim, or fifty Malaysian Ringgit (RM 50), whichever is greater.',
    ],
  },
  {
    id: 'indemnification',
    title: '11. Indemnification',
    content: [
      'You agree to indemnify, defend, and hold harmless Buku 555, its officers, directors, employees, agents, and affiliates from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in connection with:',
    ],
    list: [
      'Your use of or access to the Service.',
      'Your violation of these Terms.',
      'Your violation of any applicable law, regulation, or third-party rights.',
      'Any content or data you upload, submit, or transmit through the Service.',
      'Any financial decisions, tax filings, or business operations you undertake based on data from the Service.',
      'Any claim by a third party related to your use of the Service.',
    ],
    additionalContent: [
      'This indemnification obligation will survive the termination of your account and these Terms.',
    ],
  },
  {
    id: 'termination',
    title: '12. Termination',
    content: [
      'Either party may terminate this agreement as follows:',
    ],
    additionalContent: [
      'Termination by You:',
    ],
    list: [
      'You may delete your account at any time through the Settings page of the Service.',
      'Upon account deletion, your data stored in our database will be deleted in accordance with our Privacy Policy.',
      'Files stored in your Google Drive will remain in your Google Drive and are not affected by account deletion.',
      'You may revoke Google permissions at any time through your Google Account settings.',
    ],
    closingContent: [
      'Termination by Us: We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including but not limited to:',
    ],
    closingList: [
      'Violation of these Terms or any applicable laws.',
      'Engaging in prohibited uses as described in Section 8.',
      'Fraudulent, abusive, or harmful behaviour.',
      'Extended periods of inactivity.',
      'Discontinuation of the Service.',
    ],
    finalContent: [
      'Upon termination, your right to use the Service will immediately cease. Sections of these Terms that by their nature should survive termination (including but not limited to Limitation of Liability, Indemnification, and Governing Law) will continue to apply.',
    ],
  },
  {
    id: 'governing-law',
    title: '13. Governing Law and Jurisdiction',
    content: [
      'These Terms shall be governed by and construed in accordance with the laws of Malaysia, without regard to its conflict of law provisions.',
      'Any disputes arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of Malaysia.',
      'You agree to submit to the personal jurisdiction of the courts located in Malaysia for the purpose of resolving any such disputes.',
      'Notwithstanding the foregoing, we reserve the right to seek injunctive or other equitable relief in any court of competent jurisdiction to protect our intellectual property rights.',
    ],
  },
  {
    id: 'changes',
    title: '14. Changes to Terms',
    content: [
      'We reserve the right to modify, update, or replace these Terms at any time at our sole discretion. When we make changes:',
    ],
    list: [
      'We will update the "Last Updated" date at the top of these Terms.',
      'For material changes, we will make reasonable efforts to notify you via email or through a prominent notice on the Service.',
      'Your continued use of the Service after the effective date of any changes constitutes your acceptance of the revised Terms.',
      'If you do not agree to the revised Terms, you must discontinue use of the Service and delete your account.',
    ],
    additionalContent: [
      'We encourage you to review these Terms periodically to stay informed about our terms and conditions.',
    ],
  },
  {
    id: 'contact',
    title: '15. Contact Information',
    content: [
      'If you have any questions, concerns, or feedback regarding these Terms of Service, please contact us:',
    ],
    contactInfo: {
      email: CONTACT_EMAIL,
      platform: 'Buku 555',
      website: SITE_URL,
      location: 'Malaysia',
    },
    additionalContent: [
      'We aim to respond to all enquiries within a reasonable timeframe.',
    ],
  },
]

export default function TermsOfServicePage() {
  const [activeSection, setActiveSection] = useState(null)

  const handlePrint = () => {
    window.print()
  }

  const scrollToSection = (id) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-gray-800 hover:text-gray-600 transition-colors">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="text-sm font-medium">Back to Buku 555</span>
          </a>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-2.25 0h.008v.008h-.008V12z" />
            </svg>
            Print
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-4 lg:gap-12">
          {/* Sidebar navigation */}
          <nav className="hidden lg:block lg:col-span-1 print:hidden">
            <div className="sticky top-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                On this page
              </h3>
              <ul className="space-y-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`block w-full text-left text-sm py-1.5 px-3 rounded-md transition-colors ${
                        activeSection === section.id
                          ? 'text-blue-600 bg-blue-50 font-medium'
                          : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main content */}
          <main className="lg:col-span-3">
            {/* Title section */}
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                Terms of Service
              </h1>
              <p className="mt-2 text-lg text-gray-500">
                Buku 555 &mdash; AI-Powered Accounting Platform
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400">
                <span>
                  <span className="font-medium text-gray-500">Effective date:</span>{' '}
                  {EFFECTIVE_DATE}
                </span>
                <span>
                  <span className="font-medium text-gray-500">Last updated:</span>{' '}
                  {LAST_UPDATED}
                </span>
              </div>
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-blue-700 leading-relaxed">
                  Please read these Terms of Service carefully before using the Buku 555 platform.
                  By accessing or using our Service, you agree to be bound by these Terms. If you
                  do not agree, please do not use the Service.
                </p>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-10">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-8"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                    {section.title}
                  </h2>

                  {/* Main content paragraphs */}
                  {section.content && section.content.map((paragraph, idx) => (
                    <p key={idx} className="text-gray-600 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}

                  {/* Main list */}
                  {section.list && (
                    <ul className="space-y-3 mb-4">
                      {section.list.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          <span className="text-gray-600 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Additional content */}
                  {section.additionalContent && section.additionalContent.map((paragraph, idx) => (
                    <p key={`add-${idx}`} className="text-gray-600 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}

                  {/* Additional list */}
                  {section.additionalList && (
                    <ul className="space-y-3 mb-4">
                      {section.additionalList.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          <span className="text-gray-600 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Closing content */}
                  {section.closingContent && section.closingContent.map((paragraph, idx) => (
                    <p key={`close-${idx}`} className="text-gray-600 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}

                  {/* Closing list */}
                  {section.closingList && (
                    <ul className="space-y-3 mb-4">
                      {section.closingList.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          <span className="text-gray-600 leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Final content */}
                  {section.finalContent && section.finalContent.map((paragraph, idx) => (
                    <p key={`final-${idx}`} className="text-gray-600 leading-relaxed mb-4">
                      {paragraph}
                    </p>
                  ))}

                  {/* Contact info block */}
                  {section.contactInfo && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-4">
                      <dl className="space-y-3">
                        <div className="flex items-start gap-3">
                          <dt className="text-sm font-medium text-gray-500 w-20 flex-shrink-0">Email</dt>
                          <dd>
                            <a
                              href={`mailto:${section.contactInfo.email}`}
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              {section.contactInfo.email}
                            </a>
                          </dd>
                        </div>
                        <div className="flex items-start gap-3">
                          <dt className="text-sm font-medium text-gray-500 w-20 flex-shrink-0">Platform</dt>
                          <dd className="text-sm text-gray-600">{section.contactInfo.platform}</dd>
                        </div>
                        <div className="flex items-start gap-3">
                          <dt className="text-sm font-medium text-gray-500 w-20 flex-shrink-0">Website</dt>
                          <dd>
                            <a
                              href={`https://${section.contactInfo.website}`}
                              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {section.contactInfo.website}
                            </a>
                          </dd>
                        </div>
                        <div className="flex items-start gap-3">
                          <dt className="text-sm font-medium text-gray-500 w-20 flex-shrink-0">Location</dt>
                          <dd className="text-sm text-gray-600">{section.contactInfo.location}</dd>
                        </div>
                      </dl>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Buku 555. All rights reserved.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    These terms were last updated on {LAST_UPDATED}.
                  </p>
                </div>
                <div className="flex items-center gap-4 print:hidden">
                  <a
                    href="/privacy"
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
