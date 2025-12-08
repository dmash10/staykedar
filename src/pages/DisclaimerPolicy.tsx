import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { Mail, MessageCircle, Ticket } from "lucide-react";

const DisclaimerPolicy = () => {
    const sections = [
        { id: "role", label: "1. Nature of Our Role" },
        { id: "information", label: "2. Information & Accuracy" },
        { id: "high-altitude", label: "3. High-Altitude Travel" },
        { id: "host-liability", label: "4. Host Liability" },
        { id: "traveler", label: "5. Traveler Responsibilities" },
        { id: "force-majeure", label: "6. Force Majeure" },
        { id: "limitation", label: "7. Limitation of Liability" },
        { id: "no-advice", label: "8. No Professional Advice" },
        { id: "changes", label: "9. Changes" },
        { id: "contact", label: "10. Contact" },
    ];

    return (
        <>
            <Helmet>
                <title>Disclaimer & Liability Notice | StayKedarnath</title>
                <meta name="description" content="Disclaimer & Liability Notice for StayKedarnath.in - understanding our role as a platform and limitations of liability." />
                <link rel="canonical" href="https://staykedarnath.in/disclaimer" />
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
                                        <Link to="/privacy" className="block text-xs text-[#003580] hover:underline mt-1">Privacy Policy</Link>
                                    </div>
                                </div>
                            </aside>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">

                                {/* Header */}
                                <div className="mb-8">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                        Disclaimer & Liability Notice — StayKedarnath.in
                                    </h1>
                                    <p className="text-sm text-gray-500">Last Updated: December 5, 2025</p>
                                </div>

                                {/* Introduction */}
                                <div className="mb-6 text-sm text-gray-700 leading-relaxed space-y-3">
                                    <p>
                                        This Disclaimer & Liability Notice ("Disclaimer") explains the scope of StayKedarnath.in's ("StayKedarnath", "we", "us", "our") responsibilities and limitations when you use our <Link to="/terms#a4" className="text-[#003580] hover:underline">Platform</Link> or book accommodation and related services through it. This document must be read together with our <Link to="/terms" className="text-[#003580] hover:underline">Customer Terms of Service</Link>, <Link to="/cancellation" className="text-[#003580] hover:underline">Refund & Cancellation Policy</Link>, <Link to="/shipping" className="text-[#003580] hover:underline">Shipping & Delivery Policy</Link>, and <Link to="/privacy" className="text-[#003580] hover:underline">Privacy Notice</Link>.
                                    </p>
                                    <p>
                                        StayKedarnath operates as an online listing, booking, and facilitation platform. We <strong>do not own, manage, or control</strong> the accommodations or travel services displayed on our Platform. All stays and travel services are provided by <strong>independent third-party <Link to="/terms#a1" className="text-[#003580] hover:underline">Service Providers</Link></strong>, and the final responsibility for your on-ground experience rests with them.
                                    </p>
                                    <p>
                                        This Disclaimer is designed to ensure transparency, minimize misunderstandings, and clearly outline the boundaries of our role as a digital intermediary.
                                    </p>
                                </div>

                                {/* Section 1 - Nature of Our Role */}
                                <div id="role" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">1. Nature of Our Role</h2>

                                    <h3 className="text-base font-semibold text-gray-900 mb-2">1.1 Platform Only (Not a Hotel or Travel Operator)</h3>
                                    <p className="text-sm text-gray-700 mb-2">StayKedarnath is <strong>not</strong>:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                                        <li>A hotel, lodge, homestay, or physical accommodation provider;</li>
                                        <li>A transport operator or travel agency;</li>
                                        <li>A tour organiser or event coordinator.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700 mb-4">We only provide a digital platform where <Link to="/terms#a1" className="text-[#003580] hover:underline">Service Providers</Link> list their accommodations and travelers make <Link to="/terms#a1" className="text-[#003580] hover:underline">bookings</Link>. We also list additional travel-related services where applicable, but all pricing, service quality, availability, and on-ground delivery remain fully controlled by the independent Service Providers. All on-ground services are delivered by those independent providers.</p>

                                    <h3 className="text-base font-semibold text-gray-900 mb-2">1.2 No Ownership or Control Over Properties</h3>
                                    <p className="text-sm text-gray-700 mb-2">We do not:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                                        <li>Own the rooms listed on the Platform,</li>
                                        <li>Control pricing, amenities, or service quality,</li>
                                        <li>Supervise or manage property staff,</li>
                                        <li>Guarantee availability unless confirmed by the provider,</li>
                                        <li>Influence day-to-day operations of any stay provider.</li>
                                    </ul>

                                    <h3 className="text-base font-semibold text-gray-900 mb-2">1.3 Platform-Verified & Platform-Created Listings (Important Clarification)</h3>
                                    <p className="text-sm text-gray-700 mb-3">StayKedarnath frequently performs <strong>independent on-ground verification</strong>, which may include capturing photos, videos, gathering information, or documenting real-time conditions at properties. This ensures that listings offer better transparency and more accurate expectations for travelers.</p>
                                    <p className="text-sm text-gray-700 mb-2">However, even when property photos, descriptions, videos, or verification notes are created or uploaded by StayKedarnath, this does <strong>not</strong> mean:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                                        <li>We own, operate, or manage the accommodation,</li>
                                        <li>We guarantee long-term accuracy of amenities, room conditions, or services,</li>
                                        <li>We take responsibility for future changes made by the Service Provider,</li>
                                        <li>We assume operational, legal, or service-level liability for the host.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700 mb-4">Our verification reflects the condition <strong>on the date of documentation only</strong>. Mountain regions experience rapid changes due to weather, season, renovations, staffing, or operational variations. Actual conditions may differ at the time of travel.</p>

                                    <h3 className="text-base font-semibold text-gray-900 mb-2">1.4 Host-Uploaded Listings & Shared Responsibility for Accuracy</h3>
                                    <p className="text-sm text-gray-700 mb-3">StayKedarnath also allows Service Providers to upload their own photos, descriptions, pricing, amenities, and other details. In such cases, hosts remain fully responsible for ensuring the accuracy, legality, and timely updating of their listing information.</p>
                                    <p className="text-sm text-gray-700 mb-2">We may revise, correct, or remove any content — whether uploaded by us or by the host — if:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                                        <li>Information becomes outdated or misleading,</li>
                                        <li>We receive credible complaints from travelers,</li>
                                        <li>We identify inconsistencies during routine checks,</li>
                                        <li>The host violates quality, safety, or listing standards.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700">This combined model of <strong>platform-verified content</strong> and <strong>host-submitted content</strong> improves listing quality but does <strong>not</strong> imply operational control or ownership of any property.</p>
                                </div>

                                {/* Section 2 - Information & Accuracy */}
                                <div id="information" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">2. Information, Accuracy & Listings</h2>

                                    <h3 className="text-base font-semibold text-gray-900 mb-2">2.1 Property Information Provided by Hosts</h3>
                                    <p className="text-sm text-gray-700 mb-3">Descriptions, photos, amenities, distances, pricing, and availability are uploaded by Service Providers. While we conduct periodic checks, <strong>we do not guarantee the accuracy, completeness, or reliability</strong> of such information.</p>
                                    <p className="text-sm text-gray-700 mb-2">If you rely on property details, you acknowledge that:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                                        <li>Minor variations in rooms, facilities, or views may exist,</li>
                                        <li>Temporary unavailability of services (e.g., hot water, Wi-Fi, power) may occur due to mountain conditions,</li>
                                        <li>Actual conditions may differ during peak season or severe weather.</li>
                                    </ul>

                                    <h3 className="text-base font-semibold text-gray-900 mb-2">2.2 Errors, Omissions & System Issues</h3>
                                    <p className="text-sm text-gray-700 mb-2">Despite best efforts, the Platform may contain unintentional errors including:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                                        <li>Typographical mistakes,</li>
                                        <li>Incorrect rates provided by hosts,</li>
                                        <li>Temporarily outdated availability,</li>
                                        <li>Technical glitches or delays.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700">When such issues occur, we reserve the right to correct, amend, or cancel the affected booking with fairness to the traveler. See <Link to="/terms#a7" className="text-[#003580] hover:underline">Terms of Service - Prices, Errors, and Taxes</Link>.</p>
                                </div>

                                {/* Section 3 - High-Altitude Travel */}
                                <div id="high-altitude" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">3. High-Altitude Travel Disclaimer (Important)</h2>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-amber-800 font-medium mb-2">⚠️ Important Notice</p>
                                        <p className="text-sm text-amber-700">Traveling to Kedarnath and nearby regions involves <strong>inherently challenging terrain</strong> and high-altitude conditions.</p>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">By using the Platform, you acknowledge and agree that:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                                        <li>The region experiences unpredictable weather, landslides, snowfall, network outages, and road blockages;</li>
                                        <li>Travel plans, accessibility, and accommodation operations may be disrupted without notice;</li>
                                        <li>Guests must be medically fit for high-altitude environments.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700 mb-2">StayKedarnath is <strong>not liable</strong> for any:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                                        <li>Delays or disruptions caused by natural events,</li>
                                        <li>Health issues including AMS (Acute Mountain Sickness), dehydration, fatigue, or altitude-related complications,</li>
                                        <li>Government restrictions, closures, or law-and-order situations.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700">We strongly recommend obtaining appropriate travel and medical insurance before visiting the region. See <Link to="/terms#a12" className="text-[#003580] hover:underline">Terms of Service - Travel Insurance Recommendation</Link>.</p>
                                </div>

                                {/* Section 4 - Host Liability */}
                                <div id="host-liability" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">4. Liability for Services Provided by Hosts</h2>

                                    <h3 className="text-base font-semibold text-gray-900 mb-2">4.1 Independent Host Responsibilities</h3>
                                    <p className="text-sm text-gray-700 mb-2">Service Providers are solely responsible for:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                                        <li>Cleanliness, safety, and upkeep of their property,</li>
                                        <li>Hospitality, service quality, and promised amenities,</li>
                                        <li>Guest check-in procedures and government compliance,</li>
                                        <li>Handling on-site disputes or concerns.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700 mb-2">StayKedarnath cannot be held liable for:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                                        <li>Personal injury, loss, theft, or damage at the property,</li>
                                        <li>Misconduct or negligence of hosts or their staff,</li>
                                        <li>Service interruptions caused by the host,</li>
                                        <li>Any dispute between guests and the Service Provider.</li>
                                    </ul>

                                    <h3 className="text-base font-semibold text-gray-900 mb-2">4.2 Host Failure Situations</h3>
                                    <p className="text-sm text-gray-700 mb-2">If a host refuses service, provides incorrect information, or fails to honour a confirmed booking (<Link to="/cancellation#host-failure" className="text-[#003580] hover:underline">Host Failure</Link>), StayKedarnath will:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                                        <li>Contact the provider immediately,</li>
                                        <li>Attempt to resolve the issue on your behalf,</li>
                                        <li>Provide alternative recommendations if available,</li>
                                        <li>Assist with refunds as per our <Link to="/cancellation" className="text-[#003580] hover:underline">Refund & Cancellation Policy</Link>.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700">However, we are <strong>not legally liable</strong> for losses arising from host actions or inactions.</p>
                                </div>

                                {/* Section 5 - Traveler Responsibilities */}
                                <div id="traveler" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">5. Traveler Responsibilities</h2>
                                    <p className="text-sm text-gray-700 mb-2">By using the Platform, you agree to:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                                        <li>Provide accurate contact details and travel information,</li>
                                        <li>Follow local laws and property rules,</li>
                                        <li>Ensure all guests in your group are medically fit for high-altitude travel,</li>
                                        <li>Communicate respectfully with hosts and StayKedarnath support,</li>
                                        <li>Review booking details before confirming.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700">Any violation of these responsibilities may limit or void our ability to support or intervene. See <Link to="/terms#a5" className="text-[#003580] hover:underline">Terms of Service - Values, Conduct & Responsible Use</Link>.</p>
                                </div>

                                {/* Section 6 - Force Majeure */}
                                <div id="force-majeure" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">6. Force Majeure</h2>
                                    <p className="text-sm text-gray-700 mb-2">StayKedarnath is not liable for delays, cancellations, or service failures resulting from events beyond our reasonable control, including:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                                        <li>Floods, landslides, earthquakes, snowfall,</li>
                                        <li>Network blackouts or infrastructure failures,</li>
                                        <li>Government advisories, travel bans, or property closures,</li>
                                        <li>Strikes or civil disturbances,</li>
                                        <li>Any event classified as <Link to="/terms#a19" className="text-[#003580] hover:underline">Force Majeure</Link> under Indian law.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700">Refunds in such cases will follow our <Link to="/cancellation#force-majeure" className="text-[#003580] hover:underline">Refund & Cancellation Policy</Link>.</p>
                                </div>

                                {/* Section 7 - Limitation of Liability */}
                                <div id="limitation" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">7. Limitation of Liability</h2>
                                    <p className="text-sm text-gray-700 mb-3">To the fullest extent permitted by law:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2 ml-2 mb-3">
                                        <li>StayKedarnath's liability is <strong>strictly limited</strong> to amounts paid through our Platform for the specific affected booking.</li>
                                        <li>We are not responsible for any:
                                            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-6 mt-1">
                                                <li>Indirect, incidental, or consequential losses,</li>
                                                <li>Loss of bookings, travel delays, additional transportation costs,</li>
                                                <li>Personal injury, emotional distress, or medical emergencies,</li>
                                                <li>Loss of luggage or personal belongings.</li>
                                            </ul>
                                        </li>
                                    </ul>
                                    <p className="text-sm text-gray-700">Where applicable laws do not allow exclusion of liability, our liability will be limited to the minimum extent permitted. See <Link to="/terms#a18" className="text-[#003580] hover:underline">Terms of Service - Limitation of Liability</Link>.</p>
                                </div>

                                {/* Section 8 - No Professional Advice */}
                                <div id="no-advice" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">8. No Professional Advice</h2>
                                    <p className="text-sm text-gray-700 mb-2">Content on the Platform — including recommendations, maps, distances, local guidance, checklists, or travel tips — is for general informational purposes only. It should not be interpreted as:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-3">
                                        <li>Professional travel, medical, or legal advice,</li>
                                        <li>A guarantee of conditions or experiences.</li>
                                    </ul>
                                    <p className="text-sm text-gray-700">Always verify critical information independently before making decisions.</p>
                                </div>

                                {/* Section 9 - Changes */}
                                <div id="changes" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">9. Changes to This Disclaimer</h2>
                                    <p className="text-sm text-gray-700">We may revise this Disclaimer from time to time to reflect legal requirements, operational changes, or regional conditions. The "Last Updated" date indicates the most recent version. See <Link to="/terms#a21" className="text-[#003580] hover:underline">Terms of Service - Changes to Terms</Link>.</p>
                                </div>

                                {/* Section 10 - Contact */}
                                <div id="contact" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">10. Contact & Support</h2>
                                    <p className="text-sm text-gray-700 mb-4">For questions regarding this Disclaimer or any concerns related to your bookings:</p>
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
                                </div>

                                {/* Related Links */}
                                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Related Policies</h3>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <Link to="/terms" className="text-[#003580] hover:underline">→ Terms of Service</Link>
                                        <Link to="/cancellation" className="text-[#003580] hover:underline">→ Refund & Cancellation Policy</Link>
                                        <Link to="/shipping" className="text-[#003580] hover:underline">→ Shipping Policy</Link>
                                        <Link to="/privacy" className="text-[#003580] hover:underline">→ Privacy Policy</Link>
                                    </div>
                                </div>

                                {/* End */}
                                <div className="border-t border-gray-200 pt-6 mt-8">
                                    <p className="text-sm text-gray-600 text-center font-medium">
                                        End of Disclaimer & Liability Notice — StayKedarnath.in
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

export default DisclaimerPolicy;
