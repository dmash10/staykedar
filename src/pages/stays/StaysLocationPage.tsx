/**
 * StaysLocationPage.tsx - Programmatic SEO Page for Stays by Location
 * 
 * URL Pattern: /stays/location/[city-slug]
 * Example: /stays/location/guptkashi, /stays/location/sonprayag
 * 
 * This page shows hotels/stays available in a specific city on the Kedarnath route.
 * 
 * SEO Features:
 * - LodgingBusiness Schema
 * - ItemList Schema (for Google hotel carousels)
 * - FAQPage Schema
 * - Breadcrumb Schema
 */

import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  MapPin,
  Mountain,
  Star,
  ChevronRight,
  Bed,
  Phone,
  MessageCircle,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  Building,
  Loader2,
  Plane,
  Train,
  Car,
  Route,
  Calendar,
  CloudSun,
  Utensils,
  BookOpen
} from "lucide-react";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIOptimizedFAQ, { FAQItem } from "@/components/SEO/AIOptimizedFAQ";
import { supabase } from "@/integrations/supabase/client";

// Import data (fallback)
import citiesDataJson from "@/data/cities.json";
import servicesData from "@/data/services.json";
import {
  generateLodgingSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateItemListSchema,
  combineSchemas
} from "@/utils/seoSchemas";

// Types
interface CityData {
  slug: string;
  name: string;
  type: string;
  meta_title?: string;
  state: string;
  coordinates?: { lat: number; lng: number };
  connectivity?: {
    next_stop: string | null;
    distance_to_next: string | null;
    nearest_airport: string;
    nearest_railway: string;
  };
  distance_from_delhi: string;
  distance_from_kedarnath: string;
  elevation: string;
  position_on_route: number;
  is_major_hub: boolean;
  description: string;
  special_info?: string;
  nearby_attractions?: string[];
  stay_vibe?: string;
  stay_tip?: string;
  highlight_tag?: string;
  avg_hotel_price?: string;
  warning_tip?: string;
  alert?: string;
  faqs?: { question: string; answer: string }[];
  // Rich content fields
  stays_hero_title?: string;
  stays_hero_description?: string;
  long_description?: string;
  how_to_reach?: string;
  best_time_to_visit?: string;
  weather_info?: string;
  local_food?: string;
  history?: string;
}

interface Property {
  id: string;
  name: string;
  slug: string;
  location: string;
  rating: number;
  price_per_night: number;
  images: string[];
  amenities: string[];
  property_type: string;
}

// Fallback images (rotated to avoid duplicates)
const getFallbackImage = (index: number) => {
  const images = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800"
  ];
  return images[index % images.length];
};

// Location-specific stay FAQs
const generateStayFAQs = (city: CityData): FAQItem[] => {
  const highlightTag = (servicesData.stays.highlight_tags as Record<string, string>)?.[city.slug] || '';

  return [
    {
      question: `What is the best hotel to stay in ${city.name} for Kedarnath trip?`,
      answer: `${city.name} offers various accommodation options. ${city.stay_vibe ? `The area is known as a "${city.stay_vibe}".` : ''} ${highlightTag ? `Special feature: ${highlightTag}.` : ''} Price range is typically ${city.avg_hotel_price || '₹500 - ₹3,000'} per night. We recommend booking in advance during peak season (May-June).`
    },
    {
      question: `Is advance booking required for hotels in ${city.name}?`,
      answer: `Yes, advance booking is highly recommended for ${city.name}, especially during peak Kedarnath yatra season (May-June). Hotels fill up 2-3 weeks in advance. September-October has better availability.`
    },
    {
      question: `How far is ${city.name} from Kedarnath Temple?`,
      answer: `${city.name} is ${city.distance_from_kedarnath} from Kedarnath Temple. ${city.special_info || ''}`
    }
  ];
};

