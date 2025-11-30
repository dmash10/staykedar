import { motion } from "framer-motion";
import { ArrowRight, Mountain, Church, Trees, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import Container from "../Container";

const categories = [
    { id: "pilgrimage", label: "Pilgrimage Sites", icon: <Church className="w-4 h-4" /> },
    { id: "panch-kedar", label: "Panch Kedar", icon: <Mountain className="w-4 h-4" /> },
    { id: "nature", label: "Nature & Trekking", icon: <Trees className="w-4 h-4" /> },
];

const destinations = [
    {
        id: 1,
        name: "Kedarnath",
        category: "panch-kedar",
        tagline: "First of Panch Kedar",
        distance: "223 km from Rishikesh",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80",
        link: "/attractions?location=kedarnath"
    },
    {
        id: 2,
        name: "Tungnath",
        category: "panch-kedar",
        tagline: "Highest Shiva temple",
        distance: "195 km from Rishikesh",
        image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&q=80",
        link: "/attractions?location=tungnath"
    },
    {
        id: 3,
        name: "Chopta",
        category: "nature",
        tagline: "Mini Switzerland",
        distance: "162 km from Rishikesh",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
        link: "/attractions?location=chopta"
    },
    {
        id: 4,
        name: "Rudranath",
        category: "panch-kedar",
        tagline: "Third Kedar shrine",
        distance: "210 km from Rishikesh",
        image: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&q=80",
        link: "/attractions?location=rudranath"
    },
    {
        id: 5,
        name: "Madhmaheshwar",
        category: "panch-kedar",
        tagline: "Fourth Kedar temple",
        distance: "220 km from Rishikesh",
        image: "https://images.unsplash.com/photo-1486216736640-1a72cb1c53fa?w=400&q=80",
        link: "/attractions?location=madhmaheshwar"
    },
    {
        id: 6,
        name: "Triyuginarayan",
        category: "pilgrimage",
        tagline: "Eternal flame temple",
        distance: "205 km from Rishikesh",
        image: "https://images.unsplash.com/photo-1605647540924-852290f6b0d5?w=400&q=80",
        link: "/attractions?location=triyuginarayan"
    },
    {
        id: 7,
        name: "Kartik Swami",
        category: "pilgrimage",
        tagline: "360° Himalayan views",
        distance: "185 km from Rishikesh",
        image: "https://images.unsplash.com/photo-1588415823729-bc87f9c8e3bc?w=400&q=80",
        link: "/attractions?location=kartik-swami"
    },
    {
        id: 8,
        name: "Gaurikund",
        category: "pilgrimage",
        tagline: "Kedarnath trek base",
        distance: "210 km from Rishikesh",
        image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&q=80",
        link: "/attractions?location=gaurikund"
    },
    {
        id: 9,
        name: "Kalpeshwar",
        category: "panch-kedar",
        tagline: "Fifth Kedar shrine",
        distance: "280 km from Rishikesh",
        image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&q=80",
        link: "/attractions?location=kalpeshwar"
    },
    {
        id: 10,
        name: "Deoria Tal",
        category: "nature",
        tagline: "Pristine mountain lake",
        distance: "168 km from Rishikesh",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
        link: "/attractions?location=deoria-tal"
    }
];

const FeaturedDestinations = () => {
    const [activeCategory, setActiveCategory] = useState("pilgrimage");
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const filteredDestinations = destinations.filter(
        dest => activeCategory === "pilgrimage" ? true : dest.category === activeCategory
    );

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="py-16 bg-white">
            <Container>
                {/* Section Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                        Quick and easy trip planner
                    </h2>
                    <p className="text-gray-600">
                        Pick a vibe and explore the top destinations in Uttarakhand
                    </p>
                </motion.div>

                {/* Category Tabs */}
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`
                flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap font-medium transition-all duration-300
                ${activeCategory === category.id
                                    ? 'bg-[#0071c2] text-white shadow-md'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#0071c2] hover:text-[#0071c2]'
                                }
              `}
                        >
                            {category.icon}
                            {category.label}
                        </button>
                    ))}\n        </div>

                {/* Destinations Carousel */}
                <div className="relative group">
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>

                    {/* Scrollable Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {filteredDestinations.map((destination) => (
                            <Link
                                key={destination.id}
                                to={destination.link}
                                className="flex-shrink-0 w-[160px]  group/card"
                            >
                                <motion.div
                                    whileHover={{ y: -4 }}
                                    className="rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                                >
                                    {/* Image */}
                                    <div className="aspect-square relative overflow-hidden">
                                        <img
                                            src={destination.image}
                                            alt={destination.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="p-3 bg-white">
                                        <h3 className="font-bold text-gray-900 mb-1 text-sm">
                                            {destination.name}
                                        </h3>
                                        <p className="text-xs text-gray-600 mb-1">
                                            {destination.tagline}
                                        </p>
                                        <div className="text-xs text-gray-500">
                                            {destination.distance}
                                        </div>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-gray-50"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                </div>

                {/* View All Link */}
                <motion.div
                    className="text-center mt-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <Link
                        to="/attractions"
                        className="inline-flex items-center gap-2 text-[#0071c2] font-semibold hover:gap-3 transition-all duration-300"
                    >
                        Explore all destinations
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </Container>

            <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </section>
    );
};

export default FeaturedDestinations;
