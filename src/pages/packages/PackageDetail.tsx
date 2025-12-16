import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { TransitionLink } from "@/components/TransitionLink";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    Share2,
    Heart,
    Phone,
    Mail,
    ArrowLeft,
    Check,
    Star,
    Info,
    ShieldCheck,
    CalendarDays
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import PromoBanner from "@/components/home/PromoBanner";
import { generatePackageSchema, generateBreadcrumbSchema } from "@/components/SEO/SchemaMarkup";
import BookingModal from "@/components/packages/BookingModal";
import AIOptimizedFAQ, { KedarnathTravelFAQs } from "@/components/SEO/AIOptimizedFAQ";

interface PackageDetail {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: string;
    images: string[];
    location: string;
    features: string[];
    itinerary: { day: number; title: string; description: string }[];
    inclusions: string[];
    exclusions: string[];
}

const PackageDetail = () => {
    const { slug } = useParams();
    const [pkg, setPkg] = useState<PackageDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchPackage = async () => {
            if (!slug) return;

            try {
                const { data, error } = await supabase
                    .from('packages')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error) throw error;

                if (data) {
                    const transformedData: PackageDetail = {
                        ...data,
                        features: (data.features as string[]) || [],
                        itinerary: (data.itinerary as any[]) || [],
                        inclusions: (data.inclusions as string[]) || [],
                        exclusions: (data.exclusions as string[]) || [],
                        images: data.images || []
                    };
                    setPkg(transformedData);
                }
            } catch (error) {
                console.error('Error fetching package:', error);
                toast({
                    title: "Error",
                    description: "Could not load package details.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchPackage();
    }, [slug, toast]);

    const handleEnquiry = () => {
        setIsBookingModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Nav />
                <div className="flex-grow pt-8 px-4">
                    <Container>
                        <Skeleton className="h-[400px] w-full rounded-xl mb-8" />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <Skeleton className="h-12 w-3/4" />
                                <Skeleton className="h-6 w-1/2" />
                                <Skeleton className="h-40 w-full" />
                            </div>
                            <div className="lg:col-span-1">
                                <Skeleton className="h-64 w-full rounded-xl" />
                            </div>
                        </div>
                    </Container>
                </div>
                <Footer />
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="min-h-screen flex flex-col bg-gray-50">
                <Nav />
                <div className="flex-grow flex items-center justify-center pt-20">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Package Not Found</h1>
                        <TransitionLink to="/packages">
                            <Button>Back to Packages</Button>
                        </TransitionLink>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Generate schema for SEO
    const packageSchema = generatePackageSchema({
        name: pkg.title,
        slug: slug || '',
        description: pkg.description,
        image: pkg.images?.[0] || 'https://staykedarnath.in/og-image.png',
        price: pkg.price,
        duration: pkg.duration,
        inclusions: pkg.inclusions,
        itinerary: pkg.itinerary
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: 'https://staykedarnath.in' },
        { name: 'Packages', url: 'https://staykedarnath.in/packages' },
        { name: pkg.title, url: `https://staykedarnath.in/packages/${slug}` }
    ]);

    // Calculate pricing breakdown estimates
    const basePrice = pkg.price;
    const heliPrice = 3500; // Estimated add-on
    const gstRate = 0.05;
    const totalPrice = basePrice + (basePrice * gstRate);

    return (
        <>
            <Helmet>
                <title>{pkg.title} | Kedarnath Yatra 2026 Packages</title>
                <meta name="description" content={`Book ${pkg.title} for 2026. ${pkg.duration} Kedarnath package starting ₹${pkg.price.toLocaleString()}. Includes transport, stay, meals. Best price guarantee.`} />
                <meta name="keywords" content={`${pkg.title}, Kedarnath package 2026, Char Dham Yatra 2026, Kedarnath tour cost, registration`} />
                <link rel="canonical" href={`https://staykedarnath.in/packages/${slug}`} />

                {/* Structure Data */}
                <script type="application/ld+json">{JSON.stringify(packageSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>

            <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
                <Nav />

                <main className="flex-grow pb-16">
                    {/* Compact Header & Breadcrumbs */}
                    <div className="bg-white border-b border-gray-200">
                        <Container className="py-4">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3 font-medium">
                                <TransitionLink to="/" className="hover:text-blue-600 transition-colors">Home</TransitionLink>
                                <span>/</span>
                                <TransitionLink to="/packages" className="hover:text-blue-600 transition-colors">Packages</TransitionLink>
                                <span>/</span>
                                <span className="text-slate-800 line-clamp-1">{pkg.title}</span>
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                                            Booking Open for 2026
                                        </div>
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <Star className="w-3.5 h-3.5 fill-current" />
                                            <span className="text-xs font-bold text-slate-700">4.9 (120+ Verified)</span>
                                        </div>
                                    </div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
                                        {pkg.title}
                                    </h1>
                                    <div className="flex items-center flex-wrap gap-4 text-sm text-slate-600 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                            {pkg.location}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-blue-600" />
                                            {pkg.duration}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-green-700">
                                            <ShieldCheck className="w-4 h-4" />
                                            Local Operator Verified
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                    <Button variant="outline" size="sm" className="h-9 px-3 gap-2 rounded text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50">
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-9 px-3 gap-2 rounded text-slate-600 border-slate-200 hover:border-pink-300 hover:text-pink-600 hover:bg-pink-50">
                                        <Heart className="w-4 h-4" /> Save
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </div>

                    <Container className="py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content Column */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* Image Grid - Clean & No Scale Animations */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[350px] rounded-lg overflow-hidden border border-slate-200">
                                    <div className="h-full relative group">
                                        <img
                                            src={pkg.images[0] || "https://images.unsplash.com/photo-1535732820275-9ffd998cac22?q=80&w=1000"}
                                            alt={pkg.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors duration-300" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 h-full">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="relative overflow-hidden bg-slate-100 group">
                                                {pkg.images[i] ? (
                                                    <img
                                                        src={pkg.images[i]}
                                                        alt={`${pkg.title} view ${i}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <MapPin className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/10 transition-colors duration-300" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Overview Section */}
                                <div className="bg-white rounded-lg border border-slate-200 p-5">
                                    <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                                        Package Overview
                                        <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">ID: {pkg.id.slice(0, 6)}</span>
                                    </h2>
                                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                                        {pkg.description}
                                    </p>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                                        {pkg.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-2.5 text-slate-700 bg-slate-50 border border-slate-100 px-3 py-2 rounded text-xs font-medium">
                                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Compact Pricing Breakdown Table */}
                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                    <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                        <h2 className="text-lg font-bold text-slate-900">2026 Pricing Breakdown</h2>
                                        <span className="text-xs text-slate-500 font-medium">*Base rates per person</span>
                                    </div>
                                    <div className="p-0">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th className="px-5 py-3 font-semibold">Inclusion Type</th>
                                                    <th className="px-5 py-3 font-semibold text-right">Cost Estimate</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                <tr className="hover:bg-slate-50/50">
                                                    <td className="px-5 py-3 font-medium text-slate-700">Base Package Cost</td>
                                                    <td className="px-5 py-3 text-right text-slate-900 font-bold">₹{basePrice.toLocaleString()}</td>
                                                </tr>
                                                <tr className="hover:bg-slate-50/50">
                                                    <td className="px-5 py-3 font-medium text-slate-700">GST (5%)</td>
                                                    <td className="px-5 py-3 text-right text-slate-600">₹{(basePrice * 0.05).toFixed(0)}</td>
                                                </tr>
                                                <tr className="bg-blue-50/30">
                                                    <td className="px-5 py-3 font-bold text-blue-900">Total (Ex-Haridwar)</td>
                                                    <td className="px-5 py-3 text-right font-bold text-blue-700">₹{totalPrice.toLocaleString()}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-800 flex items-start gap-2">
                                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                                            <div>
                                                <strong>Add-on Note:</strong> Helicopter tickets (approx ₹{heliPrice}) are booked separately via IRCTC. We assist with the booking process at no extra agent fee.
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dense Itinerary */}
                                <div className="bg-white rounded-lg border border-slate-200 p-5">
                                    <h2 className="text-lg font-bold text-slate-900 mb-6">Detailed Itinerary</h2>
                                    <div className="relative pl-6 border-l-2 border-slate-100 space-y-8">
                                        {pkg.itinerary.map((day, index) => (
                                            <div key={index} className="relative">
                                                <div className="absolute -left-[31px] bg-white border-2 border-primary w-6 h-6 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                                </div>
                                                <div className="bg-slate-50 rounded border border-slate-200 p-4 transition-colors hover:border-primary/20 hover:bg-blue-50/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="font-bold text-slate-900 text-sm">Day {day.day}: {day.title}</h3>
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Step {index + 1}</span>
                                                    </div>
                                                    <p className="text-slate-600 text-sm leading-relaxed">{day.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Inclusions / Exclusions - Side by Side */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white p-5 rounded-lg border border-slate-200 h-full">
                                        <h3 className="text-sm font-bold text-emerald-700 mb-3 flex items-center uppercase tracking-wide">
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Inclusions
                                        </h3>
                                        <ul className="space-y-2">
                                            {pkg.inclusions.map((item, index) => (
                                                <li key={index} className="flex items-start text-xs text-slate-600 leading-snug">
                                                    <Check className="w-3 h-3 text-emerald-600 mr-2 mt-0.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-white p-5 rounded-lg border border-slate-200 h-full">
                                        <h3 className="text-sm font-bold text-red-700 mb-3 flex items-center uppercase tracking-wide">
                                            <XCircle className="w-4 h-4 mr-2" /> Exclusions
                                        </h3>
                                        <ul className="space-y-2">
                                            {pkg.exclusions.map((item, index) => (
                                                <li key={index} className="flex items-start text-xs text-slate-600 leading-snug">
                                                    <XCircle className="w-3 h-3 text-red-400 mr-2 mt-0.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* FAQ Section for AI SEO */}
                                <div className="pt-4">
                                    <AIOptimizedFAQ
                                        title="Common Questions about this Package"
                                        description="Everything you need to know about the 2026 booking process."
                                        faqs={KedarnathTravelFAQs}
                                        compact={true}
                                        className="border-none"
                                    />
                                </div>
                            </div>

                            {/* Sidebar - Sticky Compact - REDESIGNED */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-20 space-y-4">
                                    <div className="bg-white rounded-lg border border-blue-100 p-0 overflow-hidden">
                                        {/* Price Header */}
                                        <div className="bg-blue-600 p-5 text-white">
                                            <p className="text-blue-100 text-xs font-semibold tracking-wider uppercase mb-1">Total Package Cost</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-bold">₹{pkg.price.toLocaleString()}</span>
                                                <span className="text-blue-100 text-sm font-medium">/ person</span>
                                            </div>
                                            <div className="mt-2 inline-flex items-center bg-blue-500/30 px-2 py-1 rounded text-[10px] font-medium border border-blue-400/30">
                                                <Check className="w-3 h-3 mr-1" />
                                                No Hidden Charges
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="p-5 space-y-3 bg-white">
                                            <Button onClick={handleEnquiry} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 shadow-lg hover:shadow-xl transition-all duration-300 rounded font-bold">
                                                Book This Package
                                            </Button>
                                            <Button variant="ghost" onClick={handleEnquiry} className="w-full h-11 border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50 bg-transparent font-semibold transition-all">
                                                <Mail className="w-4 h-4 mr-2" /> Send Enquiry
                                            </Button>

                                            {/* Trust Badges - Simplified */}
                                            <div className="pt-4 mt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                                                        <ShieldCheck className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div className="text-xs leading-tight">
                                                        <span className="block font-bold text-slate-700">Verified</span>
                                                        <span className="text-slate-500">Operator</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                                        <CalendarDays className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div className="text-xs leading-tight">
                                                        <span className="block font-bold text-slate-700">Open</span>
                                                        <span className="text-slate-500">For 2026</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sidebar Promo */}
                                    <PromoBanner position="sidebar" />

                                    {/* Contact Compact */}
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Customer Support</h3>
                                                <p className="text-[10px] text-slate-500">Available 9 AM - 9 PM</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 pl-[52px]">
                                            <a href="tel:+919027475042" className="block text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">
                                                +91 90274 75042
                                            </a>
                                            <a href="mailto:dmworkforash@gmail.com" className="block text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                                                dmworkforash@gmail.com
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
                </main>

                <Footer />
            </div>

            {pkg && (
                <BookingModal
                    isOpen={isBookingModalOpen}
                    onClose={() => setIsBookingModalOpen(false)}
                    packageId={pkg.id}
                    packageTitle={pkg.title}
                    price={pkg.price}
                />
            )}
        </>
    );
};

export default PackageDetail;
