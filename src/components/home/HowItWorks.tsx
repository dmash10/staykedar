import { motion } from "framer-motion";
import { Search, CreditCard, Plane, ArrowRight } from "lucide-react";
import Container from "../Container";

const steps = [
    {
        number: "1",
        icon: Search,
        title: "Search",
        description: "Find stays, packages & services for your yatra"
    },
    {
        number: "2",
        icon: CreditCard,
        title: "Book",
        description: "Secure your booking with easy payment options"
    },
    {
        number: "3",
        icon: Plane,
        title: "Travel",
        description: "Enjoy a hassle-free spiritual journey"
    }
];

const HowItWorks = () => {
    return (
        <section className="py-8 md:py-10 bg-gradient-to-br from-[#0A1628] via-[#0F2167] to-[#1E3A8A] relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0">
                {/* Subtle pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
                {/* Gradient orbs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -ml-32 -mt-32" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-32 -mb-32" />
            </div>

            <Container>
                <div className="relative z-10 max-w-5xl mx-auto">
                    {/* Section Header */}
                    <motion.div
                        className="text-center mb-6 md:mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full mb-3 border border-white/20">
                            SIMPLE & EASY
                        </span>
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-sm">
                            How It Works
                        </h2>
                        <p className="text-blue-200/80 text-sm md:text-base">
                            Book your yatra in 3 simple steps
                        </p>
                    </motion.div>

                    {/* Steps Container */}
                    <div className="relative">
                        {/* Connecting Line - Desktop only */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-white/20 rounded-full" />

                        {/* Steps Grid */}
                        <div className="grid grid-cols-3 gap-3 md:gap-8">
                            {steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    className="text-center relative"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.15 }}
                                >
                                    {/* Step Number Circle */}
                                    <div className="relative inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#0071c2] to-[#005999] shadow-xl shadow-blue-500/30 mb-3 md:mb-4 group">
                                        <step.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                        
                                        {/* Step number badge */}
                                        <span className="absolute -top-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full bg-white text-[#0071c2] text-xs md:text-sm font-bold flex items-center justify-center shadow-lg">
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <h3 className="font-bold text-white text-sm md:text-lg mb-1">
                                        {step.title}
                                    </h3>
                                    <p className="text-blue-200/70 text-[10px] md:text-sm leading-tight px-1">
                                        {step.description}
                                    </p>

                                    {/* Arrow for mobile - between items */}
                                    {index < steps.length - 1 && (
                                        <div className="md:hidden absolute top-6 -right-1.5 text-white/50">
                                            <ArrowRight className="w-3 h-3" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default HowItWorks;
