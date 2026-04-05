import { useState, useEffect } from "react";

const COUNTRIES = {
  MY: "Malaysia",
  AE: "UAE",
  ID: "Indonesia",
  IN: "India",
  GLOBAL: "Global",
};

const COUNTRY_CODES_MAP = {
  MY: "MY",
  AE: "AE",
  ID: "ID",
  IN: "IN",
};

const EFFECTIVE_DATE = "April 5, 2026";
const LAST_UPDATED = "April 5, 2026";

function getPolicyContent(country) {
  const common = {
    companyName: "Buku 555",
    website: "buku555.online",
    contactEmail: "support@buku555.online",
    effectiveDate: EFFECTIVE_DATE,
    lastUpdated: LAST_UPDATED,
  };

  const policies = {
    MY: {
      title: "Privacy Policy — Malaysia",
      jurisdiction: "Malaysia",
      lawBadges: [
        "Personal Data Protection Act 2010 (PDPA)",
        "Communications and Multimedia Act 1998",
      ],
      sections: [
        {
          heading: "1. Introduction",
          content: `This Privacy Policy explains how ${common.companyName} ("we", "us", or "our"), an AI-powered accounting and bookkeeping platform accessible at ${common.website}, collects, uses, stores, and protects your personal data. We are a company registered and operating in Malaysia. This policy is governed by and complies with the Malaysian Personal Data Protection Act 2010 (PDPA), the Communications and Multimedia Act 1998, and applicable digital content regulations in Malaysia. By using our platform, you consent to the practices described in this policy as required under Section 6 of the PDPA.`,
        },
        {
          heading: "2. Data We Collect",
          content: null,
          subsections: [
            {
              subheading: "2.1 Account Data",
              text: "When you sign in via Google OAuth, we collect your Google profile information including your name, email address, and profile picture. This constitutes personal data under Section 4 of the PDPA.",
            },
            {
              subheading: "2.2 Financial Documents",
              text: "You may upload or provide access to financial documents including receipts, bank statements, invoices, and other accounting records. These documents may contain sensitive financial data.",
            },
            {
              subheading: "2.3 Company Documents",
              text: "Business registration documents, company profiles, SSM records, and other corporate information you provide for bookkeeping purposes.",
            },
            {
              subheading: "2.4 Google Drive Data",
              text: "With your explicit consent, we access and store data in your Google Drive account, including spreadsheets, folders, and files created or managed by our platform.",
            },
          ],
        },
        {
          heading: "3. How We Use Your Data",
          content: null,
          subsections: [
            {
              subheading: "3.1 AI Processing",
              text: "We use OpenAI GPT-4o to process and extract information from your uploaded documents. This includes optical character recognition (OCR), data extraction from receipts, bank statements, and invoices, and automated categorisation of financial transactions. Under the PDPA, this processing is carried out for the purpose of providing accounting services to you.",
            },
            {
              subheading: "3.2 Google Drive Storage",
              text: "Financial records, generated reports, and accounting documents are stored in your own Google Drive account. We create and manage folders and spreadsheets on your behalf.",
            },
            {
              subheading: "3.3 Accounting and Bookkeeping Automation",
              text: "Your data is used to automate ledger entries, generate financial statements, perform bank reconciliation, and produce accounting reports as part of our core service.",
            },
          ],
        },
        {
          heading: "4. Data Storage and Security",
          content: null,
          subsections: [
            {
              subheading: "4.1 Supabase (Cloud Database)",
              text: "We use Supabase as our primary cloud database to store account information, metadata, and application data. Supabase employs industry-standard encryption and security measures. As required by the PDPA, we take practical steps to protect your personal data from loss, misuse, and unauthorised access.",
            },
            {
              subheading: "4.2 Google Drive (User's Own Account)",
              text: "Your financial documents and generated reports are stored in your own Google Drive account, giving you direct control over your data.",
            },
            {
              subheading: "4.3 Encrypted Tokens",
              text: "Authentication tokens and API credentials are encrypted at rest and in transit. We use industry-standard encryption protocols to protect all sensitive credentials, in compliance with Section 9 of the PDPA (Security Principle).",
            },
          ],
        },
        {
          heading: "5. Third-Party Services",
          content:
            "We integrate with the following third-party services to provide our platform. Each service has its own privacy policy, and we encourage you to review them:",
          list: [
            "Google — OAuth authentication, Google Drive file storage, Google Sheets for accounting records, and Gmail integration for notifications and document sharing.",
            "OpenAI — AI-powered document extraction and processing via the GPT-4o model. Document data is sent to OpenAI's API for processing. OpenAI's data usage policies apply.",
            "Supabase — Cloud database hosting, user authentication management, and real-time data services.",
            "Resend — Transactional email delivery for account notifications, reports, and communications.",
          ],
        },
        {
          heading: "6. Data Retention",
          content:
            "We retain your personal data only for as long as necessary to fulfil the purposes for which it was collected, as required under Section 10 of the PDPA (Retention Principle). Account data is retained while your account is active and for a reasonable period after closure. Financial documents and records are retained in accordance with Malaysian Companies Act 2016 requirements (minimum 7 years for accounting records). You may request deletion of your data at any time by contacting us at support@buku555.online. Upon account deletion, we will remove your data from our systems within 30 days, except where retention is required by law.",
        },
        {
          heading: "7. Your Rights Under the PDPA",
          content:
            "Under the Malaysian Personal Data Protection Act 2010, you have the following rights:",
          list: [
            "Right of Access (Section 12) — You may request access to your personal data held by us.",
            "Right of Correction (Section 34) — You may request correction of any inaccurate or incomplete personal data.",
            "Right to Withdraw Consent — You may withdraw your consent for data processing at any time, subject to legal and contractual restrictions.",
            "Right to Prevent Processing — You may request that we cease processing your data in certain circumstances.",
            "Right to Complain — You may lodge a complaint with the Department of Personal Data Protection Malaysia if you believe your data has been mishandled.",
          ],
        },
        {
          heading: "8. Cookies and Tracking",
          content:
            "We use minimal tracking technologies. Our platform uses authentication tokens stored in your browser to maintain your login session. We do not use third-party advertising cookies or tracking pixels. Session data is limited to what is necessary for the platform to function, in line with the Communications and Multimedia Act 1998.",
        },
        {
          heading: "9. Children's Privacy",
          content:
            "Our platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If we become aware that we have collected data from a person under 18, we will take steps to delete that information promptly.",
        },
        {
          heading: "10. Changes to This Policy",
          content:
            "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. For material changes, we will notify registered users via email. Your continued use of the platform after changes are posted constitutes your acceptance of the revised policy.",
        },
        {
          heading: "11. Contact Information",
          content: `If you have questions about this Privacy Policy, wish to exercise your rights under the PDPA, or need to report a data concern, please contact us at: support@buku555.online. You may also contact the Department of Personal Data Protection Malaysia (JPDP) at www.pdp.gov.my for regulatory enquiries.`,
        },
      ],
    },

    AE: {
      title: "Privacy Policy — United Arab Emirates",
      jurisdiction: "United Arab Emirates",
      lawBadges: [
        "Federal Decree-Law No. 45 of 2021 (Data Protection)",
        "Federal Decree-Law No. 34 of 2021 (Cybercrime Law)",
        "DIFC Data Protection Law",
      ],
      sections: [
        {
          heading: "1. Introduction",
          content: `This Privacy Policy explains how ${common.companyName} ("we", "us", or "our"), an AI-powered accounting and bookkeeping platform accessible at ${common.website}, collects, uses, stores, and protects your personal data. We are a company registered in Malaysia and provide services to users in the United Arab Emirates. This policy complies with Federal Decree-Law No. 45 of 2021 on Personal Data Protection, the UAE Cybercrime Law (Federal Decree-Law No. 34 of 2021), and, where applicable, the DIFC Data Protection Law. By using our platform, you provide your consent as required under Article 5 of Federal Decree-Law No. 45 of 2021.`,
        },
        {
          heading: "2. Data We Collect",
          content: null,
          subsections: [
            {
              subheading: "2.1 Account Data",
              text: "When you sign in via Google OAuth, we collect your Google profile information including your name, email address, and profile picture. This constitutes personal data under Article 1 of Federal Decree-Law No. 45 of 2021.",
            },
            {
              subheading: "2.2 Financial Documents",
              text: "You may upload or provide access to financial documents including receipts, bank statements, invoices, and other accounting records. These may include sensitive data subject to enhanced protections under UAE law.",
            },
            {
              subheading: "2.3 Company Documents",
              text: "Business registration documents, trade licence records, company profiles, and other corporate information you provide for bookkeeping purposes.",
            },
            {
              subheading: "2.4 Google Drive Data",
              text: "With your explicit consent, we access and store data in your Google Drive account, including spreadsheets, folders, and files created or managed by our platform.",
            },
          ],
        },
        {
          heading: "3. How We Use Your Data",
          content: null,
          subsections: [
            {
              subheading: "3.1 AI Processing",
              text: "We use OpenAI GPT-4o to process and extract information from your uploaded documents. This includes optical character recognition (OCR), data extraction, and automated categorisation of financial transactions. This processing is carried out on a lawful basis under Article 5 of Federal Decree-Law No. 45 of 2021.",
            },
            {
              subheading: "3.2 Google Drive Storage",
              text: "Financial records, generated reports, and accounting documents are stored in your own Google Drive account.",
            },
            {
              subheading: "3.3 Accounting and Bookkeeping Automation",
              text: "Your data is used to automate ledger entries, generate financial statements, perform bank reconciliation, and produce VAT-compliant accounting reports.",
            },
          ],
        },
        {
          heading: "4. Data Storage and Security",
          content: null,
          subsections: [
            {
              subheading: "4.1 Supabase (Cloud Database)",
              text: "We use Supabase as our primary cloud database. All data is encrypted at rest and in transit, meeting the security standards expected under Article 7 of Federal Decree-Law No. 45 of 2021.",
            },
            {
              subheading: "4.2 Google Drive (User's Own Account)",
              text: "Your financial documents and generated reports are stored in your own Google Drive account, giving you direct control over your data.",
            },
            {
              subheading: "4.3 Encrypted Tokens",
              text: "Authentication tokens and API credentials are encrypted using industry-standard protocols. We implement appropriate technical and organisational measures as required under UAE data protection law.",
            },
          ],
        },
        {
          heading: "5. Third-Party Services",
          content:
            "We integrate with the following third-party services. Each has its own privacy policy:",
          list: [
            "Google — OAuth authentication, Google Drive, Google Sheets, and Gmail integration.",
            "OpenAI — AI-powered document extraction via GPT-4o. Data sent to OpenAI is processed under their data usage policies.",
            "Supabase — Cloud database and authentication services.",
            "Resend — Transactional email delivery.",
          ],
        },
        {
          heading: "6. Cross-Border Data Transfers",
          content:
            "As our company is based in Malaysia, your data may be transferred outside the UAE. Under Article 22 of Federal Decree-Law No. 45 of 2021, cross-border data transfers are permitted where adequate safeguards are in place. We ensure that all international transfers comply with UAE data protection requirements and that receiving jurisdictions provide an adequate level of data protection.",
        },
        {
          heading: "7. Data Retention",
          content:
            "We retain your personal data only for as long as necessary for the purposes outlined in this policy. Account data is retained while your account is active. Financial records are retained as required under UAE Commercial Transactions Law. You may request deletion of your data at any time by contacting support@buku555.online. Data will be removed within 30 days of a valid request, except where retention is required by law.",
        },
        {
          heading: "8. Your Rights Under UAE Law",
          content:
            "Under Federal Decree-Law No. 45 of 2021, you have the following rights:",
          list: [
            "Right of Access (Article 13) — You may request access to your personal data.",
            "Right of Correction (Article 14) — You may request correction of inaccurate or incomplete data.",
            "Right to Erasure — You may request deletion of your personal data, subject to legal retention requirements.",
            "Right to Restrict Processing — You may request restriction of processing in certain circumstances.",
            "Right to Data Portability — You may request a copy of your data in a machine-readable format.",
            "Right to Object — You may object to processing of your personal data in certain circumstances.",
            "Right to Complain — You may file a complaint with the UAE Data Office.",
          ],
        },
        {
          heading: "9. Cookies and Tracking",
          content:
            "We use minimal tracking technologies. Our platform uses authentication tokens to maintain your login session. We do not use third-party advertising cookies or tracking pixels.",
        },
        {
          heading: "10. Children's Privacy",
          content:
            "Our platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. If we become aware that data has been collected from a minor, we will delete it promptly.",
        },
        {
          heading: "11. Changes to This Policy",
          content:
            "We may update this Privacy Policy periodically. Changes will be posted on this page with an updated date. Material changes will be notified to registered users via email. Continued use after changes constitutes acceptance of the revised policy.",
        },
        {
          heading: "12. Contact Information",
          content: `For questions about this policy, to exercise your rights, or to report a data concern, contact us at: support@buku555.online. For regulatory matters, you may contact the UAE Data Office established under Federal Decree-Law No. 45 of 2021.`,
        },
      ],
    },

    ID: {
      title: "Privacy Policy — Indonesia",
      jurisdiction: "Indonesia",
      lawBadges: [
        "UU PDP No. 27 of 2022 (Personal Data Protection Law)",
        "Government Regulation No. 71 of 2019 (Electronic Systems)",
      ],
      sections: [
        {
          heading: "1. Introduction",
          content: `This Privacy Policy explains how ${common.companyName} ("we", "us", or "our"), an AI-powered accounting and bookkeeping platform accessible at ${common.website}, collects, uses, stores, and protects your personal data. We are a company registered in Malaysia providing services to users in Indonesia. This policy complies with the Indonesian Personal Data Protection Law (Undang-Undang Perlindungan Data Pribadi / UU PDP) No. 27 of 2022 and Government Regulation No. 71 of 2019 concerning the Implementation of Electronic Systems and Transactions. By using our platform, you provide consent in accordance with Article 20 of UU PDP.`,
        },
        {
          heading: "2. Data We Collect",
          content: null,
          subsections: [
            {
              subheading: "2.1 Account Data (Data Pribadi Umum)",
              text: "When you sign in via Google OAuth, we collect your Google profile information including name, email address, and profile picture. Under UU PDP, this constitutes general personal data (data pribadi yang bersifat umum).",
            },
            {
              subheading: "2.2 Financial Documents",
              text: "You may upload financial documents including receipts, bank statements (mutasi rekening), invoices (faktur), and other accounting records. Financial data may constitute specific personal data (data pribadi yang bersifat spesifik) under Article 4 of UU PDP.",
            },
            {
              subheading: "2.3 Company Documents",
              text: "Business registration documents (NIB, SIUP), company profiles, NPWP records, and other corporate information you provide for bookkeeping purposes.",
            },
            {
              subheading: "2.4 Google Drive Data",
              text: "With your explicit consent, we access and store data in your Google Drive account, including spreadsheets, folders, and files created or managed by our platform.",
            },
          ],
        },
        {
          heading: "3. How We Use Your Data",
          content: null,
          subsections: [
            {
              subheading: "3.1 AI Processing",
              text: "We use OpenAI GPT-4o to process and extract information from your uploaded documents. This includes OCR, data extraction, and automated categorisation. Under Article 16 of UU PDP, processing is limited to the stated purpose of providing accounting services.",
            },
            {
              subheading: "3.2 Google Drive Storage",
              text: "Financial records and generated reports are stored in your own Google Drive account.",
            },
            {
              subheading: "3.3 Accounting and Bookkeeping Automation",
              text: "Your data is used to automate ledger entries, generate financial statements, perform bank reconciliation, and produce tax-compliant accounting reports.",
            },
          ],
        },
        {
          heading: "4. Data Storage and Security",
          content: null,
          subsections: [
            {
              subheading: "4.1 Supabase (Cloud Database)",
              text: "We use Supabase as our primary cloud database with industry-standard encryption. We maintain security measures in compliance with Article 35 of UU PDP and Government Regulation No. 71 of 2019.",
            },
            {
              subheading: "4.2 Google Drive (User's Own Account)",
              text: "Your financial documents and generated reports are stored in your own Google Drive account.",
            },
            {
              subheading: "4.3 Encrypted Tokens",
              text: "Authentication tokens and API credentials are encrypted at rest and in transit using industry-standard protocols, fulfilling the security obligation under UU PDP.",
            },
          ],
        },
        {
          heading: "5. Third-Party Services",
          content:
            "We integrate with the following third-party services (pihak ketiga). Each has its own privacy policy:",
          list: [
            "Google — OAuth authentication, Google Drive, Google Sheets, and Gmail integration.",
            "OpenAI — AI-powered document extraction via GPT-4o.",
            "Supabase — Cloud database and authentication.",
            "Resend — Transactional email delivery.",
          ],
        },
        {
          heading: "6. Cross-Border Data Transfers",
          content:
            "As our company is based in Malaysia, your data is transferred outside Indonesia. Under Article 56 of UU PDP, cross-border transfers of personal data are permitted where the receiving country has an equivalent level of personal data protection or where adequate safeguards are in place. We ensure compliance with these requirements for all international data transfers.",
        },
        {
          heading: "7. Data Retention",
          content:
            "We retain your personal data in accordance with Article 25 of UU PDP — only for as long as necessary for the stated purpose. Account data is retained while your account is active. Financial records are retained in compliance with Indonesian tax regulations (minimum 10 years under Undang-Undang KUP). You may request deletion by contacting support@buku555.online. Data will be removed within 30 days, except where legally required to retain.",
        },
        {
          heading: "8. Your Rights Under UU PDP",
          content:
            "Under the Personal Data Protection Law (UU PDP) No. 27 of 2022, you have the following rights:",
          list: [
            "Right to Information (Article 5) — You have the right to be informed about data collection, processing, and use.",
            "Right of Access (Article 6) — You may request access to your personal data.",
            "Right of Correction (Article 8) — You may request correction of inaccurate data.",
            "Right to Deletion (Article 8) — You may request deletion of your personal data.",
            "Right to Withdraw Consent (Article 9) — You may withdraw your consent at any time.",
            "Right to Data Portability (Article 12) — You may obtain your data in a commonly used format.",
            "Right to Object (Article 13) — You may object to automated decision-making.",
            "Right to Complain — You may lodge a complaint with the relevant supervisory authority.",
          ],
        },
        {
          heading: "9. Cookies and Tracking",
          content:
            "We use minimal tracking technologies — only authentication tokens for login sessions. We do not use third-party advertising cookies or tracking pixels. This is in compliance with Government Regulation No. 71 of 2019.",
        },
        {
          heading: "10. Children's Privacy",
          content:
            "Our platform is not intended for users under the age of 18. We do not knowingly collect personal data from children. Under Article 25 of UU PDP, processing of children's data requires parental consent.",
        },
        {
          heading: "11. Changes to This Policy",
          content:
            "We may update this policy from time to time. Changes will be posted on this page. Material changes will be notified via email. Continued use after changes constitutes acceptance.",
        },
        {
          heading: "12. Contact Information",
          content: `For questions, rights requests, or data concerns, contact us at: support@buku555.online.`,
        },
      ],
    },

    IN: {
      title: "Privacy Policy — India",
      jurisdiction: "India",
      lawBadges: [
        "Digital Personal Data Protection Act 2023 (DPDPA)",
        "Information Technology Act 2000",
        "IT (Reasonable Security Practices) Rules 2011",
      ],
      sections: [
        {
          heading: "1. Introduction",
          content: `This Privacy Policy explains how ${common.companyName} ("we", "us", or "our"), an AI-powered accounting and bookkeeping platform accessible at ${common.website}, collects, uses, stores, and protects your personal data. We are a company registered in Malaysia providing services to users in India. This policy complies with the Digital Personal Data Protection Act 2023 (DPDPA), the Information Technology Act 2000, and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules 2011. By using our platform, you provide consent as a "Data Principal" under Section 6 of the DPDPA.`,
        },
        {
          heading: "2. Data We Collect",
          content: null,
          subsections: [
            {
              subheading: "2.1 Account Data",
              text: 'When you sign in via Google OAuth, we collect your Google profile information including name, email address, and profile picture. This constitutes "digital personal data" under the DPDPA.',
            },
            {
              subheading: "2.2 Financial Documents",
              text: "You may upload financial documents including receipts, bank statements, invoices, GST records, and other accounting records. Financial information may constitute Sensitive Personal Data or Information (SPDI) under the IT Rules 2011.",
            },
            {
              subheading: "2.3 Company Documents",
              text: "Business registration documents, PAN, GSTIN, company profiles, and other corporate information you provide for bookkeeping purposes.",
            },
            {
              subheading: "2.4 Google Drive Data",
              text: "With your explicit consent, we access and store data in your Google Drive account, including spreadsheets, folders, and files created or managed by our platform.",
            },
          ],
        },
        {
          heading: "3. How We Use Your Data",
          content: null,
          subsections: [
            {
              subheading: "3.1 AI Processing",
              text: 'We use OpenAI GPT-4o to process and extract information from your uploaded documents. This includes OCR, data extraction, and automated categorisation. Under the DPDPA, we process your data as a "Data Fiduciary" for the legitimate purpose of providing accounting services.',
            },
            {
              subheading: "3.2 Google Drive Storage",
              text: "Financial records and generated reports are stored in your own Google Drive account.",
            },
            {
              subheading: "3.3 Accounting and Bookkeeping Automation",
              text: "Your data is used to automate ledger entries, generate financial statements, perform bank reconciliation, and produce GST-compliant accounting reports.",
            },
          ],
        },
        {
          heading: "4. Data Storage and Security",
          content: null,
          subsections: [
            {
              subheading: "4.1 Supabase (Cloud Database)",
              text: "We use Supabase as our primary cloud database with industry-standard encryption. We implement reasonable security practices as required under Section 8 of the DPDPA and the IT (Reasonable Security Practices) Rules 2011, including ISO 27001-aligned security controls.",
            },
            {
              subheading: "4.2 Google Drive (User's Own Account)",
              text: "Your financial documents and generated reports are stored in your own Google Drive account.",
            },
            {
              subheading: "4.3 Encrypted Tokens",
              text: "Authentication tokens and API credentials are encrypted at rest and in transit, in compliance with the IT Act 2000 and associated rules on data security.",
            },
          ],
        },
        {
          heading: "5. Third-Party Services (Data Processors)",
          content:
            'We engage the following third-party "Data Processors" under the DPDPA. Each has its own privacy policy:',
          list: [
            "Google — OAuth authentication, Google Drive, Google Sheets, and Gmail integration.",
            "OpenAI — AI-powered document extraction via GPT-4o.",
            "Supabase — Cloud database and authentication.",
            "Resend — Transactional email delivery.",
          ],
        },
        {
          heading: "6. Cross-Border Data Transfers",
          content:
            "As our company is based in Malaysia, your data is transferred outside India. Under Section 16 of the DPDPA, the Central Government may notify countries to which transfers are restricted. We ensure that data is transferred only to jurisdictions that are not restricted and that appropriate safeguards are maintained. We do not transfer data to any jurisdiction that has been notified as restricted by the Government of India.",
        },
        {
          heading: "7. Data Retention",
          content:
            "We retain your personal data in accordance with Section 8(7) of the DPDPA — only for as long as necessary to serve the purpose for which it was collected. Account data is retained while your account is active. Financial records are retained as required under the Income Tax Act 1961 and GST regulations. You may request erasure by contacting support@buku555.online. Data will be removed within 30 days, except where retention is mandated by law.",
        },
        {
          heading: "8. Your Rights Under the DPDPA",
          content:
            'As a "Data Principal" under the Digital Personal Data Protection Act 2023, you have the following rights:',
          list: [
            "Right to Access (Section 11) — You may obtain a summary of your personal data being processed and the processing activities.",
            "Right to Correction and Erasure (Section 12) — You may request correction of inaccurate data or erasure of data no longer necessary for the stated purpose.",
            "Right to Grievance Redressal (Section 13) — You have the right to accessible grievance redressal mechanisms.",
            "Right to Nominate (Section 14) — You may nominate another individual to exercise your rights in the event of your death or incapacity.",
            "Right to Complain — You may lodge a complaint with the Data Protection Board of India.",
          ],
        },
        {
          heading: "9. Grievance Officer",
          content:
            "In accordance with the Information Technology (Reasonable Security Practices) Rules 2011 and the DPDPA, our Grievance Officer can be reached at support@buku555.online. Grievances will be acknowledged within 24 hours and resolved within 30 days.",
        },
        {
          heading: "10. Cookies and Tracking",
          content:
            "We use minimal tracking technologies — only authentication tokens for login sessions. We do not use third-party advertising cookies or tracking pixels.",
        },
        {
          heading: "11. Children's Privacy",
          content:
            "Our platform is not intended for users under the age of 18. Under Section 9 of the DPDPA, processing of personal data of children requires verifiable parental consent. We do not knowingly collect data from minors.",
        },
        {
          heading: "12. Changes to This Policy",
          content:
            "We may update this policy from time to time. Changes will be posted on this page. Material changes will be notified via email. Continued use after changes constitutes acceptance.",
        },
        {
          heading: "13. Contact Information",
          content: `For questions, rights requests, or grievances, contact us at: support@buku555.online. You may also contact the Data Protection Board of India for regulatory matters once it is constituted under the DPDPA.`,
        },
      ],
    },

    GLOBAL: {
      title: "Privacy Policy — Global",
      jurisdiction: "Global",
      lawBadges: [
        "EU General Data Protection Regulation (GDPR)",
        "Malaysia Personal Data Protection Act 2010 (PDPA)",
        "International Data Protection Principles",
      ],
      sections: [
        {
          heading: "1. Introduction",
          content: `This Privacy Policy explains how ${common.companyName} ("we", "us", or "our"), an AI-powered accounting and bookkeeping platform accessible at ${common.website}, collects, uses, stores, and protects your personal data. We are a company registered and operating in Malaysia, subject to the Malaysian Personal Data Protection Act 2010 (PDPA). For users in the European Economic Area (EEA), we also comply with the EU General Data Protection Regulation (GDPR). This policy is designed to meet international data protection standards. By using our platform, you consent to the practices described in this policy.`,
        },
        {
          heading: "2. Data We Collect",
          content: null,
          subsections: [
            {
              subheading: "2.1 Account Data",
              text: "When you sign in via Google OAuth, we collect your Google profile information including name, email address, and profile picture.",
            },
            {
              subheading: "2.2 Financial Documents",
              text: "You may upload financial documents including receipts, bank statements, invoices, and other accounting records.",
            },
            {
              subheading: "2.3 Company Documents",
              text: "Business registration documents, company profiles, and other corporate information you provide for bookkeeping purposes.",
            },
            {
              subheading: "2.4 Google Drive Data",
              text: "With your explicit consent, we access and store data in your Google Drive account, including spreadsheets, folders, and files created or managed by our platform.",
            },
          ],
        },
        {
          heading: "3. Legal Basis for Processing (GDPR)",
          content:
            "For users in the EEA, we process your personal data on the following legal bases under Article 6 of the GDPR:",
          list: [
            "Consent (Article 6(1)(a)) — You provide explicit consent when signing up and using our services.",
            "Performance of a Contract (Article 6(1)(b)) — Processing is necessary to provide our accounting services.",
            "Legitimate Interests (Article 6(1)(f)) — We may process data for legitimate business interests such as improving our services and ensuring platform security.",
            "Legal Obligation (Article 6(1)(c)) — Processing may be required to comply with applicable laws.",
          ],
        },
        {
          heading: "4. How We Use Your Data",
          content: null,
          subsections: [
            {
              subheading: "4.1 AI Processing",
              text: "We use OpenAI GPT-4o to process and extract information from your uploaded documents. This includes OCR, data extraction, and automated categorisation of financial transactions.",
            },
            {
              subheading: "4.2 Google Drive Storage",
              text: "Financial records and generated reports are stored in your own Google Drive account.",
            },
            {
              subheading: "4.3 Accounting and Bookkeeping Automation",
              text: "Your data is used to automate ledger entries, generate financial statements, perform bank reconciliation, and produce accounting reports.",
            },
          ],
        },
        {
          heading: "5. Data Storage and Security",
          content: null,
          subsections: [
            {
              subheading: "5.1 Supabase (Cloud Database)",
              text: "We use Supabase as our primary cloud database with industry-standard encryption. We implement appropriate technical and organisational measures as required under Article 32 of the GDPR and Section 9 of the Malaysia PDPA.",
            },
            {
              subheading: "5.2 Google Drive (User's Own Account)",
              text: "Your financial documents and generated reports are stored in your own Google Drive account, giving you direct control over your data.",
            },
            {
              subheading: "5.3 Encrypted Tokens",
              text: "Authentication tokens and API credentials are encrypted at rest and in transit using industry-standard encryption protocols.",
            },
          ],
        },
        {
          heading: "6. Third-Party Services",
          content:
            "We integrate with the following third-party services. Each has its own privacy policy:",
          list: [
            "Google — OAuth authentication, Google Drive, Google Sheets, and Gmail integration.",
            "OpenAI — AI-powered document extraction via GPT-4o.",
            "Supabase — Cloud database and authentication.",
            "Resend — Transactional email delivery.",
          ],
        },
        {
          heading: "7. International Data Transfers",
          content:
            "As we are based in Malaysia, your data may be transferred internationally. For EEA users, transfers outside the EEA are conducted in compliance with Chapter V of the GDPR, using Standard Contractual Clauses (SCCs) or other approved transfer mechanisms where required. Under the Malaysia PDPA, we ensure that all cross-border transfers maintain an adequate level of data protection. We take reasonable steps to ensure that your data is treated securely and in accordance with this policy regardless of where it is processed.",
        },
        {
          heading: "8. Data Retention",
          content:
            "We retain your data only for as long as necessary for the purposes described in this policy, in compliance with Article 5(1)(e) of the GDPR (storage limitation) and Section 10 of the Malaysia PDPA (Retention Principle). Account data is retained while your account is active. Financial records are retained as required by applicable law (minimum 7 years under Malaysian Companies Act 2016). You may request deletion by contacting support@buku555.online. Data will be removed within 30 days, except where legally required.",
        },
        {
          heading: "9. Your Rights",
          content:
            "Depending on your jurisdiction, you may have the following rights:",
          subsections: [
            {
              subheading: "9.1 Rights Under the GDPR (EEA Users)",
              text: null,
              list: [
                "Right of Access (Article 15) — Request a copy of your personal data.",
                "Right to Rectification (Article 16) — Request correction of inaccurate data.",
                "Right to Erasure (Article 17) — Request deletion of your data ('right to be forgotten').",
                "Right to Restriction (Article 18) — Request restriction of processing.",
                "Right to Data Portability (Article 20) — Receive your data in a structured, machine-readable format.",
                "Right to Object (Article 21) — Object to processing based on legitimate interests.",
                "Right to Withdraw Consent (Article 7) — Withdraw consent at any time.",
                "Right to Lodge a Complaint — File a complaint with your local Data Protection Authority.",
              ],
            },
            {
              subheading: "9.2 Rights Under the Malaysia PDPA",
              text: null,
              list: [
                "Right of Access (Section 12) — Request access to your personal data.",
                "Right of Correction (Section 34) — Request correction of inaccurate data.",
                "Right to Withdraw Consent — Withdraw your consent for processing.",
                "Right to Prevent Processing — Request cessation of processing in certain circumstances.",
              ],
            },
            {
              subheading: "9.3 General Rights (All Users)",
              text: null,
              list: [
                "Right to be informed about what data we collect and how we use it.",
                "Right to access your personal data held by us.",
                "Right to correction of inaccurate or incomplete data.",
                "Right to request deletion of your data.",
                "Right to withdraw consent at any time.",
              ],
            },
          ],
        },
        {
          heading: "10. Cookies and Tracking",
          content:
            "We use minimal tracking technologies — only authentication tokens for login sessions. We do not use third-party advertising cookies or tracking pixels. For EEA users, this approach is compliant with the ePrivacy Directive.",
        },
        {
          heading: "11. Children's Privacy",
          content:
            "Our platform is not intended for use by individuals under the age of 18. We do not knowingly collect personal data from children. Under the GDPR, processing of data of children under 16 requires parental consent (Article 8). If we become aware that data has been collected from a minor, we will delete it promptly.",
        },
        {
          heading: "12. Changes to This Policy",
          content:
            "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. For material changes, we will notify registered users via email. Continued use after changes constitutes acceptance.",
        },
        {
          heading: "13. Contact Information",
          content: `For questions, rights requests, or data concerns, contact us at: support@buku555.online. For EEA users, you may also contact your local Data Protection Authority. For Malaysian regulatory enquiries, contact the Department of Personal Data Protection Malaysia (JPDP) at www.pdp.gov.my.`,
        },
      ],
    },
  };

  return { ...common, ...policies[country] };
}

