import { motion } from "framer-motion";
import { ArrowRight, Star, MapPin, Wifi, Car, Utensils, ThermometerSun, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { TransitionLink } from "../TransitionLink";
import Container from "../Container";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPropertyImages } from "@/utils/stayUtils";
import { BlindProperty } from "@/types/stays";

const getRatingWord = (r: number) => {
    if (r >= 4.5) return "Excellent";
    if (r >= 4) return "Very Good";
    if (r >= 3.5) return "Good";
    if (r >= 3) return "Pleasant";
    return "Good";
};

const PropertyShowcase = () => {
    const [properties, setProperties] = useState<BlindProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const { data, error } = await supabase
                    .from('blind_properties')
                    .select('*')
                    .eq('is_active', true)
                    .order('base_price', { ascending: true })
                    .limit(8);

                if (error) throw error;
                setProperties((data as BlindProperty[]) || []);
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;
        setCanScrollLeft(container.scrollLeft > 10);
        setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;
        checkScroll();
        container.addEventListener('scroll', checkScroll);
        return () => container.removeEventListener('scroll', checkScroll);
    }, [properties]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;
        container.scrollBy({
            left: direction === 'left' ? -400 : 400,
            behavior: 'smooth'
        });
    };

    if (properties.length === 0 && !loading) return null;

    return (
        <section className="py-12 md:py-16 bg-gray-50">
            <Container>
                {/* Header */}
                <motion.div
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            <span className="text-green-700 text-sm font-semibold">Personally Verified Properties</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                            Browse Verified Stays
                        </h2>
                        <p className="text-gray-500 text-sm max-w-md">
                            Every property audited by our team for quality, safety, and value
                        </p>
                    </div>

                    <TransitionLink
                        to="/stays/smart"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0071c2] text-white font-medium rounded-md hover:bg-[#005999] transition-all text-sm"
                    >
                        View All Properties
                        <ArrowRight className="w-4 h-4" />
                    </TransitionLink>
                </motion.div>

                {/* Properties Scroll */}
                <div className="relative">
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            aria-label="Scroll left"
                            className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-gray-300 rounded-full shadow-lg hover:border-[#0071c2] transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            aria-label="Scroll right"
                            className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-gray-300 rounded-full shadow-lg hover:border-[#0071c2] transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    )}

                    {loading ? (
                        <div className="flex gap-4 overflow-hidden">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex-shrink-0 w-[380px] h-[200px] bg-white rounded-md border border-gray-200 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-4 overflow-x-auto py-2 scrollbar-hide"
                        >
                            {properties.map((property, index) => {
                                const images = getPropertyImages(property);
                                const amenities = property.amenities as any || {};
                                const rating = amenities.rating || 4.2;

                                return (
                                    <motion.div
                                        key={property.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.08 }}
                                        className="flex-shrink-0"
                                    >
                                        <TransitionLink
                                            to={`/stays/${property.location_slug}/${property.id}`}
                                            className="group block"
                                        >
                                            {/* Card - Exact Design Style */}
                                            <div className="bg-white rounded-md border border-gray-300 hover:border-[#0071c2] overflow-hidden hover:shadow-lg transition-all duration-200 w-[380px]">
                                                <div className="flex p-3 gap-3">
                                                    {/* Image */}
                                                    <div className="w-[140px] h-[140px] flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                                        <img
                                                            src={images[0]}
                                                            alt={property.display_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 flex flex-col min-w-0">
                                                        {/* Title & Verified */}
                                                        <div className="flex items-start gap-2 mb-1">
                                                            <h3 className="text-base font-bold text-[#0071c2] group-hover:underline truncate">
                                                                {property.display_name}
                                                            </h3>
                                                            <div className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-[3px] text-[10px] font-bold flex items-center gap-0.5 border border-green-200 flex-shrink-0">
                                                                <ShieldCheck className="w-2.5 h-2.5" />
                                                                Verified
                                                            </div>
                                                        </div>

                                                        {/* Location */}
                                                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                                                            <MapPin className="w-3 h-3" />
                                                            <span className="capitalize font-medium">{property.location_slug.replace(/-/g, ' ')}</span>
                                                        </div>

                                                        {/* Rating */}
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="bg-[#003580] text-white px-1.5 py-0.5 rounded-[3px] text-xs font-bold">
                                                                {rating}
                                                            </div>
                                                            <span className="text-xs text-gray-600 font-medium">{getRatingWord(rating)}</span>
                                                            <div className="flex items-center gap-0.5">
                                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                            </div>
                                                        </div>

                                                        {/* Amenities */}
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {amenities.wifi && (
                                                                <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-[10px] font-medium text-gray-600">
                                                                    <Wifi className="w-2.5 h-2.5" /> WiFi
                                                                </div>
                                                            )}
                                                            {amenities.geyser && amenities.geyser !== 'none' && (
                                                                <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-[10px] font-medium text-gray-600">
                                                                    <ThermometerSun className="w-2.5 h-2.5" /> Hot Water
                                                                </div>
                                                            )}
                                                            {amenities.restaurant && (
                                                                <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-[10px] font-medium text-gray-600">
                                                                    <Utensils className="w-2.5 h-2.5" /> Restaurant
                                                                </div>
                                                            )}
                                                            {amenities.parking && (
                                                                <div className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-200 bg-gray-50 text-[10px] font-medium text-gray-600">
                                                                    <Car className="w-2.5 h-2.5" /> Parking
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Price */}
                                                        <div className="mt-auto flex items-end justify-between">
                                                            <div>
                                                                <span className="text-lg font-bold text-gray-900">
                                                                    ₹{property.base_price.toLocaleString()}
                                                                </span>
                                                                <span className="text-xs text-gray-500 ml-1">/night</span>
                                                            </div>
                                                            <span className="text-xs text-[#0071c2] font-medium">
                                                                View →
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TransitionLink>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
};

export default PropertyShowcase;
