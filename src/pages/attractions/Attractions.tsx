import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Star,
  ArrowRight,
  Search,
  Mountain,
  Sparkles,
  Camera,
  TreePine,
  Grid3X3,
  List,
  ChevronDown
} from "lucide-react";
import Container from "../../components/Container";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { TransitionLink } from "@/components/TransitionLink";

// Define attraction data interface
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
  { id: "Religious", label: "Temples", icon: <Mountain className="w-4 h-4" /> },
  { id: "Nature", label: "Nature", icon: <TreePine className="w-4 h-4" /> },
  { id: "Adventure", label: "Adventure", icon: <Camera className="w-4 h-4" /> },
];

const difficultyConfig: Record<string, { bg: string; text: string }> = {
  "Easy": { bg: "bg-emerald-500/30", text: "text-emerald-300" },
  "Moderate": { bg: "bg-amber-500/30", text: "text-amber-300" },
  "Moderate to Difficult": { bg: "bg-orange-500/30", text: "text-orange-300" },
  "Difficult": { bg: "bg-red-500/30", text: "text-red-300" }
};

const DEFAULT_BG = "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2070";

// Helper to get cached attractions
const getCachedAttractions = (): Attraction[] => {
  try {
    const cached = localStorage.getItem('attractions_cache');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Return cache if less than 5 minutes old
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return data;
      }
    }
  } catch (e) { }
  return [];
};

