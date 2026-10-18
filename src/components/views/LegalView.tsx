'use client'
import { useNavStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

// ============================================================
// LegalView — renders one of three legal documents for
// Gucchu Test Technologies Pvt. Ltd. (Indian B2B wholesale).
// Content is stored as structured Section[] data and rendered
// programmatically to avoid JSX apostrophe pitfalls.
// ============================================================

type Section = {
  h: string
  paras?: string[]
  list?: string[]
}

type DocMeta = {
  title: string
  subtitle: string
  updated: string
  sections: Section[]
}

// ------------------------------------------------------------
// 1. TERMS & CONDITIONS
// ------------------------------------------------------------
const TERMS: DocMeta = {
  title: 'Terms & Conditions',
  subtitle: 'Gucchu Test Technologies Pvt. Ltd. — Wholesale Marketplace',
  updated: '15 January 2025',
  sections: [
    {
      h: '1. Acceptance of Terms',
      paras: [
        'These Terms & Conditions ("Terms") form a binding agreement between you ("you", "your") and Gucchu Test Technologies Pvt. Ltd., a company incorporated under the Companies Act, 2013, having its registered office in New Delhi, India ("Gucchu Test", "we", "us", "our").',
        'By registering an account, browsing the Platform, placing an order, listing a product, accepting a transport assignment, enrolling as a Sales Representative, or otherwise using the Gucchu Test platform, mobile application, website and any related services (collectively, the "Platform" or "Services"), you confirm that you have read, understood and agreed to be bound by these Terms.',
        'If you do not agree with any part of these Terms, you must stop using the Platform immediately. Continued use after any update to these Terms constitutes acceptance of the revised Terms.',
        'You represent that you are at least eighteen (18) years of age and have the legal capacity to enter into this agreement. If you are accessing the Platform on behalf of a business entity, you represent that you are duly authorised to bind that entity to these Terms.',
      ],
    },
    {
      h: '2. Definitions',
      paras: ['In these Terms, unless the context otherwise requires:'],
      list: [
        '"Gucchu Test" means Gucchu Test Technologies Pvt. Ltd. and its successors and assigns.',
        '"Platform" means the Gucchu Test website, mobile application, application programming interfaces, dashboards and all related digital infrastructure operated by Gucchu Test.',
        '"Vendor" means a registered business user who lists products on the Platform for sale to Buyers in bulk.',
        '"Buyer" means a registered user who places an Order on the Platform for bulk purchase of products listed by Vendors.',
        '"Transport Partner" means a registered logistics provider engaged to pick up goods from a Vendor and deliver them to a Buyer.',
        '"Sales Representative" means a registered individual or entity who refers Buyers to the Platform and earns commission on eligible Orders, in accordance with Section 7 below.',
        '"Order" means a confirmed purchase request placed by a Buyer for one or more products from a Vendor, accepted by the Vendor and routed through the Platform.',
        '"MOQ" means Minimum Order Quantity, being the smallest quantity in which a product may be ordered on the Platform.',
        '"GST" means the Goods and Services Tax levied under the Goods and Services Tax Act, 2017 and allied legislation in India.',
        '"Platform Fee" means the fee, commission or charge payable to Gucchu Test as described in Section 12.',
      ],
    },
    {
      h: '3. Account Registration & Responsibilities',
      paras: [
        'To access most features of the Platform, you must register an account by providing accurate, current and complete information, including your legal name, business name (where applicable), registered business address, GST Identification Number (where applicable), contact number and email address.',
        'You are solely responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You agree to notify us immediately at grievance@gucchutest.com of any unauthorised access, suspected fraud or other security breach.',
        'You may not register more than one account for the same legal entity without our prior written consent, and you may not transfer, sell or assign your account to any third party.',
        'Gucchu Test reserves the right to suspend or terminate any account that is found to contain false, misleading or incomplete information, or that is associated with fraudulent, abusive or unlawful activity.',
      ],
    },
    {
      h: '4. Buyer Terms',
      paras: [
        'As a Buyer, you may browse the Platform, compare products and pricing, and place Orders at or above the MOQ specified by the Vendor. Bulk pricing tiers, where offered, will apply automatically based on the ordered quantity.',
        'When you place an Order, you authorise Gucchu Test to share the order details, delivery address and contact information with the relevant Vendor and the assigned Transport Partner for the limited purpose of fulfilment.',
        'You agree to provide a complete and accurate delivery address, including landmark, pin code and a reachable contact number. Gucchu Test and its Transport Partners shall not be liable for delays or failed deliveries arising from incomplete or incorrect address information supplied by you.',
        'You may cancel an Order before it has been accepted by the Vendor without any charge. Once the Vendor has accepted the Order and initiated preparation for dispatch, cancellation may attract a reasonable charge as communicated on the Platform at the time of cancellation.',
        'You shall not place Orders with the intention of fraudulently obtaining goods without payment, of testing Vendor capacity for competitive intelligence, or for any purpose other than genuine bulk purchase for your own use or resale.',
      ],
    },
    {
      h: '5. Vendor Terms',
      paras: [
        'As a Vendor, you represent that you hold all licences, registrations and permits required to manufacture, import, store and sell the products you list on the Platform, including a valid GST registration where applicable. You agree to display accurate product titles, descriptions, specifications, images, pricing, MOQ and stock availability.',
        'Listing images must faithfully represent the actual product. Stock images, watermarked images sourced from third parties, or images that materially misrepresent the product are strictly prohibited.',
        'You grant Gucchu Test a non-exclusive, royalty-free, worldwide licence to display, reproduce and distribute your product listings, images and descriptions on the Platform for the purpose of marketing and fulfilling Orders, as more fully described in our IT & IP Protection Policy.',
        'You shall fulfil accepted Orders within the dispatch timeline shown to the Buyer at checkout. Repeated delays, cancellation of accepted Orders, or dispatch of incorrect, defective or counterfeit goods may result in ranking penalties, suspension or termination of your Vendor account.',
        'You shall not list any item that is prohibited under Indian law, including but not limited to restricted drugs and narcotics, counterfeit currency, unlicensed firearms and ammunition, tobacco products in violation of the Cigarettes and Other Tobacco Products Act, 2003, ivory and wildlife products protected under the Wildlife (Protection) Act, 1972, or any item whose sale is restricted by the Government of India.',
        'Gucchu Test may, at its discretion, offer certain Vendors an "exclusive" status with preferential placement and promotion. Exclusive status does not prevent a Vendor from selling through other channels, but the Vendor shall not list the same product on the Platform at a higher price than is offered on any other online channel.',
      ],
    },
    {
      h: '6. Transport Partner Terms',
      paras: [
        'As a Transport Partner, you agree to accept delivery assignments routed to you by the Platform, to pick up the consignment from the Vendor within the agreed pickup window, and to deliver it to the Buyer address within the service-level commitment shown to the Buyer at checkout.',
        'You shall handle all consignments with reasonable care, provide adequate packaging protection where the Vendor packaging is insufficient, and immediately report any shortage, damage or discrepancy at the time of pickup to Gucchu Test through the Transport Partner dashboard.',
        'You are responsible for the safe custody of the consignment from pickup to delivery. Gucchu Test shall not be liable for loss, theft, pilferage or damage to goods while they are in your custody, save where such loss arises directly from a defect in the Platform itself.',
        'You shall comply with all applicable motor vehicle, transport and labour laws, hold valid permits and insurance for the vehicles deployed, and ensure that drivers and helpers are duly licensed and verified.',
        'Failure to meet the agreed delivery service-level, repeated incidents of damage or pilferage, or breach of these Transport Partner Terms may result in reduction of assigned routes, financial penalties, suspension or termination of your Transport Partner account.',
      ],
    },
    {
      h: '7. Sales Representative Program',
      paras: [
        'The Gucchu Test Sales Representative Program ("SR Program") permits registered individuals and entities ("Sales Representatives") to refer prospective Buyers to the Platform and earn commission on eligible Orders placed by such Buyers.',
        'To be eligible for the SR Program, you must register, complete the prescribed onboarding, provide a valid Permanent Account Number (PAN), bank account details and, where applicable, GST registration, and remain in good standing under these Terms.',
        'Commission accrues only on Orders that are (a) placed by a Buyer you have referred using your unique referral identifier, (b) accepted by the Vendor, (c) successfully delivered to the Buyer, and (d) not subject to a successful refund or chargeback. The applicable commission rate, slab structure and exclusions will be published on the SR Program dashboard and may be revised by Gucchu Test with prior notice.',
        'Commission payouts shall be made on a monthly cycle, net of applicable Indian withholding tax (Tax Deducted at Source), to the bank account registered with us. You are responsible for declaring and paying all taxes due on commission income earned through the SR Program.',
        'Gucchu Test may suspend or terminate your participation in the SR Program at any time, with or without cause, including where you are found to have engaged in self-referral, referral of fictitious Buyers, manipulation of Orders, misrepresentation of Gucchu Test to prospective Buyers, or any other abuse of the program.',
      ],
    },
    {
      h: '8. Orders, Pricing & Taxes',
      paras: [
        'All prices displayed on the Platform are in Indian Rupees (INR) and are exclusive of GST unless otherwise stated. Applicable GST, at the rate notified under the GST Act for the relevant product category, shall be added at checkout.',
        'Gucchu Test strives to ensure that pricing displayed on the Platform is accurate. However, in the event of an obvious pricing error, Gucchu Test reserves the right to cancel the affected Order and offer you the option to re-order at the correct price or to receive a full refund.',
        'Each Order will generate a tax-compliant invoice from the Vendor bearing the Vendor GST Identification Number, the Buyer GST Identification Number (where provided), the Harmonised System Nomenclature (HSN) code, the applicable tax rate and all other particulars required under the GST Act and the rules made thereunder.',
        'Bulk pricing tiers and promotional discounts, where applicable, shall be applied automatically by the Platform and reflected in the final invoice. Gucchu Test reserves the right to withdraw or modify any promotion at any time without prior notice.',
      ],
    },
    {
      h: '9. Payments & Refunds',
      paras: [
        'Buyers may pay for Orders through the payment methods enabled at checkout, which may include prepaid online payment through supported payment gateways and Cash on Delivery (COD) where available for the destination pin code.',
        'For prepaid Orders, the payment shall be processed by a third-party payment gateway. Gucchu Test does not store full card numbers or net-banking credentials; payment authorisation is handled solely by the gateway and the buyer\'s bank.',
        'Refunds, where due, shall be processed to the original payment instrument within seven (7) to ten (10) working days for prepaid Orders. For COD Orders, refunds shall be issued to the registered bank account of the Buyer on record.',
        'Gucchu Test shall remit to the Vendor the net sale proceeds of each delivered Order, after deducting the applicable Platform Fee, payment gateway charges and any other amounts owed by the Vendor to Gucchu Test, in accordance with the settlement cycle published in the Vendor dashboard.',
      ],
    },
    {
      h: '10. Delivery & Risk of Loss',
      paras: [
        'Risk in the goods passes from the Vendor to the Buyer at the moment the goods are handed over to the Buyer or to a person authorised by the Buyer at the delivery address. Title in the goods passes to the Buyer upon receipt of full payment for the Order.',
        'Estimated delivery dates shown at checkout are indicative and depend on factors including Vendor dispatch time, destination pin code, route density and weather. Gucchu Test shall not be liable for delays caused by events beyond its reasonable control, including force majeure events under Section 16.',
        'The Buyer shall inspect the consignment at the time of delivery and note any visible damage or shortage on the proof of delivery before accepting it. Concealed defects not visible at delivery must be reported within forty-eight (48) hours of delivery through the Platform.',
      ],
    },
    {
      h: '11. Returns, Replacements & Disputes',
      paras: [
        'Returns and replacements are governed by the return policy displayed on the product listing at the time of Order. Where a Vendor offers a return window, the Buyer may raise a return request within that window through the Platform.',
        'Gucchu Test operates a dispute resolution mechanism. A Buyer may raise a dispute through the Platform within seven (7) days of delivery, providing photographs and a description of the issue. Gucchu Test shall facilitate communication between the Buyer and the Vendor and shall issue a binding decision where the parties cannot reach agreement within a reasonable period.',
        'Where Gucchu Test determines that a Vendor has dispatched counterfeit, defective or materially non-compliant goods, it may direct a full refund to the Buyer, recover the amount from the Vendor\'s pending settlement, and take such other action as it deems appropriate, including suspension of the Vendor account.',
      ],
    },
    {
      h: '12. Platform Fees & Commission',
      paras: [
        'Gucchu Test charges Vendors a Platform Fee, comprising a commission on the sale price of each delivered Order and such other charges as may be published in the Vendor agreement and Vendor dashboard. The Platform Fee covers use of the Platform, payment processing, dispute facilitation and access to the Gucchu Test buyer base.',
        'Gucchu Test may also charge fees for optional services such as promoted listings, brand stores, advertising and analytics, which shall be billed separately and are non-refundable unless otherwise stated.',
        'All fees are exclusive of applicable taxes. GST on fees shall be charged at the prevailing rate and a tax invoice shall be issued by Gucchu Test to the Vendor.',
        'Gucchu Test may revise its fee structure with at least thirty (30) days notice to Vendors. Continued use of the Platform after the effective date of a revised fee structure constitutes acceptance of the revised fees.',
      ],
    },
    {
      h: '13. Prohibited Conduct',
      paras: [
        'You shall not, in connection with your use of the Platform:'],
      list: [
        'engage in fraudulent, deceptive or manipulative activity, including placing Orders with no intention to pay, submitting fake reviews, or colluding with other users to manipulate pricing or ratings;',
        'scrape, mirror, reverse engineer, decompile or otherwise attempt to extract the source code, structure, sequence or data of the Platform, except as expressly permitted under our IT & IP Protection Policy;',
        'introduce viruses, malware, ransomware or any other malicious code, or attempt unauthorised access to the Platform, its databases, APIs or infrastructure;',
        'use the Platform to infringe the intellectual property, privacy or other rights of any third party;',
        'harass, threaten, abuse or defame any other user, Gucchu Test personnel, Vendor, Transport Partner or Sales Representative;',
        'misrepresent Gucchu Test, its policies, fees or affiliations to any prospective Buyer, Vendor or third party; or',
        'use the Platform for any purpose that is unlawful under Indian law or prohibited under these Terms.',
      ],
    },
    {
      h: '14. Intellectual Property',
      paras: [
        'All intellectual property rights in the Platform, including the source code, design, layout, the "Gucchu Test" name and logo, and all original content created by Gucchu Test, are owned by Gucchu Test Technologies Pvt. Ltd. Subject to these Terms, Gucchu Test grants you a limited, non-exclusive, non-transferable, revocable licence to access and use the Platform for its intended purpose.',
        'Detailed rules regarding intellectual property ownership, vendor content licences, prohibited use, and compliance with the Information Technology Act, 2000 are set out in our IT & IP Protection Policy, which is incorporated into these Terms by reference.',
      ],
    },
    {
      h: '15. Privacy',
      paras: [
        'Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, store, share and protect your personal information. The Privacy Policy is incorporated into these Terms by reference.',
        'By using the Platform, you consent to the collection, processing and transfer of your personal information as described in the Privacy Policy.',
      ],
    },
    {
      h: '16. Limitation of Liability',
      paras: [
        'To the maximum extent permitted by applicable law, Gucchu Test, its directors, officers, employees and affiliates shall not be liable for any indirect, incidental, special, consequential or punitive damages, or for any loss of profits, loss of business, loss of goodwill or loss of data, arising out of or in connection with your use of the Platform.',
        'Gucchu Test acts as an intermediary under the Information Technology Act, 2000 and the Intermediary Guidelines and Digital Media Ethics Code Rules, 2021. Gucchu Test does not manufacture, store or take title to any product listed on the Platform, and shall not be liable for the acts or omissions of Vendors, Transport Partners, Sales Representatives or other users.',
        'The aggregate liability of Gucchu Test under these Terms, for any claim arising out of or in connection with the Platform, shall not exceed the total Platform Fee received by Gucchu Test from you in the three (3) months immediately preceding the event giving rise to the claim.',
        'Nothing in these Terms shall exclude or limit liability that cannot be excluded or limited under applicable Indian law, including liability for gross negligence, wilful misconduct or fraud.',
      ],
    },
    {
      h: '17. Indemnification',
      paras: [
        'You agree to indemnify and hold harmless Gucchu Test, its directors, officers, employees and affiliates from and against any and all claims, demands, actions, losses, damages, liabilities, costs and expenses (including reasonable legal fees) arising out of or in connection with: (a) your breach of these Terms; (b) your violation of any applicable law or of any third-party right; (c) any content, information or material you submit to the Platform; (d) any product you list, sell or dispatch as a Vendor; and (e) any consignment you handle as a Transport Partner.',
        'Gucchu Test reserves the right, at its own expense, to assume the exclusive defence and control of any matter subject to indemnification by you, in which case you shall cooperate with Gucchu Test in asserting any available defences.',
      ],
    },
    {
      h: '18. Termination',
      paras: [
        'You may terminate your account at any time by contacting grievance@gucchutest.com from your registered email address. Termination does not relieve you of obligations accrued before termination, including payment of amounts owed to Gucchu Test.',
        'Gucchu Test may suspend or terminate your account and access to the Platform at any time, with or without cause and with or without notice, including where you have breached these Terms, where required by law, or where continued access would expose Gucchu Test to legal or reputational risk.',
        'Upon termination, all licences granted to you under these Terms shall cease immediately. Sections that by their nature should survive termination, including Sections 12, 14, 16, 17 and 19, shall continue in full force and effect.',
      ],
    },
    {
      h: '19. Governing Law & Dispute Resolution',
      paras: [
        'These Terms shall be governed by and construed in accordance with the laws of the Republic of India, without regard to its conflict of laws principles.',
        'Any dispute, controversy or claim arising out of or in connection with these Terms, including the existence, validity, scope, performance, breach or termination thereof, shall first be attempted to be resolved amicably through mutual discussion between the parties for a period of thirty (30) days.',
        'If the dispute is not resolved within such period, it shall be referred to a sole arbitrator appointed mutually by the parties. The arbitration shall be conducted in the English language in accordance with the Arbitration and Conciliation Act, 1996 (as amended). The seat and venue of arbitration shall be New Delhi, India.',
        'Subject to the arbitration clause above, the courts at New Delhi shall have exclusive jurisdiction over any matter not referred to arbitration or any application arising from the arbitration.',
      ],
    },
    {
      h: '20. Changes to Terms',
      paras: [
        'Gucchu Test may revise these Terms from time to time. The most current version will always be available on the Platform, with the "Last updated" date shown at the top of this document.',
        'For material changes that affect your rights or obligations, Gucchu Test shall provide notice through the Platform or by email to your registered address at least seven (7) days before the changes take effect.',
        'Continued use of the Platform after the effective date of any revised Terms constitutes your acceptance of the revised Terms. If you do not agree to the revised Terms, you must stop using the Platform.',
      ],
    },
    {
      h: '21. Contact',
      paras: [
        'If you have any questions, concerns or notices regarding these Terms, please contact us at:',
        'Gucchu Test Technologies Pvt. Ltd., Registered Office: New Delhi, India. Email: grievance@gucchutest.com. Subject line: "Terms & Conditions — Query".',
        'Grievance Officer: Ms. A. Sharma, available at grievance@gucchutest.com, shall respond to your query within forty-eight (48) working hours of receipt.',
      ],
    },
  ],
}

// ------------------------------------------------------------
// 2. PRIVACY POLICY
// ------------------------------------------------------------
const PRIVACY: DocMeta = {
  title: 'Privacy Policy',
  subtitle: 'Gucchu Test Technologies Pvt. Ltd. — How We Handle Your Information',
  updated: '15 January 2025',
  sections: [
    {
      h: '1. Introduction & Data Controller',
      paras: [
        'Gucchu Test Technologies Pvt. Ltd. ("Gucchu Test", "we", "us", "our") respects your privacy and is committed to protecting the personal information you share with us through the Gucchu Test platform, mobile application and related services (collectively, the "Platform").',
        'This Privacy Policy explains what information we collect, why we collect it, how we use it, with whom we share it, how long we retain it, and the rights you have in relation to it. It applies to Buyers, Vendors, Transport Partners, Sales Representatives and visitors to the Platform.',
        'Gucchu Test is the data controller of the personal information processed under this Privacy Policy. Our registered office is in New Delhi, India, and we process personal information in accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023, as and to the extent applicable.',
      ],
    },
    {
      h: '2. Information We Collect',
      paras: ['We collect the following categories of information when you use the Platform:'],
      list: [
        'Account information: name, business name (where applicable), email address, mobile number, password (stored only as a salted PBKDF2 hash), and account role (Buyer, Vendor, Transport Partner, Sales Representative, Administrator).',
        'Business information (Vendors and Transport Partners): legal entity name, registered business address, GST Identification Number, PAN, bank account details for settlement, and supporting registration documents such as shop establishment certificates and transport permits.',
        'Order information: products ordered, quantities, pricing, GST, delivery address, Order history, invoices and dispute correspondence.',
        'Delivery address information: recipient name, address line, landmark, city, state, pin code and contact number.',
        'Payment information: for prepaid Orders, we do not store full card numbers, CVV or net-banking credentials; these are handled directly by our PCI-DSS aligned payment gateway partners. We retain only the last four digits of the card, the transaction reference and the payment status.',
        'Device and connection information: IP address, browser type and version, operating system, device identifiers, referrer URL and approximate location derived from IP.',
        'Usage information: pages visited, features used, time spent, search queries entered on the Platform, and clicks. We use this information in aggregated and pseudonymised form for analytics and improvement of the Platform.',
        'Sales Representative information: PAN, bank account details for commission payout, referral identifier and commission history.',
      ],
    },
    {
      h: '3. How We Use Information',
      paras: ['We use your personal information for the following purposes:'],
      list: [
        'to register and authenticate your account and to manage your access to the Platform;',
        'to process and fulfil your Orders, including dispatching goods, arranging delivery, generating invoices and handling returns and disputes;',
        'to communicate with you about your account, Orders, payments, disputes, and changes to our policies and services;',
        'to compute and disburse commission to Sales Representatives and to settle proceeds to Vendors;',
        'to verify your identity, prevent fraud, detect prohibited conduct and comply with our legal and regulatory obligations;',
        'to improve the Platform, including by analysing usage patterns, fixing defects and developing new features;',
        'to send you promotional communications about products, deals and vendor offerings, where you have provided separate opt-in consent. You may withdraw consent and unsubscribe at any time through your account settings or the unsubscribe link in the communication.',
      ],
    },
    {
      h: '4. Legal Basis',
      paras: [
        'We process your personal information on the following legal bases, as recognised under the Digital Personal Data Protection Act, 2023:',
        '(a) Consent: where you have given clear, affirmative consent, for example for promotional communications and optional analytics.',
        '(b) Performance of a contract: where processing is necessary to fulfil an Order, settle a payment, or discharge our obligations under the Terms & Conditions.',
        '(c) Compliance with legal obligation: where processing is required under applicable Indian law, including maintenance of records under the GST Act and the Intermediary Guidelines and Digital Media Ethics Code Rules, 2021.',
        '(d) Legitimate interests: where processing is necessary for purposes such as fraud prevention, network security, dispute resolution and platform improvement, provided such interests are not overridden by your rights and reasonable expectations.',
      ],
    },
    {
      h: '5. Cookies & Local Storage',
      paras: [
        'The Platform uses a minimal set of cookies and browser storage mechanisms to function. We do not use cookies for cross-site advertising or behavioural profiling.',
        'A session cookie named "bc_session" identifies you while you are logged in and is removed when you close your browser, unless you select the "keep me signed in" option, in which case it persists for up to thirty (30) days.',
        'Your shopping cart contents are stored in your browser\'s local storage under the key "bc-cart" so that the cart survives page refreshes and accidental closure. This information is stored on your device only and is not transmitted to our servers until you proceed to checkout.',
        'A cookie preferences indicator is stored in local storage to remember whether you have accepted or rejected optional analytics. You may clear cookies and local storage at any time through your browser settings; some Platform features may not function correctly if you do so.',
      ],
    },
    {
      h: '6. Data Sharing',
      paras: [
        'We share your personal information with the following categories of recipients, only to the extent necessary for the purposes described in this Privacy Policy:',
        '(a) Vendors: when you place an Order, the relevant Vendor receives your name, delivery address, contact number, Order details and, where provided, your GST Identification Number for the purpose of invoicing and dispatch.',
        '(b) Transport Partners: when an Order is assigned for delivery, the assigned Transport Partner receives your name, delivery address, contact number, consignment details and pickup location.',
        '(c) Payment gateways: for prepaid Orders, your payment instrument details are routed directly to the payment gateway and are not stored on our servers.',
        '(d) Service providers: we engage trusted service providers for hosting, email delivery, SMS notifications, analytics and customer support, who process information on our behalf under written agreements requiring confidentiality and reasonable security practices.',
        '(e) Government and regulatory authorities: where we are required to disclose information under applicable law, court order, or valid request from a law enforcement or regulatory authority.',
        'We do not sell your personal information to any third party. We do not share your personal information with any third party for their own independent marketing purposes.',
      ],
    },
    {
      h: '7. Data Retention',
      paras: [
        'We retain your personal information for as long as your account is active and for a reasonable period thereafter, as required by law or to defend against potential legal claims.',
        'Order records, invoices and related financial information are retained for a period of seven (7) years from the end of the relevant financial year, in accordance with the requirements of the GST Act and the Income Tax Act, 1961.',
        'Grievance and dispute correspondence is retained for a period of three (3) years from the closure of the matter. Logs of user activity for security and fraud-monitoring purposes are retained for a period of twelve (12) months.',
        'When information is no longer required, we either anonymise it (in the case of statistical data) or securely delete it in accordance with our data retention schedule.',
      ],
    },
    {
      h: '8. Data Security',
      paras: [
        'Gucchu Test implements reasonable security practices and procedures as required under Section 43A of the Information Technology Act, 2000 and the rules made thereunder. Specific measures include:',
        '(a) Passwords are never stored in plaintext. We use the PBKDF2 key derivation function with a per-user random salt and a high iteration count to store only an irreversible hash of your password.',
        '(b) All data in transit between your browser and our servers is encrypted using TLS 1.2 or higher.',
        '(c) Sensitive data at rest, including business documents and bank account numbers, is encrypted using industry-standard algorithms.',
        '(d) Access to production systems and databases is restricted on a least-privilege basis, with multi-factor authentication and logged access for administrative actions.',
        '(e) All user-supplied input is validated and sanitised server-side; database queries use parameterised statements to prevent SQL injection; output is escaped to prevent cross-site scripting; and forms are protected with anti-CSRF tokens and SameSite cookie attributes.',
        '(f) Rate limiting is applied to authentication, search and other public endpoints to mitigate brute-force and abuse attempts.',
        '(g) Security events are logged and monitored, and we conduct periodic reviews and patching of our infrastructure.',
      ],
    },
    {
      h: '9. Your Rights',
      paras: [
        'Subject to applicable law, you have the following rights in relation to your personal information:',
        '(a) Right to access: you may request a copy of the personal information we hold about you.',
        '(b) Right to correction: you may request correction of inaccurate or incomplete information. Most information can be corrected directly through your account settings.',
        '(c) Right to deletion: you may request deletion of your personal information, subject to our legal obligations to retain certain records (for example, GST invoices).',
        '(d) Right to data portability: you may request an export of your personal information in a structured, machine-readable format.',
        '(e) Right to withdraw consent: where we process your information on the basis of consent, you may withdraw that consent at any time without affecting the lawfulness of processing prior to withdrawal.',
        '(f) Right to grievance redressal: you may file a grievance with our Grievance Officer using the contact details in Section 15.',
        'To exercise any of these rights, please email grievance@gucchutest.com from your registered email address with the subject line "Privacy Rights Request". We shall verify your identity and respond within thirty (30) days of receipt of a complete request.',
      ],
    },
    {
      h: '10. Vendor & Transport Partner Data',
      paras: [
        'Where you are a Vendor or Transport Partner, we process additional business information as described in Section 2. This includes your GST Identification Number, PAN, bank account details and registration documents, which are necessary for onboarding, statutory compliance and settlement.',
        'Vendor and Transport Partner business names, registered addresses and GST Identification Numbers may be displayed on the Platform (for example, on tax invoices and order tracking pages) to the extent necessary for transparency and regulatory compliance.',
        'Gucchu Test may use aggregated and anonymised information derived from Vendor and Transport Partner data to publish market statistics, industry insights and benchmark reports. Such information shall not identify any individual Vendor, Transport Partner or Buyer.',
      ],
    },
    {
      h: '11. Children\'s Privacy',
      paras: [
        'The Platform is intended for use by businesses and individuals aged eighteen (18) years and above. We do not knowingly collect personal information from children under the age of eighteen.',
        'If you believe that we have collected personal information from a child under eighteen, please contact us at grievance@gucchutest.com. We shall take reasonable steps to delete such information and to prevent further collection.',
      ],
    },
    {
      h: '12. International Transfers',
      paras: [
        'Gucchu Test is an Indian company and primarily stores and processes personal information within the Republic of India. Where we engage service providers located outside India (for example, for cloud infrastructure or analytics), we do so only where such transfer is permitted under applicable Indian law and subject to appropriate safeguards.',
        'Where cross-border transfer of personal information is necessary, we ensure that the recipient is bound by written contractual obligations to protect the information to a standard no lower than that required under Indian law.',
      ],
    },
    {
      h: '13. Third-Party Links',
      paras: [
        'The Platform may contain links to third-party websites, payment gateways and logistics tracking portals that are not operated by Gucchu Test. We are not responsible for the privacy practices or content of such third-party websites.',
        'We encourage you to review the privacy policies of any third-party websites you visit through links from the Platform. This Privacy Policy does not apply to such third-party websites.',
      ],
    },
    {
      h: '14. Changes to Policy',
      paras: [
        'We may update this Privacy Policy from time to time. The most current version will always be available on the Platform, with the "Last updated" date shown at the top of this document.',
        'For material changes that affect your rights, we shall provide notice through the Platform or by email to your registered address at least seven (7) days before the changes take effect.',
        'Continued use of the Platform after the effective date of any revised Privacy Policy constitutes your acceptance of the revised policy.',
      ],
    },
    {
      h: '15. Contact / Grievance Officer',
      paras: [
        'If you have any questions, concerns, requests or grievances regarding this Privacy Policy or the processing of your personal information, please contact our Grievance Officer:',
        'Name: Ms. A. Sharma, Grievance Officer, Gucchu Test Technologies Pvt. Ltd. Email: grievance@gucchutest.com. Postal address: Registered Office, New Delhi, India.',
        'Our Grievance Officer shall acknowledge your complaint within twenty-four (24) working hours and shall resolve it within thirty (30) days of receipt, in accordance with applicable Indian law.',
      ],
    },
  ],
}

// ------------------------------------------------------------
// 3. IT & IP PROTECTION POLICY
// ------------------------------------------------------------
const IP: DocMeta = {
  title: 'IT & IP Protection Policy',
  subtitle: 'Gucchu Test Technologies Pvt. Ltd. — Information Technology & Intellectual Property',
  updated: '15 January 2025',
  sections: [
    {
      h: '1. Purpose & Scope',
      paras: [
        'This Information Technology & Intellectual Property Protection Policy ("IT/IP Policy" or "Policy") of Gucchu Test Technologies Pvt. Ltd. ("Gucchu Test", "we", "us", "our") sets out the rules governing the ownership, use and protection of intellectual property rights, content, data and information technology assets associated with the Gucchu Test platform, mobile application and related services (collectively, the "Platform").',
        'This Policy applies to all users of the Platform, including Buyers, Vendors, Transport Partners, Sales Representatives, visitors and any third party that accesses, links to, or interacts with the Platform.',
        'This Policy is incorporated into, and forms an integral part of, our Terms & Conditions. Capitalised terms used but not defined in this Policy shall have the meaning ascribed to them in the Terms & Conditions.',
      ],
    },
    {
      h: '2. Intellectual Property Ownership',
      paras: [
        'All intellectual property rights in and to the Platform, including but not limited to the source code, object code, database structure, schema, design, layout, user interface, the "Gucchu Test" word mark and logo, all original content authored by Gucchu Test (including this Policy, our Terms & Conditions and our Privacy Policy), and all modifications, enhancements and derivative works thereof, are and shall remain the exclusive property of Gucchu Test Technologies Pvt. Ltd.',
        'Nothing in these Terms or on the Platform shall be construed as granting you any right, title or interest in or to the Platform or any Gucchu Test intellectual property, except for the limited, revocable, non-exclusive, non-transferable licence to access and use the Platform for its intended purpose, granted to you solely during the period that your account is in good standing.',
        'You shall not remove, alter or obscure any copyright, trademark or other proprietary notices displayed on the Platform.',
      ],
    },
    {
      h: '3. Vendor Content & Licences',
      paras: [
        'As a Vendor, you retain ownership of the intellectual property rights in your product titles, descriptions, specifications, images, brand names, logos and any other content you submit to the Platform ("Vendor Content").',
        'By submitting Vendor Content to the Platform, you grant Gucchu Test a non-exclusive, royalty-free, worldwide, sub-licensable licence to host, store, reproduce, display, perform, distribute, modify (for technical compatibility only) and otherwise use the Vendor Content for the purpose of operating, marketing and improving the Platform and fulfilling Orders.',
        'You represent and warrant that: (a) you own or otherwise have all necessary rights, licences and consents to submit the Vendor Content and to grant the licence above; (b) the Vendor Content does not and shall not infringe the intellectual property, privacy, publicity, contractual or other rights of any third party; and (c) the Vendor Content complies with all applicable Indian laws.',
        'You are solely responsible for ensuring that product images do not contain watermarks, logos or trademarks of third parties (including other e-commerce platforms) without authorisation, and that you have the right to use any brand names, model numbers or trade dress included in your listings.',
      ],
    },
    {
      h: '4. Copyright & Information Technology Act Compliance',
      paras: [
        'Gucchu Test respects the intellectual property rights of others and complies with the Copyright Act, 1957 and the Information Technology Act, 2000 (including the Copyright (Amendment) Act, 2012 which addresses digital rights management and online infringement).',
        'We respond to valid notices of alleged copyright infringement in accordance with the procedure set out in Section 10 below. Repeat infringers shall have their access to the Platform terminated in appropriate circumstances.',
        'Gucchu Test shall, upon receipt of a written notice from any person aggrieved by any content hosted on the Platform, act within thirty-six (36) hours of receipt of the notice to disable access to the alleged infringing content, in accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.',
      ],
    },
    {
      h: '5. Trademarks',
      paras: [
        '"Gucchu Test", the Gucchu Test logo and all related marks, trade dress and product names are trademarks or registered trademarks of Gucchu Test Technologies Pvt. Ltd. in India and other jurisdictions.',
        'You shall not use any Gucchu Test trademark, logo or trade dress without our prior written consent. You shall not use any meta tag, hidden text or keyword that incorporates a Gucchu Test trademark.',
        'Vendor brand names and logos submitted to the Platform remain the property of the respective Vendors. Vendors authorise Gucchu Test to display their trademarks on the Platform solely for the purpose of marketing their products.',
        'Gucchu Test shall promptly investigate any notice of trademark infringement received from a third party and shall take appropriate action, including removal of the infringing content and, in case of repeat infringement, termination of the Vendor account.',
      ],
    },
    {
      h: '6. Prohibited Use',
      paras: [
        'You shall not access or use the Platform in any manner that could damage, disable, overburden or impair the Platform, or interfere with any other user\'s use of the Platform. Prohibited activities include, without limitation:'],
      list: [
        'scraping, crawling, mirroring or otherwise extracting data from the Platform, whether manually or through automated tools, bots, spiders or scripts, except through APIs that we may publish and subject to their terms of use;',
        'reverse engineering, decompiling, disassembling or otherwise attempting to derive the source code, schema, internal structure or sequence of the Platform, except to the extent expressly permitted under applicable Indian law;',
        'submitting, transmitting or attempting to submit any virus, worm, trojan, ransomware, malicious code or any other file or program designed to interrupt, destroy or limit the functionality of the Platform;',
        'attempting unauthorised access to the Platform, its databases, APIs, administrative interfaces or supporting infrastructure, including by credential stuffing, brute-force attacks, SQL injection, cross-site scripting, cross-site request forgery or session hijacking;',
        'launching or facilitating any denial-of-service or distributed denial-of-service (DDoS) attack against the Platform;',
        'intercepting, monitoring or altering communications between the Platform and its users;',
        'using the Platform to upload, store or distribute any content that infringes the intellectual property, privacy or other rights of any third party; and',
        'evading or attempting to evade any rate limiting, security, anti-fraud or other technical protection measures deployed by Gucchu Test.',
      ],
    },
    {
      h: '7. Information Technology Act, 2000 Compliance',
      paras: [
        'Gucchu Test operates the Platform as an "intermediary" within the meaning of Section 2(1)(w) of the Information Technology Act, 2000 (the "IT Act"). Accordingly, Gucchu Test shall be entitled to the safe harbour protection available under Section 79 of the IT Act, provided it complies with the conditions set out therein and in the rules made under the IT Act.',
        'Gucchu Test implements reasonable security practices and procedures in accordance with Section 43A of the IT Act and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, as described in Section 9 of this Policy and in Section 8 of our Privacy Policy.',
        'Gucchu Test supports the use of electronic signatures and electronic records in accordance with Sections 3, 4 and 5 of the IT Act, and contracts, invoices and other records generated through the Platform shall have the same legal validity as paper documents, where applicable.',
        'Gucchu Test shall comply with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, including the obligations to publish terms of service, privacy policy, and to appoint a Grievance Officer whose contact details are set out in Section 13 below.',
      ],
    },
    {
      h: '8. Data Protection & Breach Response',
      paras: [
        'Gucchu Test shall take all reasonable measures to protect the personal information and sensitive personal data or information processed through the Platform, in accordance with Section 43A of the IT Act and the rules made thereunder.',
        'In the event of a personal data breach that is likely to cause harm to any data principal, Gucchu Test shall, as soon as reasonably practicable and in any event within seventy-two (72) hours of becoming aware of the breach: (a) notify the affected data principals of the nature of the breach, the personal information involved, the steps being taken to mitigate harm and the contact details of our Grievance Officer; (b) notify the Data Protection Board of India or such other authority as may be required under applicable law; and (c) take immediate steps to contain and remediate the breach.',
        'Gucchu Test maintains an incident response plan that includes detection, containment, eradication, recovery and post-incident review. All security incidents are logged and reviewed by our internal security team.',
      ],
    },
    {
      h: '9. Cybersecurity Measures',
      paras: [
        'Gucchu Test implements a layered defence-in-depth approach to protect the Platform and user information. Specific measures include:'],
      list: [
        'Rate limiting: authentication, password reset, search and other public endpoints are subject to per-IP and per-account rate limits to mitigate brute-force, credential stuffing and enumeration attacks.',
        'Input validation and sanitisation: all user-supplied input is validated and sanitised on the server side against strict allowlists; client-side validation is used only for user experience and is never relied upon for security.',
        'SQL injection prevention: all database queries are constructed using parameterised statements and prepared statements; raw string concatenation of user input into queries is prohibited.',
        'Cross-site scripting (XSS) prevention: output is escaped in accordance with the context (HTML, attribute, JavaScript, URL), and a strict Content Security Policy is enforced to limit the sources from which scripts and other active content can be loaded.',
        'Cross-site request forgery (CSRF) prevention: state-changing requests require an anti-CSRF token bound to the user session; cookies are set with the SameSite=Lax attribute by default and SameSite=Strict where appropriate.',
        'Secure password storage: passwords are hashed using the PBKDF2 key derivation function with a per-user random salt and a sufficiently high iteration count, and are never stored or logged in plaintext.',
        'Transport layer security: all traffic between the user and the Platform is encrypted using TLS 1.2 or higher; HSTS is enabled to enforce HTTPS.',
        'Access controls: access to production systems is granted on a least-privilege basis and protected with multi-factor authentication; privileged actions are logged and reviewed.',
        'Audit logging: authentication events, administrative actions, payment events and content takedown actions are logged and retained for a minimum of twelve (12) months for investigation and compliance purposes.',
        'Dependency management: third-party libraries are tracked and updated in response to disclosed vulnerabilities; security advisories are monitored and patches are applied within defined service-level commitments.',
      ],
    },
    {
      h: '10. User-Generated Content & Takedown',
      paras: [
        'Gucchu Test permits Vendors and other users to submit content to the Platform, including product listings, images, reviews and messages ("User-Generated Content"). Gucchu Test does not actively monitor User-Generated Content but shall act expeditiously upon receiving a valid notice of unlawful or infringing content.',
        'Any person aggrieved by User-Generated Content hosted on the Platform may submit a written complaint to our Grievance Officer at grievance@gucchutest.com. The complaint must include: (a) the name and contact details of the complainant; (b) the specific URL or location of the alleged content; (c) a clear description of the alleged violation, including the legal or rights basis for the complaint; and (d) a good-faith statement that the complaint is accurate and that the complainant is authorised to act on behalf of the rights holder, where applicable.',
        'Upon receipt of a valid complaint, Gucchu Test shall acknowledge the complaint within twenty-four (24) working hours and shall take action, including disabling access to the alleged content, within thirty-six (36) hours of receipt, in accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.',
        'Where a Vendor disagrees with a takedown, the Vendor may submit a counter-notice to grievance@gucchutest.com. Gucchu Test shall evaluate the counter-notice and may restore the content where appropriate, in accordance with applicable law.',
        'Gucchu Test reserves the right to remove any content, suspend any account, or terminate access to the Platform, in its sole discretion, where the content is unlawful, infringing, defamatory, obscene, or otherwise in violation of these Terms or applicable law.',
      ],
    },
    {
      h: '11. Indemnification for IP Infringement',
      paras: [
        'Each Vendor shall indemnify and hold harmless Gucchu Test, its directors, officers, employees and affiliates from and against any and all claims, demands, actions, losses, damages, liabilities, costs and expenses (including reasonable legal fees) arising out of or in connection with any claim that the Vendor Content submitted by the Vendor infringes the intellectual property, privacy, publicity or other rights of any third party.',
        'If Gucchu Test receives a notice of infringement relating to Vendor Content, Gucchu Test may, in addition to disabling access under Section 10, withhold the settlement proceeds of the affected Order pending resolution of the claim.',
        'Gucchu Test reserves the right, at its own expense, to assume the exclusive defence and control of any matter subject to indemnification by the Vendor, in which case the Vendor shall cooperate with Gucchu Test in asserting any available defences.',
      ],
    },
    {
      h: '12. Reporting Violations',
      paras: [
        'If you become aware of any actual or suspected violation of this Policy, including unauthorised access to the Platform, infringement of Gucchu Test intellectual property, or use of the Platform to infringe the rights of any third party, please report it promptly to grievance@gucchutest.com with the subject line "IT/IP Violation Report".',
        'Reports may be submitted anonymously where permitted by applicable law. Gucchu Test shall investigate all credible reports and shall take appropriate action, including legal action where warranted.',
        'Gucchu Test shall not retaliate against any person who, in good faith, reports a suspected violation of this Policy.',
      ],
    },
    {
      h: '13. Contact (Grievance Officer)',
      paras: [
        'For any questions, notices or complaints regarding this IT & IP Protection Policy, please contact our Grievance Officer:',
        'Name: Ms. A. Sharma, Grievance Officer, Gucchu Test Technologies Pvt. Ltd. Email: grievance@gucchutest.com. Postal address: Registered Office, New Delhi, India.',
        'Our Grievance Officer shall acknowledge your complaint within twenty-four (24) working hours and shall resolve it within fifteen (15) working days of receipt, in accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.',
      ],
    },
  ],
}

// ------------------------------------------------------------
// Doc registry
// ------------------------------------------------------------
const DOCS: Record<'terms' | 'privacy' | 'ip', DocMeta> = {
  terms: TERMS,
  privacy: PRIVACY,
  ip: IP,
}

const TABS: { key: 'terms' | 'privacy' | 'ip'; label: string }[] = [
  { key: 'terms', label: 'Terms & Conditions' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'ip', label: 'IT & IP Protection' },
]

// ------------------------------------------------------------
// Render
// ------------------------------------------------------------
export function LegalView({ doc }: { doc: 'terms' | 'privacy' | 'ip' }) {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const meta = DOCS[doc]

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 md:px-6 md:py-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={back}
        className="mb-3 -ml-2 text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Button>

      {/* Doc switcher — horizontal scroll on mobile, centred row on desktop */}
      <nav
        aria-label="Legal documents"
        className="mb-5 flex gap-2 overflow-x-auto no-scrollbar pb-1 md:justify-center"
      >
        {TABS.map((t) => {
          const active = t.key === doc
          return (
            <button
              key={t.key}
              onClick={() => navigate({ name: 'legal', doc: t.key })}
              className={
                'shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ' +
                (active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground')
              }
            >
              {t.label}
            </button>
          )
        })}
      </nav>

      {/* Document header */}
      <header className="mb-6 border-b border-border pb-4">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">{meta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.subtitle}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Last updated: <span className="font-medium text-foreground">{meta.updated}</span>
        </p>
      </header>

      {/* Document body */}
      <article className="space-y-8">
        {meta.sections.map((s) => (
          <section key={s.h} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground md:text-xl">{s.h}</h2>
            {s.paras?.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground md:text-base">
                {p}
              </p>
            ))}
            {s.list && (
              <ul className="space-y-2 pl-5">
                {s.list.map((li, i) => (
                  <li
                    key={i}
                    className="list-disc text-sm leading-relaxed text-muted-foreground md:text-base"
                  >
                    {li}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      {/* Footer */}
      <footer className="mt-10 border-t border-border pt-4">
        <p className="text-xs text-muted-foreground">
          Gucchu Test Technologies Pvt. Ltd. — Registered Office, New Delhi, India. For questions
          regarding this document, write to grievance@gucchutest.com.
        </p>
      </footer>
    </div>
  )
}
