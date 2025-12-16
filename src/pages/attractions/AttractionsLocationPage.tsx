/**
 * AttractionsLocationPage.tsx - Programmatic SEO Page for Attractions by City
 * 
 * URL Pattern: /attractions/in/[city-slug]
 * Example: /attractions/in/haridwar, /attractions/in/rishikesh
 * 
 * Shows tourist attractions, temples, and places to visit in each city.
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  MapPin,
  Mountain,
  Star,
  ChevronRight,
  Phone,
  MessageCircle,
  ArrowRight,
  Clock,
  Camera,
  Compass,
  Loader2,
  Calendar,
  Sun,
  Landmark,
  TreePine,
  Waves,
  Heart
} from "lucide-react";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIOptimizedFAQ, { FAQItem } from "@/components/SEO/AIOptimizedFAQ";
import { supabase } from "@/integrations/supabase/client";
import {
  generateFAQSchema,
  generateBreadcrumbSchema,
  combineSchemas
} from "@/utils/seoSchemas";

// Types
interface CityData {
  slug: string;
  name: string;
  type: string;
  state: string;
  elevation: string;
  description: string;
  nearby_attractions?: string[];
  long_description?: string;
  best_time_to_visit?: string;
  history?: string;
  faqs?: { question: string; answer: string }[];
  is_featured?: boolean;
}

interface Attraction {
  id: string;
  slug: string;
  name: string;
  type: string;
  description: string;
  short_description: string;
  main_image: string;
  distance?: string;
  time_required?: string;
  best_time?: string;
  rating?: number;
  tags?: string[];
  location?: string;
}

// Get icon based on attraction type
const getAttractionIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'temple': return Landmark;
    case 'trek': return Mountain;
    case 'waterfall': return Waves;
    case 'lake': return Waves;
    case 'viewpoint': return Camera;
    case 'nature': return TreePine;
    default: return MapPin;
  }
};

// Generate FAQs for this location
const generateAttractionFAQs = (city: CityData, attractions: Attraction[]): FAQItem[] => {
  const faqs: FAQItem[] = [
    {
      question: `What are the best places to visit in ${city.name}?`,
      answer: `${city.name} offers many attractions including ${city.nearby_attractions?.slice(0, 3).join(', ') || 'temples, ghats, and natural sites'}. ${attractions.length > 0 ? `Popular spots include ${attractions.slice(0, 3).map(a => a.name).join(', ')}.` : ''}`
    },
    {
      question: `How many days are enough for ${city.name} sightseeing?`,
      answer: `For complete sightseeing in ${city.name}, we recommend 1-2 days. This allows you to visit the main attractions comfortably. If you're on a Kedarnath pilgrimage, half a day is sufficient for the key sites.`
    },
    {
      question: `Is ${city.name} safe for tourists?`,
      answer: `Yes, ${city.name} is safe for tourists including solo travelers and families. It's a pilgrimage town with a peaceful atmosphere. Standard travel precautions apply.`
    }
  ];

  // Add city-specific FAQs if available
  if (city.faqs) {
    faqs.push(...city.faqs.filter(f =>
      f.question.toLowerCase().includes('visit') ||
      f.question.toLowerCase().includes('see') ||
      f.question.toLowerCase().includes('attraction')
    ));
  }

  return faqs.slice(0, 6);
};

const AttractionsLocationPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const [city, setCity] = useState<CityData | null>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch city data
        const { data: cityData, error: cityError } = await supabase
          .from('seo_cities')
          .select('*')
          .eq('slug', citySlug)
          .eq('is_active', true)
          .single();

        if (cityError || !cityData) {
          setError(true);
          return;
        }

        setCity(cityData as CityData);

        // Fetch attractions for this location
        const { data: attractionsData } = await supabase
          .from('attractions')
          .select('*')
          .eq('is_active', true)
          .or(`location.ilike.%${cityData.name}%,tags.cs.{${cityData.name}}`)
          .order('rating', { ascending: false })
          .limit(12);

        if (attractionsData) {
          setAttractions(attractionsData as Attraction[]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (citySlug) {
      fetchData();
    }
  }, [citySlug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading attractions...</p>
        </div>
      </div>
    );
  }

  // 404 if city not found
  if (error || !city) {
    return <Navigate to="/attractions" replace />;
  }

  // Generate SEO data
  const pageTitle = `Places to Visit in ${city.name} | Tourist Attractions & Sightseeing`;
  const pageDescription = `Discover the best tourist attractions in ${city.name}. Explore temples, viewpoints, and natural wonders. Complete guide for ${city.name} sightseeing during your Kedarnath trip.`;
  const canonicalUrl = `https://staykedarnath.in/attractions/in/${city.slug}`;

  // Generate schemas
  const faqItems = generateAttractionFAQs(city, attractions);
  const faqSchema = generateFAQSchema(faqItems);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://staykedarnath.in" },
    { name: "Attractions", url: "https://staykedarnath.in/attractions" },
    { name: `${city.name} Attractions`, url: canonicalUrl }
  ]);

  // Tourist Attraction List Schema
  const attractionListSchema = attractions.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Tourist Attractions in ${city.name}`,
    "description": pageDescription,
    "itemListElement": attractions.map((attraction, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "TouristAttraction",
        "name": attraction.name,
        "description": attraction.short_description,
        "image": attraction.main_image,
        "url": `https://staykedarnath.in/attractions/${attraction.slug}`,
        "aggregateRating": attraction.rating ? {
          "@type": "AggregateRating",
          "ratingValue": attraction.rating,
          "reviewCount": 50
        } : undefined
      }
    }))
  } : null;

  const allSchemas = combineSchemas(faqSchema, breadcrumbSchema, attractionListSchema);

  const handleWhatsAppEnquiry = () => {
    const message = `Hi! I'm planning to visit ${city.name} and need help with sightseeing. Can you suggest a day tour?`;
    window.open(`https://wa.me/919027475942?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        {allSchemas && (
          <script type="application/ld+json">
            {JSON.stringify(allSchemas)}
          </script>
        )}
      </Helmet>

      <Nav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-900 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`
          }} />
        </div>

        <Container className="relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-emerald-200 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/attractions" className="hover:text-white transition-colors">Attractions</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{city.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <MapPin className="w-3 h-3 mr-1" /> {city.state}
              </Badge>
              <Badge className="bg-white/10 text-white/70 border-white/20">
                <Mountain className="w-3 h-3 mr-1" /> {city.elevation}
              </Badge>
              {city.is_featured && (
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                  <Star className="w-3 h-3 mr-1" /> Popular Destination
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Places to Visit in {city.name}
            </h1>

            <p className="text-xl text-emerald-100/80 mb-6">
              {city.description || `Explore the best tourist attractions, temples, and natural wonders in ${city.name}. Perfect stop during your Kedarnath pilgrimage.`}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white">
                <Compass className="w-4 h-4" />
                <span>{attractions.length || city.nearby_attractions?.length || '5+'} Attractions</span>
              </div>
              {city.best_time_to_visit && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white">
                  <Sun className="w-4 h-4" />
                  <span>Best: {city.best_time_to_visit.split('.')[0]}</span>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleWhatsAppEnquiry}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Plan My Sightseeing
              </Button>
              <Link to={`/taxi/${city.slug}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Book Taxi for Tour
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Attractions from Database */}
      {attractions.length > 0 && (
        <section className="py-16 bg-white">
          <Container>
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Top Attractions in {city.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attractions.map((attraction, index) => {
                const Icon = getAttractionIcon(attraction.type);
                return (
                  <motion.div
                    key={attraction.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/attractions/${attraction.slug}`}>
                      <Card className="h-full hover:shadow-xl transition-all group overflow-hidden">
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={attraction.main_image || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600`}
                            alt={attraction.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 text-gray-700">
                              <Icon className="w-3 h-3 mr-1" />
                              {attraction.type}
                            </Badge>
                          </div>
                          {attraction.rating && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-semibold">{attraction.rating}</span>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                            {attraction.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {attraction.short_description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {attraction.time_required && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {attraction.time_required}
                              </span>
                            )}
                            {attraction.distance && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {attraction.distance}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Nearby Attractions from City Data */}
      {city.nearby_attractions && city.nearby_attractions.length > 0 && (
        <section className="py-12 bg-gray-50">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Must-Visit Places Near {city.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {city.nearby_attractions.map((attraction, index) => (
                <motion.div
                  key={attraction}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                        <Heart className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
                        {attraction}
                      </span>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* About Section */}
      {city.long_description && (
        <section className="py-16 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About {city.name}
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                {city.long_description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* History Section */}
      {city.history && (
        <section className="py-12 bg-amber-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                History & Significance
              </h2>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 md:p-8">
                  <p className="text-gray-600 leading-relaxed">{city.history}</p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>
      )}

      {/* Related Links */}
      <section className="py-12 bg-gradient-to-br from-emerald-600 to-teal-700">
        <Container>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Plan Your Complete {city.name} Trip
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to={`/taxi/${city.slug}`}>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center text-white">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Compass className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold mb-2">Book a Taxi</h3>
                  <p className="text-emerald-100 text-sm">For sightseeing & transfers</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={`/stays/location/${city.slug}`}>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center text-white">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold mb-2">Find Hotels</h3>
                  <p className="text-emerald-100 text-sm">Stay options in {city.name}</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/packages">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center text-white">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold mb-2">Tour Packages</h3>
                  <p className="text-emerald-100 text-sm">All-inclusive trips</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </Container>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <Container>
          <AIOptimizedFAQ
            title={`${city.name} Attractions FAQs`}
            description={`Common questions about sightseeing and tourist places in ${city.name}`}
            faqs={faqItems}
            showSchema={false}
          />
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default AttractionsLocationPage;

