import { motion } from "framer-motion";
import { Check, ArrowRight, Calendar, Star, Loader2 } from "lucide-react";
import { TransitionLink } from "../TransitionLink";
import Container from "../Container";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PackageType {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    price: number | null;
    duration: string | null;
    images: string[] | null;
    category: string | null;
    features: string[] | null;
    is_featured: boolean | null;
}

const CuratedPackages = () => {
    const [packages, setPackages] = useState<PackageType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const { data, error } = await supabase
                    .from('packages')
                    .select('id, title, slug, description, price, duration, images, category, features, is_featured')
                    .eq('status', 'published')
                    .order('is_featured', { ascending: false })
                    .order('price', { ascending: true })
                    .limit(4);

                if (error) throw error;
                setPackages(data || []);
            } catch (error) {
                console.error('Error fetching packages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, []);

    // Category badge config
    const getCategoryBadge = (category: string | null, isFeatured: boolean | null) => {
        if (isFeatured) return { label: 'Featured', className: 'bg-[#0071c2] text-white' };

        switch (category) {
            case 'helicopter':
                return { label: 'Helicopter', className: 'bg-amber-500 text-white' };
            case 'premium':
                return { label: 'Premium', className: 'bg-purple-600 text-white' };
            case 'adventure':
                return { label: 'Adventure', className: 'bg-orange-500 text-white' };
            case 'budget':
                return { label: 'Value', className: 'bg-green-500 text-white' };
            default:
                return { label: 'Popular', className: 'bg-white/90 text-gray-700' };
        }
    };

    if (loading) {
        return (
            <section className="py-8 md:py-12 bg-white">
                <Container>
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-[#0071c2]" />
                    </div>
                </Container>
            </section>
        );
    }

    if (packages.length === 0) {
        return null; // Don't show section if no packages
    }

    return (
        <section className="py-8 md:py-12 bg-white">
            <Container>
                {/* Section Header */}
                <motion.div
                    className="flex items-end justify-between gap-4 mb-5"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                            Yatra Packages
                        </h2>
                        <p className="text-gray-500 text-sm hidden md:block">
                            Hassle-free pilgrimage experiences
                        </p>
                    </div>
                    <TransitionLink
                        to="/packages"
                        className="inline-flex items-center gap-1 text-[#0071c2] font-medium hover:gap-2 transition-all text-sm flex-shrink-0"
                    >
                        View all
                        <ArrowRight className="w-4 h-4" />
                    </TransitionLink>
                </motion.div>

                {/* Horizontal Scrollable Packages */}
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide perspective-1000">
                    {packages.map((pkg, index) => {
                        const badge = getCategoryBadge(pkg.category, pkg.is_featured);
                        const originalPrice = pkg.price ? Math.round(pkg.price * 1.2) : null;

                        return (
                            <motion.div
                                key={pkg.id}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }} // Cap stagger delay
                                className="flex-shrink-0 w-[240px]"
                            >
                                <div className={`bg-white rounded-xl overflow-hidden border h-full flex flex-col transition-all duration-300 transform-gpu hover:-translate-y-1 ${pkg.is_featured ? 'border-[#0071c2] shadow-md' : 'border-gray-200'} hover:shadow-lg`}>
                                    {/* Image - Fixed height */}
                                    <div className="relative h-[140px] overflow-hidden bg-gray-100">
                                        <img
                                            src={pkg.images?.[0] || 'https://images.unsplash.com/photo-1535732820275-9ffd998cac22?w=600&q=80'}
                                            alt={pkg.title}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                        {/* Badge */}
                                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold ${badge.className}`}>
                                            {badge.label}
                                        </div>

                                        {/* Price */}
                                        <div className="absolute bottom-2 right-2 text-right">
                                            {originalPrice && (
                                                <div className="text-white/70 text-[10px] line-through">
                                                    ₹{originalPrice.toLocaleString()}
                                                </div>
                                            )}
                                            <div className="text-white font-bold text-base">
                                                ₹{pkg.price?.toLocaleString() || '0'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content - Fixed structure */}
                                    <div className="p-3 flex flex-col flex-grow">
                                        {/* Title & Rating */}
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
                                                {pkg.title}
                                            </h3>
                                            <div className="flex items-center gap-0.5 text-xs flex-shrink-0">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                <span className="font-medium">4.8</span>
                                            </div>
                                        </div>

                                        {/* Duration */}
                                        <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                                            <Calendar className="w-3 h-3" />
                                            <span>{pkg.duration || 'Contact for details'}</span>
                                        </div>

                                        {/* Features - Fixed height */}
                                        <div className="flex flex-wrap gap-1 mb-3 flex-grow">
                                            {(pkg.features || []).slice(0, 3).map((item, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-0.5 text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    <Check className="w-2.5 h-2.5 text-green-500" />
                                                    {item}
                                                </span>
                                            ))}
                                        </div>

                                        {/* View Details Button */}
                                        <TransitionLink
                                            to={`/packages/${pkg.slug}`}
                                            className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-center transition-colors bg-[#0071c2] text-white hover:bg-[#005999]"
                                        >
                                            View Details
                                        </TransitionLink>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </Container>

        </section>
    );
};

export default CuratedPackages;
