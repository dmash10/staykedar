/**
 * TravelGuidePage.tsx - Comprehensive Travel Guide for Each City
 * 
 * URL Pattern: /guide/[city-slug]
 * Example: /guide/haridwar, /guide/rishikesh
 * 
 * This is a "pillar page" - a comprehensive guide covering everything about a city.
 * Great for SEO as it targets broad keywords like "Haridwar travel guide"
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
  CloudSun,
  Utensils,
  Hotel,
  Car,
  Plane,
  Train,
  BookOpen,
  Map,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Info,
  Navigation,
  Wallet
} from "lucide-react";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  position_on_route: number;
  coordinates?: { lat: number; lng: number };
  connectivity?: {
    next_stop: string | null;
    distance_to_next: string | null;
    nearest_airport: string;
    nearest_railway: string;
  };
  nearby_attractions?: string[];
  taxi_rates?: {
    drop_sonprayag_sedan: number;
    drop_sonprayag_suv: number;
  };
  // Rich content
  long_description?: string;
  how_to_reach?: string;
  best_time_to_visit?: string;
  weather_info?: string;
  local_food?: string;
  history?: string;
  route_description?: string;
  taxi_tip?: string;
  stay_tip?: string;
  avg_hotel_price?: string;
  faqs?: { question: string; answer: string }[];
  is_featured?: boolean;
}

// Table of contents items
const tocItems = [
  { id: "overview", label: "Overview" },
  { id: "how-to-reach", label: "How to Reach" },
  { id: "best-time", label: "Best Time to Visit" },
  { id: "attractions", label: "Places to Visit" },
  { id: "where-to-stay", label: "Where to Stay" },
  { id: "food", label: "Food & Dining" },
  { id: "transport", label: "Local Transport" },
  { id: "tips", label: "Travel Tips" },
  { id: "faqs", label: "FAQs" },
];

const TravelGuidePage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const [city, setCity] = useState<CityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
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
          <p className="text-gray-600">Loading travel guide...</p>
        </div>
      </div>
    );
  }

  // 404 if city not found
  if (error || !city) {
    return <Navigate to="/" replace />;
  }

  // Generate SEO data
  const pageTitle = `${city.name} Travel Guide 2026 | Complete Kedarnath Yatra Guide`;
  const pageDescription = `Complete travel guide to ${city.name} for Kedarnath pilgrims. How to reach, best time to visit, where to stay, things to do, local food & essential tips.`;
  const canonicalUrl = `https://staykedarnath.in/guide/${city.slug}`;

  // Combine all FAQs
  const allFaqs: FAQItem[] = city.faqs || [];

  // Generate schemas
  const faqSchema = allFaqs.length > 0 ? generateFAQSchema(allFaqs) : null;
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://staykedarnath.in" },
    { name: "Travel Guides", url: "https://staykedarnath.in/guide" },
    { name: `${city.name} Guide`, url: canonicalUrl }
  ]);

  // TravelGuide Schema (Article)
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TravelGuide",
    "name": pageTitle,
    "description": pageDescription,
    "url": canonicalUrl,
    "author": {
      "@type": "Organization",
      "name": "StayKedarnath"
    },
    "publisher": {
      "@type": "Organization",
      "name": "StayKedarnath",
      "logo": {
        "@type": "ImageObject",
        "url": "https://staykedarnath.in/logo.png"
      }
    },
    "about": {
      "@type": "Place",
      "name": city.name,
      "address": {
        "@type": "PostalAddress",
        "addressRegion": city.state,
        "addressCountry": "IN"
      }
    },
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  const allSchemas = combineSchemas(faqSchema, breadcrumbSchema, articleSchema);

  const handleWhatsAppEnquiry = () => {
    const message = `Hi! I'm planning a trip to ${city.name} for Kedarnath Yatra. Can you help me plan?`;
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
        <meta property="og:type" content="article" />
        {allSchemas && (
          <script type="application/ld+json">
            {JSON.stringify(allSchemas)}
          </script>
        )}
      </Helmet>

      <Nav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L100 50L50 100L0 50L50 0z' fill='none' stroke='%23ffffff' stroke-opacity='0.1' stroke-width='1'/%3E%3C/svg%3E")`
          }} />
        </div>

        <Container className="relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-indigo-200 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Travel Guide</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{city.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">
              <BookOpen className="w-3 h-3 mr-1" /> Complete Travel Guide
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {city.name} Travel Guide 2026
            </h1>

            <p className="text-xl text-indigo-100/80 mb-6">
              Everything you need to know for your {city.name} trip during Kedarnath Yatra
            </p>

            {/* Quick Facts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Mountain className="w-6 h-6 text-indigo-300 mx-auto mb-2" />
                <p className="text-indigo-200 text-xs">Elevation</p>
                <p className="text-white font-bold">{city.elevation}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <MapPin className="w-6 h-6 text-indigo-300 mx-auto mb-2" />
                <p className="text-indigo-200 text-xs">State</p>
                <p className="text-white font-bold">{city.state}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Navigation className="w-6 h-6 text-indigo-300 mx-auto mb-2" />
                <p className="text-indigo-200 text-xs">Route Position</p>
                <p className="text-white font-bold">Stop #{city.position_on_route}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Wallet className="w-6 h-6 text-indigo-300 mx-auto mb-2" />
                <p className="text-indigo-200 text-xs">Hotels From</p>
                <p className="text-white font-bold">{city.avg_hotel_price || "₹500"}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleWhatsAppEnquiry}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Plan My Trip
              </Button>
              <Link to={`/taxi/${city.slug}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Car className="w-5 h-5 mr-2" />
                  Book Taxi
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Main Content with Sidebar */}
      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Table of Contents */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="border-0 shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">In This Guide</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <nav className="space-y-1">
                      {tocItems.map((item) => (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === item.id
                              ? 'bg-indigo-100 text-indigo-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          onClick={() => setActiveSection(item.id)}
                        >
                          {item.label}
                        </a>
                      ))}
                    </nav>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card className="border-0 shadow-md mt-4">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Quick Links</p>
                    <div className="space-y-2">
                      <Link to={`/taxi/${city.slug}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <Car className="w-4 h-4" /> Taxi from {city.name}
                      </Link>
                      <Link to={`/stays/location/${city.slug}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <Hotel className="w-4 h-4" /> Hotels in {city.name}
                      </Link>
                      <Link to={`/attractions/in/${city.slug}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                        <Camera className="w-4 h-4" /> Attractions
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-12">
              {/* Overview */}
              <section id="overview">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-6 h-6 text-indigo-600" />
                  Overview
                </h2>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    {city.long_description ? (
                      <div className="prose prose-lg max-w-none text-gray-600">
                        {city.long_description.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 leading-relaxed">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 leading-relaxed">{city.description}</p>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* How to Reach */}
              <section id="how-to-reach">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Map className="w-6 h-6 text-indigo-600" />
                  How to Reach {city.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {city.connectivity?.nearest_airport && (
                    <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-sky-50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Plane className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-gray-900">By Air</h3>
                        </div>
                        <p className="text-gray-600 text-sm">{city.connectivity.nearest_airport}</p>
                      </CardContent>
                    </Card>
                  )}
                  {city.connectivity?.nearest_railway && (
                    <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Train className="w-5 h-5 text-green-600" />
                          </div>
                          <h3 className="font-bold text-gray-900">By Rail</h3>
                        </div>
                        <p className="text-gray-600 text-sm">{city.connectivity.nearest_railway}</p>
                      </CardContent>
                    </Card>
                  )}
                  <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Car className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="font-bold text-gray-900">By Road</h3>
                      </div>
                      <p className="text-gray-600 text-sm">
                        Well connected via national highways.
                        {city.taxi_rates?.drop_sonprayag_sedan && city.taxi_rates.drop_sonprayag_sedan > 0 && (
                          <span> Taxi to Sonprayag: ₹{city.taxi_rates.drop_sonprayag_sedan.toLocaleString()}</span>
                        )}
                      </p>
                    </CardContent>
                  </Card>
                </div>
                {city.how_to_reach && (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="prose prose-sm max-w-none text-gray-600">
                        {city.how_to_reach.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-3" dangerouslySetInnerHTML={{
                            __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          }} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </section>

              {/* Best Time to Visit */}
              <section id="best-time">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  Best Time to Visit
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {city.best_time_to_visit && (
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Sun className="w-6 h-6 text-amber-500" />
                          <h3 className="font-bold text-gray-900">Best Season</h3>
                        </div>
                        <p className="text-gray-600">{city.best_time_to_visit}</p>
                      </CardContent>
                    </Card>
                  )}
                  {city.weather_info && (
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <CloudSun className="w-6 h-6 text-blue-500" />
                          <h3 className="font-bold text-gray-900">Weather</h3>
                        </div>
                        <p className="text-gray-600">{city.weather_info}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </section>

              {/* Attractions */}
              <section id="attractions">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-6 h-6 text-indigo-600" />
                  Places to Visit in {city.name}
                </h2>
                {city.nearby_attractions && city.nearby_attractions.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {city.nearby_attractions.map((attraction, index) => (
                      <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-3">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Star className="w-4 h-4 text-indigo-600" />
                          </div>
                          <span className="text-gray-700 text-sm font-medium">{attraction}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6 text-center text-gray-500">
                      <p>Attraction details coming soon. Contact us for sightseeing recommendations.</p>
                    </CardContent>
                  </Card>
                )}
                <div className="mt-4">
                  <Link to={`/attractions/in/${city.slug}`}>
                    <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                      View All Attractions <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </section>

              {/* Where to Stay */}
              <section id="where-to-stay">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Hotel className="w-6 h-6 text-indigo-600" />
                  Where to Stay in {city.name}
                </h2>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      {city.stay_tip || `${city.name} offers various accommodation options from budget dharamshalas to comfortable hotels. Book in advance during peak season (May-June).`}
                    </p>
                    {city.avg_hotel_price && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Wallet className="w-5 h-5 text-green-600" />
                        <span>Average hotel price: <strong>{city.avg_hotel_price}</strong> per night</span>
                      </div>
                    )}
                    <div className="mt-4">
                      <Link to={`/stays/location/${city.slug}`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                          View Hotels in {city.name} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Food */}
              {city.local_food && (
                <section id="food">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-indigo-600" />
                    Food & Dining
                  </h2>
                  <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-amber-50">
                    <CardContent className="p-6">
                      <p className="text-gray-600 leading-relaxed">{city.local_food}</p>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Local Transport */}
              <section id="transport">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="w-6 h-6 text-indigo-600" />
                  Local Transport
                </h2>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <p className="text-gray-600 mb-4">
                      {city.taxi_tip || `Local taxi and auto services are available in ${city.name}. For Kedarnath journey, book a taxi in advance.`}
                    </p>
                    {city.taxi_rates && city.taxi_rates.drop_sonprayag_sedan > 0 && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900 mb-2">Taxi Rates from {city.name}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Sedan:</span>
                            <span className="ml-2 font-bold text-blue-600">₹{city.taxi_rates.drop_sonprayag_sedan.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">SUV:</span>
                            <span className="ml-2 font-bold text-blue-600">₹{city.taxi_rates.drop_sonprayag_suv?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <Link to={`/taxi/${city.slug}`}>
                        <Button variant="outline">
                          Book Taxi from {city.name} <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Travel Tips */}
              <section id="tips">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-indigo-600" />
                  Essential Travel Tips
                </h2>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Carry valid ID proof (Aadhaar/Passport) for registration</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Book accommodation in advance during peak season (May-June)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Carry warm clothes even in summer - mountain weather is unpredictable</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Keep cash handy - ATMs may not work in remote areas</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">Check weather and road conditions before traveling in monsoon</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </section>

              {/* History */}
              {city.history && (
                <section id="history">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    History & Significance
                  </h2>
                  <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50">
                    <CardContent className="p-6">
                      <p className="text-gray-600 leading-relaxed">{city.history}</p>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* FAQs */}
              {allFaqs.length > 0 && (
                <section id="faqs">
                  <AIOptimizedFAQ
                    title={`${city.name} Travel FAQs`}
                    description={`Common questions about traveling to ${city.name} for Kedarnath Yatra`}
                    faqs={allFaqs}
                  />
                </section>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-indigo-600 to-purple-700">
        <Container>
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Explore {city.name}?
            </h2>
            <p className="text-indigo-100 mb-6">
              Let us help you plan the perfect trip
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100"
                onClick={handleWhatsAppEnquiry}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with Expert
              </Button>
              <a href="tel:+919027475942">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default TravelGuidePage;

