import { motion } from "framer-motion";
import { Check, ArrowRight, Calendar, Star } from "lucide-react";
import { Link } from "react-router-dom";
import Container from "../Container";

const packages = [
    {
        id: 1,
        name: "Kedarnath Express",
        duration: "3D/2N",
        price: "12,999",
        originalPrice: "15,999",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80",
        rating: 4.8,
        reviews: 234,
        inclusions: ["Helicopter ride", "2N stay", "VIP Darshan"],
        highlight: "Helicopter",
        slug: "kedarnath-express"
    },
    {
        id: 2,
        name: "Do Dham Yatra",
        duration: "5D/4N",
        price: "19,999",
        originalPrice: "24,999",
        image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=80",
        rating: 4.9,
        reviews: 412,
        inclusions: ["Kedarnath + Badrinath", "4N hotel", "Transport"],
        popular: true,
        highlight: "Popular",
        slug: "do-dham-yatra"
    },
    {
        id: 3,
        name: "Budget Pilgrim",
        duration: "4D/3N",
        price: "8,999",
        originalPrice: "11,999",
        image: "https://images.unsplash.com/photo-1486216736640-1a72cb1c53fa?w=600&q=80",
        rating: 4.6,
        reviews: 189,
        inclusions: ["Budget stays", "Shared cab", "Meals"],
        highlight: "Value",
        slug: "budget-pilgrim"
    },
    {
        id: 4,
        name: "Char Dham Complete",
        duration: "10D/9N",
        price: "35,999",
        originalPrice: "42,999",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
        rating: 4.9,
        reviews: 156,
        inclusions: ["All 4 Dhams", "9N hotel", "All meals"],
        highlight: "Premium",
        slug: "char-dham-complete"
    }
];

const CuratedPackages = () => {
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
                    <Link
                        to="/packages"
                        className="inline-flex items-center gap-1 text-[#0071c2] font-medium hover:gap-2 transition-all text-sm flex-shrink-0"
                    >
                        View all
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>

                {/* Horizontal Scrollable Packages */}
                <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                    {packages.map((pkg, index) => (
                        <motion.div
                            key={pkg.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex-shrink-0 w-[240px]"
                        >
                            <div className={`bg-white rounded-xl overflow-hidden border h-full flex flex-col ${pkg.popular ? 'border-[#0071c2] shadow-md' : 'border-gray-200'}`}>
                                {/* Image - Fixed height */}
                                <div className="relative h-[140px] overflow-hidden">
                                    <img
                                        src={pkg.image}
                                        alt={pkg.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                    {/* Badge */}
                                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold ${pkg.popular
                                            ? 'bg-[#0071c2] text-white'
                                            : 'bg-white/90 text-gray-700'
                                        }`}>
                                        {pkg.highlight}
                                    </div>

                                    {/* Price */}
                                    <div className="absolute bottom-2 right-2 text-right">
                                        <div className="text-white/70 text-[10px] line-through">₹{pkg.originalPrice}</div>
                                        <div className="text-white font-bold text-base">₹{pkg.price}</div>
                                    </div>
                                </div>

                                {/* Content - Fixed structure */}
                                <div className="p-3 flex flex-col flex-grow">
                                    {/* Title & Rating */}
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{pkg.name}</h3>
                                        <div className="flex items-center gap-0.5 text-xs flex-shrink-0">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span className="font-medium">{pkg.rating}</span>
                                        </div>
                                    </div>

                                    {/* Duration */}
                                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-2">
                                        <Calendar className="w-3 h-3" />
                                        <span>{pkg.duration}</span>
                                    </div>

                                    {/* Inclusions - Fixed height */}
                                    <div className="flex flex-wrap gap-1 mb-3 flex-grow">
                                        {pkg.inclusions.slice(0, 3).map((item, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-0.5 text-[10px] text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                                                <Check className="w-2.5 h-2.5 text-green-500" />
                                                {item}
                                            </span>
                                        ))}
                                    </div>

                                    {/* View Details Button */}
                                    <Link
                                        to={`/packages/${pkg.slug}`}
                                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-center transition-colors bg-[#0071c2] text-white hover:bg-[#005999]"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Container>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default CuratedPackages;
