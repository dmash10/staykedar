import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import Container from "../../components/Container";
import { GlobalSchemaMarkup } from "../../components/SEO/SchemaMarkup";
import AIOptimizedFAQ from "../../components/SEO/AIOptimizedFAQ";
import {
    Mountain,
    MapPin,
    Calendar,
    Clock,
    Car,
    CheckCircle2,
    ArrowRight,
    Thermometer,
    Route,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Rich Badrinath FAQs for AI Overviews
const BadrinathFAQs = [
    {
        question: "How do I reach Badrinath from Kedarnath?",
        answer: "From Kedarnath, return to Sonprayag by trek or pony (18 km), then drive via Rudraprayag → Chamoli → Joshimath → Badrinath. The road distance is approximately 240 km taking 8-9 hours. Most pilgrims complete Kedarnath first (requires trek) then proceed to Badrinath (fully motorable). Same-day travel is possible with an early morning start from Sonprayag."
    },
    {
        question: "What is the best route for Do Dham Yatra (Kedarnath + Badrinath)?",
        answer: "The recommended Do Dham route is: Delhi → Haridwar → Rishikesh → Rudraprayag → Sonprayag → Kedarnath (trek 18 km) → Return to Sonprayag → Chopta → Joshimath → Badrinath → Return via Rishikesh to Delhi. Total duration: 7-8 days. Start with Kedarnath as it requires physical exertion, then rest during the drive to Badrinath."
    },
    {
        question: "When does Badrinath Temple open and close?",
        answer: "Badrinath Temple opens in late April or early May (on Akshaya Tritiya as per Hindu calendar) and closes in November during Bhai Dooj. The exact dates are announced each year by the Badrinath Temple Committee. Peak pilgrimage season is May-June and September-October. The temple sees reduced footfall during monsoon (July-August) due to landslide risks on mountain roads."
    },
    {
        question: "Is Badrinath easier to visit than Kedarnath?",
        answer: "Yes, Badrinath is significantly easier. The temple is fully accessible by motorable road—vehicles can park within 500 meters of the temple. No trekking is required. In contrast, Kedarnath requires an 18 km trek from Gaurikund (or a helicopter). For elderly pilgrims, families with children, or those with mobility constraints, Badrinath is the more accessible of the two Dhams."
    },
    {
        question: "What is the taxi fare from Kedarnath base to Badrinath?",
        answer: "Taxi fare from Sonprayag (Kedarnath base) to Badrinath ranges from ₹4,500-6,000 for a sedan (Swift Dzire, Etios) and ₹7,000-9,000 for an SUV (Innova, Crysta). The journey covers 240 km via Ukhimath, Chopta, and Joshimath, taking 8-9 hours. During peak season (May-June), advance booking is recommended as taxis get scarce."
    },
    {
        question: "What should I pack for Badrinath visit?",
        answer: "Essential items for Badrinath: warm clothing (temperatures range 5-15°C even in summer), rain jacket, comfortable walking shoes, personal medications, sunscreen, sunglasses, valid ID proof for registration, and cash (ATMs are limited). The temple provides free meals at the langar, but carry light snacks for the journey. Hot water springs (Tapt Kund) require a towel and change of clothes."
    }
];

const BadrinathPage = () => {
    const pageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Badrinath Yatra 2025 | Hotels, Taxi & Do Dham Packages",
        "description": "Complete guide to Badrinath pilgrimage. Book verified hotels, taxi services, and Do Dham packages from Kedarnath experts.",
        "url": "https://staykedarnath.in/badrinath",
        "mainEntity": {
            "@type": "TouristDestination",
            "name": "Badrinath Dham",
            "description": "One of the Char Dham temples, Badrinath is dedicated to Lord Vishnu and located at 3,133 meters in the Garhwal Himalayas of Uttarakhand, India.",
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": 30.7433,
                "longitude": 79.4938,
                "elevation": "3133"
            }
        }
    };

    return (
        <>
            <Helmet>
                <title>Badrinath Yatra 2025 | Hotels, Taxi & Do Dham Packages | StayKedarnath</title>
                <meta
                    name="description"
                    content="Plan your Badrinath pilgrimage with verified hotels near Badrinath temple, taxi from Kedarnath to Badrinath, and complete Do Dham Yatra packages. Expert guidance from Kedarnath specialists."
                />
                <meta
                    name="keywords"
                    content="Badrinath hotels, Badrinath taxi, Do Dham Yatra, Kedarnath to Badrinath, Char Dham package, Joshimath stays, Badrinath temple opening dates 2025"
                />
                <link rel="canonical" href="https://staykedarnath.in/badrinath" />

                <meta property="og:type" content="website" />
                <meta property="og:title" content="Badrinath Yatra 2025 - Complete Pilgrimage Guide" />
                <meta property="og:description" content="Book Badrinath stays, taxi, and Do Dham packages from your trusted Kedarnath specialists." />
                <meta property="og:url" content="https://staykedarnath.in/badrinath" />

                <script type="application/ld+json">
                    {JSON.stringify(pageSchema)}
                </script>
            </Helmet>

            <GlobalSchemaMarkup />

            <div className="min-h-screen flex flex-col bg-background">
                <Nav />

                <main className="flex-grow">
                    {/* Hero Section - Clean & Minimalistic */}
                    <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
                        <Container>
                            <div className="max-w-4xl">
                                <p className="text-primary font-medium text-sm tracking-wide uppercase mb-4">
                                    Experts in Kedarnath. Guides for Char Dham.
                                </p>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                                    Badrinath Dham
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
                                    The abode of Lord Vishnu at 3,133 meters. Complete your Do Dham pilgrimage with trusted
                                    accommodations and seamless taxi connections from Kedarnath.
                                </p>

                                {/* Quick Stats Row */}
                                <div className="flex flex-wrap gap-6 mb-10 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>Elevation: 3,133m</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Car className="w-4 h-4 text-primary" />
                                        <span>Fully Motorable</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>Open: May – November</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Thermometer className="w-4 h-4 text-primary" />
                                        <span>Temperature: 5°C – 18°C</span>
                                    </div>
                                </div>

                                {/* CTA Buttons */}
                                <div className="flex flex-wrap gap-4">
                                    <Button asChild size="lg" className="btn-primary">
                                        <Link to="/stays/location/joshimath">
                                            Book Stays Near Badrinath
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="btn-secondary">
                                        <Link to="/do-dham">
                                            View Do Dham Packages
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* Why Choose Us Section */}
                    <section className="section-spacing bg-white">
                        <Container>
                            <div className="max-w-3xl mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    Why Book Badrinath with StayKedarnath?
                                </h2>
                                <p className="text-muted-foreground">
                                    We've successfully guided over 10,000 pilgrims through the challenging Kedarnath trek.
                                    Badrinath—being fully motorable—is a natural extension of our expertise.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">Proven Trek Expertise</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        If you trust us with the difficult 18 km Kedarnath trek, you can trust us with the
                                        easier Badrinath drive. Our mountain experience translates to better service.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">Verified Accommodations</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Handpicked hotels in Joshimath, Pipalkoti, and Badrinath. Each property personally
                                        vetted for cleanliness, safety, and pilgrim-friendly amenities.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Route className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">Seamless Connections</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        One call arranges your entire Do Dham journey. Taxi from Kedarnath base to Badrinath,
                                        coordinated stays, and return transport—all handled.
                                    </p>
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* Badrinath Route Cities */}
                    <section className="section-spacing bg-muted/30">
                        <Container>
                            <div className="max-w-3xl mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    Stay Options on Badrinath Route
                                </h2>
                                <p className="text-muted-foreground">
                                    Strategic stopover points between Kedarnath and Badrinath. Each offers comfortable
                                    accommodation and serves as a rest point on your pilgrimage.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                {[
                                    {
                                        name: "Joshimath",
                                        distance: "45 km from Badrinath",
                                        description: "Gateway to Badrinath. Winter seat of Lord Badri. Base for Valley of Flowers.",
                                        elevation: "1,890m",
                                        link: "/stays/location/joshimath"
                                    },
                                    {
                                        name: "Pipalkoti",
                                        distance: "80 km from Badrinath",
                                        description: "Peaceful midway halt. Excellent budget options. Scenic Alaknanda valley views.",
                                        elevation: "1,260m",
                                        link: "/stays/location/pipalkoti"
                                    },
                                    {
                                        name: "Chamoli",
                                        distance: "110 km from Badrinath",
                                        description: "District headquarters. Good connectivity, medical facilities, and supplies.",
                                        elevation: "1,300m",
                                        link: "/stays/location/chamoli"
                                    }
                                ].map((city) => (
                                    <Link
                                        key={city.name}
                                        to={city.link}
                                        className="glass-card p-6 block hover:border-primary/20 border border-transparent transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-foreground">{city.name}</h3>
                                            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                {city.elevation}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{city.description}</p>
                                        <p className="text-xs text-primary font-medium">{city.distance}</p>
                                        <div className="mt-4 flex items-center text-primary text-sm font-medium">
                                            View Stays <ArrowRight className="w-4 h-4 ml-2" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </Container>
                    </section>

                    {/* Kedarnath to Badrinath Journey Guide */}
                    <section className="section-spacing bg-white">
                        <Container>
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                                    How to Travel from Kedarnath to Badrinath
                                </h2>

                                <div className="prose prose-slate max-w-none">
                                    <p className="text-muted-foreground leading-relaxed mb-6">
                                        The Kedarnath-Badrinath route is the classic <strong className="text-foreground">Do Dham Yatra</strong>.
                                        Since Kedarnath requires a challenging 18 km trek, most pilgrims complete it first while
                                        physically fresh, then drive to Badrinath which is entirely accessible by road.
                                    </p>

                                    <h3 className="text-lg font-semibold text-foreground mt-8 mb-4">Route Options</h3>

                                    <div className="space-y-4 mb-8">
                                        <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
                                            <p className="font-medium text-foreground mb-1">Via Ukhimath-Chopta (Scenic Route)</p>
                                            <p className="text-sm text-muted-foreground">
                                                Sonprayag → Ukhimath → Chopta → Gopeshwar → Chamoli → Joshimath → Badrinath
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">Distance: 240 km | Duration: 8-9 hours</p>
                                        </div>

                                        <div className="bg-muted/30 p-4 rounded-lg border-l-4 border-muted-foreground">
                                            <p className="font-medium text-foreground mb-1">Via Rudraprayag (Alternative)</p>
                                            <p className="text-sm text-muted-foreground">
                                                Sonprayag → Rudraprayag → Karnaprayag → Chamoli → Joshimath → Badrinath
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">Distance: 260 km | Duration: 8 hours</p>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-foreground mt-8 mb-4">Pro Tips</h3>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                            <span>Depart Sonprayag by 6:00 AM to reach Badrinath for evening aarti (6:00-8:30 PM)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                            <span>Book return taxi in advance during May-June peak season—vehicles get scarce</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                            <span>Consider overnight stay in Joshimath if traveling with elderly family members</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                            <span>Carry sufficient snacks—food options are limited between Chopta and Joshimath</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                            <span>Avoid traveling after dark; mountain roads have poor lighting and sharp turns</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* Badrinath Temple Information */}
                    <section className="section-spacing bg-muted/30">
                        <Container>
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                                    About Badrinath Temple
                                </h2>

                                <div className="prose prose-slate max-w-none text-muted-foreground">
                                    <p className="leading-relaxed mb-6">
                                        <strong className="text-foreground">Badrinath Dham</strong>, situated at 3,133 meters in
                                        the Chamoli district of Uttarakhand, is one of the most sacred Vishnu temples in India.
                                        It forms the northernmost point of the Char Dham pilgrimage and is believed to be the
                                        place where Lord Vishnu meditated under a Badri tree.
                                    </p>

                                    <p className="leading-relaxed mb-6">
                                        The current temple structure was built by Adi Shankaracharya in the 9th century over an
                                        earlier temple. The main deity is a 1-meter black stone idol of Lord Vishnu in meditative
                                        posture, known as <strong className="text-foreground">Badrinarayan</strong>.
                                    </p>

                                    <h3 className="text-lg font-semibold text-foreground mt-8 mb-4">Key Highlights</h3>

                                    <div className="grid md:grid-cols-2 gap-4 not-prose">
                                        <div className="bg-white p-4 rounded-lg border border-border">
                                            <p className="font-medium text-foreground text-sm mb-1">Tapt Kund</p>
                                            <p className="text-xs text-muted-foreground">Natural hot water spring near temple. Temperature 45°C. Pilgrims bathe here before darshan.</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-border">
                                            <p className="font-medium text-foreground text-sm mb-1">Mana Village</p>
                                            <p className="text-xs text-muted-foreground">Last Indian village before Tibet border. 3 km from temple. Home to Vyas Gufa and Bhim Pul.</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-border">
                                            <p className="font-medium text-foreground text-sm mb-1">Narad Kund</p>
                                            <p className="text-xs text-muted-foreground">Believed to be where Adi Shankaracharya discovered the idol of Badrinath.</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-lg border border-border">
                                            <p className="font-medium text-foreground text-sm mb-1">Brahma Kapal</p>
                                            <p className="text-xs text-muted-foreground">Platform for ancestral rites (Pind Daan). Located on Alaknanda bank near temple.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* FAQs */}
                    <section className="section-spacing bg-white">
                        <Container>
                            <AIOptimizedFAQ
                                faqs={BadrinathFAQs}
                                title="Badrinath Yatra — Frequently Asked Questions"
                                description="Comprehensive answers about Badrinath temple, pilgrimage planning, and Do Dham Yatra logistics."
                            />
                        </Container>
                    </section>

                    {/* Final CTA */}
                    <section className="py-12 bg-primary/5">
                        <Container>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                                        Ready to complete your Do Dham Yatra?
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Book verified stays and reliable taxi services for your Badrinath pilgrimage.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Button asChild size="lg" className="btn-primary">
                                        <Link to="/do-dham">View Do Dham Packages</Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline">
                                        <Link to="/contact">Contact Us</Link>
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default BadrinathPage;

