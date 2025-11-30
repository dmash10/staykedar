import { motion, useInView } from "framer-motion";
import { Users, Building, Clock, Star, Quote } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import Container from "../Container";

const stats = [
    { icon: <Users className="w-6 h-6" />, value: 10000, label: "Happy Pilgrims", suffix: "+" },
    { icon: <Building className="w-6 h-6" />, value: 500, label: "Verified Properties", suffix: "+" },
    { icon: <Clock className="w-6 h-6" />, value: 24, label: "Support", suffix: "/7" },
    { icon: <Star className="w-6 h-6" />, value: 2018, label: "Since", suffix: "" }
];

const testimonials = [
    {
        id: 1,
        name: "Rajesh Kumar",
        location: "Delhi",
        rating: 5,
        text: "Seamless booking experience! The helicopter package made our Kedarnath trip unforgettable.",
        image: "https://i.pravatar.cc/150?img=12"
    },
    {
        id: 2,
        name: "Priya Sharma",
        location: "Mumbai",
        rating: 5,
        text: "Excellent service from start to finish. The accommodation was exactly as described and the team was very supportive.",
        image: "https://i.pravatar.cc/150?img=5"
    }
];

const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
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
                    setCount(Math.floor(start));
                }
            }, 16);

            return () => clearInterval(timer);
        }
    }, [inView, value]);

    return (
        <span ref={ref} className="text-4xl md:text-5xl font-bold text-[#0071c2]">
            {count.toLocaleString()}{suffix}
        </span>
    );
};

const TrustSignals = () => {
    return (
        <section className="py-20 bg-white">
            <Container>
                {/* Stats Grid */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-[#0071c2] mb-4">
                                {stat.icon}
                            </div>
                            <div className="mb-2">
                                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-gray-600 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h3 className="text-3xl font-bold text-center text-gray-900 mb-10">
                        What Our Pilgrims Say
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {testimonials.map((testimonial) => (
                            <motion.div
                                key={testimonial.id}
                                className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 relative"
                                whileHover={{ y: -5 }}
                            >
                                {/* Quote Icon */}
                                <div className="absolute top-6 right-6 opacity-10">
                                    <Quote className="w-16 h-16 text-[#0071c2]" />
                                </div>

                                {/* Rating */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>

                                {/* Testimonial Text */}
                                <p className="text-gray-700 mb-6 italic leading-relaxed">
                                    "{testimonial.text}"
                                </p>

                                {/* Author Info */}
                                <div className="flex items-center gap-4">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-12 h-12 rounded-full border-2 border-[#0071c2]"
                                        loading="lazy"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.location}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </Container>
        </section>
    );
};

export default TrustSignals;
