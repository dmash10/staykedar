import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Container from '@/components/Container';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { GlobalSchemaMarkup } from '@/components/SEO/SchemaMarkup';
import AIOptimizedFAQ from '@/components/SEO/AIOptimizedFAQ';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    Calendar,
    Clock,
    Car,
    ChevronRight,
    Search,
    Route,
    IndianRupee,
    Mountain,
    Compass,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    X
} from 'lucide-react';
import {
    searchCities,
    getPopularSourceCities,
    PILGRIMAGE_DESTINATIONS,
    type IndiaCity
} from '@/data/india-cities';
import {
    generateItinerary,
    formatCurrency,
    type ItineraryResult,
    type TravelPace,
    type TripOptions
} from '@/lib/itinerary-logic';

// FAQs for SEO
const ItineraryFAQs = [
    {
        question: "How do I plan my Kedarnath Yatra itinerary?",
        answer: "Start by selecting your starting city and destination (Kedarnath, Badrinath, Do Dham, or Char Dham). Our itinerary planner automatically calculates the optimal route via major highway points like Haridwar, Rishikesh, Rudraprayag, and Guptkashi. The tool provides day-by-day breakdowns with distances, estimated travel times, activities, and cost estimates. For best results, allow 1-2 buffer days beyond the minimum suggested duration."
    },
    {
        question: "What is the best route from Delhi to Kedarnath?",
        answer: "The optimal Delhi to Kedarnath route is: Delhi → Haridwar (220 km, 5 hrs) → Rishikesh → Devprayag → Rudraprayag → Guptkashi (420 km from Delhi, day 1 stay) → Sonprayag/Gaurikund (day 2) → Kedarnath (18 km trek). Total road distance is approximately 445 km from Delhi to Gaurikund, taking 12-14 hours of driving split across 2 days. Most pilgrims stay at Guptkashi or Sonprayag before the trek."
    },
    {
        question: "How many days do I need for Kedarnath from Mumbai?",
        answer: "Mumbai to Kedarnath requires 7-8 days minimum. Suggested itinerary: Day 1: Mumbai to Delhi (flight/train). Day 2: Delhi to Guptkashi (12 hrs drive). Day 3: Sonprayag to Kedarnath trek (18 km). Day 4: Kedarnath darshan, return trek. Day 5: Buffer/Joshimath (if doing Do Dham). Day 6-7: Return to Delhi. Day 8: Return to Mumbai. Always add 1-2 buffer days for weather delays, especially during monsoon season."
    },
    {
        question: "Can I do Kedarnath and Badrinath together?",
        answer: "Yes! This is called Do Dham Yatra and is the most popular pilgrimage combination. From Kedarnath, you return to Sonprayag, then drive via Chopta or Ukhimath to Joshimath (200 km, 8 hrs). Next day visit Badrinath (45 km from Joshimath). Do Dham takes 7-8 days from Delhi. 70% of Char Dham pilgrims choose Do Dham as it covers the two most significant temples in half the time."
    },
    {
        question: "What is the estimated cost for Kedarnath Yatra?",
        answer: "Kedarnath Yatra costs vary based on origin city and choices. From Delhi (5 days): Budget ₹12,000-18,000 (shared taxi, dharamshalas), Standard ₹25,000-35,000 (private car, 2-star hotels), Premium ₹45,000-60,000 (SUV, good hotels, helicopter). Add ₹7,000-10,000 for each additional day. Helicopter to Kedarnath costs ₹5,500-8,000 (official rate), saving 36 km of trekking. Peak season (May-June) prices are 20-30% higher."
    },
    {
        question: "Which cities are covered by this itinerary planner?",
        answer: "Our itinerary planner covers 300+ cities across India including all metros (Delhi, Mumbai, Kolkata, Bangalore, Chennai, Hyderabad), state capitals, major cities, and pilgrimage towns. The search supports any Indian city—simply type your city name and select from suggestions. For locations not in our database, choose the nearest major city as your starting point."
    }
];

// Scroll animation hook
function useScrollAnimation() {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
}

