import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    CheckCircle2,
    AlertTriangle,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Shield
} from 'lucide-react';
import { format } from 'date-fns';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AvailabilityModal } from '@/components/stays';
import { BlindProperty } from '@/types/stays';
import { getPropertyImages, formatPrice, getMarketRate, generateWhatsAppUrl } from '@/utils/stayUtils';
import { supabase } from '@/integrations/supabase/client';

// Amenity comparison data
const MARKET_STANDARDS: Record<string, string> = {
    geyser: 'Solar (Cold when raining)',
    toilet: 'Indian Style',
    bedding: 'Single Quilt',
    parking: 'Limited / Roadside',
    wifi: 'None or Very Weak',
    generator: 'None (Power cuts common)',
};

const PROPERTY_AMENITY_LABELS: Record<string, Record<string, string>> = {
    geyser: {
        gas: 'Gas Geyser (Hot 24/7)',
        solar: 'Solar Geyser',
        electric: 'Electric Geyser',
    },
    toilet: {
        western: 'Western Style (Clean)',
        indian: 'Indian Style',
    },
    parking: {
        true: 'Private Parking Available',
        false: 'No Dedicated Parking',
    },
    wifi: {
        true: 'WiFi Available',
        false: 'No WiFi',
    },
    restaurant: {
        true: 'In-house Restaurant',
        false: 'No Restaurant',
    },
};

const PropertyAuditPage = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState<BlindProperty | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchProperty();
    }, [propertyId]);

    const fetchProperty = async () => {
        if (!propertyId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('blind_properties')
                .select('*')
                .eq('id', propertyId)
                .single();

            if (error) throw error;
            setProperty(data as BlindProperty);
        } catch (error) {
            console.error('Error fetching property:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Nav />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            </>
        );
    }

    if (!property) {
        return (
            <>
                <Nav />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
                        <Button onClick={() => navigate('/stays')}>Back to Stays</Button>
                    </div>
                </div>
            </>
        );
    }

    const images = getPropertyImages(property);
    const marketRate = getMarketRate(property.base_price);
    const propertyIdShort = property.id.slice(0, 8).toUpperCase();

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <>
            <Helmet>
                <title>Audit Report: {property.display_name} | StayKedarnath</title>
                <meta name="description" content={`Verified audit report for ${property.display_name}. Honest review of amenities, pros and cons.`} />
            </Helmet>

            <Nav />

            <main className="min-h-screen bg-gray-50">
                {/* Back button */}
                <Container className="py-4">
                    <button
                        onClick={() => navigate('/stays')}
                        className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Stays
                    </button>
                </Container>

                {/* Hero Image */}
                <div className="relative h-64 md:h-96 bg-gray-200 overflow-hidden">
                    <img
                        src={images[currentImageIndex]}
                        alt={property.display_name}
                        className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {images.map((_, idx) => (
                                    <span
                                        key={idx}
                                        className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <Container className="py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Section 1: Truth Header */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center text-white">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            Audit Report: {property.display_name}
                                        </h1>
                                        <p className="text-sm text-gray-500">
                                            ID: #{propertyIdShort} • Location: {property.location_slug}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                                    <Calendar className="w-4 h-4" />
                                    Verified by StayKedarnath Team on {format(new Date(property.verification_date || property.created_at), 'dd MMM yyyy')}
                                </div>

                                {/* Pros & Cons */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Pros */}
                                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                        <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5" />
                                            The Good
                                        </h3>
                                        <ul className="space-y-2">
                                            {property.pros.map((pro, idx) => (
                                                <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                                                    <span className="text-green-500 mt-0.5">✓</span>
                                                    {pro}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Cons */}
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" />
                                            The Honest Truth
                                        </h3>
                                        <ul className="space-y-2">
                                            {property.cons.map((con, idx) => (
                                                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                                    <span className="text-amber-500 mt-0.5">⚠</span>
                                                    {con}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {property.audit_notes && (
                                    <p className="mt-4 text-sm text-gray-600 italic border-l-4 border-primary/30 pl-4">
                                        "{property.audit_notes}"
                                    </p>
                                )}
                            </motion.section>

                            {/* Section 2: Amenities Truth Table */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities Truth Table</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-semibold text-gray-600">Feature</th>
                                                <th className="text-left py-3 px-4 font-semibold text-gray-400">Standard Kedarnath Hotel</th>
                                                <th className="text-left py-3 px-4 font-semibold text-primary">This Property</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(property.amenities).map(([key, value]) => {
                                                const marketStandard = MARKET_STANDARDS[key];
                                                const propertyValue = PROPERTY_AMENITY_LABELS[key]?.[String(value)] || String(value);
                                                const isBetter = value === 'gas' || value === 'western' || value === true;

                                                if (!marketStandard) return null;

                                                return (
                                                    <tr key={key} className="border-b border-gray-100">
                                                        <td className="py-3 px-4 font-medium text-gray-900 capitalize">{key}</td>
                                                        <td className="py-3 px-4 text-gray-400">{marketStandard}</td>
                                                        <td className="py-3 px-4">
                                                            <Badge
                                                                className={
                                                                    isBetter
                                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                                        : 'bg-gray-100 text-gray-600 border-gray-200'
                                                                }
                                                            >
                                                                {isBetter ? '✅' : '➖'} {propertyValue}
                                                            </Badge>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.section>

                            {/* Section 3: Blind Map */}
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
                            >
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Location Zone</h2>
                                <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center relative overflow-hidden">
                                    {/* Placeholder map with circle */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200" />
                                    <div className="relative z-10 text-center">
                                        <div className="w-32 h-32 border-4 border-dashed border-green-500 rounded-full flex items-center justify-center mb-4 mx-auto bg-green-50/50">
                                            <MapPin className="w-8 h-8 text-green-600" />
                                        </div>
                                        <p className="text-gray-600 font-medium">{property.zone_description || 'Property Zone'}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-3 text-center">
                                    📍 Property is located within this zone. Exact GPS coordinates sent after booking confirmation.
                                </p>
                            </motion.section>
                        </div>

                        {/* Sidebar - Sticky CTA */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
                                <div className="mb-4">
                                    <p className="text-sm text-gray-400 line-through">{formatPrice(marketRate)}</p>
                                    <p className="text-3xl font-bold text-primary">{formatPrice(property.base_price)}</p>
                                    <p className="text-sm text-gray-500">per night (Est. Net Rate)</p>
                                </div>

                                {property.surge_price && property.surge_price > property.base_price && (
                                    <div className="bg-amber-50 text-amber-700 text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        Peak season rates may apply (May-June)
                                    </div>
                                )}

                                <Button
                                    onClick={() => setShowModal(true)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold mb-3"
                                >
                                    <MessageCircle className="w-5 h-5 mr-2" />
                                    Check Live Status via WhatsApp
                                </Button>

                                <p className="text-xs text-gray-400 text-center">
                                    We verify room availability directly with property owner
                                </p>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Shield className="w-4 h-4 text-green-600" />
                                        Verified Property
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        No booking fees
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>

            {/* Availability Modal */}
            <AvailabilityModal
                property={property}
                isOpen={showModal}
                onClose={() => setShowModal(false)}
            />

            <Footer />
        </>
    );
};

export default PropertyAuditPage;
