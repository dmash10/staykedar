import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { SEOItinerary } from '@/types/seoItinerary';
import Navbar from '@/components/Nav';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    MapPin,
    Clock,
    Calendar,
    IndianRupee,
    CheckCircle2,
    XCircle,
    Phone,
    ArrowRight,
    Car,
    Mountain,
    Utensils,
    Hotel,
} from 'lucide-react';

export default function ItineraryPage() {
    const { slug } = useParams();
    const [itinerary, setItinerary] = useState<SEOItinerary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchItinerary() {
            if (!slug) return;
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('seo_itineraries')
                    .select('*')
                    .eq('slug', slug)
                    .eq('is_active', true)
                    .single();

                if (error) throw error;
                setItinerary(data);
            } catch (err) {
                console.error('Error fetching itinerary:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchItinerary();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
                    <p className="text-muted-foreground animate-pulse">Loading your journey...</p>
                </div>
            </div>
        );
    }

    if (error || !itinerary) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Itinerary Not Found</h1>
                    <p className="text-slate-600 mb-6">We couldn't find the trip you're looking for.</p>
                    <Button asChild>
                        <Link to="/">Go Home</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    const handleBookNow = () => {
        const text = `Hi, I am interested in the "${itinerary.title}" (${itinerary.duration_days} Days) package. Please share details.`;
        window.open(`https://wa.me/919027475042?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Helmet>
                <title>{itinerary.meta_title || `${itinerary.title} - StayKedarnath`}</title>
                <meta name="description" content={itinerary.meta_description || itinerary.overview} />
            </Helmet>

            <Navbar />

            {/* Hero Section */}
            <div className="relative bg-slate-900 text-white py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-slate-900/90 z-10" />
                <div
                    className="absolute inset-0 bg-cover bg-center z-0 opacity-40 scale-105 animate-pulse-slow"
                    style={{ backgroundImage: `url('/lovable-uploads/ced60803-0c4f-4d2b-b51f-29219323df06.png')` }} // Placeholder, ideally dynamic image
                />

                <div className="container relative z-20 mx-auto px-4 max-w-5xl text-center">
                    <Badge variant="outline" className="mb-6 text-purple-200 border-purple-400/50 bg-purple-900/30 px-4 py-1.5 text-sm backdrop-blur-sm">
                        {itinerary.start_location} to {itinerary.end_location}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-purple-200">
                        {itinerary.title}
                    </h1>
                    <div className="flex flex-wrap justify-center gap-4 text-lg lg:text-xl text-slate-200 mb-10">
                        <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <Clock className="w-5 h-5 text-purple-300" /> {itinerary.duration_days} Days
                        </span>
                        <span className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md">
                            <IndianRupee className="w-5 h-5 text-green-400" /> ₹{itinerary.price_estimate ? itinerary.price_estimate.toLocaleString() : 'On Request'}
                        </span>
                    </div>
                    <Button size="lg" onClick={handleBookNow} className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-6 text-lg shadow-xl shadow-purple-900/50 transition-all hover:scale-105 active:scale-95">
                        Book This Trip <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid lg:grid-cols-3 gap-10">

                    {/* Main Content: Overview & Timeline */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Overview */}
                        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <Mountain className="w-6 h-6 text-purple-600" /> Trip Overview
                            </h2>
                            <div
                                className="prose prose-slate max-w-none text-slate-600 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: itinerary.overview || '' }}
                            />
                        </section>

                        {/* Itinerary Timeline */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-purple-600" /> Day-by-Day Plan
                            </h2>

                            <div className="relative border-l-2 border-purple-200 ml-4 lg:ml-6 space-y-12 pb-4">
                                {itinerary.day_wise_plan?.map((day, idx) => (
                                    <div key={idx} className="relative pl-8 lg:pl-12 group">
                                        {/* Timeline Dot */}
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-purple-600 shadow-md group-hover:scale-125 transition-transform duration-300" />

                                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-6 lg:p-8">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                <h3 className="text-xl font-bold text-slate-800">
                                                    <span className="text-purple-600 mr-2">Day {day.day}:</span> {day.title}
                                                </h3>
                                                <Badge variant="secondary" className="w-fit">
                                                    {day.stay_location}
                                                </Badge>
                                            </div>

                                            <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg">
                                                {day.distance_km && <div className="flex items-center gap-2"><Car className="w-4 h-4" /> Distance: {day.distance_km}</div>}
                                                {day.travel_time && <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Travel Time: {day.travel_time}</div>}
                                            </div>

                                            <p className="text-slate-600 leading-relaxed mb-4">{day.description}</p>

                                            {day.activity && (
                                                <div className="flex items-start gap-2 text-sm text-purple-700 bg-purple-50 p-3 rounded-lg border border-purple-100">
                                                    <div className="min-w-fit mt-0.5">✨ Highlight:</div>
                                                    <div>{day.activity}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar: Inclusions & CTA */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl shadow-lg border border-purple-100 p-8 sticky top-24">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Package Summary</h3>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="text-green-500 w-5 h-5" /> What's Included
                                    </h4>
                                    <ul className="space-y-2">
                                        {itinerary.inclusions?.map((inc, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <span className="block w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" /> {inc}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {itinerary.exclusions && itinerary.exclusions.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                            <XCircle className="text-red-500 w-5 h-5" /> Exclusions
                                        </h4>
                                        <ul className="space-y-2">
                                            {itinerary.exclusions.map((exc, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <span className="block w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" /> {exc}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                                <div className="text-slate-500 text-sm mb-1">Starting from</div>
                                <div className="text-3xl font-bold text-slate-900 mb-6">
                                    ₹{itinerary.price_estimate?.toLocaleString()}<span className="text-sm font-normal text-slate-400">/person</span>
                                </div>
                                <Button onClick={handleBookNow} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl shadow-lg shadow-purple-600/20">
                                    <Phone className="w-5 h-5 mr-2" /> Request Quote
                                </Button>
                                <p className="text-xs text-slate-400 mt-4">
                                    Customizable based on your requirements.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Footer />
            <WhatsAppButton />
        </div>
    );
}
