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

// Comprehensive Char Dham FAQs
const CharDhamFAQs = [
    {
        question: "What is Char Dham Yatra?",
        answer: "Char Dham Yatra is the sacred Hindu pilgrimage to four ancient temples in the Garhwal Himalayas of Uttarakhand: Yamunotri (source of Yamuna), Gangotri (source of Ganga), Kedarnath (Lord Shiva), and Badrinath (Lord Vishnu). This circuit covers approximately 1,200 km and is considered one of the holiest journeys in Hinduism. The traditional sequence follows west to east: Yamunotri → Gangotri → Kedarnath → Badrinath."
    },
    {
        question: "How many days are needed for complete Char Dham Yatra?",
        answer: "A complete Char Dham Yatra requires 10-12 days from Delhi. Recommended breakdown: Day 1-2: Delhi to Yamunotri (includes 6 km trek), Day 3-4: Yamunotri to Gangotri, Day 5-7: Gangotri to Kedarnath (includes 18 km trek or helicopter), Day 8-10: Kedarnath to Badrinath, Day 11-12: Return to Delhi via Haridwar. Add 1-2 buffer days for weather delays and acclimatization."
    },
    {
        question: "When is the best time for Char Dham Yatra?",
        answer: "The optimal months are May-June and September-October. Temple opening dates: Yamunotri & Gangotri open on Akshaya Tritiya (late April/early May), Kedarnath opens on Mahashivratri morning (April/May), and Badrinath opens on Akshaya Tritiya. All temples close in November for winter. Avoid monsoon season (July-August) due to landslides and road closures. May-June has best weather but heavy crowds; September-October offers pleasant weather with fewer pilgrims."
    },
    {
        question: "Which Dham should I visit first?",
        answer: "The traditional order is west to east: Yamunotri → Gangotri → Kedarnath → Badrinath. This sequence is considered spiritually significant and practically efficient. Start with Yamunotri (requires 6 km trek) while you have full energy. Kedarnath—the most challenging with its 18 km trek—comes third when you're acclimatized. Badrinath (fully motorable) is saved for last as it requires minimal physical effort."
    },
    {
        question: "What is the total cost of Char Dham Yatra?",
        answer: "Char Dham Yatra costs range from ₹25,000 to ₹80,000+ per person for 12 days. Budget option (₹25,000-35,000): Dharamshalas, shared taxis, basic meals. Standard option (₹40,000-55,000): Decent hotels, private car (4 passengers), breakfast included. Premium option (₹60,000-80,000+): Good hotels, SUV (Innova/Crysta), all meals, Kedarnath helicopter. The Kedarnath helicopter alone adds ₹7,000-10,000 but saves 36 km of trekking."
    },
    {
        question: "Is Char Dham Yatra safe for senior citizens?",
        answer: "Char Dham Yatra is manageable for seniors with proper planning. Key considerations: Yamunotri has 6 km trek (ponies/palanquins available), Gangotri is fully motorable, Kedarnath requires 18 km trek (helicopter recommended for seniors), Badrinath is fully motorable. Recommended adaptations: Use helicopter for Kedarnath, book comfortable hotels, take rest days, carry medications, and avoid monsoon season. Many pilgrims above 60 successfully complete the yatra with appropriate pacing."
    }
];

