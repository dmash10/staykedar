import { motion } from "framer-motion";
import Container from "../Container";

const WhyUs = () => {
    const benefits = [
        {
            id: 1,
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 28L18 22L24 28L34 18" stroke="#0071c2" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="12" y="32" width="24" height="4" rx="1" fill="#FFD700" />
                </svg>
            ),
            title: "Book now, pay at the property",
            description: "FREE cancellation on most rooms"
        },
        {
            id: 2,
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="14" r="5" fill="#0071c2" />
                    <path d="M16 20c0-3 3-5 8-5s8 2 8 5v12H16V20z" fill="#0071c2" opacity="0.6" />
                    <circle cx="18" cy="26" r="1.5" fill="white" />
                    <circle cx="24" cy="26" r="1.5" fill="white" />
                    <circle cx="30" cy="26" r="1.5" fill="white" />
                </svg>
            ),
            title: "300M+ reviews from fellow travelers",
            description: "Get trusted information from guests like you"
        },
        {
            id: 3,
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="14" width="32" height="20" rx="2" stroke="#0071c2" strokeWidth="2" fill="none" />
                    <circle cx="24" cy="24" r="5" fill="#FFD700" />
                    <path d="M18 8h12" stroke="#0071c2" strokeWidth="2" strokeLinecap="round" />
                    <path d="M20 10h8" stroke="#0071c2" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            title: "2+ million properties worldwide",
            description: "Pilgrimage sites, budget stays, dharamshalas, and more..."
        },
        {
            id: 4,
            icon: (
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="18" r="6" stroke="#0071c2" strokeWidth="2" fill="none" />
                    <path d="M24 24v8M20 28h8" stroke="#0071c2" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="16" cy="36" r="1.5" fill="#0071c2" />
                    <circle cx="24" cy="36" r="1.5" fill="#0071c2" />
                    <circle cx="32" cy="36" r="1.5" fill="#0071c2" />
                </svg>
            ),
            title: "Trusted 24/7 customer service",
            description: "We're always here to help"
        }
    ];

    return (
        <section className="pt-24 pb-12 bg-gray-50">
            <Container>
                <motion.h2
                    className="text-2xl md:text-3xl font-bold text-gray-900 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    Why StayKedarnath?
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            key={benefit.id}
                            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <div className="w-12 h-12 mb-4">
                                {benefit.icon}
                            </div>
                            <h3 className="font-bold text-base text-gray-900 mb-2">
                                {benefit.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {benefit.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default WhyUs;
