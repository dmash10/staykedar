import { useState, useEffect, useRef, memo } from 'react';
import { motion } from "framer-motion";
import { Heart, ClipboardCheck } from "lucide-react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import Container from "../Container";

// Fallback static icons - colorful SVGs
const CalendarIcon = memo(() => (
    <svg width="56" height="56" viewBox="0 0 80 80" fill="none">
        <rect x="12" y="18" width="56" height="50" rx="6" fill="#E3F2FD" />
        <rect x="12" y="18" width="56" height="16" rx="6" fill="#1976D2" />
        <rect x="24" y="10" width="6" height="16" rx="3" fill="#1565C0" />
        <rect x="50" y="10" width="6" height="16" rx="3" fill="#1565C0" />
        <circle cx="56" cy="50" r="12" fill="#4CAF50" />
        <path d="M50 50L54 54L62 46" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
));

const ThumbsUpIcon = memo(() => (
    <svg width="56" height="56" viewBox="0 0 80 80" fill="none">
        <path d="M22 40V62C22 64.2 23.8 66 26 66H32C34.2 66 36 64.2 36 62V40C36 37.8 34.2 36 32 36H26C23.8 36 22 37.8 22 40Z" fill="#FF9800" />
        <path d="M36 44H52C56.4 44 60 40.4 60 36V32C60 29.8 58.2 28 56 28H46L49 16C49.5 12.5 46.5 10 43 10C40.8 10 40 12 40 14V24L36 36V44Z" fill="#FFB74D" />
        <circle cx="60" cy="20" r="10" fill="#2196F3" />
        <path d="M55 20L58 23L65 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
));

const GlobeIcon = memo(() => (
    <svg width="56" height="56" viewBox="0 0 80 80" fill="none">
        <circle cx="40" cy="40" r="26" fill="#FFF3E0" />
        <circle cx="40" cy="40" r="26" stroke="#FF9800" strokeWidth="2" />
        <ellipse cx="40" cy="40" rx="10" ry="26" stroke="#FF9800" strokeWidth="2" />
        <line x1="14" y1="40" x2="66" y2="40" stroke="#FF9800" strokeWidth="2" />
        <circle cx="56" cy="18" r="10" fill="#E53935" />
        <path d="M56 12C53.2 12 51 14.2 51 17C51 21.5 56 26 56 26C56 26 61 21.5 61 17C61 14.2 58.8 12 56 12Z" fill="white" />
    </svg>
));

const SupportIcon = memo(() => (
    <svg width="56" height="56" viewBox="0 0 80 80" fill="none">
        <path d="M28 58C28 52 32 48 40 48C48 48 52 52 52 58V70H28V58Z" fill="#1976D2" />
        <circle cx="40" cy="32" r="14" fill="#FFCC80" />
        <path d="M26 30C26 22 32 18 40 18C48 18 54 22 54 30" stroke="#5D4037" strokeWidth="4" strokeLinecap="round" />
        <path d="M20 28V34C20 34 20 40 26 40" stroke="#29B6F6" strokeWidth="4" strokeLinecap="round" />
        <path d="M60 28V34C60 34 60 40 54 40" stroke="#29B6F6" strokeWidth="4" strokeLinecap="round" />
        <circle cx="20" cy="28" r="5" fill="#29B6F6" />
        <circle cx="60" cy="28" r="5" fill="#29B6F6" />
    </svg>
));

// Animation data cache to prevent refetching
const animationCache = new Map<string, object>();