const CharDhamPage = () => {
    const pageSchema = {
        "@context": "https://schema.org",
        "@type": "TouristTrip",
        "name": "Char Dham Yatra 2025 - Complete Pilgrimage Guide",
        "description": "Complete Char Dham pilgrimage covering Yamunotri, Gangotri, Kedarnath, and Badrinath temples in Uttarakhand Himalayas.",
        "url": "https://staykedarnath.in/char-dham",
        "touristType": ["Pilgrimage", "Religious Tourism"],
        "itinerary": {
            "@type": "ItemList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Yamunotri" },
                { "@type": "ListItem", "position": 2, "name": "Gangotri" },
                { "@type": "ListItem", "position": 3, "name": "Kedarnath" },
                { "@type": "ListItem", "position": 4, "name": "Badrinath" }
            ]
        }
    };

    const dhams = [
        {
            name: "Yamunotri",
            deity: "Goddess Yamuna",
            elevation: "3,293m",
            access: "6 km trek from Janki Chatti",
            season: "May – October",
            description: "The source of the Yamuna River and first stop in the Char Dham circuit. The temple houses an idol of Goddess Yamuna carved from black marble. Pilgrims cook rice in the hot springs to offer as prasad.",
            position: 1,
            link: "/yamunotri"
        },
        {
            name: "Gangotri",
            deity: "Goddess Ganga",
            elevation: "3,100m",
            access: "Fully motorable",
            season: "May – October",
            description: "The origin point of the holy Ganges River. The 18th-century temple marks where King Bhagirath meditated to bring Ganga to Earth. Gaumukh glacier, the actual source, is 18 km trek from here.",
            position: 2,
            link: "/gangotri"
        },
        {
            name: "Kedarnath",
            deity: "Lord Shiva (Jyotirlinga)",
            elevation: "3,583m",
            access: "18 km trek or helicopter",
            season: "May – October",
            description: "One of 12 Jyotirlingas and the most challenging Dham. The ancient temple survived the 2013 floods miraculously. The trek from Gaurikund is arduous but spiritually rewarding. Helicopter service available.",
            position: 3,
            link: "/"
        },
        {
            name: "Badrinath",
            deity: "Lord Vishnu (Narayan)",
            elevation: "3,133m",
            access: "Fully motorable",
            season: "May – November",
            description: "The most significant of the Char Dham, dedicated to Lord Vishnu. The temple was established by Adi Shankaracharya in the 9th century. Hot springs (Tapt Kund) and Mana Village are key attractions.",
            position: 4,
            link: "/badrinath"
        }
    ];

    return (
        <>
            <Helmet>
                <title>Char Dham Yatra 2025 | Complete Guide, Itinerary & Packages | StayKedarnath</title>
                <meta
                    name="description"
                    content="Complete Char Dham Yatra guide covering Yamunotri, Gangotri, Kedarnath & Badrinath. 12-day itinerary, route maps, costs from ₹25,000, and booking assistance from Kedarnath experts."
                />
                <meta
                    name="keywords"
                    content="Char Dham Yatra 2025, Char Dham package, Yamunotri Gangotri Kedarnath Badrinath, Uttarakhand pilgrimage, 4 dham yatra cost, Char Dham opening dates"
                />
                <link rel="canonical" href="https://staykedarnath.in/char-dham" />

                <meta property="og:type" content="website" />
                <meta property="og:title" content="Char Dham Yatra 2025 - Complete Pilgrimage Guide" />
                <meta property="og:description" content="Plan your sacred Char Dham journey with expert guidance. 12-day itinerary covering all 4 Himalayan temples." />
                <meta property="og:url" content="https://staykedarnath.in/char-dham" />

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
                                    The Ultimate Sacred Journey
                                </p>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                                    Char Dham Yatra
                                </h1>
                                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
                                    Four divine temples in the Garhwal Himalayas. A 1,200 km circuit through Yamunotri,
                                    Gangotri, Kedarnath, and Badrinath—the spiritual journey of a lifetime.
                                </p>

                                {/* Quick Stats */}
                                <div className="flex flex-wrap gap-6 mb-10 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span>4 Temples</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-primary" />
                                        <span>10-12 Days</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Car className="w-4 h-4 text-primary" />
                                        <span>~1,200 km Circuit</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        <span>May – November</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <Button asChild size="lg" className="btn-primary">
                                        <Link to="/packages?type=char-dham">
                                            View Char Dham Packages
                                        </Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline" className="btn-secondary">
                                        <Link to="/do-dham">
                                            Do Dham (Kedar + Badri)
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* The Four Dhams */}
                    <section className="section-spacing bg-white">
                        <Container>
                            <div className="max-w-3xl mb-12">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    The Four Sacred Dhams
                                </h2>
                                <p className="text-muted-foreground">
                                    Each temple holds unique spiritual significance. The traditional circuit follows west to
                                    east: Yamunotri → Gangotri → Kedarnath → Badrinath.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {dhams.map((dham) => (
                                    <div
                                        key={dham.name}
                                        className="glass-card p-6 md:p-8 border border-border"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start gap-6">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                                    <span className="text-lg font-bold text-primary">{dham.position}</span>
                                                </div>
                                            </div>

                                            <div className="flex-grow">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-foreground">{dham.name}</h3>
                                                        <p className="text-sm text-primary">{dham.deity}</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                        <span className="bg-muted px-2 py-1 rounded">{dham.elevation}</span>
                                                        <span className="bg-muted px-2 py-1 rounded">{dham.season}</span>
                                                    </div>
                                                </div>

                                                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                                                    {dham.description}
                                                </p>

                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-muted-foreground">
                                                        <span className="font-medium">Access:</span> {dham.access}
                                                    </p>
                                                    <Link
                                                        to={dham.link}
                                                        className="text-primary text-sm font-medium flex items-center hover:underline"
                                                    >
                                                        Learn more <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Container>
                    </section>

                    {/* 12-Day Itinerary */}
                    <section className="section-spacing bg-muted/30">
                        <Container>
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    Suggested 12-Day Itinerary
                                </h2>
                                <p className="text-muted-foreground mb-10">
                                    A well-paced schedule covering all four Dhams with adequate rest and buffer for weather.
                                </p>

                                <div className="space-y-3">
                                    {[
                                        { day: "Day 1", route: "Delhi → Barkot", desc: "Drive 300 km via Dehradun and Mussoorie (8 hours). Rest in Barkot for next day's trek." },
                                        { day: "Day 2", route: "Barkot → Yamunotri → Barkot", desc: "Drive to Janki Chatti, then 6 km trek to Yamunotri temple. Return trek and drive back to Barkot." },
                                        { day: "Day 3", route: "Barkot → Uttarkashi", desc: "Drive 100 km (4 hours). Visit Vishwanath Temple. Prepare for Gangotri the next day." },
                                        { day: "Day 4", route: "Uttarkashi → Gangotri → Uttarkashi", desc: "Day trip to Gangotri (100 km each way). Temple darshan. Return to Uttarkashi by evening." },
                                        { day: "Day 5", route: "Uttarkashi → Guptkashi", desc: "Long drive via Tehri Dam (200 km, 8 hours). Base for Kedarnath trek." },
                                        { day: "Day 6", route: "Guptkashi → Kedarnath", desc: "Drive to Gaurikund, then 18 km trek or helicopter to Kedarnath. Overnight at temple." },
                                        { day: "Day 7", route: "Kedarnath → Guptkashi", desc: "Early morning darshan. Trek down to Gaurikund (or helicopter). Drive to Guptkashi." },
                                        { day: "Day 8", route: "Guptkashi → Joshimath", desc: "Scenic drive via Chopta junction (200 km, 7 hours). Rest before Badrinath." },
                                        { day: "Day 9", route: "Joshimath → Badrinath → Joshimath", desc: "Early drive to Badrinath (45 km). Darshan, Tapt Kund bath, Mana Village visit. Return to Joshimath." },
                                        { day: "Day 10", route: "Joshimath → Rudraprayag", desc: "Relaxed drive down (160 km, 5 hours). Buffer day for rest or delays." },
                                        { day: "Day 11", route: "Rudraprayag → Haridwar", desc: "Drive to Haridwar (165 km, 5 hours). Evening Ganga Aarti at Har Ki Pauri." },
                                        { day: "Day 12", route: "Haridwar → Delhi", desc: "Return to Delhi (230 km, 5 hours). Yatra complete." }
                                    ].map((item, index) => (
                                        <div key={index} className="flex gap-4 bg-white p-4 rounded-lg border border-border">
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

                    {/* Cost Breakdown */}
                    <section className="section-spacing bg-white">
                        <Container>
                            <div className="max-w-3xl mx-auto">
                                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                                    Char Dham Yatra Cost Breakdown
                                </h2>
                                <p className="text-muted-foreground mb-8">
                                    Approximate costs for a 12-day Char Dham Yatra. Prices vary by season and accommodation choice.
                                </p>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="bg-muted/30 p-6 rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Budget</p>
                                        <p className="text-2xl font-bold text-foreground mb-4">₹25,000 – ₹35,000</p>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>Dharamshala / Basic lodges</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>Shared taxi (Tempo Traveller)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>Group departures</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>Kedarnath trek only</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-primary/5 p-6 rounded-lg border-2 border-primary">
                                        <p className="text-xs text-primary uppercase tracking-wide mb-2">Standard</p>
                                        <p className="text-2xl font-bold text-foreground mb-4">₹40,000 – ₹55,000</p>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>2-star / 3-star hotels</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>Private sedan (4 passengers)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>Flexible dates</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>Pony/Doli option included</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-muted/30 p-6 rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Premium</p>
                                        <p className="text-2xl font-bold text-foreground mb-4">₹60,000 – ₹80,000+</p>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>Best available hotels</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>SUV (Innova / Crysta)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>All meals included</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                                <span>Kedarnath helicopter included</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Container>
                    </section>

                    {/* FAQs */}
                    <section className="section-spacing bg-muted/30">
                        <Container>
                            <AIOptimizedFAQ
                                faqs={CharDhamFAQs}
                                title="Char Dham Yatra — Frequently Asked Questions"
                                description="Comprehensive answers about the sacred Char Dham pilgrimage in Uttarakhand."
                            />
                        </Container>
                    </section>

                    {/* Final CTA */}
                    <section className="py-12 bg-primary/5">
                        <Container>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                                        Need a shorter pilgrimage?
                                    </h2>
                                    <p className="text-muted-foreground">
                                        Consider Do Dham Yatra—covering Kedarnath and Badrinath in 7-8 days.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <Button asChild size="lg" className="btn-primary">
                                        <Link to="/do-dham">View Do Dham Packages</Link>
                                    </Button>
                                    <Button asChild size="lg" variant="outline">
                                        <Link to="/contact">Custom Itinerary</Link>
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

export default CharDhamPage;

