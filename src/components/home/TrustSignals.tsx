import { motion, useInView } from "framer-motion";
import { Users, Building, Star, Quote, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import Container from "../Container";

const stats = [
    { icon: Users, value: 10000, label: "Happy Pilgrims", suffix: "+" },
    { icon: Building, value: 500, label: "Verified Properties", suffix: "+" },
    { icon: Star, value: 4.8, label: "Average Rating", suffix: "/5", decimals: 1 }
];

const fallbackTestimonials = [
    {
        id: "1",
        customer_name: "Rajesh Kumar",
        customer_location: "Delhi",
        rating: 5,
        content: "Seamless booking experience! The helicopter package made our Kedarnath trip unforgettable. Highly recommended for families.",
        customer_avatar: "https://i.pravatar.cc/150?img=12"
    },
    {
        id: "2",
        customer_name: "Priya Sharma",
        customer_location: "Mumbai",
        rating: 5,
        content: "Excellent service from start to finish. The accommodation was exactly as described and the team was very supportive throughout.",
        customer_avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
        id: "3",
        customer_name: "Amit Verma",
        customer_location: "Bangalore",
        rating: 5,
        content: "Best platform for Kedarnath yatra planning. The VIP darshan arrangement saved us hours of waiting. Will book again!",
        customer_avatar: "https://i.pravatar.cc/150?img=8"
    }
];

interface Testimonial {
    id: string;
    customer_name: string;
    customer_location: string;
    rating: number;
    content: string;
    customer_avatar?: string;
}

const AnimatedCounter = ({ value, suffix, decimals = 0 }: { value: number; suffix: string; decimals?: number }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const end = value;
            const duration = 2000;
            const increment = end / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(start);
                }
            }, 16);

            return () => clearInterval(timer);
        }
    }, [inView, value]);

    const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();

    return (
        <span ref={ref} className="text-3xl md:text-4xl font-bold text-[#0071c2]">
            {displayValue}{suffix}
        </span>
    );
};

const TrustSignals = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const { data: testimonials = fallbackTestimonials } = useQuery({
        queryKey: ['public-testimonials'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('is_active', true)
                .order('is_featured', { ascending: false })
                .limit(6);
            
            if (error || !data || data.length === 0) {
                return fallbackTestimonials;
            }
            return data;
        },
        staleTime: 60000,
    });

    useEffect(() => {
        if (testimonials.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [testimonials.length]);

    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    const currentTestimonial = testimonials[currentIndex];

    return (
        <section className="py-12 md:py-16 bg-white">
            <Container>
                {/* Stats Row */}
                <motion.div
                    className="flex justify-center gap-8 md:gap-16 mb-12 pb-12 border-b border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                            <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Testimonial Section */}
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            What Pilgrims Say
                        </h2>
                        <p className="text-gray-600">Real experiences from our travelers</p>
                    </motion.div>

                    {/* Testimonial Card */}
                    <div className="relative">
                        {testimonials.length > 1 && (
                            <>
                                <button 
                                    onClick={prevSlide}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-12 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-[#0071c2] transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={nextSlide}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-12 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-[#0071c2] transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}

                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 md:p-8 text-center relative"
                        >
                            <Quote className="absolute top-4 left-4 w-8 h-8 text-[#0071c2]/10" />
                            
                            {/* Rating */}
                            <div className="flex justify-center gap-1 mb-4">
                                {[...Array(currentTestimonial?.rating || 5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-gray-700 text-lg md:text-xl italic mb-6 leading-relaxed">
                                "{currentTestimonial?.content}"
                            </p>

                            {/* Author */}
                            <div className="flex items-center justify-center gap-3">
                                <img
                                    src={currentTestimonial?.customer_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentTestimonial?.customer_name || '')}&background=0071c2&color=fff`}
                                    alt={currentTestimonial?.customer_name}
                                    className="w-12 h-12 rounded-full border-2 border-[#0071c2] object-cover"
                                />
                                <div className="text-left">
                                    <div className="font-semibold text-gray-900">{currentTestimonial?.customer_name}</div>
                                    <div className="text-sm text-gray-500">{currentTestimonial?.customer_location}</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Dots */}
                        {testimonials.length > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {testimonials.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${
                                            currentIndex === idx ? 'w-6 bg-[#0071c2]' : 'bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA Section */}
                <motion.div
                    className="mt-16 bg-gradient-to-r from-[#0071c2] to-[#005999] rounded-2xl p-8 md:p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        Ready to Plan Your Kedarnath Yatra?
                    </h3>
                    <p className="text-blue-100 mb-6 max-w-xl mx-auto">
                        Join thousands of pilgrims who trust us for their sacred journey
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/stays"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#0071c2] font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            Browse Stays
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/packages"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                        >
                            View Packages
                        </Link>
                    </div>
                </motion.div>
            </Container>
        </section>
    );
};

export default TrustSignals;
