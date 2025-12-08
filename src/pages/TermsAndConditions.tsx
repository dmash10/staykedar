import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { Mail, Phone, Globe } from "lucide-react";

const TermsAndConditions = () => {
  const sections = [
    { id: "summary", label: "Summary" },
    { id: "section-a", label: "A. General Terms" },
    { id: "a1", label: "A1. Definitions" },
    { id: "a2", label: "A2. Scope" },
    { id: "a3", label: "A3. About Us" },
    { id: "a4", label: "A4. Platform & Content" },
    { id: "a5", label: "A5. Conduct" },
    { id: "a6", label: "A6. Account" },
    { id: "a7", label: "A7. Prices & Taxes" },
    { id: "a8", label: "A8. Payments" },
    { id: "a9", label: "A9. Policies" },
    { id: "a10", label: "A10. Privacy" },
    { id: "a11", label: "A11. Accessibility" },
    { id: "a12", label: "A12. Insurance" },
    { id: "a13", label: "A13. Rewards" },
    { id: "a14", label: "A14. IP" },
    { id: "a15", label: "A15. Complaints" },
    { id: "a16", label: "A16. Communication" },
    { id: "a17", label: "A17. Behavior" },
    { id: "a18", label: "A18. Liability" },
    { id: "a19", label: "A19. Force Majeure" },
    { id: "a20", label: "A20. Governing Law" },
    { id: "a21", label: "A21. Changes" },
    { id: "section-b", label: "B. Accommodation" },
    { id: "section-c", label: "C. Transport" },
    { id: "section-d", label: "D. Operations" },
    { id: "section-e", label: "E. Contact" },
    { id: "section-f", label: "F. Definitions" },
  ];

  return (
    <>
      <Helmet>
        <title>Terms of Service | StayKedarnath</title>
        <meta name="description" content="Customer Terms of Service for StayKedarnath.in - comprehensive terms governing your use of our platform." />
        <link rel="canonical" href="https://staykedarnath.in/terms" />
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
                    <Link to="/privacy" className="block text-xs text-[#003580] hover:underline">Privacy Policy</Link>
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
                    Customer Terms of Service — StayKedarnath.in
                  </h1>
                  <p className="text-sm text-gray-500">Last Updated: December 8, 2025</p>
                </div>

                {/* Introduction */}
                <div className="mb-6 text-sm text-gray-700 leading-relaxed space-y-3">
                  <p>
                    Welcome to StayKedarnath.in ("StayKedarnath", "we", "us", "our"). These Customer Terms of Service ("Terms") describe the rights and responsibilities that apply when you access or use our website (www.staykedarnath.in), our mobile interfaces, or any services offered through the Platform. They also explain the relationship between you, StayKedarnath, and the independent accommodation or service providers ("Service Providers") listed on the Platform.
                  </p>
                  <p>
                    Please read these Terms carefully. By using the Platform, requesting bookings, making payments, or otherwise interacting with our services, you agree to be bound by these Terms. If you do not accept these Terms in full, please do not use the Platform or place a booking.
                  </p>
                  <p>
                    These Terms are written to be comprehensive and practically useful for all parties involved — travelers, family groups, Service Providers, and partners — and to clarify what you may expect from us and from Service Providers.
                  </p>
                </div>

                {/* Summary */}
                <div id="summary" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Plain-language Summary (for quick reading)</h2>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2">
                    <li>StayKedarnath.in is a regional aggregator and concierge platform focused on verified stays along the Kedarnath Yatra route. We present property information, assist with booking confirmations, and provide local, on-ground support where feasible.</li>
                    <li>We are an intermediary: Service Providers are independently responsible for the supply of accommodation and other Travel Experiences. We do not own or operate the listed properties unless explicitly stated.</li>
                    <li>Bookings are contracts between you and the Service Provider. StayKedarnath facilitates communication and (in certain cases) payment processing.</li>
                    <li>Important standalone policies: Privacy Policy and Refund & Cancellation Policy. These documents are linked separately on the site and form an integral part of these Terms.</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3 italic">
                    This summary is not a substitute for the full Terms. If you need help understanding anything, contact us at info@staykedarnath.in.
                  </p>
                </div>

                {/* Table of Contents */}
                <div className="mb-8 bg-gray-50 rounded-lg p-4">
                  <h2 className="text-base font-bold text-gray-900 mb-3">Table of Contents</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm">
                    <div className="space-y-1">
                      <a href="#section-a" className="block font-semibold text-gray-900 hover:text-[#003580] mt-2">A. General Terms for All Travel Experiences</a>
                      <a href="#a1" className="block ml-3 text-gray-700 hover:text-[#003580]">A1. Definitions</a>
                      <a href="#a2" className="block ml-3 text-gray-700 hover:text-[#003580]">A2. Scope and Acceptance of Terms</a>
                      <a href="#a3" className="block ml-3 text-gray-700 hover:text-[#003580]">A3. About StayKedarnath.in</a>
                      <a href="#a4" className="block ml-3 text-gray-700 hover:text-[#003580]">A4. The Platform and Content</a>
                      <a href="#a5" className="block ml-3 text-gray-700 hover:text-[#003580]">A5. Values, Conduct & Responsible Use</a>
                      <a href="#a6" className="block ml-3 text-gray-700 hover:text-[#003580]">A6. Personalization and Account Features</a>
                      <a href="#a7" className="block ml-3 text-gray-700 hover:text-[#003580]">A7. Prices, Errors, and Taxes</a>
                      <a href="#a8" className="block ml-3 text-gray-700 hover:text-[#003580]">A8. Payments and Security</a>
                      <a href="#a9" className="block ml-3 text-gray-700 hover:text-[#003580]">A9. Policies Applicable to Bookings</a>
                      <a href="#a10" className="block ml-3 text-gray-700 hover:text-[#003580]">A10. Privacy & Cookies (summary)</a>
                      <a href="#a11" className="block ml-3 text-gray-700 hover:text-[#003580]">A11. Accessibility and Special Requirements</a>
                      <a href="#a12" className="block ml-3 text-gray-700 hover:text-[#003580]">A12. Travel Insurance Recommendation</a>
                      <a href="#a13" className="block ml-3 text-gray-700 hover:text-[#003580]">A13. Rewards, Promotions & Wallet</a>
                      <a href="#a14" className="block ml-3 text-gray-700 hover:text-[#003580]">A14. Intellectual Property</a>
                      <a href="#a15" className="block ml-3 text-gray-700 hover:text-[#003580]">A15. Complaints, Remedies & What If Something Goes Wrong</a>
                      <a href="#a16" className="block ml-3 text-gray-700 hover:text-[#003580]">A16. Communication with Service Providers</a>
                      <a href="#a17" className="block ml-3 text-gray-700 hover:text-[#003580]">A17. Measures Against Unacceptable Behavior</a>
                      <a href="#a18" className="block ml-3 text-gray-700 hover:text-[#003580]">A18. Limitation of Liability and Indemnification</a>
                      <a href="#a19" className="block ml-3 text-gray-700 hover:text-[#003580]">A19. Force Majeure</a>
                      <a href="#a20" className="block ml-3 text-gray-700 hover:text-[#003580]">A20. Governing Law, Venue & Dispute Resolution</a>
                      <a href="#a21" className="block ml-3 text-gray-700 hover:text-[#003580]">A21. Changes to Terms</a>
                    </div>
                    <div className="space-y-1">
                      <a href="#section-b" className="block font-semibold text-gray-900 hover:text-[#003580] mt-2">B. Accommodation-specific Terms</a>
                      <a href="#b1" className="block ml-3 text-gray-700 hover:text-[#003580]">B1. Scope</a>
                      <a href="#b2" className="block ml-3 text-gray-700 hover:text-[#003580]">B2. Contractual Relationship and Booking Vouchers</a>
                      <a href="#b3" className="block ml-3 text-gray-700 hover:text-[#003580]">B3. What StayKedarnath Will Do</a>
                      <a href="#b4" className="block ml-3 text-gray-700 hover:text-[#003580]">B4. What You Must Do</a>
                      <a href="#b5" className="block ml-3 text-gray-700 hover:text-[#003580]">B5. Price and Payment Details</a>
                      <a href="#b6" className="block ml-3 text-gray-700 hover:text-[#003580]">B6. Amendments, Cancellations & Refunds</a>
                      <a href="#b7" className="block ml-3 text-gray-700 hover:text-[#003580]">B7. Damage Claims and Security Deposits</a>
                      <a href="#b8" className="block ml-3 text-gray-700 hover:text-[#003580]">B8. Host-Failure Protections & On-ground Assistance</a>
                      <a href="#section-c" className="block font-semibold text-gray-900 hover:text-[#003580] mt-4">C. Transportation, Attractions, and Other</a>
                      <a href="#section-d" className="block font-semibold text-gray-900 hover:text-[#003580] mt-4">D. Operational Clauses</a>
                      <a href="#d1" className="block ml-3 text-gray-700 hover:text-[#003580]">D1. Fraud Prevention & Security</a>
                      <a href="#d2" className="block ml-3 text-gray-700 hover:text-[#003580]">D2. Content Standards and Reviews</a>
                      <a href="#d3" className="block ml-3 text-gray-700 hover:text-[#003580]">D3. Suspension, Termination</a>
                      <a href="#d4" className="block ml-3 text-gray-700 hover:text-[#003580]">D4. Indemnity and Remedies</a>
                      <a href="#d5" className="block ml-3 text-gray-700 hover:text-[#003580]">D5. Severability and Interpretation</a>
                      <a href="#section-e" className="block font-semibold text-gray-900 hover:text-[#003580] mt-4">E. Contact Information</a>
                      <a href="#section-f" className="block font-semibold text-gray-900 hover:text-[#003580] mt-4">F. Expanded Definitions</a>
                    </div>
                  </div>
                </div>

                {/* Section A */}
                <div id="section-a" className="mb-6 scroll-mt-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#003580]">
                    A. General Terms for All Travel Experiences
                  </h2>
                </div>

                {/* A1 */}
                <div id="a1" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A1. Definitions</h3>
                  <p className="text-sm text-gray-700 mb-2">In these Terms the following capitalized words have the meaning set out below:</p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li><strong>Account:</strong> the account you create to use the Platform.</li>
                    <li><strong>Booking:</strong> a confirmed reservation for a Travel Experience that is evidenced by a Booking Voucher or confirmation message.</li>
                    <li><strong>Booking Voucher:</strong> the confirmation document (email, message or PDF) that confirms a Booking.</li>
                    <li><strong>Service Provider:</strong> an independent owner/operator of an accommodation, transport service, or attraction listed on the Platform.</li>
                    <li><strong>Platform:</strong> the website www.staykedarnath.in, any mobile application, and associated interfaces we provide.</li>
                    <li><strong>Travel Experience:</strong> any product or service listed via the Platform (accommodation, transport, attraction, etc.).</li>
                    <li><strong>User/You:</strong> any person using the Platform, whether or not a registered account-holder.</li>
                    <li><strong>Host Failure:</strong> a Service Provider's refusal to honour a confirmed Booking, overbooking, price gouging after confirmation, or any action that denies a confirmed guest access to their reserved Travel Experience.</li>
                  </ul>
                </div>

                {/* A2 */}
                <div id="a2" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A2. Scope and Acceptance of Terms</h3>
                  <p className="text-sm text-gray-700 mb-2">These Terms apply whenever you access or use the Platform, request or make a Booking, leave reviews, or otherwise interact with our services.</p>
                  <p className="text-sm text-gray-700 mb-2">Additional or different terms may apply to specific products or promotions and will be presented to you during the booking process; those terms form part of the contract if they are accepted as part of booking.</p>
                  <p className="text-sm text-gray-700">If a competent authority finds any clause unlawful or unenforceable, the remainder of these Terms remain in force.</p>
                </div>

                {/* A3 */}
                <div id="a3" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A3. About StayKedarnath.in</h3>
                  <p className="text-sm text-gray-700 mb-2">StayKedarnath.in provides an online platform for discovering, comparing, and requesting Bookings for Travel Experiences in the Kedarnath region. We do not own or operate Service Providers unless explicitly stated.</p>
                  <p className="text-sm text-gray-700 mb-2">Our role includes listing, verification (where practicable), showing information, assisting with confirmations, and in some cases facilitating payment processing.</p>
                  <p className="text-sm text-gray-700">The operational supply of any Travel Experience is the responsibility of the Service Provider. Any contractual rights and obligations connected to the Travel Experience arise between you and the Service Provider when the Booking is confirmed.</p>
                </div>

                {/* A4 */}
                <div id="a4" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A4. The Platform and Content</h3>
                  <p className="text-sm text-gray-700 mb-2">We obtain information from Service Providers, public sources, and our verification efforts. We endeavor to keep content accurate and up-to-date, but content (including pricing, availability, amenities, and images) may change.</p>
                  <p className="text-sm text-gray-700 mb-2"><strong>StayKedarnath does not control or guarantee pricing, amenities, availability, or the service quality of accommodations.</strong> All such decisions are made solely by independent Service Providers.</p>
                  <p className="text-sm text-gray-700 mb-2">The Platform is provided on an "as available" and "as is" basis. We do not promise uninterrupted access, and we are not liable for temporary outages.</p>
                  <p className="text-sm text-gray-700 mb-2">The presence of a Service Provider on the Platform is not an endorsement by us. Users should review Service Provider details and confirm directly when necessary.</p>

                  <h4 className="text-sm font-semibold text-gray-900 mt-4 mb-2">Platform-Verified Listings</h4>
                  <p className="text-sm text-gray-700 mb-2">StayKedarnath may perform independent on-ground verification, including capturing photos, videos, and documenting conditions. However, such verification reflects the condition <strong>on the date of documentation only</strong>. Mountain regions experience rapid changes due to weather, season, or renovations. This verification does not imply ownership, management, or guarantee of long-term accuracy.</p>

                  <h4 className="text-sm font-semibold text-gray-900 mt-4 mb-2">Host-Uploaded Content</h4>
                  <p className="text-sm text-gray-700 mb-2">Service Providers may upload their own photos, descriptions, pricing, and amenities. Hosts remain fully responsible for ensuring accuracy and timely updates. We may revise or remove content that becomes outdated, misleading, or violates our standards.</p>
                  <p className="text-sm text-gray-700">For full details, see our <Link to="/disclaimer" className="text-[#003580] hover:underline">Disclaimer & Liability Notice</Link>.</p>
                </div>

                {/* A5 */}
                <div id="a5" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A5. Values, Conduct & Responsible Use</h3>
                  <p className="text-sm text-gray-700 mb-2">Users must act in good faith, not post false information, and must respect local laws, cultural norms, and Service Provider rules.</p>
                  <p className="text-sm text-gray-700 mb-2">Making fraudulent, abusive, or nuisance bookings is prohibited. Users who behave unreasonably may be blocked and liable for losses to Service Providers or to us.</p>
                  <p className="text-sm text-gray-700">All reviews and user-generated content must reflect honest, first-hand experiences. Fabricated or defamatory content is prohibited and may be removed.</p>
                </div>

                {/* A6 */}
                <div id="a6" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A6. Personalization and Account Features</h3>
                  <p className="text-sm text-gray-700 mb-2">We may personalize the Platform experience using your Account preferences and usage data to present relevant offers and content.</p>
                  <p className="text-sm text-gray-700 mb-2">You are responsible for maintaining the confidentiality of your Account credentials and for all activities that occur under your Account.</p>
                  <p className="text-sm text-gray-700">Notify us immediately if you suspect unauthorized access to your Account.</p>
                </div>

                {/* A7 */}
                <div id="a7" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A7. Prices, Errors, and Taxes</h3>
                  <p className="text-sm text-gray-700 mb-2">Prices shown are indicative and provided by Service Providers. Final prices are confirmed during checkout.</p>
                  <p className="text-sm text-gray-700 mb-2">Where obvious pricing errors are displayed (e.g., clearly incorrect currency or decimal mistakes), we may cancel the Booking and refund any amounts paid.</p>
                  <p className="text-sm text-gray-700">Prices may not include local taxes, service charges, or mandatory levies; these will be displayed during the booking process and may be payable at the property.</p>
                </div>

                {/* A8 */}
                <div id="a8" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A8. Payments and Security</h3>
                  <p className="text-sm text-gray-700 mb-2">Payment instructions and available methods will be presented during the booking process. Where we act as the payment facilitator, we will clearly indicate this.</p>
                  <p className="text-sm text-gray-700 mb-2">We do not store sensitive payment credentials on our servers. We rely on trusted payment processors and follow standard security practices. Users must ensure their payment methods are valid and have sufficient funds.</p>
                  <p className="text-sm text-gray-700 mb-2">For certain urgent Bookings (same-day or high-demand peak Yatra periods), full prepayment may be required by the Service Provider to secure inventory.</p>
                  <p className="text-sm text-gray-700">If you suspect fraudulent activity related to payments, notify us and your card provider immediately.</p>
                </div>

                {/* A9 */}
                <div id="a9" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A9. Policies Applicable to Bookings</h3>
                  <p className="text-sm text-gray-700 mb-2">When you make a Booking, you accept the Service Provider's cancellation, damage, and other relevant policies which will be displayed during the booking flow.</p>
                  <p className="text-sm text-gray-700">Our separate <Link to="/cancellation" className="text-[#003580] hover:underline">Refund & Cancellation Policy</Link> and <Link to="/privacy" className="text-[#003580] hover:underline">Privacy Policy</Link> form part of these Terms.</p>
                </div>

                {/* A10 */}
                <div id="a10" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A10. Privacy & Cookies (summary)</h3>
                  <p className="text-sm text-gray-700">Our <Link to="/privacy" className="text-[#003580] hover:underline">Privacy Policy</Link> explains the personal data we collect and how we use it. We use cookies and tracking technologies to improve functionality, measure usage, and provide personalised content. You may manage cookie preferences via your browser or the Platform's cookie settings.</p>
                </div>

                {/* A11 */}
                <div id="a11" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A11. Accessibility and Special Requirements</h3>
                  <p className="text-sm text-gray-700">If you have accessibility needs or require special assistance (e.g., mobility, dietary, religious considerations), disclose these during booking. We will pass such requests to the Service Provider and assist where feasible, but compliance is ultimately the Service Provider's responsibility.</p>
                </div>

                {/* A12 */}
                <div id="a12" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A12. Travel Insurance Recommendation</h3>
                  <p className="text-sm text-gray-700">Travel to high-altitude regions like Kedarnath involves additional risks. We strongly recommend you obtain appropriate travel, medical evacuation, and personal accident insurance before travel. We do not provide insurance as part of the Platform services.</p>
                </div>

                {/* A13 */}
                <div id="a13" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A13. Rewards, Promotions & Wallet</h3>
                  <p className="text-sm text-gray-700 mb-2">Any promotional offers, credits, or wallet balances are subject to separate terms that will be made available when the offer is presented.</p>
                  <p className="text-sm text-gray-700">We reserve the right to modify, suspend, or terminate promotional programs at our discretion.</p>
                </div>

                {/* A14 */}
                <div id="a14" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A14. Intellectual Property</h3>
                  <p className="text-sm text-gray-700">All Platform content, including text, graphics, logos, and code, is owned by or licensed to StayKedarnath. Unauthorized copying, distribution, or use of our intellectual property is prohibited.</p>
                </div>

                {/* A15 */}
                <div id="a15" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A15. Complaints, Remedies & What If Something Goes Wrong</h3>
                  <p className="text-sm text-gray-700 mb-2">If a problem arises with a Booking, first contact the Service Provider to seek an immediate resolution.</p>
                  <p className="text-sm text-gray-700 mb-2">If the Service Provider cannot resolve the issue, contact us at info@staykedarnath.in with your Booking reference, a description of the issue, and supporting evidence (photos, receipts). We will log and investigate complaints and make reasonable efforts to assist.</p>
                  <p className="text-sm text-gray-700 mb-2">Remedies may include refunds, credits, alternative accommodation assistance, or dispute escalation depending on facts and applicable policies.</p>
                  <p className="text-sm text-gray-700">For urgent safety or medical issues, contact local emergency services immediately and then inform us.</p>
                </div>

                {/* A16 */}
                <div id="a16" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A16. Communication with Service Providers</h3>
                  <p className="text-sm text-gray-700">We may facilitate communications between you and Service Providers, but we do not guarantee response times or outcomes. Any promises made directly by Service Providers form part of the contract between you and that Service Provider.</p>
                </div>

                {/* A17 */}
                <div id="a17" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A17. Measures Against Unacceptable Behavior</h3>
                  <p className="text-sm text-gray-700 mb-2">We may suspend or terminate Accounts, cancel Bookings, or take other actions where users breach the Terms, defraud Service Providers, or act abusively.</p>
                  <p className="text-sm text-gray-700">If we cancel your Booking for cause, you may not be entitled to a refund depending on the circumstances.</p>
                </div>

                {/* A18 */}
                <div id="a18" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A18. Limitation of Liability and Indemnification</h3>
                  <p className="text-sm text-gray-700 mb-2">To the fullest extent permitted by law, our aggregate liability for any claim arising from or related to these Terms or your Booking shall not exceed the total commission or service fee we received for that Booking.</p>
                  <p className="text-sm text-gray-700 mb-2">We are not liable for losses caused by Service Providers, natural events, or events beyond our reasonable control.</p>
                  <p className="text-sm text-gray-700">You agree to indemnify and hold harmless StayKedarnath and our personnel from any claim, loss, or expense arising out of your breach of these Terms, misuse of the Platform, or violation of applicable law.</p>
                </div>

                {/* A19 */}
                <div id="a19" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A19. Force Majeure</h3>
                  <p className="text-sm text-gray-700">We are not responsible for delays or failures caused by events beyond our reasonable control, including natural disasters, government actions, strikes, or telecommunications failures. In such events, we will use reasonable efforts to assist affected Users but cannot guarantee outcomes.</p>
                </div>

                {/* A20 */}
                <div id="a20" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A20. Governing Law, Venue & Dispute Resolution</h3>
                  <p className="text-sm text-gray-700 mb-2">These Terms are governed by the laws of India. To the extent permitted by applicable mandatory consumer protection laws, disputes shall be subject to the jurisdiction of courts in Rudraprayag, Uttarakhand.</p>
                  <p className="text-sm text-gray-700">Before commencing formal legal action, Users agree to raise disputes via our customer support so we can attempt amicable resolution.</p>
                </div>

                {/* A21 */}
                <div id="a21" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">A21. Changes to Terms</h3>
                  <p className="text-sm text-gray-700">We may update these Terms periodically. Material changes will be notified via the Platform or email where appropriate. Continued use of the Platform after the effective date of changes constitutes acceptance.</p>
                </div>

                {/* Section B */}
                <div id="section-b" className="mb-6 scroll-mt-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#003580]">
                    B. Accommodation-specific Terms
                  </h2>
                </div>

                <div id="b1" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">B1. Scope</h3>
                  <p className="text-sm text-gray-700">This section applies to accommodation Bookings (hotels, lodges, homestays, camps, guesthouses) made via the Platform.</p>
                </div>

                <div id="b2" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">B2. Contractual Relationship and Booking Vouchers</h3>
                  <p className="text-sm text-gray-700 mb-2">A Booking results in a direct contract between you and the Service Provider unless explicitly stated otherwise in writing. StayKedarnath is not a contracting party unless we state otherwise.</p>
                  <p className="text-sm text-gray-700">A Booking is only confirmed when you receive a Booking Voucher or confirmation message. Always retain the Booking Voucher and present it at check-in if requested.</p>
                </div>

                <div id="b3" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">B3. What StayKedarnath Will Do</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    <li>Display property information supplied by Service Providers.</li>
                    <li>Where feasible, verify property details through on-ground checks and local verification partners.</li>
                    <li>Assist with confirming reservations and, when possible, facilitate payments and refunds.</li>
                    <li>Provide local on-ground assistance in case of Host Failure, subject to availability and feasibility.</li>
                  </ul>
                </div>

                <div id="b4" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">B4. What You Must Do</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    <li>Provide accurate contact, identity, and travel information.</li>
                    <li>Carry valid government-issued identification for all guests and any permits required for the Yatra.</li>
                    <li>Comply with property house rules and reasonable requests by Service Provider staff.</li>
                    <li>Settle outstanding balances or extras directly with the Service Provider at check-in or check-out as required.</li>
                  </ul>
                </div>

                <div id="b5" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">B5. Price and Payment Details</h3>
                  <p className="text-sm text-gray-700 mb-2">The price displayed during booking includes components described at checkout: room rate, any disclosed taxes, and any service fee.</p>
                  <p className="text-sm text-gray-700 mb-2">If the Service Provider imposes mandatory local taxes or levies that were not reflected at checkout, you are responsible for paying those directly to the Service Provider unless stated otherwise.</p>
                  <p className="text-sm text-gray-700">For peak season and urgent bookings, Service Providers may request higher deposit amounts or full prepayment.</p>
                </div>

                <div id="b6" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">B6. Amendments, Cancellations & Refunds (detailed)</h3>
                  <p className="text-sm text-gray-700 mb-2">Our <Link to="/cancellation" className="text-[#003580] hover:underline">Refund & Cancellation Policy</Link> (separate page) outlines general rules. For bookings processed through the Platform, the standard rules are:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-2">
                    <li><strong>Full refund</strong> for cancellations made 7 or more days before check-in (unless the property specifies a different window at booking)</li>
                    <li><strong>50% refund</strong> for cancellations made 2–6 days before check-in</li>
                    <li><strong>No refund</strong> for cancellations made within 24 hours of check-in</li>
                  </ul>
                  <p className="text-sm text-gray-700 mb-2">Some Service Providers publish stricter or more flexible cancellation conditions; those specific conditions will be shown during booking and override the general rules.</p>
                  <p className="text-sm text-gray-700 mb-2">In Host Failure cases (overbooking, refusal, price change after confirmation), we provide a full refund for payments processed through the Platform and will use reasonable efforts to find suitable alternatives.</p>
                  <p className="text-sm text-gray-700">If the payment was made directly to the Service Provider, we will liaise on your behalf but cannot guarantee a refund — the final decision rests with the Service Provider unless local law requires otherwise.</p>
                </div>

                <div id="b7" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">B7. Damage Claims and Security Deposits</h3>
                  <p className="text-sm text-gray-700 mb-2">Service Providers may require a damage/security deposit at check-in. If a damage claim is submitted through the Platform, we will notify you and facilitate an investigation. Proven, reasonable damage costs may be charged to your payment method where permitted.</p>
                  <p className="text-sm text-gray-700">Ordinary wear and tear or pre-existing issues are not considered damage claims.</p>
                </div>

                <div id="b8" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">B8. Host-Failure Protections & On-ground Assistance</h3>
                  <p className="text-sm text-gray-700 mb-2">StayKedarnath's local presence allows us to provide on-ground support in many cases. If a confirmed Booking fails due to Host Failure, we will:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-2">
                    <li>Offer a full refund for payments processed through the Platform, and</li>
                    <li>Use local contacts to assist you in locating alternative accommodation when feasible.</li>
                  </ul>
                  <p className="text-sm text-gray-700 mb-2">Replacement accommodation depends on availability; we cannot guarantee it in all circumstances, especially during peak Yatra dates.</p>
                  <p className="text-sm text-gray-700">We reserve the right to suspend or remove Service Providers who demonstrate repeated Host Failures or unethical conduct.</p>
                </div>

                {/* Section C */}
                <div id="section-c" className="mb-6 scroll-mt-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#003580]">
                    C. Transportation, Attractions, and Other Travel Experiences (Reference)
                  </h2>
                  <p className="text-sm text-gray-700 mb-2">The Platform may list car hire, local transport, attractions, or other services. Each category has specific terms which will be shown during booking. In general:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    <li>Transport services require timely arrival and valid identity; cancellations may have stricter rules.</li>
                    <li>Car hire often requires the main driver to present a charge card and valid driving license at pick-up.</li>
                    <li>Attraction tickets may be time-limited and non-refundable depending on the provider.</li>
                  </ul>
                </div>

                {/* Section D */}
                <div id="section-d" className="mb-6 scroll-mt-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#003580]">
                    D. Operational Clauses and Additional Provisions
                  </h2>
                </div>

                <div id="d1" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">D1. Fraud Prevention & Security Measures</h3>
                  <p className="text-sm text-gray-700 mb-2">We use industry-standard measures to detect and prevent fraudulent bookings, payment fraud, and account misuse. We may decline or hold suspicious Bookings pending verification.</p>
                  <p className="text-sm text-gray-700">If we reasonably suspect fraud, we may freeze funds, suspend Accounts, or share limited information with law enforcement as required by law.</p>
                </div>

                <div id="d2" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">D2. Content Standards and Reviews</h3>
                  <p className="text-sm text-gray-700 mb-2">Reviews and user-submitted content must be honest and first-hand. By submitting content you grant us a worldwide, transferable, perpetual license to use and display that content.</p>
                  <p className="text-sm text-gray-700">We moderate content and may remove content that violates our standards, is abusive, illegal, or misleading.</p>
                </div>

                <div id="d3" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">D3. Suspension, Termination, and Account Closure</h3>
                  <p className="text-sm text-gray-700 mb-2">We may suspend or terminate Accounts for violations of these Terms, fraudulent behavior, or legal requirements.</p>
                  <p className="text-sm text-gray-700">If your Account is closed for cause, we may cancel pending Bookings; in such cases refunds (if any) will be handled according to these Terms and the relevant Service Provider's policies.</p>
                </div>

                <div id="d4" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">D4. Indemnity and Remedies</h3>
                  <p className="text-sm text-gray-700 mb-2">You agree to indemnify StayKedarnath against any loss, damage, claim, or expense arising from your breach of these Terms or from negligent or unlawful acts.</p>
                  <p className="text-sm text-gray-700">We reserve the right to pursue all available remedies for losses caused by abusive or fraudulent use of the Platform.</p>
                </div>

                <div id="d5" className="mb-6 scroll-mt-24">
                  <h3 className="text-base font-bold text-gray-900 mb-2">D5. Severability, Interpretation, and Entire Agreement</h3>
                  <p className="text-sm text-gray-700 mb-2">If any provision of these Terms is found unenforceable, it will be severed and the remainder will remain in effect.</p>
                  <p className="text-sm text-gray-700">These Terms, together with the <Link to="/privacy" className="text-[#003580] hover:underline">Privacy Policy</Link> and <Link to="/cancellation" className="text-[#003580] hover:underline">Refund & Cancellation Policy</Link>, constitute the entire agreement between you and StayKedarnath in relation to the Platform.</p>
                </div>

                {/* Section E */}
                <div id="section-e" className="mb-6 scroll-mt-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#003580]">
                    E. Contact Information and Effective Date
                  </h2>
                  <p className="text-sm text-gray-700 mb-4">If you have questions, need assistance, or wish to make a complaint, contact us:</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#003580]" />
                      <span className="text-gray-700">Email: <a href="mailto:info@staykedarnath.in" className="text-[#003580] hover:underline">info@staykedarnath.in</a></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#003580]" />
                      <span className="text-gray-700">Phone: +91 9027475942</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-[#003580]" />
                      <span className="text-gray-700">Website: <a href="https://www.staykedarnath.in" className="text-[#003580] hover:underline">www.staykedarnath.in</a></span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mt-4">These Terms are effective as of the date shown at the top of this document. We may revise the Terms from time to time; material changes will be communicated where practicable.</p>
                </div>

                {/* Section F */}
                <div id="section-f" className="mb-6 scroll-mt-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-[#003580]">
                    F. Expanded Definitions and Notes
                  </h2>
                  <p className="text-sm text-gray-700 mb-3">This section provides additional clarity on specific terms used throughout:</p>
                  <ul className="text-sm text-gray-700 space-y-2 ml-2">
                    <li><strong>Booking Voucher:</strong> the document sent by email or messaging app that confirms a Booking. Always retain it.</li>
                    <li><strong>Host Failure:</strong> defined in Section A1 and includes any unfair or unlawful denial of an honoured reservation.</li>
                    <li><strong>Net Rate:</strong> the final price paid to the Service Provider excluding any platform service fee.</li>
                    <li><strong>Service Fee:</strong> the fee retained by StayKedarnath for facilitating the Booking (if applicable).</li>
                    <li><strong>Force Majeure:</strong> events outside reasonable control such as natural disasters, strikes, or government orders.</li>
                  </ul>
                </div>

                {/* Related Links */}
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Related Policies</h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <Link to="/privacy" className="text-[#003580] hover:underline">→ Privacy Policy</Link>
                    <Link to="/cancellation" className="text-[#003580] hover:underline">→ Refund & Cancellation Policy</Link>
                  </div>
                </div>

                {/* End */}
                <div className="border-t border-gray-200 pt-6 mt-8">
                  <p className="text-sm text-gray-600 text-center font-medium">
                    End of Customer Terms of Service for StayKedarnath.in
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

export default TermsAndConditions;