import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
    MapPin,
    ArrowRight,
    Wallet,
    Clock,
    Car,
    Mountain,
    Hotel,
    CheckCircle2,
    XCircle,
    HelpCircle,
    TrendingUp
} from 'lucide-react';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Import city data directly
import citiesData from '@/data/cities.json';

// Types based on the JSON structure
interface CityData {
    slug: string;
    name: string;
    type: string;
    state: string;
    distance_from_delhi: string;
    distance_from_kedarnath: string;
    elevation: string;
    taxi_rates: {
        drop_sonprayag_sedan: number;
        drop_sonprayag_suv: number;
    };
    stay_vibe: string;
    avg_hotel_price: string;
    images: string[];
    description: string;
    connectivity: {
        nearest_airport: string;
        nearest_railway: string;
    };
}

export default function CompareCitiesPage() {
    const { city1, city2 } = useParams();
    const navigate = useNavigate();
    const [c1Data, setC1Data] = useState<CityData | null>(null);
    const [c2Data, setC2Data] = useState<CityData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Parse slugs from URL pattern /compare/city1-vs-city2
        // But react-router param might need manual splitting if route is defined as /compare/:comparisonSlug
        // OR if defined as /compare/:city1-vs-:city2 which is cleaner.
        // Let's assume App.tsx uses /compare/:city1-vs-:city2 
        // Wait, params are usually separate. Let's stick to :city1-vs-:city2 logic if we can, 
        // OR just :slug and parse it. 
        // Implementation Plan said: /compare/:city1-vs-:city2 
        // This allows useParams to get city1 and city2 directly if the route is defined as path="/compare/:city1-vs-:city2"
        // However, "-" inside names (like new-delhi) might break this simple split if not careful with router.
        // A safer route is /compare/:city1/:city2 but let's try to stick to the requested "vs" format for SEO.
        // Actually, :city1-vs-:city2 is not valid react-router syntax usually.
        // It's better to use a single param :slug and parse it.

        // We will assume route is /compare/:slug and we parse "guptkashi-vs-sonprayag"
        // BUT the implementation plan said /compare/:city1-vs-:city2. 
        // React Router DOES support static segments between params? 
        // No, standard is /compare/:city1/vs/:city2 or just parsing one slug.
        // I will use /compare/:comparisonSlug and parse it manually.
    }, [city1, city2]);

    // Actual logic to load data
    useEffect(() => {
        // If using /compare/:slug, we need to extract from slug
        // But wait, in App.tsx I can define path="/compare/:slug" 
        // and then inside here:
        // const { slug } = useParams();
        // const parts = slug.split('-vs-');

        // Let's implement assuming specific params first for simplicity in logic,
        // but since I haven't edited App.tsx yet, I will decide the route strategy now.
        // Strategy: Route path="/compare/:slug"
        // Example slug: "guptkashi-vs-sonprayag"
    }, []);

    // Let's use a simpler approach: define route as /compare/:slug in App.tsx
    // And parse here.
    const { slug } = useParams();

    useEffect(() => {
        if (!slug) return;

        // Handle both old "city1-vs-city2" and new "city1-vs-city2-stay-for-kedarnath"
        const cleanSlug = slug.replace('-stay-for-kedarnath', '');
        const parts = cleanSlug.split('-vs-');

        if (parts.length !== 2) {
            // Invalid format
            return;
        }

        const [s1, s2] = parts;
        const d1 = citiesData.find((c: any) => c.slug === s1);
        const d2 = citiesData.find((c: any) => c.slug === s2);

        if (d1 && d2) {
            setC1Data(d1 as CityData);
            setC2Data(d2 as CityData);
        }
        setLoading(false);
    }, [slug]);

    if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

    if (!c1Data || !c2Data) {
        return (
            <Container className="py-20 text-center">
                <h2 className="text-2xl font-bold">Comparison Not Found</h2>
                <p className="text-muted-foreground mt-2">We couldn't find the cities you're looking for.</p>
                <Button className="mt-4" onClick={() => navigate('/')}>Go Home</Button>
            </Container>
        );
    }

    // --- COMPARISON LOGIC ---

    // 1. Distance Helper
    const getDistanceNum = (distStr: string) => parseInt(distStr.replace(/\D/g, '')) || 999;
    const dist1 = getDistanceNum(c1Data.distance_from_kedarnath);
    const dist2 = getDistanceNum(c2Data.distance_from_kedarnath);

    const closerCity = dist1 < dist2 ? c1Data : c2Data;
    const diffDist = Math.abs(dist1 - dist2);

    // 2. Price Helper
    const getPriceAvg = (priceStr: string) => {
        // "₹1,500 - ₹6,000" -> avg 3750
        const matches = priceStr.match(/(\d+),?(\d*)/g);
        if (!matches) return 3000;
        const clean = (s: string) => parseInt(s.replace(/,/g, '').replace('₹', ''));
        if (matches.length === 2) return (clean(matches[0]) + clean(matches[1])) / 2;
        return clean(matches[0]);
    };

    const price1 = getPriceAvg(c1Data.avg_hotel_price);
    const price2 = getPriceAvg(c2Data.avg_hotel_price);
    const cheaperCity = price1 < price2 ? c1Data : c2Data;
    const savingsPct = Math.round((Math.abs(price1 - price2) / Math.max(price1, price2)) * 100);

    // 3. Verdict Logic
    const verdictTitle = closerCity === cheaperCity
        ? `${closerCity.name} is the Clear Winner! 🏆`
        : `It depends: ${cheaperCity.name} for Budget, ${closerCity.name} for Proximity`;

    // SEO
    const pageTitle = `${c1Data.name} vs ${c2Data.name}: Which is Better for Kedarnath Yatra?`;
    const pageDesc = `Comparing ${c1Data.name} and ${c2Data.name} for your Kedarnath trip. ${closerCity.name} is closer to the temple, while ${cheaperCity.name} offers better rates.`;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <link rel="canonical" href={`https://staykedarnath.in/compare/${slug}`} />
            </Helmet>

            <div className="min-h-screen bg-background">
                <PageHeader
                    title={`${c1Data.name} vs ${c2Data.name}`}
                    description="Which city is the better halt for your Kedarnath Yatra?"
                />

                <Container className="py-12">

                    {/* Verdict Card */}
                    <Card className="mb-12 border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-900/10 shadow-lg">
                        <CardContent className="p-6">
                            <h3 className="text-sm font-bold uppercase tracking-wide text-green-700 dark:text-green-400 mb-2">The Verdict</h3>
                            <h2 className="text-2xl font-bold mb-2">{verdictTitle}</h2>
                            <p className="text-muted-foreground">
                                If you want to reach the temple quickly, choose <strong>{closerCity.name}</strong> ({closerCity.distance_from_kedarnath} away).
                                If you want to save money on hotels, <strong>{cheaperCity.name}</strong> is approx {savingsPct}% cheaper.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Comparison Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                        {/* VS Badge */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white font-bold shadow-xl border-4 border-background">
                            VS
                        </div>

                        {/* City 1 Column */}
                        <CityColumn city={c1Data} isWinner={closerCity === c1Data || cheaperCity === c1Data} otherCity={c2Data} />

                        {/* City 2 Column */}
                        <CityColumn city={c2Data} isWinner={closerCity === c2Data || cheaperCity === c2Data} otherCity={c1Data} />
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="mt-16 max-w-4xl mx-auto space-y-12">
                        <ComparisonSection
                            title="📍 Proximity to Kedarnath"
                            icon={<MapPin className="w-6 h-6 text-blue-500" />}
                            winner={closerCity}
                            loser={closerCity.slug === c1Data.slug ? c2Data : c1Data}
                            diff={`${diffDist} km`}
                            metric="closer"
                            description={`Being closer means you can start your trek earlier. ${closerCity.name} saves you travel time in the morning.`}
                        />

                        <ComparisonSection
                            title="💰 Budget & Costs"
                            icon={<Wallet className="w-6 h-6 text-green-500" />}
                            winner={cheaperCity}
                            loser={cheaperCity.slug === c1Data.slug ? c2Data : c1Data}
                            diff={`${savingsPct}%`}
                            metric="cheaper"
                            description={`${cheaperCity.name} offers better value for money, with average hotel rates around ${cheaperCity.avg_hotel_price}.`}
                        />

                        <ComparisonSection
                            title="✨ Vibe & Atmosphere"
                            icon={<TrendingUp className="w-6 h-6 text-purple-500" />}
                            winner={null} // No clear winner for vibe
                            loser={null}
                            customContent={
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                        <h4 className="font-bold mb-1">{c1Data.name}</h4>
                                        <p className="text-sm">{c1Data.stay_vibe}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
                                        <h4 className="font-bold mb-1">{c2Data.name}</h4>
                                        <p className="text-sm">{c2Data.stay_vibe}</p>
                                    </div>
                                </div>
                            }
                            description="Different travelers seek different experiences. Choose based on what you prioritize."
                        />
                        {/* Genuine FAQs */}
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-8 border">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-primary" />
                                Common Questions
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-bold text-sm mb-2">Which is better for reliable phone network?</h4>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>{c1Data.distance_from_delhi < c2Data.distance_from_delhi ? c1Data.name : c2Data.name}</strong> generally has better connectivity. Major towns like Guptkashi/Phata have stable Jio/Airtel 4G. Higher up near Sonprayag, it can be patchy.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm mb-2">I am traveling with parents (60+). Where should we stay?</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Choose <strong>{closerCity.name}</strong>. The road travel from {cheaperCity.name} to Sonprayag adds fatigue before the trek begins. Minimizing morning travel is crucial for elderly pilgrims.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm mb-2">Which has better food options?</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Larger towns like Guptkashi/Sitapur have proper restaurants. Smaller halts like {closerCity.name === 'Sonprayag' ? 'Gaurikund' : closerCity.name} mostly have basic dhabas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-16 text-center">
                        <h3 className="text-2xl font-bold mb-6">Ready to Book?</h3>
                        <div className="flex justify-center gap-4">
                            <Link to={`/${c1Data.slug}/hotels`}>
                                <Button size="lg" variant="outline">Browse {c1Data.name} Hotels</Button>
                            </Link>
                            <Link to={`/${c2Data.slug}/hotels`}>
                                <Button size="lg">Browse {c2Data.name} Hotels</Button>
                            </Link>
                        </div>
                    </div>

                </Container>
                <Footer />
            </div>
        </>
    );
}

