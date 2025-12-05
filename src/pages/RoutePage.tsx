/**
 * RoutePage.tsx - Programmatic SEO Page for Travel Routes
 * 
 * URL Pattern: /route/[route-slug]
 * Example: /route/haridwar-to-kedarnath, /route/delhi-to-kedarnath
 * 
 * Shows detailed route information, travel options, stops, and pricing.
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import {
  MapPin,
  Navigation,
  Clock,
  ChevronRight,
  Phone,
  MessageCircle,
  ArrowRight,
  Car,
  Bus,
  Train,
  Loader2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Fuel,
  Shield,
  CloudSun,
  Mountain,
  Camera,
  Milestone,
  RouteIcon
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
interface RouteStop {
  name: string;
  description: string;
  distance_from_start: number;
  time_needed: string;
}

interface RouteData {
  id: string;
  slug: string;
  from_city: string;
  to_city: string;
  distance_km: number;
  duration_hours: number;
  route_type: string;
  difficulty: string;
  meta_title: string;
  meta_description: string;
  short_description: string;
  long_description: string;
  route_highlights: string[];
  route_images: string[];
  main_image: string;
  how_to_travel: string;
  road_conditions: string;
  best_time_to_travel: string;
  stops_along_way: RouteStop[];
  taxi_rates: {
    sedan: number;
    suv: number;
    tempo: number;
  };
  bus_info: string;
  shared_taxi_info: string;
  weather_info: string;
  safety_tips: string;
  faqs: { question: string; answer: string }[];
  is_popular: boolean;
  is_featured: boolean;
}

// Generate default FAQs if none exist
const generateDefaultFAQs = (route: RouteData): FAQItem[] => {
  return [
    {
      question: `What is the distance from ${route.from_city} to ${route.to_city}?`,
      answer: `The distance from ${route.from_city} to ${route.to_city} is approximately ${route.distance_km} km. The journey typically takes ${route.duration_hours} hours by car, depending on road conditions and traffic.`
    },
    {
      question: `What is the best way to travel from ${route.from_city} to ${route.to_city}?`,
      answer: `The most popular option is by taxi or private car, which offers flexibility and comfort. ${route.bus_info ? 'Government and private buses are also available.' : 'Book a taxi in advance during peak season.'}`
    },
    {
      question: `How much does a taxi cost from ${route.from_city} to ${route.to_city}?`,
      answer: route.taxi_rates?.sedan > 0 
        ? `Taxi fares start from ₹${route.taxi_rates.sedan?.toLocaleString()} for a Sedan and ₹${route.taxi_rates.suv?.toLocaleString()} for an SUV (Innova). Prices may vary based on season.`
        : `Taxi fares vary by vehicle type and season. Contact us for current rates and to book your taxi.`
    },
    {
      question: `What is the best time to travel from ${route.from_city} to ${route.to_city}?`,
      answer: route.best_time_to_travel || `The best time to travel is from May to June and September to October when the weather is pleasant and roads are in good condition. Avoid monsoon season (July-August) due to landslide risks.`
    },
    {
      question: `Is the road from ${route.from_city} to ${route.to_city} safe?`,
      answer: route.safety_tips || `The route is generally safe but involves mountain roads. Hire experienced hill drivers, avoid night travel, and check weather conditions before starting. The road is well-maintained by government authorities.`
    }
  ];
};

const RoutePage = () => {
  const { routeSlug } = useParams<{ routeSlug: string }>();
  const [route, setRoute] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch route data
  useEffect(() => {
    const fetchRoute = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('seo_routes')
          .select('*')
          .eq('slug', routeSlug)
          .eq('is_active', true)
          .single();

        if (error || !data) {
          setError(true);
          return;
        }

        setRoute(data as RouteData);
      } catch (err) {
        console.error('Error fetching route:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (routeSlug) {
      fetchRoute();
    }
  }, [routeSlug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading route details...</p>
        </div>
      </div>
    );
  }

  // 404 if route not found
  if (error || !route) {
    return <Navigate to="/car-rentals" replace />;
  }

  // Generate SEO data
  const pageTitle = route.meta_title || `${route.from_city} to ${route.to_city} Route Guide | Distance, Taxi Fare & Tips`;
  const pageDescription = route.meta_description || `Complete travel guide from ${route.from_city} to ${route.to_city}. Distance: ${route.distance_km} km, Duration: ${route.duration_hours} hrs. Road conditions, taxi fares, and travel tips.`;
  const canonicalUrl = `https://staykedarnath.in/route/${route.slug}`;

  // FAQs
  const faqItems: FAQItem[] = (route.faqs && route.faqs.length > 0) 
    ? route.faqs 
    : generateDefaultFAQs(route);

  // Generate schemas
  const faqSchema = generateFAQSchema(faqItems);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://staykedarnath.in" },
    { name: "Routes", url: "https://staykedarnath.in/car-rentals" },
    { name: `${route.from_city} to ${route.to_city}`, url: canonicalUrl }
  ]);

  // TravelAction Schema for AI Search
  const travelActionSchema = {
    "@context": "https://schema.org",
    "@type": "TravelAction",
    "name": `Travel from ${route.from_city} to ${route.to_city}`,
    "fromLocation": {
      "@type": "Place",
      "name": route.from_city
    },
    "toLocation": {
      "@type": "Place",
      "name": route.to_city
    },
    "distance": {
      "@type": "Distance",
      "name": `${route.distance_km} kilometers`
    },
    "provider": {
      "@type": "TravelAgency",
      "name": "StayKedarnath"
    }
  };

  const allSchemas = combineSchemas(faqSchema, breadcrumbSchema, travelActionSchema);

  const handleWhatsAppEnquiry = () => {
    const message = `Hi! I need a taxi from ${route.from_city} to ${route.to_city}. Can you help with booking and fare details?`;
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
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23ffffff' fill-opacity='0.1'/%3E%3C/svg%3E")`
          }} />
        </div>

        <Container className="relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/car-rentals" className="hover:text-white transition-colors">Car Rentals</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{route.from_city} → {route.to_city}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            {/* Route Visual */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-green-400 text-sm font-medium">FROM</p>
                  <p className="text-2xl font-bold text-white">{route.from_city}</p>
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center gap-2 px-4">
                <div className="flex-1 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded" />
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  <RouteIcon className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold">{route.distance_km} km</span>
                </div>
                <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-red-500 rounded" />
              </div>
              
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-red-400 text-sm font-medium text-right">TO</p>
                  <p className="text-2xl font-bold text-white">{route.to_city}</p>
                </div>
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {route.from_city} to {route.to_city} Route Guide
            </h1>
            
            <p className="text-lg text-blue-100/80 mb-6">
              {route.short_description || `Complete travel guide with distance, taxi fares, road conditions, and essential tips for your journey.`}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Navigation className="w-5 h-5 text-blue-300 mx-auto mb-2" />
                <p className="text-blue-200 text-xs">Distance</p>
                <p className="text-white font-bold">{route.distance_km} km</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 text-blue-300 mx-auto mb-2" />
                <p className="text-blue-200 text-xs">Duration</p>
                <p className="text-white font-bold">{route.duration_hours} hrs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Car className="w-5 h-5 text-blue-300 mx-auto mb-2" />
                <p className="text-blue-200 text-xs">Sedan Fare</p>
                <p className="text-white font-bold">
                  {route.taxi_rates?.sedan > 0 ? `₹${route.taxi_rates.sedan.toLocaleString()}` : 'On Request'}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <Mountain className="w-5 h-5 text-blue-300 mx-auto mb-2" />
                <p className="text-blue-200 text-xs">Difficulty</p>
                <p className="text-white font-bold">{route.difficulty || 'Moderate'}</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleWhatsAppEnquiry}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Book Taxi Now
              </Button>
              <a href="tel:+919027475942">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Call for Best Rates
                </Button>
              </a>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Taxi Pricing Section */}
      <section className="py-12 bg-white">
        <Container>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Car className="w-6 h-6 text-blue-600" />
            Taxi Fare: {route.from_city} to {route.to_city}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sedan */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Sedan</h3>
                    <p className="text-sm text-gray-500">Dzire, Etios</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-blue-600">
                    {route.taxi_rates?.sedan > 0 ? `₹${route.taxi_rates.sedan.toLocaleString()}` : 'Contact Us'}
                  </p>
                  <p className="text-sm text-gray-500">One way fare</p>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>4 Passengers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>AC (Plains only)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>2 Large Bags</span>
                  </div>
                </div>
                <Button className="w-full" onClick={handleWhatsAppEnquiry}>
                  Book Sedan
                </Button>
              </CardContent>
            </Card>

            {/* SUV */}
            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600">Most Popular</Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">SUV</h3>
                    <p className="text-sm text-gray-500">Innova, Ertiga</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-blue-600">
                    {route.taxi_rates?.suv > 0 ? `₹${route.taxi_rates.suv.toLocaleString()}` : 'Contact Us'}
                  </p>
                  <p className="text-sm text-gray-500">One way fare</p>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>6-7 Passengers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>AC (Plains only)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>4 Large Bags</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Roof Carrier</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleWhatsAppEnquiry}>
                  Book SUV
                </Button>
              </CardContent>
            </Card>

            {/* Tempo */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Bus className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Tempo Traveller</h3>
                    <p className="text-sm text-gray-500">12-17 Seater</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-purple-600">
                    {route.taxi_rates?.tempo > 0 ? `₹${route.taxi_rates.tempo.toLocaleString()}` : 'Contact Us'}
                  </p>
                  <p className="text-sm text-gray-500">One way fare</p>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>12-17 Passengers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Push Back Seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Large Luggage Space</span>
                  </div>
                </div>
                <Button className="w-full" variant="outline" onClick={handleWhatsAppEnquiry}>
                  Book Tempo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Price Includes */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="font-bold text-gray-900 mb-4">What's Included in the Fare</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Experienced Driver</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Fuel Cost</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>Toll Charges</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>State Taxes</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Route Description */}
      {route.long_description && (
        <section className="py-12 bg-gray-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                About the Journey
              </h2>
              <Card className="border-0 shadow-md">
                <CardContent className="p-6 md:p-8">
                  <div className="prose prose-lg max-w-none text-gray-600">
                    {route.long_description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>
      )}

      {/* Route Highlights */}
      {route.route_highlights && route.route_highlights.length > 0 && (
        <section className="py-12 bg-white">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Camera className="w-6 h-6 text-blue-600" />
              Route Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {route.route_highlights.map((highlight, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Milestone className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700">{highlight}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Stops Along the Way */}
      {route.stops_along_way && route.stops_along_way.length > 0 && (
        <section className="py-12 bg-gray-50">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Stops Along the Way
            </h2>
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200 hidden md:block" />
              
              <div className="space-y-6">
                {route.stops_along_way.map((stop, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative md:pl-16"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-4 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow hidden md:block" />
                    
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{stop.name}</h3>
                            <p className="text-gray-600 mt-1">{stop.description}</p>
                          </div>
                          <div className="flex gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-gray-500">Distance</p>
                              <p className="font-bold text-blue-600">{stop.distance_from_start} km</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-500">Time Needed</p>
                              <p className="font-bold text-gray-900">{stop.time_needed}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Travel Info Sections */}
      <section className="py-12 bg-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Road Conditions */}
            {route.road_conditions && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    Road Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{route.road_conditions}</p>
                </CardContent>
              </Card>
            )}

            {/* Best Time */}
            {route.best_time_to_travel && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Best Time to Travel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{route.best_time_to_travel}</p>
                </CardContent>
              </Card>
            )}

            {/* Weather */}
            {route.weather_info && (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CloudSun className="w-5 h-5 text-blue-600" />
                    Weather Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{route.weather_info}</p>
                </CardContent>
              </Card>
            )}

            {/* Safety Tips */}
            {route.safety_tips && (
              <Card className="border-0 shadow-md bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    Safety Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-800">{route.safety_tips}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </Container>
      </section>

      {/* Other Transport Options */}
      {(route.bus_info || route.shared_taxi_info) && (
        <section className="py-12 bg-gray-50">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Other Transport Options
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {route.bus_info && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Bus className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">Bus Service</h3>
                    </div>
                    <p className="text-gray-600">{route.bus_info}</p>
                  </CardContent>
                </Card>
              )}
              {route.shared_taxi_info && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Car className="w-6 h-6 text-purple-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">Shared Taxi</h3>
                    </div>
                    <p className="text-gray-600">{route.shared_taxi_info}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Related Links */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-indigo-700">
        <Container>
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            Plan Your Complete Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to={`/taxi/${route.from_city.toLowerCase()}`}>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center text-white">
                  <Car className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-bold mb-1">Taxis from {route.from_city}</h3>
                  <p className="text-blue-100 text-sm">More routes available</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={`/stays/location/${route.to_city.toLowerCase()}`}>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center text-white">
                  <MapPin className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-bold mb-1">Stays in {route.to_city}</h3>
                  <p className="text-blue-100 text-sm">Find accommodation</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/packages">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors">
                <CardContent className="p-6 text-center text-white">
                  <Calendar className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-bold mb-1">Tour Packages</h3>
                  <p className="text-blue-100 text-sm">All-inclusive trips</p>
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
            title={`${route.from_city} to ${route.to_city} FAQs`}
            description={`Common questions about traveling from ${route.from_city} to ${route.to_city}`}
            faqs={faqItems}
          />
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default RoutePage;

