import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
    Calendar,
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
    Star
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import PromoBanner from "@/components/home/PromoBanner";

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
        toast({
            title: "Enquiry Sent",
            description: "Our team will contact you shortly regarding this package.",
        });
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
                        <Link to="/packages">
                            <Button>Back to Packages</Button>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{pkg.title} | StayKedarnath</title>
                <meta name="description" content={pkg.description} />
            </Helmet>

            <div className="min-h-screen flex flex-col bg-gray-50">
                <Nav />

                <main className="flex-grow pb-12">
                    {/* Image Gallery - Matching PropertyDetail style */}
                    <div className="bg-white border-b border-gray-200">
                        <Container className="py-6">
                            <div className="mb-4">
                                <Link to="/packages" className="inline-flex items-center text-gray-500 hover:text-[#0071c2] transition-colors">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Packages
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-[400px] rounded-xl overflow-hidden mb-6">
                                <div className="h-full">
                                    <img
                                        src={pkg.images[0] || "https://images.unsplash.com/photo-1535732820275-9ffd998cac22?q=80&w=1000"}
                                        alt={pkg.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 h-full">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="relative overflow-hidden bg-gray-100">
                                            {pkg.images[i] ? (
                                                <img
                                                    src={pkg.images[i]}
                                                    alt={`${pkg.title} view ${i}`}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <MapPin className="w-8 h-8 opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Title and Info */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                            Package
                                        </span>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span className="text-sm font-medium text-gray-900">4.8 (Verified)</span>
                                        </div>
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{pkg.title}</h1>
                                    <div className="flex items-center text-gray-600 mb-4">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {pkg.location}
                                        <span className="mx-2">•</span>
                                        <Clock className="w-4 h-4 mr-1" />
                                        {pkg.duration}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                                        <Share2 className="w-4 h-4" /> Share
                                    </Button>
                                    <Button variant="outline" size="sm" className="gap-2 rounded-lg">
                                        <Heart className="w-4 h-4" /> Save
                                    </Button>
                                </div>
                            </div>
                        </Container>
                    </div>

                    <Container className="py-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Overview */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h2 className="text-xl font-bold mb-4 text-gray-900">Overview</h2>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {pkg.description}
                                    </p>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                                        {pkg.features.map((feature, index) => (
                                            <div key={index} className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                                <CheckCircle2 className="w-5 h-5 text-[#0071c2] shrink-0" />
                                                <span className="text-sm font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Itinerary */}
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <h2 className="text-xl font-bold mb-6 text-gray-900">Itinerary</h2>
                                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                        {pkg.itinerary.map((day, index) => (
                                            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#0071c2] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                                    <span className="font-bold text-sm">{day.day}</span>
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                                        <div className="font-bold text-gray-900">{day.title}</div>
                                                    </div>
                                                    <div className="text-gray-600 text-sm">{day.description}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Inclusions & Exclusions */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center">
                                            <CheckCircle2 className="w-5 h-5 mr-2" /> Inclusions
                                        </h3>
                                        <ul className="space-y-3">
                                            {pkg.inclusions.map((item, index) => (
                                                <li key={index} className="flex items-start text-sm text-gray-700">
                                                    <Check className="w-4 h-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center">
                                            <XCircle className="w-5 h-5 mr-2" /> Exclusions
                                        </h3>
                                        <ul className="space-y-3">
                                            {pkg.exclusions.map((item, index) => (
                                                <li key={index} className="flex items-start text-sm text-gray-700">
                                                    <XCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="sticky top-24 space-y-6">
                                    {/* Promo Banner */}
                                    <PromoBanner position="sidebar" />

                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                        <div className="mb-6">
                                            <p className="text-sm text-gray-500 mb-1">Starting from</p>
                                            <div className="flex items-baseline">
                                                <span className="text-3xl font-bold text-[#0071c2]">₹{pkg.price.toLocaleString()}</span>
                                                <span className="text-gray-500 ml-2">/ person</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <Button onClick={handleEnquiry} className="w-full bg-[#0071c2] hover:bg-[#005a9c] h-12 text-lg rounded-lg font-semibold">
                                                Book Now
                                            </Button>
                                            <Button variant="outline" onClick={handleEnquiry} className="w-full h-12 rounded-lg font-semibold">
                                                <Mail className="w-4 h-4 mr-2" /> Send Enquiry
                                            </Button>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Phone className="w-4 h-4 mr-3 text-[#0071c2]" />
                                                <span>+91 98765 43210</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="w-4 h-4 mr-3 text-[#0071c2]" />
                                                <span>bookings@staykedarnath.com</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                        <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
                                        <p className="text-sm text-blue-800 mb-4">
                                            Not sure which package is right for you? Our travel experts can help you customize your journey.
                                        </p>
                                        <Button variant="link" className="p-0 h-auto text-[#0071c2] font-semibold">
                                            Contact Expert &rarr;
                                        </Button>
                                    </div>
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

export default PackageDetail;