const Attractions = () => {
  // Initialize from cache for instant display
  const [attractions, setAttractions] = useState<Attraction[]>(() => getCachedAttractions());
  const [loading, setLoading] = useState(() => getCachedAttractions().length === 0);
  // Initialize from localStorage to prevent flash/loading delay
  const [bgLoading, setBgLoading] = useState(() => !localStorage.getItem('attractions_bg_style'));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [backgroundImage, setBackgroundImage] = useState(() => localStorage.getItem('attractions_bg') || DEFAULT_BG);
  const [backgroundStyle, setBackgroundStyle] = useState<'image' | 'white'>(() =>
    (localStorage.getItem('attractions_bg_style') as 'image' | 'white') || 'white'
  );
  const [heroImage, setHeroImage] = useState<string>(() => localStorage.getItem('attractions_hero_image') || "");

  useEffect(() => {
    fetchAttractions();
    fetchBackground();
  }, []);

  const fetchBackground = async () => {
    try {
      const { data } = await supabase
        .from('site_content')
        .select('value, key')
        .in('key', ['attractions_background', 'attractions_bg_style', 'attractions_hero_image']);

      if (data) {
        const bgImage = data.find((d: any) => d.key === 'attractions_background');
        if (bgImage?.value) {
          setBackgroundImage(bgImage.value);
          localStorage.setItem('attractions_bg', bgImage.value);
        }

        const bgStyle = data.find((d: any) => d.key === 'attractions_bg_style');
        if (bgStyle?.value) {
          setBackgroundStyle(bgStyle.value as 'image' | 'white');
          localStorage.setItem('attractions_bg_style', bgStyle.value);
        }

        const hero = data.find((d: any) => d.key === 'attractions_hero_image');
        if (hero?.value) {
          setHeroImage(hero.value);
          localStorage.setItem('attractions_hero_image', hero.value);
        }
      }
    } catch (error) {
      // Use default if not set
    } finally {
      setBgLoading(false);
    }
  };

  const fetchAttractions = async () => {
    try {
      // Try to load from cache first for instant display
      const cached = localStorage.getItem('attractions_cache');
      if (cached) {
        const { data: cachedData, timestamp } = JSON.parse(cached);
        // Use cache if less than 5 minutes old - skip fresh fetch
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setAttractions(cachedData);
          setLoading(false);
          return; // Don't fetch again, use cache
        }
      }

      // Fetch fresh data only if cache is stale or missing
      const { data, error } = await (supabase as any)
        .from('attractions')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false })
        .order('id', { ascending: true }); // Stable sort by id

      if (error) throw error;
      if (data) {
        setAttractions(data as any);
        // Cache the results
        localStorage.setItem('attractions_cache', JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error fetching attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttractions = attractions.filter(attraction => {
    const matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (attraction.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = activeCategory === "all" ? true : attraction.type === activeCategory;
    return matchesSearch && matchesType;
  });

  // Card Component - Clean Minimal Design with smooth image loading
  const AttractionCard = ({ attraction }: { attraction: Attraction }) => {
    // Check if image was already loaded in this session (sessionStorage clears on refresh)
    const imageKey = `img_loaded_${attraction.id}`;
    const wasLoadedInSession = typeof window !== 'undefined' && sessionStorage.getItem(imageKey) === 'true';

    const [imageLoaded, setImageLoaded] = useState(wasLoadedInSession);

    const handleImageLoad = () => {
      setImageLoaded(true);
      // Mark as loaded in session so it shows instantly on navigation back
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(imageKey, 'true');
      }
    };

    return (
      <TransitionLink to={`/attractions/${attraction.slug}`} className="block" transitionStyle="scale">
        {/* Compact Card with Full-Bleed Image */}
        <div className="group relative aspect-[4/3] sm:aspect-[3/2] rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-slate-200">
          {/* Full Background Image with fade-in */}
          <img
            src={attraction.main_image}
            alt={attraction.name}
            loading="lazy"
            onLoad={handleImageLoad}
            className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
          />

          {/* Gradient Overlay - Simpler */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'
            }`} />

          {/* Rating Badge - Top Right */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-xs sm:text-sm font-bold">{attraction.rating}</span>
          </div>

          {/* Featured Badge */}
          {attraction.is_featured && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
              <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] sm:text-xs font-bold rounded-md flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-white" /> Featured
              </span>
            </div>
          )}

          {/* Bottom - Title Only */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4">
            <h3 className="text-sm sm:text-lg font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors duration-300 drop-shadow-lg">
              {attraction.name}
            </h3>
          </div>
        </div>
      </TransitionLink>
    );
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen relative">
        <Helmet>
          <title>Attractions Near Kedarnath | StayKedarnath</title>
          <meta name="description" content="Explore the most beautiful and sacred attractions near Kedarnath. Plan your visit to these must-see destinations during your pilgrimage." />
        </Helmet>

        {/* Background - Conditional based on style (only render after loaded) */}
        {!bgLoading && (
          backgroundStyle === 'image' ? (
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
              }}
            >
              <div className="absolute inset-0 bg-black/50" />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-white" />
          )
        )}

        {/* Content */}
        <div className="relative z-10 pb-16">
          {/* Hero Banner Section */}
          <section className="relative pt-16 pb-8">
            {/* Hero Image Container */}
            {heroImage && (
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={heroImage}
                  alt="Hero Banner"
                  className="w-full h-full object-cover"
                />
                {/* Subtle dark overlay for text visibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
              </div>
            )}

            <Container className="relative z-10">
              {/* Badge */}
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 backdrop-blur-md border rounded-full text-sm font-medium mb-4 ${heroImage
                  ? 'bg-white/20 border-white/30 text-white'
                  : backgroundStyle === 'white'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white/10 border-white/20 text-white/80'
                  }`}
              >
                <MapPin className="w-4 h-4" />
                Discover Sacred Destinations
              </span>

              <div className="mb-6">
                <h1 className={`text-3xl md:text-5xl font-bold mb-3 ${heroImage ? 'text-white drop-shadow-lg' : backgroundStyle === 'white' ? 'text-slate-800' : 'text-white'}`}>
                  Explore the <span className={`${heroImage ? 'text-sky-300' : 'text-[#0071c2]'}`}>Divine Himalayas</span>
                </h1>
                <p className={`max-w-2xl ${heroImage ? 'text-white/90 drop-shadow' : backgroundStyle === 'white' ? 'text-slate-600' : 'text-white/60'}`}>
                  Discover breathtaking temples, pristine valleys, and sacred destinations near Kedarnath
                </p>
              </div>

              {/* Filter Bar */}
              <div
                className={`flex flex-col md:flex-row items-center gap-4 justify-between p-4 backdrop-blur-md rounded-xl border transition-all duration-300 ${backgroundStyle === 'white'
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-white/5 border-white/10'
                  }`}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-sm font-medium ${backgroundStyle === 'white' ? 'text-slate-500' : 'text-white/60'}`}>Filter by</span>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 ${activeCategory === cat.id
                        ? "bg-[#0071c2] text-white shadow-md scale-105"
                        : backgroundStyle === 'white'
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-102"
                          : "bg-white/10 text-white/70 hover:bg-white/20 hover:scale-102"
                        }`}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${backgroundStyle === 'white' ? 'text-slate-400' : 'text-white/40'}`} />
                    <input
                      type="text"
                      placeholder="Search attractions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full md:w-56 pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none transition-all ${backgroundStyle === 'white'
                        ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-400'
                        : 'bg-white/10 border-white/10 text-white placeholder-white/40 focus:border-white/30'
                        }`}
                    />
                  </div>

                  <div className={`flex rounded-lg p-1 ${backgroundStyle === 'white' ? 'bg-slate-100' : 'bg-white/10'}`}>
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded transition-colors ${viewMode === "grid"
                        ? backgroundStyle === 'white' ? "bg-white text-slate-800 shadow-sm" : "bg-white/20 text-white"
                        : backgroundStyle === 'white' ? "text-slate-500 hover:text-slate-800" : "text-white/60 hover:text-white"
                        }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded transition-colors ${viewMode === "list"
                        ? backgroundStyle === 'white' ? "bg-white text-slate-800 shadow-sm" : "bg-white/20 text-white"
                        : backgroundStyle === 'white' ? "text-slate-500 hover:text-slate-800" : "text-white/60 hover:text-white"
                        }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* Results */}
          <section className="py-8">
            <Container>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${backgroundStyle === 'white' ? 'text-slate-800' : 'text-white'}`}>
                  Top Results
                  <span className={`font-normal text-base transition-all duration-300 ${backgroundStyle === 'white' ? 'text-slate-400' : 'text-white/40'}`}>
                    ({filteredAttractions.length})
                  </span>
                </h2>
              </div>

              {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={`aspect-[4/3] sm:aspect-[3/2] rounded-xl sm:rounded-2xl overflow-hidden animate-pulse ${backgroundStyle === 'white' ? 'bg-slate-200' : 'bg-white/10'}`} />
                  ))}
                </div>
              )}

              {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {filteredAttractions.map((attraction) => (
                    <AttractionCard key={attraction.id} attraction={attraction} />
                  ))}
                </div>
              )}

              {!loading && filteredAttractions.length === 0 && (
                <div className="text-center py-16">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${backgroundStyle === 'white' ? 'bg-slate-100' : 'bg-white/5'}`}>
                    <Search className={`w-8 h-8 ${backgroundStyle === 'white' ? 'text-slate-400' : 'text-white/30'}`} />
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${backgroundStyle === 'white' ? 'text-slate-800' : 'text-white'}`}>No attractions found</h3>
                  <p className={`mb-6 ${backgroundStyle === 'white' ? 'text-slate-500' : 'text-white/50'}`}>Try adjusting your search or filters</p>
                  <button
                    onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                    className="px-6 py-2.5 bg-[#0071c2] hover:bg-[#005a9c] text-white font-medium rounded-lg transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </Container>
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Attractions;