const WhyUs = () => {
    const features = [
        {
            icon: <CalendarIcon />,
            lottieUrl: "https://assets2.lottiefiles.com/packages/lf20_hy9kur6j.json",
            title: "Book Now, Pay at Property",
            description: <><span className="text-[#0071c2] font-medium">FREE cancellation</span> on most rooms</>
        },
        {
            icon: <ThumbsUpIcon />,
            lottieUrl: "https://assets10.lottiefiles.com/packages/lf20_touohxv0.json",
            title: "Verified Guest Reviews",
            description: "Get trusted information from guests like you"
        },
        {
            icon: <GlobeIcon />,
            lottieUrl: "https://assets5.lottiefiles.com/packages/lf20_svy4ivvy.json",
            title: "100+ Verified Properties",
            description: "Hotels, guesthouses, homestays, and camps"
        },
        {
            icon: <SupportIcon />,
            lottieUrl: "https://assets9.lottiefiles.com/packages/lf20_u25cckyh.json",
            title: "24/7 Customer Support",
            description: "We're always here to help you"
        }
    ];

    return (
        <section className="pt-36 md:pt-28 pb-6 md:pb-10 bg-white border-b border-gray-100">
            <Container>
                {/* 4 Feature Cards with Optimized Lottie */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            className="group bg-gray-50 hover:bg-white hover:shadow-lg rounded-xl p-5 md:p-6 transition-all duration-300 border border-transparent hover:border-gray-200"
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            <div className="mb-4 w-14 h-14 md:w-16 md:h-16">
                                <OptimizedLottie url={feature.lottieUrl} fallback={feature.icon} />
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1">
                                {feature.title}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-600">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Our Promise Banner */}
                <motion.div
                    className="mt-6 bg-gradient-to-r from-[#003580] to-[#0071c2] rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-center gap-3 md:gap-5 shadow-lg"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                >
                    <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="font-bold text-white text-base md:text-lg mb-0.5">
                            We Only List Properties We'd Stay At Ourselves
                        </h3>
                        <p className="text-white/80 text-xs md:text-sm">
                            Every property is personally visited, inspected, and verified by our team.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                        <ClipboardCheck className="w-4 h-4 text-yellow-400" />
                        <span className="text-white text-xs font-medium whitespace-nowrap">100+ Audited</span>
                    </div>
                </motion.div>
            </Container>
        </section>
    );
};

// Optimized Lottie wrapper with IntersectionObserver, caching, and cleanup
const OptimizedLottie = memo(({ url, fallback }: { url: string; fallback: React.ReactNode }) => {
    const [animationData, setAnimationData] = useState<object | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);
    const [error, setError] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    // Intersection Observer - only load when visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Stop observing once visible
                }
            },
            { threshold: 0.1, rootMargin: '100px' } // Load slightly before visible
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Fetch animation data with caching
    useEffect(() => {
        if (!isVisible || hasLoaded) return;

        // Check cache first
        if (animationCache.has(url)) {
            setAnimationData(animationCache.get(url) || null);
            setHasLoaded(true);
            return;
        }

        // Fetch with AbortController for cleanup
        const controller = new AbortController();

        fetch(url, { signal: controller.signal })
            .then(res => {
                if (!res.ok) throw new Error('Network error');
                return res.json();
            })
            .then(data => {
                animationCache.set(url, data); // Cache the data
                setAnimationData(data);
                setHasLoaded(true);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    setError(true);
                    setHasLoaded(true);
                }
            });

        return () => controller.abort();
    }, [url, isVisible, hasLoaded]);

    // Pause animation when not visible for performance
    useEffect(() => {
        if (!lottieRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    lottieRef.current?.play();
                } else {
                    lottieRef.current?.pause();
                }
            },
            { threshold: 0 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, [animationData]);

    // Show fallback if error or still loading
    if (error || !animationData) {
        return (
            <div ref={containerRef} className="w-full h-full flex items-center justify-center">
                {fallback}
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full">
            <Lottie
                lottieRef={lottieRef}
                animationData={animationData}
                loop={true}
                autoplay={true}
                style={{ width: '100%', height: '100%' }}
                rendererSettings={{
                    preserveAspectRatio: 'xMidYMid slice',
                    progressiveLoad: true, // Progressive loading
                }}
            />
        </div>
    );
});

OptimizedLottie.displayName = 'OptimizedLottie';
CalendarIcon.displayName = 'CalendarIcon';
ThumbsUpIcon.displayName = 'ThumbsUpIcon';
GlobeIcon.displayName = 'GlobeIcon';
SupportIcon.displayName = 'SupportIcon';

export default WhyUs;