const StaysLocationPage = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<CityData | null>(null);
  const [allCities, setAllCities] = useState<CityData[]>([]);
  const [cityLoading, setCityLoading] = useState(true);
  const [error, setError] = useState(false);

  const stayService = servicesData.stays;

  // Fetch city data from Supabase
  useEffect(() => {
    const fetchCityData = async () => {
      setCityLoading(true);
      try {
        // Fetch current city
        const { data: cityData, error: cityError } = await supabase
          .from('seo_cities')
          .select('*')
          .eq('slug', citySlug)
          .eq('is_active', true)
          .single();

        if (cityError || !cityData) {
          // Fallback to JSON data
          const jsonCity = (citiesDataJson as CityData[]).find(c => c.slug === citySlug);
          if (jsonCity) {
            setCity(jsonCity);
            setAllCities(citiesDataJson as CityData[]);
          } else {
            setError(true);
          }
        } else {
          // Transform Supabase data
          const transformedCity: CityData = {
            ...cityData,
            coordinates: cityData.coordinates as { lat: number; lng: number },
            faqs: cityData.faqs as { question: string; answer: string }[],
            is_major_hub: cityData.is_featured || false,
            distance_from_delhi: '',
            distance_from_kedarnath: cityData.connectivity?.distance_to_next || '',
          };
          setCity(transformedCity);

          // Fetch all cities for navigation
          const { data: allCitiesData } = await supabase
            .from('seo_cities')
            .select('*')
            .eq('is_active', true)
            .order('position_on_route', { ascending: true });

          if (allCitiesData) {
            const transformedCities = allCitiesData.map(c => ({
              ...c,
              coordinates: c.coordinates as { lat: number; lng: number },
              faqs: c.faqs as { question: string; answer: string }[],
              is_major_hub: c.is_featured || false,
              distance_from_delhi: '',
              distance_from_kedarnath: c.connectivity?.distance_to_next || '',
            }));
            setAllCities(transformedCities);
          }
        }
      } catch (err) {
        console.error('Error fetching city:', err);
        // Fallback to JSON
        const jsonCity = (citiesDataJson as CityData[]).find(c => c.slug === citySlug);
        if (jsonCity) {
          setCity(jsonCity);
          setAllCities(citiesDataJson as CityData[]);
        } else {
          setError(true);
        }
      } finally {
        setCityLoading(false);
      }
    };

    if (citySlug) {
      fetchCityData();
    }
  }, [citySlug]);

  // Fetch properties for this location
  useEffect(() => {
    const fetchProperties = async () => {
      if (!city) return;

      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .ilike('location', `%${city.name}%`)
          .limit(12);

        if (!error && data) {
          setProperties(data);
        }
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    if (city) {
      fetchProperties();
    }
  }, [city]);

  // Loading state
  if (cityLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading stays...</p>
        </div>
      </div>
    );
  }

  // 404 if city not found
  if (error || !city) {
    return <Navigate to="/stays" replace />;
  }

  // Get nearby cities for related routes
  const nearbyCities = allCities
    .filter(c => c.slug !== citySlug && c.is_major_hub && c.stay_vibe)
    .sort((a, b) => Math.abs(a.position_on_route - city.position_on_route) - Math.abs(b.position_on_route - city.position_on_route))
    .slice(0, 4);

  // Get highlight tag for this city
  const highlightTag = (stayService.highlight_tags as Record<string, string>)?.[city.slug] || '';

  // Generate SEO data - use custom titles if available
  const pageTitle = city.stays_hero_title || stayService.title_template.replace("{city}", city.name);
  const pageDescription = city.stays_hero_description || stayService.description_template.replace("{city}", city.name);
  const pageH1 = city.stays_hero_title || (highlightTag
    ? `${stayService.h1_template.replace("{city}", city.name)} ${highlightTag}`
    : stayService.h1_template.replace("{city}", city.name));
  const canonicalUrl = `https://staykedarnath.in/stays/location/${city.slug}`;

  // Generate schemas
  const lodgingSchema = generateLodgingSchema(city, city.avg_hotel_price || "₹500-₹5,000");
  const cityFaqs = generateStayFAQs(city);
  const faqSchema = generateFAQSchema(cityFaqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://staykedarnath.in" },
    { name: "Stays", url: "https://staykedarnath.in/stays" },
    { name: `Hotels in ${city.name}`, url: canonicalUrl }
  ]);

  // ItemList Schema for property listings (triggers Google carousels)
  const propertyListSchema = properties.length > 0
    ? generateItemListSchema(
      properties.map(p => ({
        name: p.name,
        id: p.id,
        image: p.images?.[0],
        price: p.price_per_night,
        rating: p.rating,
        location: p.location
      })),
      city.name,
      city.state
    )
    : null;

  const allSchemas = combineSchemas(lodgingSchema, faqSchema, breadcrumbSchema, propertyListSchema);

  const handleWhatsAppEnquiry = (propertyName?: string, price?: number) => {
    const message = propertyName
      ? `Hi, I am interested in booking ${propertyName} in ${city.name}. Price shown: ₹${price}. Please share availability.`
      : `Hi! I'm looking for hotel/stay options in ${city.name} for my Kedarnath trip. Please share available options and prices.`;
    window.open(`https://wa.me/919027475942?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{pageTitle} | StayKedarnath</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`hotels in ${city.name}, ${city.name} stay, ${city.name} accommodation, ${city.name} dharamshala, ${city.name} guest house`} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:title" content={`${pageTitle} | StayKedarnath`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />

        {/* JSON-LD Schemas */}
        {allSchemas && (
          <script type="application/ld+json">
            {JSON.stringify(allSchemas)}
          </script>
        )}
      </Helmet>

      <Nav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#003580] via-[#0071c2] to-[#003580] pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2000&auto=format&fit=crop"
            alt="Hotels"
            className="w-full h-full object-cover"
          />
        </div>

        <Container className="relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-blue-200 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/stays" className="hover:text-white transition-colors">Stays</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{city.name}</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className="bg-white/20 text-white border-white/30">
                <MapPin className="w-3 h-3 mr-1" /> {city.state}
              </Badge>
              {city.stay_vibe && (
                <Badge className="bg-amber-500/20 text-amber-200 border-amber-500/30">
                  {city.stay_vibe}
                </Badge>
              )}
              {highlightTag && (
                <Badge className="bg-green-500/20 text-green-200 border-green-500/30">
                  {highlightTag}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {pageH1}
            </h1>

            <p className="text-xl text-blue-100/80 mb-6">
              Find comfortable accommodations in {city.name} for your Kedarnath pilgrimage.
              {city.description}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white">
                <Mountain className="w-4 h-4" />
                <span>{city.elevation}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white">
                <MapPin className="w-4 h-4" />
                <span>{city.distance_from_kedarnath} to Kedarnath</span>
              </div>
              {city.avg_hotel_price && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white">
                  <Bed className="w-4 h-4" />
                  <span>{city.avg_hotel_price}/night</span>
                </div>
              )}
            </div>

            {/* CTA */}
            <Button
              size="lg"
              className="bg-white text-[#003580] hover:bg-gray-100"
              onClick={() => handleWhatsAppEnquiry()}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Get Hotel Recommendations
            </Button>
          </motion.div>
        </Container>
      </section>

      {/* Alert Banner */}
      {city.alert && (
        <section className="bg-amber-50 border-y border-amber-200">
          <Container className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800">{city.alert}</p>
            </div>
          </Container>
        </section>
      )}

      {/* Properties from Database */}
      <section className="py-16 bg-white">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Available Stays in {city.name}
              </h2>
              <p className="text-gray-600">
                {properties.length > 0
                  ? `${properties.length} properties found`
                  : 'Contact us for the best options'}
              </p>
            </div>
            <Link to="/stays">
              <Button variant="outline">
                View All Stays <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/stays/${property.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={property.images?.[0] || getFallbackImage(index)}
                          alt={property.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-white/90 text-gray-800">
                            {property.property_type || 'Hotel'}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 rounded-full">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">{property.rating || 4.5}</span>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {property.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                          <MapPin className="w-3 h-3" />
                          {property.location}
                        </div>

                        {property.amenities && property.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {property.amenities.slice(0, 3).map((amenity) => (
                              <span key={amenity} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Updated: Quick Book Button + Price */}
                        <div className="flex items-center justify-between pt-3 border-t gap-2">
                          <div>
                            <p className="text-xs text-gray-500">Starting from</p>
                            <p className="text-lg font-bold text-blue-600">
                              ₹{property.price_per_night?.toLocaleString() || '999'}
                            </p>
                          </div>

                          {/* Quick Book Button - Prevents link navigation */}
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleWhatsAppEnquiry(property.name, property.price_per_night);
                            }}
                          >
                            <MessageCircle className="w-3 h-3 mr-1" /> Book
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            /* No properties - Show contact CTA */
            <Card className="p-8 text-center">
              <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Looking for stays in {city.name}?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We have partner hotels and guesthouses in {city.name}. Contact us for personalized recommendations and best deals.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => handleWhatsAppEnquiry()} className="bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Us
                </Button>
                <Button variant="outline" onClick={() => window.location.href = 'tel:+919027475942'}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </div>
            </Card>
          )}
        </Container>
      </section>

      {/* Location-Specific Tips */}
      {city.special_info && (
        <section className="py-12 bg-blue-50">
          <Container>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    About Staying in {city.name}
                  </h3>
                  <p className="text-gray-600">{city.special_info}</p>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Nearby Cities for Stays */}
      <section className="py-16 bg-gray-50">
        <Container>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Also Consider Staying In
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nearbyCities.map((otherCity, index) => (
              <motion.div
                key={otherCity.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/stays/location/${otherCity.slug}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                          <Bed className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {otherCity.name}
                          </h3>
                          <p className="text-xs text-gray-500">{otherCity.stay_vibe}</p>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mountain className="w-3 h-3 text-blue-500" />
                          {otherCity.elevation}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          {otherCity.distance_from_kedarnath}
                        </div>
                      </div>
                      {otherCity.avg_hotel_price && (
                        <div className="mt-3 pt-3 border-t text-sm">
                          <span className="text-gray-500">Hotels from </span>
                          <span className="font-semibold text-blue-600">{otherCity.avg_hotel_price}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Rich Content: About This City */}
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

      {/* Rich Content: How to Reach */}
      {(city.how_to_reach || city.connectivity) && (
        <section className="py-12 bg-gray-50">
          <Container>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
              <Route className="w-7 h-7 text-blue-600" />
              How to Reach {city.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {city.connectivity?.nearest_airport && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Plane className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">By Air</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {city.connectivity.nearest_airport}
                    </p>
                  </CardContent>
                </Card>
              )}
              {city.connectivity?.nearest_railway && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Train className="w-6 h-6 text-green-600" />
                      </div>
                      <h3 className="font-bold text-gray-900">By Rail</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {city.connectivity.nearest_railway}
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">By Road</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {city.distance_from_kedarnath} from Kedarnath Temple
                  </p>
                </CardContent>
              </Card>
            </div>
            {city.how_to_reach && (
              <div className="mt-8 p-6 bg-white rounded-xl shadow-sm">
                <div className="prose prose-sm max-w-none text-gray-600">
                  {city.how_to_reach.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-3" dangerouslySetInnerHTML={{
                      __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                  ))}
                </div>
              </div>
            )}
          </Container>
        </section>
      )}

      {/* Rich Content: Best Time & Weather */}
      {(city.best_time_to_visit || city.weather_info) && (
        <section className="py-12 bg-white">
          <Container>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {city.best_time_to_visit && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Best Time to Visit</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{city.best_time_to_visit}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              {city.weather_info && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="h-full border-0 shadow-md bg-gradient-to-br from-blue-50 to-sky-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <CloudSun className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Weather in {city.name}</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">{city.weather_info}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Rich Content: History */}
      {city.history && (
        <section className="py-12 bg-amber-50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-7 h-7 text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  History & Significance of {city.name}
                </h2>
              </div>
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <p className="text-gray-600 leading-relaxed">{city.history}</p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Rich Content: Local Food */}
      {city.local_food && (
        <section className="py-12 bg-white">
          <Container>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Utensils className="w-7 h-7 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Where to Eat in {city.name}
                </h2>
              </div>
              <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-amber-50">
                <CardContent className="p-6 md:p-8">
                  <p className="text-gray-600 leading-relaxed">{city.local_food}</p>
                </CardContent>
              </Card>
            </div>
          </Container>
        </section>
      )}

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <Container>
          <AIOptimizedFAQ
            title={`Hotels & Stays FAQs - ${city.name}`}
            description={`Common questions about accommodation in ${city.name} for Kedarnath pilgrims`}
            faqs={cityFaqs}
            showSchema={false}
          />
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-12 bg-gradient-to-r from-[#003580] to-[#0071c2]">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Need Help Finding the Perfect Stay?
              </h2>
              <p className="text-blue-200">
                Our travel experts can recommend the best hotels in {city.name} for your needs
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-white text-[#003580] hover:bg-gray-100"
                onClick={() => handleWhatsAppEnquiry()}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Get Recommendations
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </div>
  );
};

export default StaysLocationPage;
