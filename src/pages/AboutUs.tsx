import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { Mail, Phone, Globe, Search, Shield, Handshake, Users, MessageCircle, Target, CheckCircle, MapPin } from "lucide-react";

const AboutUs = () => {
    const sections = [
        { id: "intro", label: "1. How It Started" },
        { id: "different", label: "2. What Makes Us Different" },
        { id: "verification", label: "3. Ground-Truth Audit" },
        { id: "local-support", label: "4. Local Support" },
        { id: "who-we-are", label: "5. Who We Are" },
        { id: "our-aim", label: "6. What We Aim For" },
        { id: "platform-role", label: "7. Platform Role" },
        { id: "contact", label: "8. Contact" },
    ];

    return (
        <>
            <Helmet>
                <title>About Us | StayKedarnath - Built Locally, Run Responsibly</title>
                <meta name="description" content="StayKedarnath was created for travelers who deserve clarity, fairness, and real information. We come from this area and built a platform that reflects ground reality." />
                <meta name="keywords" content="StayKedarnath, about us, Kedarnath travel, trusted booking, pilgrimage accommodation, local experts" />
                <link rel="canonical" href="https://staykedarnath.in/about" />
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
                                        <Link to="/disclaimer" className="block text-xs text-[#003580] hover:underline mt-1">Disclaimer</Link>
                                        <Link to="/contact" className="block text-xs text-[#003580] hover:underline mt-1">Contact Us</Link>
                                    </div>
                                </div>
                            </aside>

                            {/* Main Content */}
                            <div className="flex-1 min-w-0">

                                {/* Header */}
                                <div className="mb-8">
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                        About StayKedarnath
                                    </h1>
                                    <p className="text-sm text-gray-500">Last Updated: November 28, 2025</p>
                                </div>

                                {/* Introduction */}
                                <div className="mb-6 text-sm text-gray-700 leading-relaxed space-y-3">
                                    <p>
                                        StayKedarnath was created for a simple reason: people traveling to this region deserve clarity, fairness, and real information—not guesswork.
                                    </p>
                                    <p>
                                        We come from this area, we understand how travel here actually works, and we built a platform that reflects that ground reality. Please also read our <Link to="/terms" className="text-[#003580] hover:underline">Terms of Service</Link> and <Link to="/disclaimer" className="text-[#003580] hover:underline">Disclaimer</Link> to fully understand our role.
                                    </p>
                                </div>

                                {/* Section 1 - How It Started */}
                                <div id="intro" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">1. How It Started</h2>

                                    <div className="text-sm text-gray-700 space-y-3">
                                        <p>
                                            For years, we watched travelers struggle with one recurring problem: the information available online rarely matched what they found when they arrived. Rooms that looked perfect in photos felt different in person, availability changed without warning, and visitors had no one local to call when things went wrong.
                                        </p>
                                        <p>
                                            We saw families shivering in the cold because their booked hotel denied them entry. We saw elderly pilgrims sleeping in cars because they couldn't find a clean bed. We saw the disconnect between the spiritual intent of the Yatra and the harsh logistical reality of the mountains.
                                        </p>
                                        <p className="font-medium text-gray-900">
                                            We knew the gap wasn't technology. The gap was trust.
                                        </p>
                                        <p>
                                            It became clear that what was missing wasn't just "hotels"—it was empathy and local accountability. StayKedarnath was founded to be that bridge. So we decided to create a platform shaped by people who live here, who understand the terrain, the challenges, and the expectations of modern travelers.
                                        </p>
                                    </div>
                                </div>

                                {/* Section 2 - What Makes Us Different */}
                                <div id="different" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">2. What Makes Us Different</h2>

                                    <div className="text-sm text-gray-700 space-y-3">
                                        <p>
                                            Most travel sites list whatever properties are uploaded. <strong>We do not operate that way.</strong>
                                        </p>
                                        <p>
                                            We verify properties personally whenever possible—walking into the rooms, checking the basics, talking to the owners, and understanding how they operate during both calm and peak seasons. Not to judge them, but to make sure travelers receive honest and reliable information.
                                        </p>
                                        <p>
                                            We also allow owners to list their properties directly, but even then, we monitor listings for accuracy and update or correct them when needed. If something doesn't feel right, we don't hesitate to investigate or delist.
                                        </p>
                                    </div>
                                </div>

                                {/* Section 3 - Ground-Truth Audit */}
                                <div id="verification" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">3. The Ground-Truth Audit</h2>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-green-700" />
                                        </div>
                                        <p className="text-sm text-gray-700">We function differently from standard travel apps. We do not use bots to scrape listings. <strong>We use boots on the ground.</strong></p>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-4">Our verification is straightforward:</p>

                                    <div className="space-y-4 mb-4">
                                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-start gap-3">
                                                <Search className="w-5 h-5 text-[#003580] mt-0.5" />
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">The Physical Inspection</h3>
                                                    <p className="text-sm text-gray-600">We document rooms and surroundings exactly as we find them. We don't rely on photos sent by owners—our team visits the lodges to check the reality: whether the water pressure is adequate, the blankets are thick enough for the winter, and if the hygiene standards meet expectations.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-start gap-3">
                                                <Shield className="w-5 h-5 text-[#003580] mt-0.5" />
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">The Safety Check</h3>
                                                    <p className="text-sm text-gray-600">We note practical details that matter in the mountains: water supply, access, heating, cleanliness, and location. We assess properties for their suitability for families and seniors, checking accessibility and location safety.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                            <div className="flex items-start gap-3">
                                                <Handshake className="w-5 h-5 text-[#003580] mt-0.5" />
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">The "Handshake" Relationship</h3>
                                                    <p className="text-sm text-gray-600">We talk to property owners to understand their approach to hosting and consistency. We build personal relationships ensuring they understand that a guest sent by StayKedarnath is a guest of the valley, ensuring our bookings are honored even during peak rush.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                        <p className="text-sm text-amber-800 font-medium">If a property does not meet our standard of reliability and basic comfort, we simply do not list it.</p>
                                    </div>
                                </div>

                                {/* Section 4 - Local Support */}
                                <div id="local-support" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">4. Local Support That Actually Helps</h2>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <MessageCircle className="w-5 h-5 text-purple-700" />
                                        </div>
                                        <p className="text-sm text-gray-700">We're based here—not in another state. We are not a faceless call center sitting in a distant metro city. <strong>We are locals who understand the terrain.</strong></p>
                                    </div>

                                    <div className="text-sm text-gray-700 space-y-3 mb-4">
                                        <p>
                                            That means when you need information, you get guidance from someone who actually knows the roads, the weather patterns, how busy a place gets, or what areas are better for different types of travelers.
                                        </p>
                                        <p>
                                            <strong>We don't overpromise. We don't use flowery language. We simply tell you what's true and what's practical.</strong>
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Accessible Communication</h3>
                                            <p className="text-sm text-gray-600">When you book with us, you get access to a team that knows the region inside out. If you are confused about the route or need advice on timing your trek, you're talking to someone who actually lives here.</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Problem Solving</h3>
                                            <p className="text-sm text-gray-600">If you run into an issue with a check-in or a property, we step in as your local point of contact and help resolve things wherever possible. We are just a phone call away to assist and mediate.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 5 - Who We Are */}
                                <div id="who-we-are" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">5. Who We Are</h2>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Users className="w-5 h-5 text-blue-700" />
                                        </div>
                                        <p className="text-sm text-gray-700"><strong>We are locals who speak the language of technology.</strong></p>
                                    </div>

                                    <div className="text-sm text-gray-700 space-y-3">
                                        <p>
                                            StayKedarnath is built by people who grew up in this region—in the valleys of <strong>Guptkashi and Sonprayag</strong>—combining deep ancestral ties with professional expertise in digital strategy and operations.
                                        </p>
                                        <p>
                                            We blend two perspectives: the lived experience of someone who knows the area intimately, and the structured thinking of someone who works with tech, design, and operations.
                                        </p>
                                        <p>
                                            We view our work as <strong>'Seva' (Service)</strong>. When you book with us, you are not just a customer; you are a guest in our home district. We feel a personal responsibility to ensure your stay is secure and comfortable.
                                        </p>
                                    </div>
                                </div>

                                {/* Section 6 - What We Aim For */}
                                <div id="our-aim" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">6. What We Aim For</h2>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-lg bg-[#003580]/10 flex items-center justify-center flex-shrink-0">
                                            <Target className="w-5 h-5 text-[#003580]" />
                                        </div>
                                        <p className="text-sm text-gray-700">Our goal is not to be the "biggest" travel platform. <strong>Our goal is to be the most reliable one for this region.</strong></p>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-3">We focus on:</p>

                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2 mb-4">
                                        <li><strong>Clear and accurate listings</strong></li>
                                        <li><strong>Realistic guidance</strong></li>
                                        <li><strong>Smooth communication</strong></li>
                                        <li><strong>Accountability from both sides</strong>—traveler and host</li>
                                    </ul>

                                    <p className="text-sm text-gray-700 mb-4">We promise: <strong>Transparency in pricing</strong>, <strong>Integrity in our listings</strong>, and <strong>Respect for the pilgrim</strong>.</p>

                                    <div className="bg-[#003580] text-white rounded-lg p-4 text-center">
                                        <p className="text-base font-semibold">Our mission is simple: You focus on the Darshan; we handle the rest.</p>
                                    </div>
                                </div>

                                {/* Section 7 - Platform Role */}
                                <div id="platform-role" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">7. In Simple Terms: Understanding Our Role</h2>

                                    <div className="text-sm text-gray-700 space-y-3 mb-4">
                                        <p>
                                            Traveling here can be unpredictable. Our job is to reduce the uncertainty. We give you information you can trust, support when you need it, and a platform that respects both travelers and property owners.
                                        </p>
                                    </div>

                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                        <p className="text-sm text-amber-800">
                                            <strong>Note:</strong> StayKedarnath is a <strong>platform and facilitator</strong>, not a hotel operator. We do not own or manage the accommodations listed. All accommodations are provided by independent <Link to="/terms#a1" className="text-[#003580] hover:underline">Service Providers</Link>.
                                        </p>
                                    </div>

                                    <p className="text-sm text-gray-700 mb-3">For full details, please read our:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-2">
                                        <li><Link to="/terms#a4" className="text-[#003580] hover:underline">Terms of Service — The Platform and Content</Link></li>
                                        <li><Link to="/disclaimer" className="text-[#003580] hover:underline">Disclaimer & Liability Notice</Link></li>
                                        <li><Link to="/cancellation" className="text-[#003580] hover:underline">Refund & Cancellation Policy</Link></li>
                                    </ul>
                                </div>

                                {/* Section 8 - Contact */}
                                <div id="contact" className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b-2 border-[#003580]">8. Contact Us</h2>
                                    <p className="text-sm text-gray-700 mb-4">Have questions? Need guidance? We're here to help.</p>
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
                                            <Mail className="w-4 h-4 text-[#003580]" />
                                            <span className="text-gray-700"><Link to="/contact" className="text-[#003580] hover:underline">Raise a Support Ticket</Link></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Related Links */}
                                <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Related Policies</h3>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <Link to="/terms" className="text-[#003580] hover:underline">→ Terms of Service</Link>
                                        <Link to="/privacy" className="text-[#003580] hover:underline">→ Privacy Policy</Link>
                                        <Link to="/disclaimer" className="text-[#003580] hover:underline">→ Disclaimer</Link>
                                        <Link to="/cancellation" className="text-[#003580] hover:underline">→ Refund Policy</Link>
                                    </div>
                                </div>

                                {/* End */}
                                <div className="border-t border-gray-200 pt-6 mt-8">
                                    <p className="text-sm text-gray-600 text-center font-medium">
                                        This is StayKedarnath—built locally, run responsibly, and designed for people who appreciate honesty over hype. 🙏
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

export default AboutUs;
