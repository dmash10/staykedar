import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { Mail, MessageCircle, Ticket } from "lucide-react";

const ShippingPolicy = () => {
  const sections = [
    { id: "nature", label: "1. Nature of Services" },
    { id: "delivery", label: "2. How We Deliver" },
    { id: "timelines", label: "3. Delivery Timelines" },
    { id: "on-ground", label: "4. On-Ground Services" },
    { id: "failures", label: "5. Delivery Failures" },
    { id: "updates", label: "6. Updates & Modifications" },
    { id: "communication", label: "7. Communication" },
    { id: "limitations", label: "8. Limitations" },
    { id: "changes", label: "9. Changes" },
    { id: "contact", label: "10. Contact" },
  ];

  return (
    <>
      <Helmet>
        <title>Shipping & Delivery Policy | StayKedarnath</title>
        <meta name="description" content="Shipping & Delivery Policy for StayKedarnath.in - how we deliver digital booking services and confirmations." />
        <link rel="canonical" href="https://staykedarnath.in/shipping" />
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
                    <Link to="/privacy" className="block text-xs text-[#003580] hover:underline mt-1">Privacy Policy</Link>
                    <Link to="/disclaimer" className="block text-xs text-[#003580] hover:underline mt-1">Disclaimer</Link>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1 min-w-0">

                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Shipping & Delivery Policy — StayKedarnath.in
                  </h1>
                  <p className="text-sm text-gray-500">Last Updated: November 9, 2025</p>
                </div>

                {/* Introduction */}
                <div className="mb-6 text-sm text-gray-700 leading-relaxed space-y-3">
                  <p>
                    This Shipping & Delivery Policy explains how StayKedarnath.in ("StayKedarnath", "we", "us", "our") delivers its services to travelers. Since we operate as a digital travel platform — not a physical goods seller — this Policy clarifies how booking confirmations, service delivery, communication timelines, and support processes function.
                  </p>
                  <p>
                    This Policy must be read together with our <Link to="/terms" className="text-[#003580] hover:underline">Customer Terms of Service</Link>, <Link to="/cancellation" className="text-[#003580] hover:underline">Refund & Cancellation Policy</Link>, and <Link to="/privacy" className="text-[#003580] hover:underline">Privacy Notice</Link>.
                  </p>
                  <p>
                    Our goal is to provide transparent, reliable, and timely delivery of all digital services related to your <Link to="/terms#a1" className="text-[#003580] hover:underline">booking</Link>.
                  </p>
                </div>

                {/* Section 1 - Nature of Services */}
                <div id="nature" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">1. Nature of Services (Important Explanation)</h2>
                  <p className="text-sm text-gray-700 mb-3">StayKedarnath does <strong>not</strong> ship any physical goods. All services are delivered <strong>digitally</strong>, including:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li>Booking confirmations</li>
                    <li><Link to="/terms#a1" className="text-[#003580] hover:underline">Booking Vouchers</Link></li>
                    <li>Payment receipts</li>
                    <li>Communication with <Link to="/terms#a1" className="text-[#003580] hover:underline">Service Providers</Link></li>
                    <li>Modification and cancellation updates</li>
                    <li>Support messages</li>
                    <li>Local assistance details</li>
                  </ul>
                  <p className="text-sm text-gray-700">Delivery of actual travel services (such as accommodation, transportation, meals, attractions) is performed by <strong>independent Service Providers</strong>, not StayKedarnath.</p>
                </div>

                {/* Section 2 - How We Deliver */}
                <div id="delivery" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">2. How We Deliver Digital Services</h2>
                  <p className="text-sm text-gray-700 mb-3">All digital confirmations and documents are delivered through one or more of the following channels:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li><strong>Email</strong> (primary delivery method)</li>
                    <li><strong>SMS/WhatsApp</strong> (where applicable)</li>
                    <li><strong>On-screen confirmation pages</strong> after payment</li>
                    <li><strong>Downloadable Booking Vouchers</strong> via the <Link to="/terms#a4" className="text-[#003580] hover:underline">Platform</Link></li>
                  </ul>
                  <p className="text-sm text-gray-700 mb-3">Delivery is considered successful when:</p>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li>A Booking Voucher is automatically generated and sent to your registered email address, and</li>
                    <li>The confirmation page appears on your screen after payment.</li>
                  </ol>
                  <p className="text-sm text-gray-700 mb-2">If you do not receive the email within 10 minutes, please check:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Spam or Promotions folder,</li>
                    <li>That your email address was entered correctly.</li>
                  </ul>
                  <p className="text-sm text-gray-700">If still missing, contact us at <a href="mailto:info@staykedarnath.in" className="text-[#003580] hover:underline">info@staykedarnath.in</a>.</p>
                </div>

                {/* Section 3 - Delivery Timelines */}
                <div id="timelines" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">3. Delivery Timelines</h2>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.1 Instant Delivery (Automated)</h3>
                  <p className="text-sm text-gray-700 mb-2">For most bookings made on the Platform:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li>Booking confirmation is delivered <strong>instantly</strong> after successful payment.</li>
                    <li>The Booking Voucher is emailed within <strong>10 minutes</strong>.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.2 Manual Confirmation (Exceptional Cases)</h3>
                  <p className="text-sm text-gray-700 mb-2">Some stays require manual verification with the Service Provider (typically during peak season or in remote areas).</p>
                  <p className="text-sm text-gray-700 mb-2">In such cases:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li>Delivery time may extend to <strong>15–60 minutes</strong>.</li>
                    <li>You will be notified if manual confirmation is needed.</li>
                    <li>If the property cannot confirm, you will be offered an alternative or a refund as per <Link to="/cancellation" className="text-[#003580] hover:underline">policy</Link>.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">3.3 Delayed Delivery Due to External Factors</h3>
                  <p className="text-sm text-gray-700 mb-2">Delays may occur because of:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Power outages in mountain regions</li>
                    <li>Network downtime affecting Service Providers</li>
                    <li>Payment gateway delays</li>
                  </ul>
                  <p className="text-sm text-gray-700">We will keep you informed proactively whenever possible.</p>
                </div>

                {/* Section 4 - On-Ground Services */}
                <div id="on-ground" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">4. Delivery of On-Ground Services (What We Are Responsible For)</h2>
                  <p className="text-sm text-gray-700 mb-3">StayKedarnath is responsible for:</p>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2 ml-2 mb-4">
                    <li>Delivering accurate booking information to Service Providers.</li>
                    <li>Delivering digital confirmations to travelers.</li>
                    <li>Providing customer support and mediation.</li>
                    <li>Offering <strong>local assistance</strong> in case of <Link to="/cancellation#host-failure" className="text-[#003580] hover:underline">Host Failure</Link> or emergency, wherever feasible.</li>
                  </ol>
                  <p className="text-sm text-gray-700">We are <strong>not</strong> the provider of accommodation, meals, transport, or physical travel services. These are delivered by independent Service Providers under their own terms as explained in our <Link to="/terms#a3" className="text-[#003580] hover:underline">Terms of Service</Link>.</p>
                </div>

                {/* Section 5 - Delivery Failures */}
                <div id="failures" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">5. Delivery Failures</h2>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">5.1 Email Not Received</h3>
                  <p className="text-sm text-gray-700 mb-2">If you do not receive your Booking Voucher:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li>Contact us at <a href="mailto:info@staykedarnath.in" className="text-[#003580] hover:underline">info@staykedarnath.in</a> and we will resend it.</li>
                    <li>You may also request a WhatsApp or SMS copy.</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">5.2 Host Does Not Receive Your Booking Details</h3>
                  <p className="text-sm text-gray-700 mb-2">If the Service Provider claims they did not receive your booking:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                    <li>We immediately resend the confirmation to the host,</li>
                    <li>Contact them directly on your behalf,</li>
                    <li>Provide proof of confirmation,</li>
                    <li>And if necessary, activate <strong><Link to="/cancellation#host-failure" className="text-[#003580] hover:underline">Host Failure support</Link></strong> (as defined in our Terms).</li>
                  </ul>

                  <h3 className="text-base font-semibold text-gray-900 mb-2">5.3 Payment Success but Voucher Missing</h3>
                  <p className="text-sm text-gray-700 mb-2">If payment succeeds but no voucher is delivered:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                    <li>We verify the transaction,</li>
                    <li>Reissue the voucher,</li>
                    <li>Or issue a <Link to="/cancellation" className="text-[#003580] hover:underline">refund</Link> if the booking cannot be fulfilled.</li>
                  </ul>
                </div>

                {/* Section 6 - Updates & Modifications */}
                <div id="updates" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">6. Delivery of Updates & Modifications</h2>
                  <p className="text-sm text-gray-700 mb-3">When your booking is modified or cancelled:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Updated vouchers are sent via email and/or WhatsApp,</li>
                    <li>Refund confirmations (where applicable) are delivered via email,</li>
                    <li>Any changes requested by the traveler or Service Provider are documented in writing.</li>
                  </ul>
                  <p className="text-sm text-gray-700">You are responsible for reviewing updated confirmations. See our <Link to="/cancellation#amendments" className="text-[#003580] hover:underline">Amendments policy</Link> for details.</p>
                </div>

                {/* Section 7 - Communication */}
                <div id="communication" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">7. Communication Commitments</h2>
                  <p className="text-sm text-gray-700 mb-3">StayKedarnath aims to:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Acknowledge customer queries within <strong>24–48 hours</strong>,</li>
                    <li>Provide booking updates promptly.</li>
                  </ul>
                  <p className="text-sm text-gray-700">During peak Yatra periods, minor delays may occur, but we continue to prioritize urgent traveler needs. Learn more <Link to="/about" className="text-[#003580] hover:underline">About Us</Link> and our local support.</p>
                </div>

                {/* Section 8 - Limitations */}
                <div id="limitations" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">8. Limitations of Responsibility</h2>
                  <p className="text-sm text-gray-700 mb-3">We are not responsible for delivery delays caused by:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                    <li>Network failure on your device,</li>
                    <li>Incorrect email/mobile details provided by you,</li>
                    <li>Email service provider issues,</li>
                    <li>Service Provider communication delays,</li>
                    <li><Link to="/terms#a19" className="text-[#003580] hover:underline">Force Majeure</Link> situations affecting the region.</li>
                  </ul>
                  <p className="text-sm text-gray-700">However, we always assist to the best of our ability. See our <Link to="/terms#a18" className="text-[#003580] hover:underline">Limitation of Liability</Link> section for details.</p>
                </div>

                {/* Section 9 - Changes */}
                <div id="changes" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">9. Changes to This Policy</h2>
                  <p className="text-sm text-gray-700 mb-3">We may update this Shipping & Delivery Policy periodically to reflect operational changes, technological improvements, or legal requirements. The "Last Updated" date indicates the latest version.</p>
                  <p className="text-sm text-gray-700">Material changes will be communicated where appropriate. See <Link to="/terms#a21" className="text-[#003580] hover:underline">Terms of Service - Changes to Terms</Link>.</p>
                </div>

                {/* Section 10 - Contact */}
                <div id="contact" className="mb-8 scroll-mt-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">10. Contact & Support</h2>
                  <p className="text-sm text-gray-700 mb-4">For issues related to booking delivery, missing vouchers, or communication delays:</p>
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
                  <p className="text-sm text-gray-700">We strongly recommend contacting us immediately if you have not received confirmation within the expected timeframe.</p>
                </div>

                {/* Related Links */}
                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Related Policies</h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <Link to="/terms" className="text-[#003580] hover:underline">→ Terms of Service</Link>
                    <Link to="/cancellation" className="text-[#003580] hover:underline">→ Refund & Cancellation Policy</Link>
                    <Link to="/privacy" className="text-[#003580] hover:underline">→ Privacy Policy</Link>
                  </div>
                </div>

                {/* End */}
                <div className="border-t border-gray-200 pt-6 mt-8">
                  <p className="text-sm text-gray-600 text-center font-medium">
                    End of Shipping & Delivery Policy — StayKedarnath.in
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

export default ShippingPolicy;