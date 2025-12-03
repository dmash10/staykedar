import { motion } from "framer-motion";
import { Shield, Clock, BadgeCheck, Headphones } from "lucide-react";
import Container from "../Container";

const WhyUs = () => {
    const benefits = [
        {
            icon: Shield,
            title: "Secure Booking",
            description: "100% verified"
        },
        {
            icon: BadgeCheck,
            title: "Best Price",
            description: "No hidden fees"
        },
        {
            icon: Clock,
            title: "Free Cancel",
            description: "Most bookings"
        },
        {
            icon: Headphones,
            title: "24/7 Support",
            description: "Always here"
        }
    ];

    return (
        <section className="pt-36 md:pt-28 pb-4 md:pb-6 bg-white">
            <Container>
                {/* Evenly spaced 2x2 grid on mobile, 4 columns on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-2 md:gap-6">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col items-center text-center py-1"
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                            {/* Icon */}
                            <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-blue-50 flex items-center justify-center mb-1 md:mb-2">
                                <benefit.icon className="w-4 h-4 md:w-6 md:h-6 text-[#0071c2]" />
                            </div>
                            
                            {/* Text */}
                            <div className="font-semibold text-gray-900 text-[11px] md:text-sm leading-tight">
                                {benefit.title}
                            </div>
                            <div className="text-[9px] md:text-xs text-gray-500 leading-tight">
                                {benefit.description}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default WhyUs;
