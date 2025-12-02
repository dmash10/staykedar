import { motion } from "framer-motion";
import { Search, CreditCard, Smile } from "lucide-react";
import Container from "../Container";

const steps = [
    {
        number: 1,
        icon: <Search className="w-8 h-8" />,
        title: "Search & Compare",
        description: "Browse verified stays and packages across the Kedarnath route"
    },
    {
        number: 2,
        icon: <CreditCard className="w-8 h-8" />,
        title: "Book Securely",
        description: "Choose your perfect option and book with confidence & secure payment"
    },
    {
        number: 3,
        icon: <Smile className="w-8 h-8" />,
        title: "Enjoy Your Yatra",
        description: "Focus on your spiritual journey while we handle the logistics"
    }
];

const HowItWorks = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const item = {
        hidden: { opacity: 0, scale: 0.8 },
        show: { opacity: 1, scale: 1 }
    };

    return (
        <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
            <Container>
                {/* Section Header */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Book in 3 Simple Steps
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Your spiritual journey, simplified
                    </p>
                </motion.div>

                {/* Steps Grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            variants={item}
                            className="relative flex md:block items-center md:items-start text-left md:text-center gap-4 md:gap-0"
                        >
                            {/* Connecting Line (Desktop only) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-[#0071c2] to-gray-300 -z-10" />
                            )}

                            {/* Step Number Circle */}
                            <motion.div
                                className="inline-flex items-center justify-center w-16 h-16 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005a9c] text-white mb-0 md:mb-6 shadow-xl relative z-10 flex-shrink-0"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="relative">
                                    <div className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full flex items-center justify-center text-[#0071c2] font-bold text-sm md:text-lg shadow-md">
                                        {step.number}
                                    </div>
                                    <div className="transform scale-75 md:scale-100">
                                        {step.icon}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Step Content */}
                            <div className="flex-grow">
                                <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-sm md:text-base text-gray-600 max-w-none md:max-w-xs mx-auto">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </Container>
        </section>
    );
};

export default HowItWorks;
