import { motion } from "framer-motion";
import { Package, Check, ArrowRight, Calendar, Users, Hotel } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../Container";

const packages = [
    {
        id: 1,
        name: "Kedarnath Express",
        duration: "3 Days / 2 Nights",
        price: "₹12,999",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
        inclusions: [
            "Helicopter to Kedarnath",
            "2 Nights accommodation",
            "VIP Darshan tickets",
            "Meals included"
        ],
        link: "/packages/kedarnath-express"
    },
    {
        id: 2,
        name: "Do Dham Yatra",
        duration: "5 Days / 4 Nights",
        price: "₹19,999",
        image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80",
        inclusions: [
            "Kedarnath + Badrinath",
            "4 Nights hotel stay",
            "All transportation",
            "Guided tours"
        ],
        popular: true,
        link: "/packages/do-dham-yatra"
    },
    {
        id: 3,
        name: "Budget Pilgrim",
        duration: "4 Days / 3 Nights",
        price: "₹8,999",
        image: "https://images.unsplash.com/photo-1486216736640-1a72cb1c53fa?w=800&q=80",
        inclusions: [
            "Budget-friendly stays",
            "Shared transportation",
            "Temple visits",
            "Basic meals"
        ],
        link: "/packages/budget-pilgrim"
    }
];

const CuratedPackages = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <section className="py-20 bg-white">
            <Container>
                {/* Section Header */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                        <Package className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Popular Yatra Packages
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Thoughtfully curated packages for a seamless and divine pilgrimage experience
                    </p>
                </motion.div>

                {/* Packages Grid */}
                <motion.div
                    className="flex overflow-x-auto snap-x md:grid md:grid-cols-3 gap-4 md:gap-8 pb-4 md:pb-0 px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {packages.map((pkg) => (
                        <motion.div
                            key={pkg.id}
                            variants={item}
                            whileHover={{ y: -8 }}
                            className="group relative min-w-[280px] snap-center md:min-w-0"
                        >
                            {/* Popular Badge */}
                            {pkg.popular && (
                                <div className="absolute -top-3 right-6 z-10 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                                {/* Package Image */}
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <img
                                        src={pkg.image}
                                        alt={pkg.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                    {/* Duration & Price Overlay */}
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                        <div className="text-white">
                                            <div className="flex items-center gap-2 text-sm mb-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{pkg.duration}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-200">Starting from</div>
                                            <div className="text-2xl font-bold text-white">{pkg.price}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Package Content */}
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                        {pkg.name}
                                    </h3>

                                    {/* Inclusions */}
                                    <ul className="space-y-3 mb-6 flex-grow">
                                        {pkg.inclusions.map((inclusion, index) => (
                                            <li key={index} className="flex items-start gap-2 text-gray-700">
                                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{inclusion}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <Link to={pkg.link} className="mt-auto">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full bg-[#0071c2] hover:bg-[#005a9c] text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300"
                                        >
                                            View Package
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* View All Packages */}
                <motion.div
                    className="text-center mt-12"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                >
                    <Link
                        to="/packages"
                        className="inline-flex items-center gap-2 text-[#0071c2] font-semibold text-lg hover:gap-3 transition-all duration-300 border-2 border-[#0071c2] px-6 py-3 rounded-lg hover:bg-[#0071c2] hover:text-white"
                    >
                        View All Packages
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </Container>
        </section>
    );
};

export default CuratedPackages;
