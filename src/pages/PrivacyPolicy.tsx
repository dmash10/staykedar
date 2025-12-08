import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { Mail, MessageCircle, Ticket } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    { id: "key-terms", label: "1. Key Terms" },
    { id: "data-collection", label: "2. Data Collection" },
    { id: "purposes", label: "3. Processing Purposes" },
    { id: "legal-bases", label: "4. Legal Bases" },
    { id: "sharing", label: "5. Data Sharing" },
    { id: "transfers", label: "6. International Transfers" },
    { id: "cookies", label: "7. Cookies & Tracking" },
    { id: "automated", label: "8. AI & Profiling" },
    { id: "retention", label: "9. Data Retention" },
    { id: "security", label: "10. Data Security" },
    { id: "rights", label: "11. Your Rights" },
    { id: "children", label: "12. Children's Data" },
    { id: "specific", label: "13. Specific Notes" },
    { id: "changes", label: "14. Changes" },
    { id: "contact", label: "15. Contact" },
  ];

  return (
    <>
      <Helmet>
        <title>Privacy Policy | StayKedarnath</title>
        <meta name="description" content="Privacy Notice for StayKedarnath.in - how we collect, use, and protect your personal data." />
        <link rel="canonical" href="https://staykedarnath.in/privacy" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-white">
        <Nav />

        <main className="flex-grow pt-4">
          <Container>
            <div className="flex gap-8 max-w-6xl mx-auto py-8">

              {/* Sidebar */}
              <aside className="hidden lg:block w-56 flex-shrink-0">
                <div className="sticky top-24">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Navigation</p>
                  <nav className="space-y-0.5 max-h-[70vh] overflow-y-auto text-xs">
                    {sections.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className="block text-gray-600 hover:text-[#003580] py-1 px-2 rounded hover:bg-gray-50 transition-colors"
                      >
                        {section.label}
                      </a>
                    ))}
                  </nav>
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">Related</p>
                    <Link to="/terms" className="block text-xs text-[#003580] hover:underline">Terms of Service</Link>
                    <Link to="/cancellation" className="block text-xs text-[#003580] hover:underline mt-1">Refund Policy</Link>
                    <Link to="/shipping" className="block text-xs text-[#003580] hover:underline mt-1">Shipping Policy</Link>
                    <Link to="/disclaimer" className="block text-xs text-[#003580] hover:underline mt-1">Disclaimer</Link>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">

                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Privacy Notice — StayKedarnath.in
                  </h1>
                  <p className="text-sm text-gray-500">Last Updated: November 15, 2025</p>
                </div>

                {/* Introduction */}
                <div className="mb-6 text-sm text-gray-700 leading-relaxed space-y-3">
                  <p>
                    This Privacy Notice explains how StayKedarnath.in ("StayKedarnath", "we", "us", "our") collects, uses, shares, stores, and protects personal data when you use our website (www.staykedarnath.in), mobile interfaces, or our services (together, the "Platform"). It also explains the rights you have in respect of your personal data and how to exercise them.
                  </p>
                  <p>
                    This Notice is written for travelers and visitors who browse our Platform, create accounts, make bookings, contact customer support, or otherwise use our services. It is intended to be comprehensive and practical — similar in scope to privacy notices used by leading travel platforms — but tailored for a regional operator focused on the Kedarnath Yatra.
                  </p>
                  <p>
                    If you do not agree with this Notice, please do not use the Platform or provide personal data to us.
                  </p>
                </div>

                {/* Table of Contents */}
                <div className="mb-8 bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-bold text-gray-900 mb-3">Table of Contents (quick links)</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <a href="#key-terms" className="text-gray-700 hover:text-[#003580]">1. Key terms we use</a>
                    <a href="#data-collection" className="text-gray-700 hover:text-[#003580]">2. Personal data we collect</a>
                    <a href="#purposes" className="text-gray-700 hover:text-[#003580]">3. How and why we process data</a>
                    <a href="#legal-bases" className="text-gray-700 hover:text-[#003580]">4. Legal bases for processing</a>
                    <a href="#sharing" className="text-gray-700 hover:text-[#003580]">5. How we share data</a>
                    <a href="#transfers" className="text-gray-700 hover:text-[#003580]">6. International transfers</a>
                    <a href="#cookies" className="text-gray-700 hover:text-[#003580]">7. Cookies & tracking</a>
                    <a href="#automated" className="text-gray-700 hover:text-[#003580]">8. Automated decision-making & AI</a>
                    <a href="#retention" className="text-gray-700 hover:text-[#003580]">9. Retention of data</a>
                    <a href="#security" className="text-gray-700 hover:text-[#003580]">10. Data security</a>
                    <a href="#rights" className="text-gray-700 hover:text-[#003580]">11. Your rights</a>
                    <a href="#children" className="text-gray-700 hover:text-[#003580]">12. Children's data</a>
                    <a href="#specific" className="text-gray-700 hover:text-[#003580]">13. Specific market notes</a>
                    <a href="#changes" className="text-gray-700 hover:text-[#003580]">14. Changes to this Notice</a>
                    <a href="#contact" className="text-gray-700 hover:text-[#003580]">15. Contact & grievance officer</a>
                  </div>
                </div>

                {/* Section 1 */}
                <div id="key-terms" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">1. Key terms we use</h2>
                  <ul className="text-sm text-gray-700 space-y-2 ml-2">
                    <li><strong>Platform:</strong> www.staykedarnath.in, our mobile interfaces, APIs, and related services.</li>
                    <li><strong>You / User / Traveler:</strong> anyone using or visiting the Platform (with or without an account).</li>
                    <li><strong>Service Provider / Trip Provider:</strong> independent accommodation owners, transport operators, guides, or other third parties providing Travel Experiences listed on the Platform.</li>
                    <li><strong>Booking:</strong> a reservation confirmed by a Booking Voucher or confirmation message.</li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div id="data-collection" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">2. Personal data we collect and how we collect it</h2>
                  <p className="text-sm text-gray-700 mb-4">We collect personal data about you in three main ways: (a) data you provide directly to us, (b) data we collect automatically when you use the Platform, and (c) data we receive from third parties.</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">2.1. Data you provide directly</h3>
                  <p className="text-sm text-gray-700 mb-2">When you interact with the Platform or our customer service, you may provide:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li><strong>Contact information:</strong> name, email address, phone number, postal address.</li>
                    <li><strong>Booking details:</strong> travel dates, party size, room preferences, special requests, and any guest details required by Service Providers.</li>
                    <li><strong>Identity documents:</strong> passport, Aadhaar, voter ID, driver's license or other ID when required for regulatory checks or verification (only when necessary).</li>
                    <li><strong>Payment & billing information:</strong> payment status, last four digits of card (for records), UPI transaction references. We do not store full payment card numbers, CVV, or UPI PINs.</li>
                    <li><strong>Communications:</strong> messages sent to us via email, chat, WhatsApp, or phone, including any attachments you provide.</li>
                    <li><strong>User-generated content:</strong> reviews, photos, and ratings you post about properties or services.</li>
                    <li><strong>Support and verification inputs:</strong> selfies or identity photos where you consent to verification for trust/badge programs.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">2.2. Data collected automatically</h3>
                  <p className="text-sm text-gray-700 mb-2">When you browse or use the Platform we automatically collect:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li><strong>Technical data:</strong> IP address, device identifiers, browser type/version, operating system, screen resolution.</li>
                    <li><strong>Usage data:</strong> pages viewed, search queries, timestamps, clickstreams, and error logs.</li>
                    <li><strong>Location data:</strong> approximate location derived from IP; precise GPS location only if you allow it in the mobile app.</li>
                    <li><strong>Cookies and similar identifiers:</strong> session cookies, persistent cookies, and local storage identifiers.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">2.3. Data from third parties</h3>
                  <p className="text-sm text-gray-700 mb-2">We may receive data about you from:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    <li><strong>Service Providers:</strong> confirmation details, property check-in requirements, and communications related to your stay.</li>
                    <li><strong>Payment processors:</strong> transaction status, refunds, chargebacks, and limited payment metadata.</li>
                    <li><strong>Verification partners:</strong> identity and property verification results.</li>
                    <li><strong>Advertising and analytics providers:</strong> aggregated or pseudonymized performance data.</li>
                    <li><strong>Public & regulatory sources:</strong> law enforcement or government authorities when required.</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div id="purposes" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">3. How and why we process your personal data (purposes)</h2>
                  <p className="text-sm text-gray-700 mb-4">We process personal data to operate and improve the Platform, to fulfil bookings, and to comply with legal obligations. Key purposes include:</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.1. Providing and administering bookings</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Create, confirm, modify, and cancel Bookings; issue Booking Vouchers and receipts; pass necessary information to Service Providers to deliver the Travel Experience.</li>
                    <li>Send transactional messages (booking confirmations, reminders, check-in instructions).</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.2. Customer support and dispute resolution</h3>
                  <p className="text-sm text-gray-700 mb-3 ml-2">Respond to support requests, investigate complaints, and mediate disputes between travelers and Service Providers.</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.3. Payments, refunds & fraud prevention</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Initiate and verify payments, process refunds (see our <Link to="/cancellation" className="text-[#003580] hover:underline">Refund Policy</Link>), and investigate suspicious transactions or chargebacks.</li>
                    <li>Detect, prevent, and mitigate fraud and security risks (including automated fraud scoring and manual review).</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.4. Safety, verification & trust</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Verify identities where necessary for safety, guest verification badges, or regulatory compliance (e.g., Char Dham Yatra checks).</li>
                    <li>Share essential details with Service Providers to ensure guest identification and safety at check-in.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.5. Personalization & marketing (where permitted)</h3>
                  <p className="text-sm text-gray-700 mb-3 ml-2">Personalize property recommendations and promotional messages based on your preferences and past booking behavior (you can opt out of marketing).</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.6. Analytics & product improvement</h3>
                  <p className="text-sm text-gray-700 mb-3 ml-2">Aggregate and analyze data to improve search, UI, performance, and services; test features and measure engagement.</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.7. Legal compliance & recordkeeping</h3>
                  <p className="text-sm text-gray-700 ml-2">Maintain records to comply with accounting, tax, and regulatory requirements; respond to lawful requests from authorities.</p>
                </div>

                {/* Section 4 */}
                <div id="legal-bases" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">4. Legal bases for processing</h2>
                  <p className="text-sm text-gray-700 mb-3">Under applicable data protection laws (including Indian law and, where relevant, other jurisdictions), we rely on one or more of the following legal bases:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2 mb-3">
                    <li><strong>Contractual necessity:</strong> processing required to perform a booking contract or to take steps at your request prior to entering a contract (e.g., confirming bookings).</li>
                    <li><strong>Consent:</strong> where you have given consent (for example, to marketing communications or optional identity verification).</li>
                    <li><strong>Legitimate interests:</strong> for platform security, fraud prevention, service improvement, and enforcing our <Link to="/terms" className="text-[#003580] hover:underline">Terms of Service</Link> — balanced against your rights and freedoms.</li>
                    <li><strong>Legal obligation:</strong> where processing is required by law, such as tax or government-issued checks for the Yatra.</li>
                  </ul>
                  <p className="text-sm text-gray-700">When we rely on legitimate interests, we will never use your data in ways that meaningfully harm your interests without clear justification.</p>
                </div>

                {/* Section 5 */}
                <div id="sharing" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">5. How we share and disclose personal data</h2>
                  <p className="text-sm text-gray-700 mb-4">We share personal data only where necessary and with appropriate safeguards. Categories of recipients include:</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">5.1. Service Providers (required for fulfilment)</h3>
                  <p className="text-sm text-gray-700 mb-3 ml-2">To enable your stay or booked service, we share necessary personal data (names, contact details, arrival times, ID where required). Service Providers then process that data under their own policies.</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">5.2. Payment processors & financial institutions</h3>
                  <p className="text-sm text-gray-700 mb-3 ml-2">To process payments, confirm transactions, and manage chargebacks/refunds we share transactional metadata with banks, payment gateways, and payment aggregators.</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">5.3. Hosting, analytics & technical providers</h3>
                  <p className="text-sm text-gray-700 mb-3 ml-2">We use third-party hosting, cloud services, analytics (e.g., Google Analytics), and monitoring tools; they process data under contract to us.</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">5.4. Fraud prevention, identity verification & safety partners</h3>
                  <p className="text-sm text-gray-700 mb-3 ml-2">We may share limited data with providers that assist in identity checks, fraud detection, and safety investigations.</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">5.5. Legal or regulatory bodies</h3>
                  <p className="text-sm text-gray-700 mb-3 ml-2">We disclose personal data if required by law, court order, or to respond to lawful government requests; or to protect the rights, property, or safety of StayKedarnath, our users, or the public.</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">5.6. Corporate transactions & professional advisors</h3>
                  <p className="text-sm text-gray-700 mb-3 ml-2">If we reorganize, sell, or merge all or part of our business, personal data may be transferred to a buyer or new parent company subject to confidentiality protections. Professional advisors (lawyers, auditors) may also receive data on a need-to-know basis.</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">5.7. Advertising & marketing partners (hashed/pseudonymized)</h3>
                  <p className="text-sm text-gray-700 ml-2">For marketing campaigns we may share hashed or pseudonymized identifiers with advertising partners to enable targeted campaigns. We do not provide raw personal data for general advertising without consent where consent is required by law.</p>
                </div>

                {/* Section 6 */}
                <div id="transfers" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">6. International transfers and safeguards</h2>
                  <p className="text-sm text-gray-700 mb-3">We are based in India and process personal data in India. We may also transfer personal data to recipients outside India (e.g., cloud providers, payment processors, analytics partners). When transferring data internationally we implement adequate safeguards such as:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Contractual agreements with recipients including data processing clauses,</li>
                    <li>Where needed, standard contractual clauses or other legal mechanisms, and</li>
                    <li>Practical technical measures such as pseudonymization and encryption.</li>
                  </ul>
                  <p className="text-sm text-gray-700">If you are located in a jurisdiction that requires additional protections for international transfers (for example, the EEA or UK), contact us for details of the safeguards in place.</p>
                </div>

                {/* Section 7 */}
                <div id="cookies" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">7. Cookies, tracking & similar technologies</h2>
                  <p className="text-sm text-gray-700 mb-3">We and our partners use cookies, local storage, pixels, and similar technologies to support the Platform. Categories include:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li><strong>Strictly necessary cookies:</strong> required for site functionality and booking flow.</li>
                    <li><strong>Performance/analytics cookies:</strong> to understand how the Platform is used and improve it.</li>
                    <li><strong>Functional cookies:</strong> to remember preferences and session information.</li>
                    <li><strong>Marketing/advertising cookies:</strong> to provide relevant advertising and measure campaign performance.</li>
                  </ul>
                  <p className="text-sm text-gray-700">You can control cookies via your browser settings and the cookie banner on the Platform. Disabling certain cookies may degrade some features.</p>
                </div>

                {/* Section 8 */}
                <div id="automated" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">8. Automated decision-making, AI & profiling</h2>
                  <p className="text-sm text-gray-700 mb-3">We may use automated systems and machine learning models to support fraud detection, personalize content, and improve user experience. Where such processing has a legal or similarly significant effect on you, we will provide suitable safeguards including human review and an explanation of the rationale upon request.</p>
                  <p className="text-sm text-gray-700 mb-2">Examples:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li><strong>Fraud scoring:</strong> transactions may be automatically scored for risk; high-risk transactions are reviewed by humans before action is taken.</li>
                    <li><strong>Personalization:</strong> search rankings, property suggestions, and marketing may be influenced by automated models trained on anonymized and pseudonymized data.</li>
                  </ul>
                  <p className="text-sm text-gray-700">We do not currently use fully automated decision-making that produces legal or similarly significant effects without human intervention.</p>
                </div>

                {/* Section 9 */}
                <div id="retention" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">9. Retention of personal data</h2>
                  <p className="text-sm text-gray-700 mb-3">We retain personal data only as long as necessary for the purposes stated and to meet legal and regulatory obligations. Typical retention periods:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li><strong>Booking records & tax records:</strong> up to 7 years (or as required by law).</li>
                    <li><strong>Customer support communications:</strong> 1–3 years depending on the case.</li>
                    <li><strong>Authentication & account data:</strong> for the lifetime of the account plus a period for recovery and legal compliance.</li>
                    <li><strong>Analytics data:</strong> aggregated or pseudonymized; raw logs retained up to 24 months unless otherwise needed.</li>
                    <li><strong>Identity verification documents:</strong> retained only as long as necessary to complete verification and for fraud prevention obligations; then securely deleted unless law requires otherwise.</li>
                  </ul>
                  <p className="text-sm text-gray-700">Where retention is based on legitimate interests, we document and periodically review the need for keeping the data.</p>
                </div>

                {/* Section 10 */}
                <div id="security" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">10. Data security and breach response</h2>
                  <p className="text-sm text-gray-700 mb-3">We apply industry-standard technical and organizational measures to protect personal data, including:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Transport-layer encryption (TLS/HTTPS),</li>
                    <li>Pseudonymization and encryption of sensitive records where feasible,</li>
                    <li>Access control and least-privilege principles,</li>
                    <li>Regular security audits and vulnerability assessments,</li>
                    <li>Secure backups and disaster recovery plans.</li>
                  </ul>
                  <p className="text-sm text-gray-700">In the event of a data breach, we will follow our incident response plan, notify affected individuals and regulators as required by law, and take steps to remediate and prevent reoccurrence.</p>
                </div>

                {/* Section 11 */}
                <div id="rights" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">11. Your rights and how to exercise them</h2>
                  <p className="text-sm text-gray-700 mb-3">Subject to applicable law, you may have the following rights:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li><strong>Access:</strong> request a copy of personal data we hold about you.</li>
                    <li><strong>Correction:</strong> ask us to correct inaccurate or incomplete data.</li>
                    <li><strong>Erasure:</strong> request deletion of data where legal grounds permit.</li>
                    <li><strong>Restriction:</strong> ask for limitation of processing in certain circumstances.</li>
                    <li><strong>Portability:</strong> receive a machine-readable copy of data you provided.</li>
                    <li><strong>Objection:</strong> object to processing based on legitimate interests or direct marketing.</li>
                    <li><strong>Withdraw consent:</strong> where processing is based on consent.</li>
                  </ul>
                  <p className="text-sm text-gray-700">To exercise these rights, contact us at info@staykedarnath.in with subject "Data Subject Request". We will verify your identity and respond within the timelines required by applicable law. If you remain unsatisfied, you may lodge a complaint with a supervisory authority.</p>
                </div>

                {/* Section 12 */}
                <div id="children" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">12. Children's data</h2>
                  <p className="text-sm text-gray-700">The Platform is not intended for children under 13. We do not knowingly collect data from children. If a parent or guardian believes we have collected data about a child in error, please contact us and we will delete it.</p>
                </div>

                {/* Section 13 */}
                <div id="specific" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">13. Specific market or product notes</h2>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2">
                    <li><strong>Ground transport & car hires:</strong> additional identity or driving licence information may be required for bookings; these are shared with the relevant Service Provider.</li>
                    <li><strong>Insurance products:</strong> if offered, insurance providers will be separate controllers for insurance-specific data and will process it according to their policies.</li>
                    <li><strong>Local/regulatory checks:</strong> for the Kedarnath Yatra, local authorities or Service Providers may require identity data; when necessary, we will disclose such data to comply with local rules.</li>
                  </ul>
                </div>

                {/* Section 14 */}
                <div id="changes" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">14. Changes to this Notice</h2>
                  <p className="text-sm text-gray-700">We may update this Privacy Notice to reflect changes in our practices or legal requirements. The "Last Updated" date at the top will indicate when the Notice was last revised. Material changes will be communicated where appropriate.</p>
                </div>

                {/* Section 15 */}
                <div id="contact" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">15. Contact, grievance officer & supervisory authorities</h2>
                  <p className="text-sm text-gray-700 mb-4">If you have questions, requests, or complaints about this Privacy Notice or our data practices, contact us:</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#003580]" />
                      <span className="text-gray-700">Email: <a href="mailto:info@staykedarnath.in" className="text-[#003580] hover:underline">info@staykedarnath.in</a></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">WhatsApp: <a href="https://wa.me/919027475942" className="text-green-600 hover:underline">Chat with us</a></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Ticket className="w-4 h-4 text-[#003580]" />
                      <span className="text-gray-700"><Link to="/contact" className="text-[#003580] hover:underline">Raise a Support Ticket</Link></span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">We aim to acknowledge data subject requests within 48–72 hours and resolve them promptly. If you are not satisfied with our response, you can raise a complaint with the relevant data protection supervisory authority in your country.</p>
                </div>

                {/* Related Links */}
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Related Policies</h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <Link to="/terms" className="text-[#003580] hover:underline">→ Terms of Service</Link>
                    <Link to="/cancellation" className="text-[#003580] hover:underline">→ Refund & Cancellation Policy</Link>
                    <Link to="/shipping" className="text-[#003580] hover:underline">→ Shipping Policy</Link>
                  </div>
                </div>

                {/* End */}
                <div className="border-t border-gray-200 pt-6 mt-8">
                  <p className="text-sm text-gray-600 text-center font-medium">
                    End of Privacy Notice — StayKedarnath.in
                  </p>
                </div>

              </div>
            </div>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;