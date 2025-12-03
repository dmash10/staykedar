import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  MapPin, 
  Clock, 
  Star, 
  Heart, 
  ArrowRight, 
  Search,
  Mountain,
  Sparkles,
  TreePine,
  Compass,
  Sun,
  Camera,
  Users,
  Shield,
  Footprints,
  Navigation,
  Loader2
} from "lucide-react";

import Container from "../components/Container";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { supabase } from "@/integrations/supabase/client";

// Define attraction data interface matching database
interface Attraction {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  short_description: string;
  main_image: string;
  images: string[];
  distance: string;
  time_required: string;
  best_time: string;
  difficulty: "Easy" | "Moderate" | "Difficult" | "Moderate to Difficult";
  rating: number;
  tags: string[];
  location: string;
  elevation?: string;
  is_featured?: boolean;
  is_active: boolean;
}

const categories = [
  { id: "all", label: "All Places", icon: <Sparkles className="w-4 h-4" /> },
  { id: "Religious", label: "Temples & Shrines", icon: <Mountain className="w-4 h-4" /> },
  { id: "Natural", label: "Lakes & Nature", icon: <TreePine className="w-4 h-4" /> },
  { id: "Historical", label: "Historical Sites", icon: <Compass className="w-4 h-4" /> },
];

const difficultyColors = {
  "Easy": "bg-emerald-100 text-emerald-700",
  "Moderate": "bg-amber-100 text-amber-700",
  "Moderate to Difficult": "bg-orange-100 text-orange-700",
  "Difficult": "bg-red-100 text-red-700"
};

