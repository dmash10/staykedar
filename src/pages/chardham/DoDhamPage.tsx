import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import Container from "../../components/Container";
import { GlobalSchemaMarkup } from "../../components/SEO/SchemaMarkup";
import AIOptimizedFAQ from "../../components/SEO/AIOptimizedFAQ";
import {
    MapPin,
    Calendar,
    Clock,
    Car,
    CheckCircle2,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Comprehensive Do Dham FAQs
const DoDhamFAQs = [
    {
        question: "What is Do Dham Yatra?",
        answer: "Do Dham Yatra is the pilgrimage to two of the four Char Dham temples in Uttarakhand. The most popular combination is Kedarnath (Lord Shiva) and Badrinath (Lord Vishnu). This route covers approximately 500 km and takes 7-8 days from Delhi. Do Dham is ideal for pilgrims who cannot take 12 days off for the complete Char Dham circuit but wish to visit the two most significant temples."
    },
    {
        question: "How many days are needed for Kedarnath-Badrinath Yatra?",
        answer: "Kedarnath-Badrinath Do Dham Yatra requires 7-8 days. Optimized itinerary: Day 1: Delhi to Guptkashi (450 km), Day 2: Gaurikund to Kedarnath (18 km trek or helicopter), Day 3: Kedarnath darshan and return trek, Day 4: Guptkashi to Joshimath (200 km), Day 5: Joshimath to Badrinath and back, Day 6: Joshimath to Haridwar (270 km), Day 7: Haridwar to Delhi. Add 1 buffer day for weather delays."
    },
    {
        question: "Should I visit Kedarnath or Badrinath first?",
        answer: "Visit Kedarnath first. The logic: Kedarnath requires an 18 km trek from Gaurikund and is physically demanding. Complete the harder pilgrimage when you have maximum energy and fresh legs. Badrinath is fully accessible by road—no walking except to the temple entrance. By doing Kedarnath first, you rest during the 8-hour drive to Badrinath, recovering for the remaining journey."
    },
    {
        question: "What is the cost of Do Dham Yatra package?",
        answer: "Do Dham Yatra packages range from ₹15,000 to ₹45,000 per person for 7 days. Budget (₹15,000-20,000): Shared tempo, dharamshalas, trek only. Standard (₹25,000-35,000): Private sedan, 2-star hotels, pony option. Premium (₹35,000-45,000): SUV, good hotels, Kedarnath helicopter included. For groups of 4+, per-person costs reduce by 15-20% due to shared vehicle expenses."
    },
    {
        question: "Can Do Dham Yatra be completed in 5 days?",
        answer: "Yes, a 5-day Do Dham is possible but demanding. Fastest itinerary: Day 1: Delhi to Sonprayag (overnight travel), Day 2: Kedarnath by helicopter (up and down same day), Day 3: Sonprayag to Badrinath (8 hours drive), Day 4: Badrinath darshan + drive to Rishikesh (9 hours), Day 5: Rishikesh to Delhi (6 hours). This requires using helicopter for Kedarnath and very early starts each day."
    },
    {
        question: "What is the best time for Do Dham Yatra?",
        answer: "Best months for Do Dham are May-June and September-October. Kedarnath temple opens around late April (Mahashivratri) and Badrinath opens on Akshaya Tritiya. Both close in November. May-June offers best weather but peak crowds; book accommodations 2-3 months ahead. September-October has pleasant weather, fewer crowds, and occasional rain. Avoid July-August monsoon due to landslides."
    }
];

const DoDhamPage = () => {
    const pageSchema = {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        "name": "Do Dham Yatra 2025 - Kedarnath & Badrinath Packages",
        "description": "Complete Kedarnath and Badrinath pilgrimage packages from ₹15,999. 7-day itinerary with verified hotels and transport.",
        "url": "https://staykedarnath.in/do-dham",
        "touristType": ["Pilgrimage", "Religious Tourism"],
        "itinerary": {
            "@type": "ItemList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Kedarnath" },
                { "@type": "ListItem", "position": 2, "name": "Badrinath" }
            ]
        }
    };

    return (
        <>
            <Helmet>
                <title>Do Dham Yatra 2025 | Kedarnath Badrinath Package from ₹15,999 | StayKedarnath</title>
                <meta
                    name="description"
                    content="Book Do Dham Yatra package for Kedarnath and Badrinath. 7-day itinerary from ₹15,999 per person. Verified hotels, experienced drivers, trek support. Your Kedarnath experts."
                />
                <meta
                    name="keywords"
                    content="Do Dham Yatra 2025, Kedarnath Badrinath package, 2 dham yatra cost, Kedarnath Badrinath tour, Do Dham package price, Kedar Badri yatra"
                />
                <link rel="canonical" href="https://staykedarnath.in/do-dham" />

                <meta property="og:type" content="website" />
                <meta property="og:title" content="Do Dham Yatra - Kedarnath & Badrinath in 7 Days" />
                <meta property="og:description" content="The most popular pilgrimage combination. Cover both Kedarnath and Badrinath with trusted packages starting ₹15,999." />
                <meta property="og:url" content="https://staykedarnath.in/do-dham" />

                <script type="application/ld+json">
                    {JSON.stringify(pageSchema)}
                </script>
            </Helmet>

            <GlobalSchemaMarkup />

            <div className="min-h-screen flex flex-col bg-background">
                <Nav />

                <main className="flex-grow">
                    {/* Hero Section */}
                    <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
                        <Container>
                            <div className="max-w-4xl">
                                <p className="text-primary font-medium text-sm tracking-wide uppercase mb-4">
                                    Most Popular Pilgrimage
                                </p>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                                    Do Dham Yatra
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-4 leading-relaxed">
                                    Kedarnath + Badrinath in 7 days. The two most significant Himalayan temples,
                                    covering both Lord Shiva and Lord Vishnu in a single journey.
                                </p>
                                <p className="text-base text-muted-foreground mb-8">
                                    70% of Char Dham pilgrims choose Do Dham. Half the time, half the cost, complete spiritual merit.
                                </p>

                                {/* Quick Stats */}
                                <div className="flex flex-wrap gap-6 mb-10 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>2 Dhams</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>7-8 Days</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Car className="w-4 h-4 text-primary" />
                                        <span>~500 km Circuit</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span>From ₹15,999/person</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <Button asChild size="lg" className="btn-primary">
                                        <a href="#packages">
                                            View Do Dham Packages
                                        </a>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="btn-secondary">
                                        <Link to="/char-dham">
                                            Full Char Dham
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* Why Do Dham */}
                    <section className="section-spacing bg-white">
                        <Container>
                            <div className="max-w-3xl mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    Why Choose Do Dham Over Char Dham?
                                </h2>
                                <p className="text-muted-foreground">
                                    For working professionals and families with limited time, Do Dham offers the
                                    spiritual essence of Char Dham in half the duration.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">Save 5 Days</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        7 days instead of 12. Perfect for those who cannot take extended leave.
                                        Weekend + 5 days of leave is sufficient.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">Complete Merit</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        Kedarnath (Lord Shiva) and Badrinath (Lord Vishnu) are the two primary Dhams.
                                        Yamunotri and Gangotri are river-source shrines.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Car className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground">50% Cost Saving</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        ₹15,000-35,000 vs ₹30,000-60,000 for Char Dham. Fewer hotel nights,
                                        less fuel, and reduced overall expenses.
                                    </p>
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* Packages Section */}
                    <section id="packages" className="section-spacing bg-muted/30">
                        <Container>
                            <div className="max-w-3xl mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    Do Dham Packages 2025
                                </h2>
                                <p className="text-muted-foreground">
                                    Vetted packages with transparent pricing. All packages include accommodation,
                                    transport, and basic trek assistance.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                                {/* Budget Package */}
                                <div className="bg-white p-6 rounded-lg border border-border">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Budget</p>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Essential Do Dham</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-bold text-foreground">₹15,999</span>
                                        <span className="text-muted-foreground text-sm">/person</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 7 Days / 6 Nights
                                    </p>

                                    <ul className="space-y-2 mb-6">
                                        {[
                                            "Shared tempo traveller transport",
                                            "Dharamshala / Budget lodge stays",
                                            "Kedarnath trek (no helicopter)",
                                            "Vegetarian meals included",
                                            "Group departure dates"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button asChild className="w-full" variant="outline">
                                        <Link to="/contact?package=budget-do-dham">Enquire Now</Link>
                                    </Button>
                                </div>

                                {/* Standard Package */}
                                <div className="bg-white p-6 rounded-lg border-2 border-primary relative">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full">
                                        Most Popular
                                    </div>
                                    <p className="text-xs text-primary uppercase tracking-wide mb-1">Standard</p>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Comfort Do Dham</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-bold text-foreground">₹28,999</span>
                                        <span className="text-muted-foreground text-sm">/person</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 7 Days / 6 Nights
                                    </p>

                                    <ul className="space-y-2 mb-6">
                                        {[
                                            "Private sedan (Swift Dzire/Etios)",
                                            "2-star hotel accommodation",
                                            "Kedarnath trek with pony option",
                                            "Breakfast included daily",
                                            "Flexible departure dates"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button asChild className="w-full btn-primary">
                                        <Link to="/contact?package=standard-do-dham">Book Now</Link>
                                    </Button>
                                </div>

                                {/* Premium Package */}
                                <div className="bg-white p-6 rounded-lg border border-border">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Premium</p>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">Luxury Do Dham</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-bold text-foreground">₹42,999</span>
                                        <span className="text-muted-foreground text-sm">/person</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> 6 Days / 5 Nights
                                    </p>

                                    <ul className="space-y-2 mb-6">
                                        {[
                                            "Private SUV (Innova/Crysta)",
                                            "3-star hotel accommodation",
                                            "Kedarnath helicopter included",
                                            "All meals included",
                                            "VIP darshan assistance"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <Button asChild className="w-full" variant="outline">
                                        <Link to="/contact?package=premium-do-dham">Book Now</Link>
                                    </Button>
                                </div>
                            </div>

                            <p className="text-center text-sm text-muted-foreground mt-8">
                                Need a custom itinerary? <Link to="/contact" className="text-primary font-medium hover:underline">Contact us</Link> for personalized packages.
                            </p>
                        </Container>
                    </section>

                    {/* 7-Day Itinerary */}
                    <section className="section-spacing bg-white">
                        <Container>
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    7-Day Do Dham Itinerary
                                </h2>
                                <p className="text-muted-foreground mb-10">
                                    Optimized route starting with Kedarnath (the trek) and ending with Badrinath (motorable).
                                </p>

                                <div className="space-y-3">
                                    {[
                                        { day: "Day 1", route: "Delhi → Guptkashi", desc: "Early morning departure from Delhi. Drive 450 km via Haridwar, Rishikesh, Devprayag, and Rudraprayag (12-14 hours). Overnight at Guptkashi." },
                                        { day: "Day 2", route: "Guptkashi → Kedarnath", desc: "Drive to Gaurikund (30 km). Begin 18 km trek to Kedarnath or take helicopter. Arrive by afternoon. Evening aarti at temple. Overnight near temple." },
                                        { day: "Day 3", route: "Kedarnath → Guptkashi", desc: "Early morning darshan at Kedarnath Temple. Post-darshan, trek down 18 km to Gaurikund (4-5 hours). Drive to Guptkashi. Rest and recover." },
                                        { day: "Day 4", route: "Guptkashi → Joshimath", desc: "Scenic drive via Ukhimath and Chopta (200 km, 7 hours). Joshimath is the winter seat of Lord Badri. Overnight stay." },
                                        { day: "Day 5", route: "Joshimath → Badrinath → Joshimath", desc: "Early drive to Badrinath (45 km). Darshan at temple, holy dip in Tapt Kund, visit Mana Village (last Indian village). Return to Joshimath." },
                                        { day: "Day 6", route: "Joshimath → Haridwar", desc: "Descend through the mountains to Haridwar (270 km, 8 hours). Evening Ganga Aarti at Har Ki Pauri. Overnight in Haridwar." },
                                        { day: "Day 7", route: "Haridwar → Delhi", desc: "Morning departure from Haridwar. Arrive Delhi by afternoon (230 km, 5 hours). Do Dham Yatra complete." }
                                    ].map((item, index) => (
                                        <div key={index} className="flex gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                                            <div className="flex-shrink-0 w-16 text-center">
                                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                                                    {item.day}
                                                </span>
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-medium text-foreground text-sm mb-1">{item.route}</p>
                                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* FAQs */}
                    <section className="section-spacing bg-muted/30">
                        <Container>
                            <AIOptimizedFAQ
                                faqs={DoDhamFAQs}
                                title="Do Dham Yatra — Frequently Asked Questions"
                                description="Everything about Kedarnath-Badrinath pilgrimage packages, costs, and planning."
                            />
                        </Container>
                    </section>

                    {/* Final CTA */}
                    <section className="py-12 bg-primary/5">
                        <Container>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                                        Ready to begin your Do Dham journey?
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Book now for 2025 season. Early bookings get preferred dates and better rates.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Button asChild size="lg" className="btn-primary">
                                        <Link to="/contact">Book Your Package</Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline">
                                        <Link to="/char-dham">Explore Char Dham</Link>
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

export default DoDhamPage;

