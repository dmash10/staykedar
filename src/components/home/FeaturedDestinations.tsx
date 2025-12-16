import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { TransitionLink } from "../TransitionLink";
import Container from "../Container";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Destination {
    id: string;
    slug: string;
    name: string;
    image_url: string;
    type: string;
    is_popular?: boolean;
}

const FeaturedDestinations = () => {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDestinations = async () => {
            const { data } = await supabase
                .from('destinations')
                .select('id, slug, name, image_url, type, is_popular')
                .order('display_order', { ascending: true });

            if (data) setDestinations(data);
        };
        fetchDestinations();
    }, []);

    // Check scroll position for fade visibility - Throttled
    const checkScroll = () => {
        if (!scrollContainerRef.current) return;

        requestAnimationFrame(() => {
            const container = scrollContainerRef.current;
            if (!container) return;
            setCanScrollLeft(container.scrollLeft > 10);
            setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
        });
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        checkScroll();
        container.addEventListener('scroll', checkScroll, { passive: true });
        window.addEventListener('resize', checkScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [destinations]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const scrollAmount = 400;
        container.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    if (destinations.length === 0) return null;

    return (
        <section className="py-12 md:py-16 bg-gradient-to-b from-white via-slate-50/50 to-white">
            <Container>
                {/* Modern Section Header */}
                <motion.div
                    className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-full mb-3">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>EXPLORE DESTINATIONS</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            Sacred Places to Visit
                        </h2>
                        <p className="text-gray-500 text-sm md:text-base max-w-md">
                            Discover holy temples and breathtaking landscapes along the Kedarnath pilgrimage route
                        </p>
                    </div>
                    <TransitionLink
                        to="/attractions"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-full hover:border-blue-500 hover:text-blue-600 transition-all text-sm shadow-sm hover:shadow-md"
                    >
                        View All Destinations
                        <ArrowRight className="w-4 h-4" />
                    </TransitionLink>
                </motion.div>

                {/* Destination Cards - Horizontal Scroll */}
                <div className="relative group/scroll">
                    {/* Left Fade - only show when can scroll left */}
                    {canScrollLeft && (
                        <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
                    )}
                    {/* Right Fade - only show when can scroll right */}
                    {canScrollRight && (
                        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
                    )}

                    {/* Navigation Buttons - Desktop only */}
                    {canScrollLeft && (
                        <button
                            onClick={() => scroll('left')}
                            aria-label="Scroll left"
                            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl hover:border-blue-500 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    )}
                    {canScrollRight && (
                        <button
                            onClick={() => scroll('right')}
                            aria-label="Scroll right"
                            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl hover:border-blue-500 transition-all"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    )}

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-5 overflow-x-auto py-2 pb-4 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide perspective-1000"
                    >
                        {destinations.map((destination, index) => (
                            <motion.div
                                key={destination.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }} // Cap delay
                                className="flex-shrink-0"
                            >
                                <TransitionLink
                                    to={`/attractions/${destination.slug}`}
                                    className="group block w-[160px] md:w-[180px]"
                                >
                                    {/* Card Container - smooth hover with flicker fix */}
                                    <div
                                        className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform-gpu hover:-translate-y-1"
                                        style={{
                                            willChange: 'transform',
                                            backfaceVisibility: 'hidden',
                                        }}
                                    >
                                        {/* Image Container */}
                                        <div className="relative aspect-[4/5] bg-gray-100">
                                            <img
                                                src={destination.image_url}
                                                alt={destination.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                            />
                                            {/* Gradient Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                            {/* Popular Badge */}
                                            {destination.is_popular && (
                                                <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-blue-600 rounded-full uppercase tracking-wide">
                                                    Popular
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <h3 className="font-bold text-white text-base mb-1 drop-shadow-lg">
                                                    {destination.name}
                                                </h3>
                                                <div className="flex items-center gap-1.5 text-white/90 text-xs">
                                                    <MapPin className="w-3 h-3" />
                                                    <span>{destination.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </TransitionLink>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default FeaturedDestinations;



