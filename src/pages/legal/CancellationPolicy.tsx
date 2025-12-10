import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import Container from "../../components/Container";
import { Mail, Phone, Globe, Shield, AlertTriangle, Clock, CreditCard, Users, Ban, FileEdit } from "lucide-react";

const CancellationPolicy = () => {
  const sections = [
    { id: "overview", label: "1. Overview" },
    { id: "definitions", label: "2. Definitions" },
    { id: "standard-rules", label: "3. Standard Rules" },
    { id: "amendments", label: "4. Amendments" },
    { id: "host-failure", label: "5. Host Failure" },
    { id: "force-majeure", label: "6. Force Majeure" },
    { id: "no-show", label: "7. No-Show" },
    { id: "payment-issues", label: "8. Payment Issues" },
    { id: "refund-timelines", label: "9. Refund Timelines" },
    { id: "local-support", label: "10. Local Support" },
    { id: "fraud", label: "11. Fraud & Misuse" },
    { id: "changes", label: "12. Changes" },
    { id: "contact", label: "13. Contact" },
  ];

  return (
    <>
      <Helmet>
        <title>Refund & Cancellation Policy | StayKedarnath</title>
        <meta name="description" content="Refund & Cancellation Policy for StayKedarnath.in - understand our refund process, cancellation rules, and timelines." />
        <link rel="canonical" href="https://staykedarnath.in/cancellation" />
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
                    <Link to="/privacy" className="block text-xs text-[#003580] hover:underline mt-1">Privacy Policy</Link>
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
                    Refund & Cancellation Policy — StayKedarnath.in
                  </h1>
                  <p className="text-sm text-gray-500">Last Updated: December 2, 2025</p>
                </div>

                {/* Introduction */}
                <div className="mb-6 text-sm text-gray-700 leading-relaxed">
                  <p>
                    This Refund & Cancellation Policy explains how cancellations, amendments, refunds, force-majeure situations, Host-Failure cases, and transaction issues are handled for bookings made through StayKedarnath.in ("StayKedarnath", "we", "us", "our"). This Policy is aligned with our <Link to="/terms" className="text-[#003580] hover:underline">Customer Terms of Service</Link> and reflects how regional travel realistically operates across the Kedarnath Yatra route.
                  </p>
                  <p className="mt-3">
                    It is written in a clear, comprehensive format similar to leading travel platforms, while protecting both travelers and local <Link to="/terms#a1" className="text-[#003580] hover:underline">Service Providers</Link>.
                  </p>
                  <p className="mt-3">
                    <strong>Important:</strong> StayKedarnath does not own, manage, or control accommodations. All accommodations are provided by independent Service Providers. We do not control or guarantee pricing, amenities, availability, or service quality — these are solely determined by Service Providers. See our <Link to="/disclaimer" className="text-[#003580] hover:underline">Disclaimer</Link> for full details.
                  </p>
                </div>

                {/* Section 1 - Overview */}
                <div id="overview" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">1. Policy Overview — Plain Language Summary</h2>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2">
                    <li>You may cancel any <Link to="/terms#a1" className="text-[#003580] hover:underline">booking</Link>; eligibility for refund depends on the timing and the property's rules.</li>
                    <li>Standard platform rules: <strong>100% refund (7+ days before)</strong>, <strong>50% refund (2–6 days before)</strong>, <strong>0% refund (within 24 hours)</strong>.</li>
                    <li>If a property displays a stricter or different policy during booking, <strong>that policy overrides the standard rules</strong>.</li>
                    <li>If your stay is disrupted because the host refuses service, overbooks, or gives your room to walk-in guests (<strong>Host Failure</strong>), we provide a <strong>full refund</strong> (for platform-processed payments) + on-ground assistance.</li>
                    <li>If travel is disrupted due to government orders, landslides, or natural disasters (<strong>Force Majeure</strong>), we work to secure refunds or date-changes on your behalf.</li>
                    <li>Refunds are always processed to the <strong>original payment method only</strong>.</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3 italic">
                    This summary is for convenience only. Please read the full policy below.
                  </p>
                </div>

                {/* Section 2 - Definitions */}
                <div id="definitions" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">2. Key Definitions</h2>
                  <ul className="text-sm text-gray-700 space-y-2 ml-2">
                    <li><strong>Booking</strong> — A reservation confirmed through a <Link to="/terms#a1" className="text-[#003580] hover:underline">Booking Voucher</Link> or confirmation message.</li>
                    <li><strong>Service Provider</strong> — Independent hotels, lodges, homestays, camps, or operators listed on the <Link to="/terms#a4" className="text-[#003580] hover:underline">Platform</Link>.</li>
                    <li><strong>Host Failure</strong> — Overbooking, refusal of a confirmed booking, unjustified price increase after confirmation, or giving booked rooms to walk-ins.</li>
                    <li><strong>Force Majeure</strong> — Events outside control: landslides, floods, snow blockage, road closures, government Yatra suspension.</li>
                    <li><strong>Platform-processed payment</strong> — Payments made online through StayKedarnath.in.</li>
                  </ul>
                </div>

                {/* Section 3 - Standard Rules */}
                <div id="standard-rules" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">3. Standard Refund Rules</h2>
                  <p className="text-sm text-gray-700 mb-4">These apply unless the property's own cancellation rules (shown during booking) differ.</p>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.1 Cancellations made 7 or more days before check-in</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li><strong>100% refund</strong> of amount paid on the Platform.</li>
                    <li>Processing time: <strong>5–10 working days</strong>.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.2 Cancellations made 2–6 days before check-in</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li><strong>50% refund</strong>.</li>
                    <li>The remaining 50% is retained by the Service Provider to cover blocked inventory.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.3 Cancellations made within 24 hours of check-in</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li><strong>No refund</strong>.</li>
                    <li>If the situation involves medical emergencies, road closures, or similar constraints, we attempt mediation — but refunds are <strong>not guaranteed</strong>.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.4 Same-day or urgent bookings</h3>
                  <p className="text-sm text-gray-700 ml-2">Some properties require <strong>non-refundable</strong> payments during peak days. Those rules override the standard policy.</p>
                </div>

                {/* Section 4 - Amendments */}
                <div id="amendments" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">4. Amendments (Date Changes, Guest Changes)</h2>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2">
                    <li>Date changes depend only on <strong>availability</strong> and the <strong>Service Provider's approval</strong>.</li>
                    <li>Any price difference must be paid by the traveler.</li>
                    <li>If amendments are denied, the standard cancellation rules apply.</li>
                  </ul>
                </div>

                {/* Section 5 - Host Failure */}
                <div id="host-failure" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">5. Host Failure — Our Local Protection Guarantee</h2>
                  <p className="text-sm text-gray-700 mb-3">Because we operate regionally, StayKedarnath provides stronger protections than typical aggregators.</p>
                  <p className="text-sm text-gray-700 mb-3">If a Service Provider commits <strong>Host Failure</strong>, StayKedarnath will:</p>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 ml-2 mb-4">
                    <li>Issue a <strong>100% refund</strong> for platform-processed payments.</li>
                    <li>Provide <strong>on-ground assistance</strong> via our local network to help find alternative accommodation (subject to availability).</li>
                    <li>Investigate the issue and may suspend or remove the property from the Platform.</li>
                  </ol>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-semibold text-amber-800 mb-2">If you paid the Service Provider directly (cash/UPI):</h4>
                    <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                      <li>We will help negotiate a refund,</li>
                      <li>But the final decision legally rests with the Service Provider.</li>
                    </ul>
                  </div>
                </div>

                {/* Section 6 - Force Majeure */}
                <div id="force-majeure" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">6. Force Majeure & Government Orders</h2>
                  <p className="text-sm text-gray-700 mb-3">Natural disruptions on the Kedarnath route may include:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li>Landslides, floods, snowfall,</li>
                    <li>Road closures or restricted entry,</li>
                    <li>Official Yatra suspensions by local administration.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">In such cases:</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>We work to secure <strong>full refunds or date changes</strong> from the Service Provider.</li>
                    <li>If the Service Provider refunds us, we transfer <strong>100% of that amount to you</strong>.</li>
                    <li>If only date-change or credit-note options are offered, we will relay those options.</li>
                  </ul>
                  <p className="text-sm text-gray-700">StayKedarnath cannot be held liable for refunds that Service Providers deny in force-majeure situations, but we always advocate on your behalf. See our <Link to="/terms#a19" className="text-[#003580] hover:underline">Terms of Service - Force Majeure</Link> section for more details.</p>
                </div>

                {/* Section 7 - No-Show */}
                <div id="no-show" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">7. No-Show Policy</h2>
                  <p className="text-sm text-gray-700 mb-3">If you fail to arrive and do not inform us or the host:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Booking will be marked as <strong>No-Show</strong>.</li>
                    <li><strong>No refund</strong> applies.</li>
                  </ul>
                  <p className="text-sm text-gray-700">If you anticipate delays, you must inform us or the Service Provider as early as possible.</p>
                </div>

                {/* Section 8 - Payment Issues */}
                <div id="payment-issues" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">8. Payment Gateway Failures & Pending Transactions</h2>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2">
                    <li>Refunds begin only after we verify that the payment was successfully received by us.</li>
                    <li>If payment is deducted but not received due to UPI or bank issues, the amount is typically reversed automatically by your bank.</li>
                    <li>Such reversals are not processed by StayKedarnath.</li>
                  </ul>
                  <p className="text-sm text-gray-700 mt-3">Normal bank reversal times: <strong>3–7 working days</strong>. For payment security details, see our <Link to="/terms#a8" className="text-[#003580] hover:underline">Terms of Service - Payments and Security</Link>.</p>
                </div>

                {/* Section 9 - Refund Timelines */}
                <div id="refund-timelines" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">9. Refund Processing & Timelines</h2>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2 mb-3">
                    <li>Refunds are transferred only to the <strong>original payment method</strong>.</li>
                    <li>UPI refunds: <strong>2–5 working days</strong>.</li>
                    <li>Bank/card refunds: <strong>5–10 working days</strong> (depending on the bank).</li>
                    <li>We will notify you by email when the refund is initiated.</li>
                  </ul>
                  <p className="text-sm text-gray-700">StayKedarnath is not responsible for delays caused by banks or payment networks.</p>
                </div>

                {/* Section 10 - Local Support */}
                <div id="local-support" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">10. Local Support Advantage</h2>
                  <p className="text-sm text-gray-700 mb-3">As a regional platform, we may offer additional help:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>On-ground mediation with Service Providers,</li>
                    <li>Assistance in locating alternate stays during Host Failure,</li>
                    <li>Support during local disruptions.</li>
                  </ul>
                  <p className="text-sm text-gray-700">This support is <strong>best-effort</strong>, not guaranteed, especially during peak Yatra days. Learn more <Link to="/about" className="text-[#003580] hover:underline">About Us</Link> and our local presence.</p>
                </div>

                {/* Section 11 - Fraud */}
                <div id="fraud" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">11. Fraud, Abuse & Misuse of Refund System</h2>
                  <p className="text-sm text-gray-700 mb-3">Refunds may be denied if we identify:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>False claims or misrepresentation,</li>
                    <li>Attempts to exploit cancellations strategically,</li>
                    <li>Repeated last-minute cancellations harming Service Providers,</li>
                    <li>Suspicious chargeback or refund behaviour.</li>
                  </ul>
                  <p className="text-sm text-gray-700">Accounts involved may be reviewed, restricted, or suspended per our <Link to="/terms#a17" className="text-[#003580] hover:underline">Terms of Service - Measures Against Unacceptable Behavior</Link>.</p>
                </div>

                {/* Section 12 - Changes */}
                <div id="changes" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">12. Changes to This Policy</h2>
                  <p className="text-sm text-gray-700 mb-3">We may modify this Policy to reflect operational, legal, or seasonal updates. The "Last Updated" date indicates the latest revision.</p>
                  <p className="text-sm text-gray-700">Material changes will be communicated appropriately via the Platform. See <Link to="/terms#a21" className="text-[#003580] hover:underline">Terms of Service - Changes to Terms</Link> for our update process.</p>
                </div>

                {/* Section 13 - Contact */}
                <div id="contact" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">13. Contact & Support</h2>
                  <p className="text-sm text-gray-700 mb-4">For cancellation, refund, or booking-related queries:</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#003580]" />
                      <span className="text-gray-700">Email: <a href="mailto:info@staykedarnath.in" className="text-[#003580] hover:underline">info@staykedarnath.in</a></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-gray-700">WhatsApp: <a href="https://wa.me/919027475942" className="text-green-600 hover:underline">Chat with us</a></span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-[#003580]" />
                      <span className="text-gray-700"><Link to="/contact" className="text-[#003580] hover:underline">Raise a Support Ticket</Link></span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">We aim to acknowledge queries within <strong>24–48 hours</strong>.</p>
                </div>

                {/* Related Links */}
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Related Policies</h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <Link to="/terms" className="text-[#003580] hover:underline">→ Terms of Service</Link>
                    <Link to="/privacy" className="text-[#003580] hover:underline">→ Privacy Policy</Link>
                    <Link to="/shipping" className="text-[#003580] hover:underline">→ Shipping Policy</Link>
                  </div>
                </div>

                {/* End */}
                <div className="border-t border-gray-200 pt-6 mt-8">
                  <p className="text-sm text-gray-600 text-center font-medium">
                    End of Refund & Cancellation Policy — StayKedarnath.in
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

export default CancellationPolicy;
