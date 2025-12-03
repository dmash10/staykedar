import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Mountain, 
  Star, 
  ArrowLeft, 
  ArrowRight,
  Navigation,
  Camera,
  Footprints,
  Sun,
  CloudSnow,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Heart,
  ChevronRight,
  ChevronLeft,
  Home,
  Bed,
  Package,
  Phone,
  MessageCircle,
  X,
  ZoomIn,
  Image as ImageIcon,
  Loader2
} from "lucide-react";

import Container from "../components/Container";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { supabase } from "@/integrations/supabase/client";

// Attraction data interface matching database
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
  meta_title?: string;
  meta_description?: string;
}

const difficultyColors = {
  "Easy": "bg-emerald-100 text-emerald-700",
  "Moderate": "bg-amber-100 text-amber-700",
  "Moderate to Difficult": "bg-orange-100 text-orange-700",
  "Difficult": "bg-red-100 text-red-700"
};

const AttractionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [relatedAttractions, setRelatedAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  
  // Image Gallery State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchAttraction();
    }
    window.scrollTo(0, 0);
  }, [id]);

  const fetchAttraction = async () => {
    setLoading(true);
    try {
      // Fetch by slug
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .eq('slug', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setAttraction(data);

      // Fetch related attractions
      if (data) {
        const { data: related, error: relatedError } = await supabase
          .from('attractions')
          .select('*')
          .eq('is_active', true)
          .neq('slug', id)
          .or(`type.eq.${data.type}`)
          .limit(4);

        if (!relatedError && related) {
          setRelatedAttractions(related);
        }
      }
    } catch (error) {
      console.error('Error fetching attraction:', error);
      setAttraction(null);
    } finally {
      setLoading(false);
    }
  };

  // Get all images (main + gallery)
  const allImages = attraction 
    ? [attraction.main_image, ...(attraction.images || [])]
    : [];

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="w-10 h-10 text-[#0071c2] animate-spin mb-4" />
          <p className="text-gray-500">Loading attraction...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <Container className="py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Attraction Not Found</h1>
          <p className="text-gray-600 mb-8">The attraction you're looking for doesn't exist.</p>
          <Link to="/attractions" className="text-[#0071c2] font-medium hover:underline">
            ← Back to Attractions
          </Link>
        </Container>
        <Footer />
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: attraction.name,
        text: attraction.short_description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{attraction.meta_title || `${attraction.name} - Things to Do Near Kedarnath`} | StayKedarnath</title>
        <meta name="description" content={attraction.meta_description || `${attraction.short_description} Plan your visit to ${attraction.name} at ${attraction.elevation}. Best time: ${attraction.best_time}. ${attraction.difficulty} difficulty.`} />
        <meta name="keywords" content={`${attraction.name}, ${(attraction.tags || []).join(', ')}, Kedarnath attractions, Uttarakhand tourism, ${attraction.type}`} />
        <link rel="canonical" href={`https://staykedarnath.in/attractions/${attraction.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${attraction.name} | StayKedarnath`} />
        <meta property="og:description" content={attraction.short_description} />
        <meta property="og:image" content={attraction.main_image} />
        <meta property="og:url" content={`https://staykedarnath.in/attractions/${attraction.slug}`} />
        <meta property="og:type" content="article" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${attraction.name} | StayKedarnath`} />
        <meta name="twitter:description" content={attraction.short_description} />
        <meta name="twitter:image" content={attraction.main_image} />
      </Helmet>
      
      <Nav />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={attraction.main_image}
          alt={attraction.name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => openLightbox(0)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* View Gallery Button */}
        {allImages.length > 1 && (
          <button
            onClick={() => openLightbox(0)}
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-white transition-colors text-sm z-10"
          >
            <ImageIcon className="w-4 h-4" />
            View {allImages.length} Photos
          </button>
        )}
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
          <button
            onClick={() => navigate('/attractions')}
            className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 font-medium hover:bg-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Attractions</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex gap-2">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2.5 rounded-full backdrop-blur-sm transition-colors ${isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-white'}`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
        
        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <Container>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-white/70 text-sm mb-3">
              <Link to="/" className="hover:text-white">Home</Link>
              <ChevronRight className="w-4 h-4" />
              <Link to="/attractions" className="hover:text-white">Attractions</Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white">{attraction.name}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#0071c2] text-white text-xs font-semibold rounded-full">
                {attraction.type}
              </span>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${difficultyColors[attraction.difficulty]}`}>
                {attraction.difficulty}
              </span>
              <div className="flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-white text-sm font-medium">{attraction.rating}</span>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {attraction.name}
            </h1>
            
            <div className="flex items-center gap-2 text-white/80">
              <MapPin className="w-4 h-4" />
              <span>{attraction.location}</span>
            </div>
          </Container>
        </div>
      </section>
      
      {/* Quick Info Bar */}
      <section className="bg-white border-b sticky top-0 z-30">
        <Container>
          <div className="flex items-center justify-between py-3 overflow-x-auto gap-4">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Mountain className="w-4 h-4 text-[#0071c2]" />
                <span className="text-gray-600">{attraction.elevation}</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <MapPin className="w-4 h-4 text-[#0071c2]" />
                <span className="text-gray-600">{attraction.distance} from Kedarnath</span>
              </div>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Clock className="w-4 h-4 text-[#0071c2]" />
                <span className="text-gray-600">{attraction.time_required}</span>
              </div>
            </div>
            <Link to="/stays" className="hidden md:flex">
              <button className="px-4 py-2 bg-[#0071c2] text-white text-sm font-medium rounded-lg hover:bg-[#005a9c] transition-colors whitespace-nowrap">
                Book Nearby Stay
              </button>
            </Link>
          </div>
        </Container>
      </section>
      
      {/* Main Content */}
      <section className="py-8 md:py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {attraction.name}</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {attraction.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {(attraction.tags || []).map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Image Gallery Section */}
              {allImages.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Photo Gallery</h2>
                    <span className="text-gray-500 text-sm">{allImages.length} photos</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {allImages.map((image, index) => (
                      <motion.div
                        key={index}
                        className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => openLightbox(index)}
                      >
                        <img
                          src={image}
                          alt={`${attraction.name} - Photo ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {index === 0 && (
                          <span className="absolute top-2 left-2 px-2 py-1 bg-[#0071c2] text-white text-xs font-medium rounded">
                            Main
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Key Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Information</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <Mountain className="w-6 h-6 text-[#0071c2] mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">{attraction.elevation}</div>
                    <div className="text-xs text-gray-500">Elevation</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">{attraction.time_required}</div>
                    <div className="text-xs text-gray-500">Time Required</div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl text-center">
                    <Calendar className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">{attraction.best_time}</div>
                    <div className="text-xs text-gray-500">Best Time</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl text-center">
                    <Footprints className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-gray-900">{attraction.difficulty}</div>
                    <div className="text-xs text-gray-500">Difficulty</div>
                  </div>
                </div>
              </motion.div>
              
              {/* Tips Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Tips</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Best Season</h3>
                      <p className="text-gray-600 text-sm">Visit during {attraction.best_time} for the best weather and clear views.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CloudSnow className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Weather</h3>
                      <p className="text-gray-600 text-sm">Temperatures can drop significantly. Carry warm clothes even in summer.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Camera className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Photography</h3>
                      <p className="text-gray-600 text-sm">Early morning offers the best light. Respect photography rules at religious sites.</p>
                    </div>
                  </div>
                  {attraction.difficulty !== "Easy" && (
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Fitness Required</h3>
                        <p className="text-gray-600 text-sm">This is a {attraction.difficulty.toLowerCase()} trek. Ensure you're physically prepared and acclimatized.</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Book Stay CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#003580] to-[#0071c2] rounded-2xl p-6 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bed className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Book Your Stay</h3>
                    <p className="text-white/70 text-sm">Near {attraction.name}</p>
                  </div>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  Find comfortable accommodations near this attraction for a hassle-free pilgrimage.
                </p>
                <Link to="/stays">
                  <button className="w-full py-3 bg-white text-[#003580] font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                    <Bed className="w-5 h-5" />
                    Find Stays
                  </button>
                </Link>
              </motion.div>
              
              {/* Package CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Yatra Packages</h3>
                    <p className="text-gray-500 text-sm">All-inclusive tours</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Explore curated packages that include this destination with accommodation, transport & meals.
                </p>
                <Link to="/packages">
                  <button className="w-full py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2">
                    <Package className="w-5 h-5" />
                    View Packages
                  </button>
                </Link>
              </motion.div>
              
              {/* Contact CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="font-bold text-lg text-gray-900 mb-4">Need Help Planning?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Our travel experts can help you plan the perfect itinerary.
                </p>
                <div className="space-y-3">
                  <a href="tel:+919876543210" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Phone className="w-5 h-5 text-[#0071c2]" />
                    <span className="text-gray-700 font-medium">+91 98765 43210</span>
                  </a>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700 font-medium">WhatsApp Us</span>
                  </a>
                </div>
              </motion.div>
              
              {/* Map Placeholder */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="aspect-video bg-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Map View</p>
                  </div>
                </div>
                <div className="p-4">
                  <button className="w-full py-2.5 border border-[#0071c2] text-[#0071c2] font-medium rounded-lg hover:bg-[#0071c2] hover:text-white transition-colors flex items-center justify-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </Container>
      </section>
      
      {/* Related Attractions */}
      {relatedAttractions.length > 0 && (
        <section className="py-12 bg-white">
          <Container>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Nearby Attractions</h2>
              <Link to="/attractions" className="text-[#0071c2] font-medium flex items-center gap-1 hover:gap-2 transition-all">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedAttractions.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/attractions/${item.slug}`}>
                    <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300">
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={item.main_image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="px-2 py-1 bg-white/90 text-xs font-medium rounded-full text-gray-700">
                            {item.type}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-[#0071c2] transition-colors line-clamp-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="line-clamp-1">{item.distance}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>
      )}
      
      {/* Bottom CTA - Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 md:hidden z-40">
        <div className="flex gap-3">
          <Link to="/stays" className="flex-1">
            <button className="w-full py-3 bg-[#0071c2] text-white font-semibold rounded-xl flex items-center justify-center gap-2">
              <Bed className="w-5 h-5" />
              Book Stay
            </button>
          </Link>
          <Link to="/packages" className="flex-1">
            <button className="w-full py-3 border-2 border-[#0071c2] text-[#0071c2] font-semibold rounded-xl flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              Packages
            </button>
          </Link>
        </div>
      </div>
      
      {/* Spacer for mobile bottom CTA */}
      <div className="h-20 md:hidden" />
      
      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Image Counter */}
            <div className="absolute top-4 left-4 px-4 py-2 bg-white/10 rounded-full text-white text-sm">
              {currentImageIndex + 1} / {allImages.length}
            </div>
            
            {/* Navigation Buttons */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
            
            {/* Main Image */}
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={allImages[currentImageIndex]}
              alt={`${attraction.name} - Photo ${currentImageIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-black/50 rounded-full overflow-x-auto max-w-[90vw]">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      index === currentImageIndex ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <Footer />
    </div>
  );
};

export default AttractionDetail;
