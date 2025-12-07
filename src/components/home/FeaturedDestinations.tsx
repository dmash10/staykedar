import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { TransitionLink } from "../TransitionLink";
import Container from "../Container";

const destinations = [
    {
        id: 1,
        name: "Kedarnath",
        properties: "120+ stays",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80",
        slug: "kedarnath"
    },
    {
        id: 2,
        name: "Tungnath",
        properties: "45+ stays",
        image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&q=80",
        slug: "tungnath"
    },
    {
        id: 3,
        name: "Chopta",
        properties: "80+ stays",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
        slug: "chopta"
    },
    {
        id: 4,
        name: "Badrinath",
        properties: "150+ stays",
        image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&q=80",
        slug: "badrinath"
    },
    {
        id: 5,
        name: "Triyuginarayan",
        properties: "25+ stays",
        image: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&q=80",
        slug: "triyuginarayan"
    },
    {
        id: 6,
        name: "Deoria Tal",
        properties: "30+ stays",
        image: "https://images.unsplash.com/photo-1486216736640-1a72cb1c53fa?w=400&q=80",
        slug: "deoria-tal"
    },
    {
        id: 7,
        name: "Gaurikund",
        properties: "40+ stays",
        image: "https://images.unsplash.com/photo-1588415823729-bc87f9c8e3bc?w=400&q=80",
        slug: "gaurikund"
    },
    {
        id: 8,
        name: "Rudranath",
        properties: "15+ stays",
        image: "https://images.unsplash.com/photo-1486216736640-1a72cb1c53fa?w=400&q=80",
        slug: "rudranath"
    }
];

const FeaturedDestinations = () => {
    return (
        <section className="py-8 md:py-12 bg-gray-50">
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
                            Popular Destinations
                        </h2>
                        <p className="text-gray-500 text-sm hidden md:block">
                            Explore sacred places along the Kedarnath route
                        </p>
                    </div>
                    <TransitionLink
                        to="/attractions"
                        className="inline-flex items-center gap-1 text-[#0071c2] font-medium hover:gap-2 transition-all text-sm flex-shrink-0"
                    >
                        View all
                        <ArrowRight className="w-4 h-4" />
                    </TransitionLink>
                </motion.div>

                {/* Horizontal Scrollable Destinations */}
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                    {destinations.map((destination, index) => (
                        <motion.div
                            key={destination.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="flex-shrink-0"
                        >
                            <TransitionLink
                                to={`/attractions/${destination.slug}`}
                                className="group block w-[120px] md:w-[140px]"
                            >
                                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2">
                                    <img
                                        src={destination.image}
                                        alt={destination.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    <div className="absolute bottom-2 left-2 right-2">
                                        <h3 className="font-semibold text-white text-sm truncate">
                                            {destination.name}
                                        </h3>
                                        <div className="flex items-center gap-1 text-white/80 text-[10px]">
                                            <MapPin className="w-2.5 h-2.5" />
                                            <span>{destination.properties}</span>
                                        </div>
                                    </div>
                                </div>
                            </TransitionLink>
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

export default FeaturedDestinations;
