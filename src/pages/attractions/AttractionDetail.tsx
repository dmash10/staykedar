import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  MapPin,
  Clock,
  Calendar,
  Mountain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
  MessageCircle,
  BedDouble,
  Compass,
  ArrowRight,
  ShieldCheck,
  Heart,
  Star,
  Phone,
  ClipboardCheck
} from "lucide-react";

import Container from "../../components/Container";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { supabase } from "@/integrations/supabase/client";
import './AttractionContent.css';

// Intefaces
interface FAQ {
  question: string;
  answer: string;
}

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
  faqs?: FAQ[];
}

const difficultyColors = {
  "Easy": "text-green-700 bg-green-50 border-green-200",
  "Moderate": "text-amber-700 bg-amber-50 border-amber-200",
  "Moderate to Difficult": "text-orange-700 bg-orange-50 border-orange-200",
  "Difficult": "text-red-700 bg-red-50 border-red-200"
};

const AttractionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyAttractions, setNearbyAttractions] = useState<Attraction[]>([]);

  // Gallery
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    if (slug) {
      fetchAttraction();
      fetchNearbyAttractions();
    }
    window.scrollTo(0, 0);
  }, [slug]);

  const fetchAttraction = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('attractions')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      setAttraction(data as any);
    } catch (error) {
      console.error('Error fetching:', error);
      setAttraction(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyAttractions = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('attractions')
        .select('id, name, slug, main_image, location, type, short_description')
        .neq('slug', slug) // Exclude current
        .eq('is_active', true)
        .limit(4);

      if (error) throw error;
      if (data) setNearbyAttractions(data as any);
    } catch (error) {
      console.error('Error fetching nearby:', error);
    }
  };

  const allImages = attraction ? [attraction.main_image, ...(attraction.images || [])] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#0071c2] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!attraction) {
    return (
      <div className="min-h-screen bg-white">
        <Nav />
        <Container className="py-20 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Attraction Not Found</h1>
          <Link to="/attractions" className="text-[#0071c2] font-medium hover:underline text-sm">← Back to Attractions</Link>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased text-base">
      <Helmet>
        <title>{attraction.meta_title || attraction.name} | StayKedarnath</title>
        <meta name="description" content={attraction.meta_description || attraction.short_description} />
      </Helmet>

      <Nav />

      {/* 
        HERO SECTION - Split Layout (Reference Inspired) 
        Dark background with blur effect and content overlay
      */}
      <div className="relative bg-[#0f172a] text-white pt-10 pb-16 overflow-hidden">
        {/* Background Blur Effect - DUMMY IMAGE */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80"
            alt="Background"
            className="w-full h-full object-cover blur-3xl scale-110"
          />
        </div>

        <Container className="relative z-10">
          {/* Breadcrumb - Light */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-10">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link to="/attractions" className="hover:text-white transition-colors">Attractions</Link>
            <span>/</span>
            <span className="text-white">{attraction.name}</span>
          </div>

          {/* Grid Layout: 5/12 Text, 7/12 Image for WIDER feel */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* LEFT: Text Content (Col Span 5) */}
            <div className="lg:col-span-5 space-y-5">
              <span className="inline-block px-2.5 py-0.5 bg-blue-500/20 text-blue-200 text-[11px] font-bold uppercase tracking-wider rounded border border-blue-500/30">
                {attraction.type}
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]">
                {attraction.name}
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed font-light">
                {attraction.short_description}
              </p>
              <div className="flex items-center gap-6 pt-2 text-sm text-gray-300 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {attraction.location}
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {attraction.rating} / 5.0
                </div>
              </div>
            </div>

            {/* RIGHT: Gallery Card (Col Span 7) - WIDER ASPECT RATIO */}
            <div className="lg:col-span-7 relative group">
              <div
                className="aspect-[2/1] rounded-lg overflow-hidden shadow-2xl border border-white/10 cursor-pointer relative bg-gray-900"
                onClick={() => { setCurrentImageIndex(0); setLightboxOpen(true); }}
              >
                <img
                  src={attraction.main_image}
                  alt={attraction.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded text-xs font-medium text-white border border-white/10 flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5" />
                  View Gallery
                </div>
              </div>

              {/* Thumbnails Strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                  {allImages.slice(0, 5).map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => { setCurrentImageIndex(idx); setLightboxOpen(true); }}
                      className={`w-24 h-16 shrink-0 rounded overflow-hidden cursor-pointer border-2 transition-all ${currentImageIndex === idx ? 'border-blue-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {allImages.length > 5 && (
                    <button
                      onClick={() => { setCurrentImageIndex(0); setLightboxOpen(true); }}
                      className="w-24 h-16 shrink-0 rounded bg-gray-800 border border-white/10 flex flex-col items-center justify-center text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                    >
                      <span>+{allImages.length - 5}</span>
                      <span>More</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* MAIN CONTENT - Clean White Area */}
      <main className="py-12 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* LEFT COLUMN: Content (2/3) */}
            <div className="lg:col-span-2 space-y-10">

              {/* Highlights List - Clean Bullets */}
              {attraction.tags && attraction.tags.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="text-[#0071c2]">{attraction.name}</span> Highlights
                  </h2>
                  <ul className="grid gap-3">
                    {attraction.tags.map(tag => (
                      <li key={tag} className="flex items-start gap-3 text-[15px] text-gray-700 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                        {tag}
                      </li>
                    ))}
                    {/* Hardcoded extras for demo layout */}
                    <li className="flex items-start gap-3 text-[15px] text-gray-700 leading-relaxed">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 shrink-0" />
                      Enjoy a hassle-free visit with our guided inputs and local connectivity.
                    </li>
                  </ul>
                </section>
              )}

              {/* Overview Prose */}
              <section className="border-t border-gray-100 pt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Overview</h2>
                <div
                  className="attraction-content prose prose-gray max-w-none prose-p:text-[15px] prose-p:leading-7 prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-[#0071c2]"
                  dangerouslySetInnerHTML={{ __html: attraction.description }}
                />
              </section>

              {/* Why Choose StayKedarnath Section */}
              <section className="bg-white py-8 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Card 1 */}
                  <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors group flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0">
                      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <rect x="8" y="14" width="48" height="42" rx="4" fill="#FFE0B2" />
                        <rect x="8" y="14" width="48" height="12" rx="4" fill="#FF9800" />
                        <rect x="16" y="8" width="4" height="12" rx="2" fill="#795548" />
                        <rect x="44" y="8" width="4" height="12" rx="2" fill="#795548" />
                        <circle cx="44" cy="42" r="12" fill="#4CAF50" />
                        <path d="M39 42L42 45L49 38" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="16" y="32" width="8" height="6" rx="1" fill="#FFCC80" />
                        <rect x="28" y="32" width="8" height="6" rx="1" fill="#FFCC80" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">Book Now, Pay at Property</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        <span className="text-[#0071c2] font-medium">FREE cancellation</span> on most rooms
                      </p>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors group flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0">
                      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path d="M20 32V52C20 53.1046 20.8954 54 22 54H26C27.1046 54 28 53.1046 28 52V32C28 30.8954 27.1046 30 26 30H22C20.8954 30 20 30.8954 20 32Z" fill="#FF9800" />
                        <path d="M28 34H40C43.3137 34 46 31.3137 46 28V26C46 24.8954 45.1046 24 44 24H36L38 14C38 11.7909 36.2091 10 34 10C32.8954 10 32 10.8954 32 12V20L28 30V34Z" fill="#FFCC80" />
                        <circle cx="50" cy="18" r="12" fill="#4CAF50" />
                        <path d="M45 18L48 21L55 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">Verified Guest Reviews</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">Trusted info from guests</p>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors group flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0">
                      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <circle cx="32" cy="32" r="24" fill="#FFE0B2" />
                        <ellipse cx="32" cy="32" rx="10" ry="24" stroke="#FF9800" strokeWidth="2" />
                        <line x1="8" y1="32" x2="56" y2="32" stroke="#FF9800" strokeWidth="2" />
                        <path d="M14 20C20 20 26 18 32 18C38 18 44 20 50 20" stroke="#FF9800" strokeWidth="2" />
                        <path d="M14 44C20 44 26 46 32 46C38 46 44 44 50 44" stroke="#FF9800" strokeWidth="2" />
                        <circle cx="50" cy="14" r="10" fill="#2196F3" />
                        <path d="M46 14H54M50 10V18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">100+ Verified Properties</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">Camps, Hotels & more</p>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 transition-colors group flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0">
                      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <circle cx="32" cy="28" r="16" fill="#BBDEFB" />
                        <circle cx="32" cy="24" r="10" fill="#FFE0B2" />
                        <path d="M22 24C22 24 24 22 32 22C40 22 42 24 42 24" stroke="#795548" strokeWidth="2" />
                        <ellipse cx="28" cy="24" rx="1.5" ry="2" fill="#795548" />
                        <ellipse cx="36" cy="24" rx="1.5" ry="2" fill="#795548" />
                        <path d="M30 28C30 28 31 29 32 29C33 29 34 28 34 28" stroke="#795548" strokeWidth="1.5" strokeLinecap="round" />
                        <path d="M18 22V28C18 28 18 32 22 32" stroke="#2196F3" strokeWidth="3" strokeLinecap="round" />
                        <path d="M46 22V28C46 28 46 32 42 32" stroke="#2196F3" strokeWidth="3" strokeLinecap="round" />
                        <rect x="16" y="20" width="6" height="4" rx="2" fill="#2196F3" />
                        <rect x="42" y="20" width="6" height="4" rx="2" fill="#2196F3" />
                        <path d="M24 44C24 40 28 38 32 38C36 38 40 40 40 44V54H24V44Z" fill="#2196F3" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm mb-1">24/7 Customer Support</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">Always here to help</p>
                    </div>
                  </div>

                </div>

                {/* Our Promise Banner */}
                <div className="mt-6 bg-gradient-to-r from-[#003580] to-[#0071c2] rounded-xl p-5 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm mb-0.5">
                      We Only List Properties We'd Stay At Ourselves
                    </h3>
                    <p className="text-white/85 text-xs">
                      Personally visited & verified.
                    </p>
                  </div>
                </div>
              </section>


              {/* FAQ Accordion */}
              {attraction.faqs && attraction.faqs.length > 0 && (
                <section className="pt-8 border-t border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Must Know Before You Go</h2>
                  <div className="space-y-3">
                    {attraction.faqs.map((faq, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-blue-200 transition-colors">
                        <button
                          onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                          className="w-full text-left flex justify-between items-center p-4 bg-gray-50/50 hover:bg-gray-50"
                        >
                          <span className="font-semibold text-gray-900 pr-4 text-sm">{faq.question}</span>
                          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                        </button>
                        {openFaqIndex === idx && (
                          <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed bg-gray-50/50 border-t border-gray-100">
                            <div className="pt-3">{faq.answer}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: Sidebar (Sticky) - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">

                {/* BOOKING CARD */}
                <div className="bg-gradient-to-b from-[#f0f9ff] to-white rounded-xl border border-blue-100 shadow-[0_4px_20px_rgba(0,113,194,0.08)] overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-xs text-blue-600/80 font-bold uppercase tracking-wider mb-1">Starting from</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-900">₹ Active</span>
                          <span className="text-sm text-gray-400 line-through font-medium">₹ High</span>
                        </div>
                        <div className="mt-2.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-[10px] font-bold text-green-700 border border-green-200/60 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" /> Best Price Guaranteed
                          </span>
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-white border border-blue-100 text-[#0071c2] flex items-center justify-center shadow-sm">
                        <BedDouble className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <Link to="/stays" className="block w-full">
                        <button className="w-full py-3.5 bg-[#0071c2] hover:bg-[#005a9c] text-white font-bold rounded-xl shadow-lg shadow-blue-900/10 transition-all hover:shadow-blue-900/20 text-sm uppercase tracking-wide flex items-center justify-center gap-2 group">
                          Explore Stays <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                      <Link to="/packages" className="block w-full">
                        <button className="w-full py-3.5 bg-white border border-blue-200 hover:border-blue-300 text-[#0071c2] font-bold rounded-xl transition-all shadow-sm hover:shadow text-sm">
                          View Packages
                        </button>
                      </Link>
                    </div>

                    <div className="mt-5 pt-4 border-t border-blue-50/50 text-[11px] text-gray-500 text-center flex justify-center gap-4">
                      <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Instant Confirm</span>
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Best Support</span>
                    </div>
                  </div>
                </div>

                {/* Key Details - Text List Style (Clean) */}
                <div className="bg-[#fcfdff] rounded-xl border border-blue-100 p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 font-bold text-sm text-[#0071c2] mb-5 uppercase tracking-wide border-b border-blue-50 pb-3">
                    <Compass className="w-4 h-4" /> Trip Facts
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div className="grid grid-cols-3 gap-2 items-center group">
                      <span className="text-gray-500 font-medium col-span-1 group-hover:text-blue-500 transition-colors">Elevation</span>
                      <span className="font-semibold text-gray-900 col-span-2 text-right">{attraction.elevation || "-"}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-100 my-1 opacity-50" />
                    <div className="grid grid-cols-3 gap-2 items-center group">
                      <span className="text-gray-500 font-medium col-span-1 group-hover:text-blue-500 transition-colors">Duration</span>
                      <span className="font-semibold text-gray-900 col-span-2 text-right">{attraction.time_required}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-100 my-1 opacity-50" />
                    <div className="grid grid-cols-3 gap-2 items-center group">
                      <span className="text-gray-500 font-medium col-span-1 group-hover:text-blue-500 transition-colors">Best Time</span>
                      <span className="font-semibold text-gray-900 col-span-2 text-right">{attraction.best_time}</span>
                    </div>
                    <div className="border-t border-dashed border-gray-100 my-1 opacity-50" />
                    <div className="grid grid-cols-3 gap-2 items-center pt-1">
                      <span className="text-gray-500 font-medium col-span-1">Difficulty</span>
                      <div className="col-span-2 flex justify-end">
                        <span className={`font-bold px-3 py-1 rounded-md text-[10px] uppercase border ${difficultyColors[attraction.difficulty]}`}>
                          {attraction.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Need Help Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0071c2] flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm mb-1">Have questions?</p>
                      <p className="text-xs text-gray-600 mb-3 leading-relaxed">Speak to our local experts in Kedarnath for the best advice.</p>
                      <a href="https://wa.me/919876543210" className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#0071c2] hover:bg-[#005a9c] px-3 py-1.5 rounded-lg transition-colors">
                        Call or WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* NEARBY ATTRACTIONS (Premium Style with Real Data) */}
          <div className="mt-16 pt-10 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center md:text-left">More Attractions in Kedarnath</h2>

            {nearbyAttractions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {nearbyAttractions.map((item, idx) => (
                  <Link to={`/attractions/${item.slug}`} key={idx} className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#0071c2] transition-colors duration-300">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <img
                        src={item.main_image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-wider bg-[#0071c2] px-2 py-0.5 rounded inline-block mb-1 shadow-sm">{item.type}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-[#0071c2] transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed h-[36px]">
                        {item.short_description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 text-sm">
                No other attractions found.
              </div>
            )}

            <div className="text-center mt-10">
              <Link to="/attractions" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0071c2] hover:bg-[#005a9c] text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                View All Attractions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </Container>

      </main>

      {/* Lightbox Overlay */}
      {
        lightboxOpen && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={allImages[currentImageIndex]}
              alt="Gallery"
              className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
            />
            {allImages.length > 1 && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                {allImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-110' : 'bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )
      }
    </div >
  );
};

export default AttractionDetail;