function SectionRenderer({ section }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
        {section.heading}
      </h2>
      {section.content && (
        <p className="text-gray-700 leading-relaxed mb-3">{section.content}</p>
      )}
      {section.list && (
        <ul className="list-disc list-outside ml-6 space-y-2 text-gray-700">
          {section.list.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      )}
      {section.subsections &&
        section.subsections.map((sub, i) => (
          <div key={i} className="ml-4 mb-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {sub.subheading}
            </h3>
            {sub.text && (
              <p className="text-gray-700 leading-relaxed mb-2">{sub.text}</p>
            )}
            {sub.list && (
              <ul className="list-disc list-outside ml-6 space-y-2 text-gray-700">
                {sub.list.map((item, j) => (
                  <li key={j} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
    </div>
  );
}

export default function PrivacyPolicyPage() {
  const [selectedCountry, setSelectedCountry] = useState("GLOBAL");
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [detecting, setDetecting] = useState(true);

  useEffect(() => {
    async function detectCountry() {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("ipapi.co failed");
        const data = await response.json();
        const code = data.country_code;
        if (code && COUNTRY_CODES_MAP[code]) {
          setDetectedCountry(COUNTRY_CODES_MAP[code]);
          setSelectedCountry(COUNTRY_CODES_MAP[code]);
        } else {
          setDetectedCountry("GLOBAL");
        }
      } catch {
        try {
          const response = await fetch("http://ip-api.com/json/?fields=countryCode");
          if (!response.ok) throw new Error("ip-api.com failed");
          const data = await response.json();
          const code = data.countryCode;
          if (code && COUNTRY_CODES_MAP[code]) {
            setDetectedCountry(COUNTRY_CODES_MAP[code]);
            setSelectedCountry(COUNTRY_CODES_MAP[code]);
          } else {
            setDetectedCountry("GLOBAL");
          }
        } catch {
          setDetectedCountry("GLOBAL");
        }
      } finally {
        setDetecting(false);
      }
    }

    detectCountry();
  }, []);

  const policy = getPolicyContent(selectedCountry);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 print:bg-white print:border-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Privacy Policy
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Buku 555 — AI-Powered Accounting Platform
              </p>
              <p className="text-sm text-gray-500">buku555.online</p>
            </div>
            <button
              onClick={handlePrint}
              className="print:hidden inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </button>
          </div>

          {/* Dates */}
          <div className="mt-4 flex gap-6 text-sm text-gray-600">
            <span>
              <span className="font-medium">Effective date:</span>{" "}
              {EFFECTIVE_DATE}
            </span>
            <span>
              <span className="font-medium">Last updated:</span>{" "}
              {LAST_UPDATED}
            </span>
          </div>

          {/* Country Tabs */}
          <div className="mt-6 print:hidden">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-600">
                Jurisdiction:
              </span>
              {detecting && (
                <span className="text-xs text-blue-600 animate-pulse">
                  Detecting your location...
                </span>
              )}
              {!detecting && detectedCountry && (
                <span className="text-xs text-gray-500">
                  (Auto-detected:{" "}
                  {COUNTRIES[detectedCountry] || "Global"})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(COUNTRIES).map(([code, name]) => (
                <button
                  key={code}
                  onClick={() => setSelectedCountry(code)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCountry === code
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Law Badges */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {policy.title}
          </h2>
          <div className="flex flex-wrap gap-2">
            {policy.lawBadges.map((badge, i) => (
              <span
                key={i}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div className="prose prose-gray max-w-none">
          {policy.sections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1">
              Buku 555 — AI-Powered Accounting Platform
            </p>
            <p>buku555.online</p>
            <p className="mt-2">
              Contact:{" "}
              <a
                href="mailto:support@buku555.online"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                support@buku555.online
              </a>
            </p>
            <p className="mt-4 text-xs text-gray-400">
              This privacy policy is effective as of {EFFECTIVE_DATE}.
              The company is registered and operates from Malaysia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