// Animated section wrapper
function AnimatedSection({ children, className = '', delay = 0 }: {
    children: React.ReactNode;
    className?: string;
    delay?: number;
}) {
    const { ref, isVisible } = useScrollAnimation();

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ${className}`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transitionDelay: `${delay}ms`
            }}
        >
            {children}
        </div>
    );
}

// City search component
function CitySearch({
    value,
    onChange,
    placeholder,
    label
}: {
    value: string;
    onChange: (city: string) => void;
    placeholder: string;
    label: string;
}) {
    const [query, setQuery] = useState(value);
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<IndiaCity[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (query.length >= 2) {
            const results = searchCities(query, 8);
            setSuggestions(results);
            setIsOpen(results.length > 0);
        } else {
            setSuggestions([]);
            setIsOpen(false);
        }
    }, [query]);

    const handleSelect = (city: IndiaCity) => {
        setQuery(city.name);
        onChange(city.name);
        setIsOpen(false);
    };

    const popularCities = useMemo(() => getPopularSourceCities().slice(0, 8), []);

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-foreground mb-2">
                {label}
            </label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-background text-foreground 
                             focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            onChange('');
                            inputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Suggestions dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {suggestions.map((city) => (
                        <button
                            key={`${city.name}-${city.state}`}
                            onClick={() => handleSelect(city)}
                            className="w-full px-4 py-3 text-left flex items-center justify-between
                                     hover:bg-primary/5 transition-colors border-b border-border/50 last:border-0"
                        >
                            <div>
                                <span className="font-medium text-foreground">{city.name}</span>
                                <span className="text-sm text-muted-foreground ml-2">{city.state}</span>
                            </div>
                            {city.type === 'pilgrimage' && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Pilgrimage</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Popular cities quick select */}
            {!query && (
                <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-2">Popular cities:</p>
                    <div className="flex flex-wrap gap-2">
                        {popularCities.map((city) => (
                            <button
                                key={city.name}
                                onClick={() => handleSelect(city)}
                                className="px-3 py-1 text-xs rounded-full border border-border text-muted-foreground
                                         hover:border-primary hover:text-primary transition-colors"
                            >
                                {city.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Horizontal Timeline Component
function TimelineView({ days }: { days: any[] }) {
    const [activeDay, setActiveDay] = useState(0);
    const { ref, isVisible } = useScrollAnimation();
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to center of active day dot
    useEffect(() => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const activeElement = container.querySelector(`[data-day="${activeDay}"]`) as HTMLElement;
            if (activeElement) {
                const containerWidth = container.offsetWidth;
                const elementLeft = activeElement.offsetLeft;
                const elementWidth = activeElement.offsetWidth;
                container.scrollTo({
                    left: elementLeft - containerWidth / 2 + elementWidth / 2,
                    behavior: 'smooth'
                });
            }
        }
    }, [activeDay]);

    const currentDay = days[activeDay];

    return (
        <div
            ref={ref}
            className="transition-all duration-700"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
            }}
        >
            {/* Horizontal scrollable timeline */}
            <div className="relative mb-6">
                {/* Scroll hint for mobile */}
                <p className="text-xs text-muted-foreground text-center mb-3 md:hidden">
                    ← Swipe to see all days →
                </p>

                <div
                    ref={scrollContainerRef}
                    className="flex items-start gap-0 overflow-x-auto pt-2 pb-4 px-6 scroll-smooth snap-x snap-mandatory"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {days.map((day, index) => (
                        <div
                            key={index}
                            data-day={index}
                            className="flex items-center flex-shrink-0 snap-center"
                        >
                            {/* Day node */}
                            <button
                                onClick={() => setActiveDay(index)}
                                className="relative flex flex-col items-center group transition-all duration-300 px-1"
                            >
                                {/* Dot/Circle */}
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                    ${activeDay === index
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                                        : 'bg-background border-border text-muted-foreground group-hover:border-primary/50'
                                    }`}
                                >
                                    <span className="text-xs md:text-sm font-bold">D{day.day}</span>
                                </div>

                                {/* City name below */}
                                <div className="mt-2 text-center w-[70px] md:w-[90px]">
                                    <p className={`text-[10px] md:text-xs font-medium truncate transition-colors
                                        ${activeDay === index ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                        {day.to}
                                    </p>
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground/70">{day.distance} km</p>
                                </div>
                            </button>

                            {/* Connector line */}
                            {index < days.length - 1 && (
                                <div className={`w-6 md:w-12 h-0.5 transition-colors duration-300
                                    ${index < activeDay ? 'bg-primary' : 'bg-border'}`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Active day details card */}
            <div
                key={activeDay}
                className="glass-card p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent animate-in fade-in-50 slide-in-from-bottom-2 duration-300"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center">
                            <span className="text-lg font-bold">D{currentDay.day}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                                <span>{currentDay.from}</span>
                                <ChevronRight className="w-5 h-5 text-primary" />
                                <span>{currentDay.to}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{currentDay.title || 'Journey Day'}</p>
                        </div>
                    </div>

                    {/* Stats badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
                            <Route className="w-4 h-4" />
                            {currentDay.distance} km
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm">
                            <Clock className="w-4 h-4" />
                            {currentDay.duration} hrs
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                            ${currentDay.terrain === 'mountains'
                                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                                : currentDay.terrain === 'hills'
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            }`}>
                            {currentDay.terrain === 'mountains' ? <Mountain className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                            {currentDay.terrain.charAt(0).toUpperCase() + currentDay.terrain.slice(1)}
                        </span>
                    </div>
                </div>

                {/* Content grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Activities */}
                    <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            Activities
                        </h4>
                        <ul className="space-y-2">
                            {currentDay.activities.map((activity: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                                    {activity}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tips & Overnight */}
                    <div className="space-y-4">
                        {currentDay.tips.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                                <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4" />
                                    Travel Tips
                                </h4>
                                <ul className="space-y-1">
                                    {currentDay.tips.map((tip: string, i: number) => (
                                        <li key={i} className="text-xs text-amber-700 dark:text-amber-400">• {tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Overnight */}
                        <div className="bg-primary/5 p-4 rounded-lg">
                            <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                                🏨 Overnight Stay
                            </h4>
                            <p className="text-primary font-medium">{currentDay.overnight}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Day navigation buttons */}
            <div className="flex justify-between items-center mt-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveDay(Math.max(0, activeDay - 1))}
                    disabled={activeDay === 0}
                    className="gap-1"
                >
                    <ChevronRight className="w-4 h-4 rotate-180" />
                    Previous Day
                </Button>

                <span className="text-sm text-muted-foreground">
                    Day {activeDay + 1} of {days.length}
                </span>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveDay(Math.min(days.length - 1, activeDay + 1))}
                    disabled={activeDay === days.length - 1}
                    className="gap-1"
                >
                    Next Day
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

// Compact horizontal day pill (for quick overview)
function QuickOverview({ days }: { days: any[] }) {
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {days.map((day, index) => (
                <div
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted text-xs text-muted-foreground"
                >
                    <span className="font-semibold text-foreground">D{day.day}</span>
                    <span>→</span>
                    <span className="truncate max-w-[80px]">{day.to}</span>
                </div>
            ))}
        </div>
    );
}

export default function ItineraryPlannerPage() {
    const [sourceCity, setSourceCity] = useState('');
    const [destination, setDestination] = useState('');
    const [pace, setPace] = useState<TravelPace>('fast');
    const [stayNights, setStayNights] = useState<1 | 2>(1);
    const [itinerary, setItinerary] = useState<ItineraryResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        if (!sourceCity || !destination) return;

        setIsGenerating(true);

        // Simulate processing time for UX
        setTimeout(() => {
            const result = generateItinerary(
                sourceCity,
                destination as any,
                { pace, stayNights }
            );
            setItinerary(result);
            setIsGenerating(false);

            // Scroll to results
            document.getElementById('itinerary-results')?.scrollIntoView({ behavior: 'smooth' });
        }, 800);
    };

    const pageSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Kedarnath Yatra Itinerary Planner",
        "applicationCategory": "TravelApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "INR"
        },
        "description": "Free tool to plan your Kedarnath, Badrinath, and Char Dham yatra. Get day-by-day itineraries with distances, costs, and travel tips."
    };

    return (
        <>
            <Helmet>
                <title>Kedarnath Yatra Itinerary Planner | Plan Your Trip from Any City | StayKedarnath</title>
                <meta
                    name="description"
                    content="Free itinerary planner for Kedarnath, Badrinath, Do Dham & Char Dham. Get day-by-day travel plans from any Indian city with distances, costs & tips. 300+ cities supported."
                />
                <meta
                    name="keywords"
                    content="kedarnath itinerary, kedarnath route planner, kedarnath trip plan, badrinath travel guide, char dham route, do dham yatra plan, delhi to kedarnath route"
                />
                <link rel="canonical" href="https://staykedarnath.in/tools/itinerary-planner" />

                <meta property="og:type" content="website" />
                <meta property="og:title" content="Kedarnath Yatra Itinerary Planner - Plan Your Trip" />
                <meta property="og:description" content="Free tool to plan Kedarnath, Badrinath & Char Dham yatra from any Indian city. Get personalized day-by-day itineraries." />
                <meta property="og:url" content="https://staykedarnath.in/tools/itinerary-planner" />

                <script type="application/ld+json">
                    {JSON.stringify(pageSchema)}
                </script>
            </Helmet>

            <GlobalSchemaMarkup />

            <div className="min-h-screen flex flex-col bg-background">
                <Nav />

                <main className="flex-grow">
                    {/* Hero Section */}
                    <section className="relative bg-gradient-to-b from-primary/5 to-background py-10 md:py-12">
                        <Container>
                            <AnimatedSection>
                                <div className="max-w-3xl mx-auto text-center">
                                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                                        <Compass className="w-4 h-4" />
                                        Free Trip Planning Tool
                                    </div>
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                                        Kedarnath Yatra Itinerary Planner
                                    </h1>
                                    <p className="text-base md:text-lg text-muted-foreground mb-4">
                                        Plan your Kedarnath, Badrinath, Do Dham or Char Dham journey from any city in India.
                                        Get personalized day-by-day itineraries with distances, costs, and local tips.
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            300+ Indian cities
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            Day-by-day plans
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <IndianRupee className="w-4 h-4 text-primary" />
                                            Cost estimates
                                        </span>
                                    </div>
                                </div>
                            </AnimatedSection>
                        </Container>
                    </section>

                    {/* Planner Form */}
                    <section className="section-spacing bg-white">
                        <Container>
                            <AnimatedSection delay={100}>
                                <div className="max-w-2xl mx-auto">
                                    <div className="glass-card p-6 md:p-8 border border-border">
                                        <h2 className="text-xl font-semibold text-foreground mb-6">
                                            Create Your Itinerary
                                        </h2>

                                        <div className="space-y-6">
                                            {/* Source City */}
                                            <CitySearch
                                                value={sourceCity}
                                                onChange={setSourceCity}
                                                placeholder="Type your city name..."
                                                label="Starting City"
                                            />

                                            {/* Destination */}
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">
                                                    Destination
                                                </label>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    {PILGRIMAGE_DESTINATIONS.map((dest) => (
                                                        <button
                                                            key={dest.id}
                                                            onClick={() => setDestination(dest.id)}
                                                            className={`p-3 rounded-lg border text-sm text-center transition-colors
                                                                ${destination === dest.id
                                                                    ? 'border-primary bg-primary/5 text-primary'
                                                                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                                                                }`}
                                                        >
                                                            {dest.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Trip Options */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Pace */}
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-2">
                                                        Trip Pace
                                                    </label>
                                                    <div className="flex flex-col gap-2">
                                                        {[
                                                            { id: 'fast', label: 'Fast', desc: 'Minimum days' },
                                                            { id: 'comfort', label: 'Comfort', desc: 'Balanced' },
                                                            { id: 'relaxed', label: 'Relaxed', desc: 'More rest' }
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => setPace(opt.id as TravelPace)}
                                                                className={`p-2 rounded-lg border text-left text-sm transition-colors
                                                                    ${pace === opt.id
                                                                        ? 'border-primary bg-primary/5 text-primary'
                                                                        : 'border-border text-muted-foreground hover:border-primary/50'
                                                                    }`}
                                                            >
                                                                <span className="font-medium">{opt.label}</span>
                                                                <span className="text-xs ml-1 opacity-70">({opt.desc})</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Stay Nights */}
                                                <div>
                                                    <label className="block text-sm font-medium text-foreground mb-2">
                                                        Nights at Temple
                                                    </label>
                                                    <div className="flex flex-col gap-2">
                                                        {[
                                                            { id: 1, label: '1 Night', desc: 'Quick darshan' },
                                                            { id: 2, label: '2 Nights', desc: 'Extra exploration' }
                                                        ].map((opt) => (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => setStayNights(opt.id as 1 | 2)}
                                                                className={`p-2 rounded-lg border text-left text-sm transition-colors
                                                                    ${stayNights === opt.id
                                                                        ? 'border-primary bg-primary/5 text-primary'
                                                                        : 'border-border text-muted-foreground hover:border-primary/50'
                                                                    }`}
                                                            >
                                                                <span className="font-medium">{opt.label}</span>
                                                                <span className="text-xs ml-1 opacity-70">({opt.desc})</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Generate Button */}
                                            <Button
                                                onClick={handleGenerate}
                                                disabled={!sourceCity || !destination || isGenerating}
                                                className="w-full btn-primary"
                                                size="lg"
                                            >
                                                {isGenerating ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                                        Generating Itinerary...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Route className="w-5 h-5 mr-2" />
                                                        Generate Itinerary
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedSection>
                        </Container>
                    </section>

                    {/* Results Section */}
                    {itinerary && itinerary.route.length > 0 && (
                        <section id="itinerary-results" className="section-spacing bg-muted/30">
                            <Container>
                                <AnimatedSection>
                                    <div className="max-w-3xl mx-auto">
                                        {/* Summary Card */}
                                        <div className="glass-card p-5 border border-border mb-6">
                                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                                Your {destination === 'kedarnath' ? 'Kedarnath' :
                                                    destination === 'badrinath' ? 'Badrinath' :
                                                        destination === 'do-dham' ? 'Do Dham' : 'Char Dham'} Itinerary
                                            </h2>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-primary">{itinerary.totalDays}</p>
                                                    <p className="text-xs text-muted-foreground">Total Days</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-primary">{itinerary.totalDistance}</p>
                                                    <p className="text-xs text-muted-foreground">Total km</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-primary">
                                                        {formatCurrency(itinerary.estimatedCost.total.min)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Budget (min)</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-primary">
                                                        {formatCurrency(itinerary.estimatedCost.total.max)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Premium (max)</p>
                                                </div>
                                            </div>

                                            {/* Warnings */}
                                            {itinerary.warnings.length > 0 && (
                                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                                        <div>
                                                            {itinerary.warnings.map((warning, i) => (
                                                                <p key={i} className="text-sm text-amber-800 dark:text-amber-200">{warning}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommendations */}
                                            {itinerary.recommendations.length > 0 && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                                    <div className="flex items-start gap-2">
                                                        <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                                                        <div>
                                                            {itinerary.recommendations.map((rec, i) => (
                                                                <p key={i} className="text-sm text-blue-800 dark:text-blue-200">{rec}</p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Day-by-day itinerary with horizontal timeline */}
                                        <h3 className="text-lg font-semibold text-foreground mb-4">Your Journey</h3>
                                        <QuickOverview days={itinerary.route} />
                                        <TimelineView days={itinerary.route} />

                                        {/* Cost Breakdown */}
                                        <div className="glass-card p-5 border border-border mt-6">
                                            <h3 className="text-lg font-semibold text-foreground mb-4">Estimated Cost Breakdown</h3>
                                            <div className="space-y-3">
                                                {[
                                                    { label: 'Transport', data: itinerary.estimatedCost.transport },
                                                    { label: 'Accommodation', data: itinerary.estimatedCost.accommodation },
                                                    { label: 'Food', data: itinerary.estimatedCost.food },
                                                    { label: 'Miscellaneous', data: itinerary.estimatedCost.misc },
                                                ].map((item) => (
                                                    <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                                                        <span className="text-muted-foreground">{item.label}</span>
                                                        <span className="text-foreground font-medium">
                                                            {formatCurrency(item.data.min)} - {formatCurrency(item.data.max)}
                                                        </span>
                                                    </div>
                                                ))}
                                                <div className="flex justify-between items-center pt-2 font-semibold">
                                                    <span className="text-foreground">Total</span>
                                                    <span className="text-primary text-lg">
                                                        {formatCurrency(itinerary.estimatedCost.total.min)} - {formatCurrency(itinerary.estimatedCost.total.max)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* CTA */}
                                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                            <Button asChild size="lg" className="btn-primary flex-1">
                                                <Link to="/packages">Browse Packages</Link>
                                            </Button>
                                            <Button asChild size="lg" variant="outline" className="flex-1">
                                                <Link to="/contact">Get Custom Quote</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </AnimatedSection>
                            </Container>
                        </section>
                    )}

                    {/* FAQs */}
                    <section className="section-spacing bg-white">
                        <Container>
                            <AnimatedSection>
                                <AIOptimizedFAQ
                                    faqs={ItineraryFAQs}
                                    title="Itinerary Planning — Frequently Asked Questions"
                                    description="Common questions about planning your Kedarnath, Badrinath, and Char Dham pilgrimage."
                                />
                            </AnimatedSection>
                        </Container>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}