// Helper Components
const CityColumn = ({ city, isWinner, otherCity }: { city: CityData, isWinner: boolean, otherCity: CityData }) => (
    <Card className={`h-full border-t-4 ${isWinner ? 'border-t-green-500 shadow-md' : 'border-t-slate-300'}`}>
        <div className="h-48 overflow-hidden relative">
            <img
                src={city.images[0] || '/images/default-city.jpg'}
                alt={city.name}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <h3 className="absolute bottom-4 left-4 text-3xl font-bold text-white shadow-sm">{city.name}</h3>
        </div>
        <CardContent className="space-y-6 pt-6">
            <div className="flex items-start gap-3">
                <Mountain className="w-5 h-5 text-slate-500 mt-1" />
                <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Distance to Temple</p>
                    <p className="text-lg font-bold">{city.distance_from_kedarnath}</p>
                </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
                <Hotel className="w-5 h-5 text-slate-500 mt-1" />
                <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Avg Hotel Price</p>
                    <p className="text-lg font-bold">{city.avg_hotel_price}</p>
                </div>
            </div>
            <Separator />
            <div className="flex items-start gap-3">
                <Car className="w-5 h-5 text-slate-500 mt-1" />
                <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">Connectivity</p>
                    <p className="text-sm font-medium">{city.connectivity.nearest_railway}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);

const ComparisonSection = ({ title, icon, winner, loser, diff, metric, description, customContent }: any) => {
    if (customContent) {
        return (
            <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">{icon}</div>
                    <h3 className="text-xl font-bold">{title}</h3>
                </div>
                {customContent}
                <p className="mt-4 text-muted-foreground">{description}</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">{icon}</div>
                <h3 className="text-xl font-bold">{title}</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-4">
                <div className="flex-1 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                        <span className="font-bold text-green-700 dark:text-green-400">{winner.name}</span>
                        <span className="text-sm text-green-600 dark:text-green-500 ml-2">is {diff} {metric}</span>
                    </div>
                </div>
                <div className="flex-1 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3 opacity-75">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <div>
                        <span className="font-bold text-red-700 dark:text-red-400">{loser.name}</span>
                        <span className="text-sm text-red-600 dark:text-red-500 ml-2">is {metric === 'cheaper' ? 'more expensive' : 'further away'}</span>
                    </div>
                </div>
            </div>

            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}