const Attractions = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;
      setAttractions(data || []);
    } catch (error) {
      console.error('Error fetching attractions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get featured attraction
  const featuredAttraction = attractions.find(a => a.is_featured);
  
  // Filter attractions based on search and type
  const filteredAttractions = attractions.filter(attraction => {
    const matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         attraction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (attraction.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = activeCategory === "all" ? true : attraction.type === activeCategory;
    
    return matchesSearch && matchesType && !attraction.is_featured;
  });
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Helmet>
        <title>Attractions Near Kedarnath | StayKedarnath</title>
        <meta name="description" content="Explore the most beautiful and sacred attractions near Kedarnath. Plan your visit to these must-see destinations during your pilgrimage." />
      </Helmet>
      
      <Nav />
      
      {/* Hero Section - Compact */}
      <section className="relative bg-[#003580] pt-6 pb-12 md:pt-8 md:pb-16 overflow-hidden">
        {/* Background Image - Subtle */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2070"
            alt="Kedarnath Valley"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Content */}
        <Container className="relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-2"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-white/90 text-xs font-medium">
                <MapPin className="w-3 h-3" />
                Discover Sacred Destinations
              </span>
            </motion.div>
            
            <motion.h1 
              className="text-2xl md:text-4xl font-bold text-white mb-2 leading-tight"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Explore the{" "}
              <span className="text-amber-300">Divine Himalayas</span>
            </motion.h1>
            
            <motion.p 
              className="text-sm text-white/70 max-w-lg mb-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              From ancient temples to pristine glacial lakes, discover sacred attractions around Kedarnath
            </motion.p>
            
            {/* Stats - Inline Flex */}
            <motion.div 
              className="inline-flex items-center gap-4 md:gap-6 text-white"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div>
                <div className="text-lg md:text-2xl font-bold">{attractions.length}</div>
                <div className="text-[10px] md:text-xs text-white/60">Places</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <div className="text-lg md:text-2xl font-bold">3,583m</div>
                <div className="text-[10px] md:text-xs text-white/60">Elevation</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div>
                <div className="text-lg md:text-2xl font-bold">1000+</div>
                <div className="text-[10px] md:text-xs text-white/60">Years</div>
              </div>
            </motion.div>
          </div>
        </Container>
        
        {/* Bottom Curve */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 40H1440V20C1440 20 1320 0 1200 0C1080 0 960 15 720 15C480 15 360 0 240 0C120 0 0 20 0 20V40Z" fill="rgb(248 250 252)" />
          </svg>
        </div>
      </section>
      
      {/* Search and Filter Section */}
      <section className="py-4 relative z-20">
        <Container>
          <motion.div 
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#0071c2]" size={18} />
              <input
                type="text"
                placeholder="Search temples, lakes, treks..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border-2 border-[#0071c2] focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10 transition-all duration-300 text-slate-700 placeholder:text-slate-400 outline-none shadow-sm text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Category Pills - 2x2 Grid on mobile, inline on desktop */}
            <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:justify-center md:gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all duration-300 text-sm
                    ${activeCategory === category.id
                      ? 'bg-[#0071c2] text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-[#0071c2] hover:text-[#0071c2]'
                    }
                  `}
                >
                  {category.icon}
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>
      
      {/* Loading State */}
      {loading && (
        <section className="py-20">
          <Container>
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#0071c2] animate-spin mb-4" />
              <p className="text-gray-500">Loading attractions...</p>
            </div>
          </Container>
        </section>
      )}

      {!loading && (
        <>
          {/* Featured Attraction - Spotlight */}
          {featuredAttraction && activeCategory === "all" && !searchQuery && (
            <section className="py-12">
              <Container>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Star className="w-7 h-7 text-amber-500 fill-amber-500" />
                    Must Visit Destination
                  </h2>
                </motion.div>
                
                <Link to={`/attractions/${featuredAttraction.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="relative rounded-3xl overflow-hidden group cursor-pointer"
                >
                  {/* Large Featured Image */}
                  <div className="aspect-[21/9] md:aspect-[21/8] relative overflow-hidden">
                    <img
                      src={featuredAttraction.main_image}
                      alt={featuredAttraction.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
                  </div>
                  
                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                          Featured
                        </span>
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                          {featuredAttraction.type}
                        </span>
                        <div className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-white text-xs font-medium">{featuredAttraction.rating}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-3xl md:text-5xl font-bold text-white mb-3">
                        {featuredAttraction.name}
                      </h3>
                      
                      <p className="text-white/80 text-base md:text-lg mb-6 line-clamp-2">
                        {featuredAttraction.short_description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/70 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{featuredAttraction.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mountain className="w-4 h-4" />
                          <span>{featuredAttraction.elevation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{featuredAttraction.time_required}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Explore Button */}
                  <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10">
                    <motion.button 
                      className="flex items-center gap-2 px-6 py-3 bg-white text-[#003580] font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Explore
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
                </Link>
              </Container>
            </section>
          )}
          
          {/* Attractions Grid */}
          <section className="py-12">
            <Container>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-between mb-8"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {activeCategory === "all" ? "All Attractions" : categories.find(c => c.id === activeCategory)?.label}
                </h2>
                <span className="text-slate-500 text-sm">
                  {filteredAttractions.length} {filteredAttractions.length === 1 ? 'place' : 'places'} found
                </span>
              </motion.div>
              
              {filteredAttractions.length === 0 ? (
                <motion.div 
                  className="text-center py-16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No attractions found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters</p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {filteredAttractions.map((attraction, index) => (
                    <motion.div
                      key={attraction.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group"
                      whileHover={{ y: -8 }}
                    >
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 h-full flex flex-col">
                        {/* Image Container */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={attraction.main_image}
                            alt={attraction.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          {/* Overlay Content */}
                          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                            <div className="text-white">
                              <div className="flex items-center gap-2 text-sm mb-1">
                                <MapPin className="w-4 h-4" />
                                <span>{attraction.distance}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <span className="text-white text-sm font-medium">{attraction.rating}</span>
                            </div>
                          </div>
                          
                          {/* Type Badge */}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-[#0071c2] text-white text-xs font-semibold rounded-full">
                              {attraction.type}
                            </span>
                          </div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {attraction.name}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
                            {attraction.short_description}
                          </p>
                          
                          {/* Info Row */}
                          <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-[#0071c2]" />
                              <span>{attraction.time_required}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mountain className="w-4 h-4 text-[#0071c2]" />
                              <span>{attraction.elevation || 'N/A'}</span>
                            </div>
                            <span className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full ${difficultyColors[attraction.difficulty]}`}>
                              {attraction.difficulty}
                            </span>
                          </div>
                          
                          {/* CTA Button - Matching Homepage */}
                          <Link to={`/attractions/${attraction.slug}`} className="block">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full bg-[#0071c2] hover:bg-[#005a9c] text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-300"
                            >
                              View Details
                              <ArrowRight className="w-5 h-5" />
                            </motion.button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Container>
          </section>
          
          {/* Travel Tips Section */}
          <section className="py-16 bg-gradient-to-b from-slate-50 to-white">
            <Container>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#003580]/10 rounded-full text-[#003580] text-sm font-medium mb-4">
                  <Compass className="w-4 h-4" />
                  Travel Guide
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Essential Tips for Your Journey
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Make the most of your visit to Kedarnath with these helpful tips from experienced travelers
                </p>
              </motion.div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: <Sun className="w-6 h-6" />,
                    title: "Best Time to Visit",
                    description: "Plan your visit between May-June or September-October for the best weather and clear mountain views.",
                    color: "from-amber-500 to-orange-500"
                  },
                  {
                    icon: <Footprints className="w-6 h-6" />,
                    title: "Physical Preparation",
                    description: "Start light exercises 2-3 weeks before. The trek requires moderate fitness levels.",
                    color: "from-emerald-500 to-teal-500"
                  },
                  {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Altitude Acclimatization",
                    description: "Spend a day at Gaurikund to acclimatize. Stay hydrated and avoid rushing.",
                    color: "from-blue-500 to-indigo-500"
                  },
                  {
                    icon: <Camera className="w-6 h-6" />,
                    title: "Photography Tips",
                    description: "Early mornings offer the best light. Some temples restrict photography inside.",
                    color: "from-purple-500 to-pink-500"
                  },
                  {
                    icon: <Users className="w-6 h-6" />,
                    title: "Hire Local Guides",
                    description: "Local guides provide valuable insights about religious significance and hidden spots.",
                    color: "from-rose-500 to-red-500"
                  },
                  {
                    icon: <Heart className="w-6 h-6" />,
                    title: "Respect Sacred Sites",
                    description: "Dress modestly, remove footwear when required, and maintain silence in temples.",
                    color: "from-cyan-500 to-blue-500"
                  }
                ].map((tip, index) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg border border-slate-100 transition-all duration-300"
                    whileHover={{ y: -4 }}
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tip.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      {tip.icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{tip.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{tip.description}</p>
                  </motion.div>
                ))}
              </div>
            </Container>
          </section>
          
          {/* CTA Section */}
          <section className="py-20 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#003580] via-[#004494] to-[#0071c2]" />
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            
            <Container className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-3xl mx-auto"
              >
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Ready to Begin Your
                  <span className="block text-amber-300">Spiritual Journey?</span>
                </h2>
                <p className="text-white/80 text-lg mb-10 leading-relaxed">
                  Book your stay with us and get personalized recommendations for attractions 
                  based on your interests and schedule.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/stays">
                    <motion.button 
                      className="px-8 py-4 bg-white text-[#003580] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Find Your Stay
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </Link>
                  <Link to="/packages">
                    <motion.button 
                      className="px-8 py-4 bg-transparent border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Packages
                      <Navigation className="w-5 h-5" />
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </Container>
          </section>
        </>
      )}
      
      <Footer />
    </div>
  );
};

export default Attractions;
