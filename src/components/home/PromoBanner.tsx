import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Banner {
    id: string;
    title: string;
    subtitle?: string;
    image_url: string;
    link_text?: string;
    link_url?: string;
    position: string;
    background_color?: string;
    text_color?: string;
}

interface PromoBannerProps {
    position?: 'hero' | 'homepage' | 'sidebar' | 'footer' | 'popup';
    className?: string;
}

export default function PromoBanner({ position = 'homepage', className = '' }: PromoBannerProps) {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [dismissed, setDismissed] = useState<string[]>([]);
    const [showPopup, setShowPopup] = useState(false);

    // Fetch banners from database
    const { data: banners = [] } = useQuery({
        queryKey: ['public-banners', position],
        queryFn: async () => {
            const now = new Date().toISOString();
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .eq('is_active', true)
                .eq('position', position)
                .or(`start_date.is.null,start_date.lte.${now}`)
                .or(`end_date.is.null,end_date.gte.${now}`)
                .order('display_order', { ascending: true });
            
            if (error) {
                console.error('Error fetching banners:', error);
                return [];
            }
            return data || [];
        },
        staleTime: 60000,
    });

    // Filter out dismissed banners
    const activeBanners = banners.filter(b => !dismissed.includes(b.id));

    // Auto-rotate banners
    useEffect(() => {
        if (activeBanners.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
        }, 5000);
        
        return () => clearInterval(interval);
    }, [activeBanners.length]);

    // Show popup after delay
    useEffect(() => {
        if (position === 'popup' && activeBanners.length > 0) {
            const hasSeenPopup = sessionStorage.getItem('popup-banner-seen');
            if (!hasSeenPopup) {
                const timer = setTimeout(() => {
                    setShowPopup(true);
                    sessionStorage.setItem('popup-banner-seen', 'true');
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [position, activeBanners.length]);

    if (activeBanners.length === 0) return null;

    const currentBanner = activeBanners[currentIndex];

    const handleClick = (banner: Banner) => {
        if (banner.link_url) {
            if (banner.link_url.startsWith('http')) {
                window.open(banner.link_url, '_blank');
            } else {
                navigate(banner.link_url);
            }
        }
    };

    const dismissBanner = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDismissed(prev => [...prev, id]);
        if (position === 'popup') setShowPopup(false);
    };

    // Popup Banner
    if (position === 'popup') {
        return (
            <AnimatePresence>
                {showPopup && currentBanner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setShowPopup(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={(e) => dismissBanner(currentBanner.id, e)}
                                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            
                            {currentBanner.image_url && (
                                <img 
                                    src={currentBanner.image_url} 
                                    alt={currentBanner.title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {currentBanner.title}
                                </h3>
                                {currentBanner.subtitle && (
                                    <p className="text-gray-600 mb-4">
                                        {currentBanner.subtitle}
                                    </p>
                                )}
                                {currentBanner.link_text && (
                                    <Button 
                                        onClick={() => handleClick(currentBanner)}
                                        className="w-full bg-[#0071c2] hover:bg-[#005999]"
                                    >
                                        {currentBanner.link_text}
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    // Hero Banner (Full width slider)
    if (position === 'hero') {
        return (
            <div className={`relative overflow-hidden ${className}`}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentBanner.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative h-[400px] md:h-[500px] cursor-pointer"
                        onClick={() => handleClick(currentBanner)}
                        style={{ backgroundColor: currentBanner.background_color || '#0071c2' }}
                    >
                        {currentBanner.image_url && (
                            <img 
                                src={currentBanner.image_url} 
                                alt={currentBanner.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                            <div className="max-w-4xl">
                                <h2 
                                    className="text-3xl md:text-5xl font-bold mb-4"
                                    style={{ color: currentBanner.text_color || '#ffffff' }}
                                >
                                    {currentBanner.title}
                                </h2>
                                {currentBanner.subtitle && (
                                    <p 
                                        className="text-lg md:text-xl mb-6 opacity-90"
                                        style={{ color: currentBanner.text_color || '#ffffff' }}
                                    >
                                        {currentBanner.subtitle}
                                    </p>
                                )}
                                {currentBanner.link_text && (
                                    <Button 
                                        size="lg"
                                        className="bg-white text-gray-900 hover:bg-gray-100"
                                    >
                                        {currentBanner.link_text}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                {activeBanners.length > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => setCurrentIndex((prev) => (prev + 1) % activeBanners.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        
                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {activeBanners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        idx === currentIndex ? 'w-6 bg-white' : 'bg-white/50'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Homepage Banner (Horizontal strip)
    if (position === 'homepage') {
        return (
            <div className={`bg-gradient-to-r from-[#0071c2] to-[#005999] ${className}`}>
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentBanner.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex items-center justify-between gap-4"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                {currentBanner.image_url && (
                                    <img 
                                        src={currentBanner.image_url} 
                                        alt=""
                                        className="w-10 h-10 rounded-lg object-cover hidden sm:block"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">
                                        {currentBanner.title}
                                        {currentBanner.subtitle && (
                                            <span className="hidden md:inline text-white/80 ml-2">
                                                — {currentBanner.subtitle}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {currentBanner.link_text && (
                                    <Button 
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleClick(currentBanner)}
                                        className="bg-white text-[#0071c2] hover:bg-gray-100 whitespace-nowrap"
                                    >
                                        {currentBanner.link_text}
                                    </Button>
                                )}
                                <button
                                    onClick={(e) => dismissBanner(currentBanner.id, e)}
                                    className="text-white/70 hover:text-white p-1"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                    
                    {/* Dots for multiple banners */}
                    {activeBanners.length > 1 && (
                        <div className="flex justify-center gap-1 mt-2">
                            {activeBanners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                        idx === currentIndex ? 'w-4 bg-white' : 'bg-white/40'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Sidebar Banner
    if (position === 'sidebar') {
        return (
            <div className={`space-y-4 ${className}`}>
                {activeBanners.slice(0, 2).map((banner) => (
                    <motion.div
                        key={banner.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => handleClick(banner)}
                    >
                        <button
                            onClick={(e) => dismissBanner(banner.id, e)}
                            className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        
                        {banner.image_url ? (
                            <img 
                                src={banner.image_url} 
                                alt={banner.title}
                                className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div 
                                className="w-full h-40"
                                style={{ backgroundColor: banner.background_color || '#0071c2' }}
                            />
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h4 
                                className="font-semibold mb-1"
                                style={{ color: banner.text_color || '#ffffff' }}
                            >
                                {banner.title}
                            </h4>
                            {banner.link_text && (
                                <span className="text-sm text-white/80 underline">
                                    {banner.link_text}
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    // Footer Banner
    if (position === 'footer') {
        return (
            <div 
                className={`rounded-xl overflow-hidden ${className}`}
                style={{ backgroundColor: currentBanner.background_color || '#0071c2' }}
            >
                <div className="flex flex-col md:flex-row items-center gap-6 p-6">
                    {currentBanner.image_url && (
                        <img 
                            src={currentBanner.image_url} 
                            alt=""
                            className="w-24 h-24 rounded-xl object-cover"
                        />
                    )}
                    <div className="flex-1 text-center md:text-left">
                        <h4 
                            className="text-xl font-bold mb-2"
                            style={{ color: currentBanner.text_color || '#ffffff' }}
                        >
                            {currentBanner.title}
                        </h4>
                        {currentBanner.subtitle && (
                            <p 
                                className="opacity-90"
                                style={{ color: currentBanner.text_color || '#ffffff' }}
                            >
                                {currentBanner.subtitle}
                            </p>
                        )}
                    </div>
                    {currentBanner.link_text && (
                        <Button 
                            onClick={() => handleClick(currentBanner)}
                            className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                            {currentBanner.link_text}
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
