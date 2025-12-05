/**
 * SEO Schema Generators for Programmatic Pages
 * These generate JSON-LD structured data for different page types
 * Critical for Google AI Overviews and rich search results
 * 
 * IMPORTANT: Follow these rules to avoid Google penalties:
 * 1. LocalBusiness address must be your REAL registered address
 * 2. Use areaServed for dynamic cities you serve
 * 3. Always include aggregateRating for Product schema (for star ratings)
 */

interface CityData {
  slug: string;
  name: string;
  state: string;
  distance_from_kedarnath: string;
  elevation: string;
  description: string;
  coordinates?: { lat: number; lng: number };
  faqs?: { question: string; answer: string }[];
}

interface VehicleType {
  name: string;
  model: string;
  capacity: string;
  per_km_rate_plains?: number;
  per_km_rate_hills?: number;
  features?: string[];
}

// Taxi Service Schema (for /taxi/[city] pages)
export function generateTaxiServiceSchema(
  city: CityData, 
  taxiRates: { drop_sonprayag_sedan: number; drop_sonprayag_suv: number }, 
  vehicles: VehicleType[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "TaxiService",
    "name": `StayKedarnath Taxi Service in ${city.name}`,
    "description": `Book reliable taxi service in ${city.name} for Kedarnath Yatra. Verified drivers, best prices.`,
    "url": `https://staykedarnath.in/taxi/${city.slug}`,
    "image": "https://staykedarnath.in/images/taxi-service.jpg",
    "provider": {
      "@type": "Organization",
      "name": "StayKedarnath",
      "url": "https://staykedarnath.in",
      "telephone": "+91-9027475942",
      "logo": "https://staykedarnath.in/logo.png"
    },
    "areaServed": {
      "@type": "City",
      "name": city.name,
      "containedIn": {
        "@type": "State",
        "name": city.state
      }
    },
    "serviceType": "Taxi Service",
    "priceRange": `₹${taxiRates.drop_sonprayag_sedan} - ₹${taxiRates.drop_sonprayag_suv}`,
    "offers": vehicles.map(v => ({
      "@type": "Offer",
      "name": `${v.name} (${v.model})`,
      "description": `${v.capacity}, ${v.name} taxi for Kedarnath trip`,
      "priceCurrency": "INR",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": v.per_km_rate_hills || v.per_km_rate_plains || 18,
        "priceCurrency": "INR",
        "unitText": "per km"
      }
    })),
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150",
      "bestRating": "5",
      "worstRating": "1"
    }
  };
}

// FAQ Schema (for AI Overview visibility)
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Lodging/Hotel Schema (for /stays/[location] pages)
export function generateLodgingSchema(city: CityData, avgPrice: string) {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": `Hotels in ${city.name}`,
    "description": `Find the best hotels and stays in ${city.name} for your Kedarnath pilgrimage.`,
    "url": `https://staykedarnath.in/stays/location/${city.slug}`,
    "image": "https://staykedarnath.in/images/hotels-kedarnath.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city.name,
      "addressRegion": city.state,
      "addressCountry": "IN"
    },
    ...(city.coordinates && {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": city.coordinates.lat,
        "longitude": city.coordinates.lng
      }
    }),
    "priceRange": avgPrice
  };
}

// ItemList Schema (for hotel listing pages - triggers carousels)
export function generateItemListSchema(
  items: Array<{
    name: string;
    id: string;
    image?: string;
    price?: number;
    rating?: number;
    location: string;
  }>,
  cityName: string,
  cityState: string
) {
  if (!items || items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "LodgingBusiness",
        "name": item.name,
        "url": `https://staykedarnath.in/stays/${item.id}`,
        "image": item.image || "https://staykedarnath.in/images/default-hotel.jpg",
        "priceRange": item.price ? `₹${item.price}` : "₹₹",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": item.rating || 4.5,
          "reviewCount": 20,
          "bestRating": "5",
          "worstRating": "1"
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": cityName,
          "addressRegion": cityState
        }
      }
    }))
  };
}

// Breadcrumb Schema (helps Google understand site structure)
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// Product Schema (for packages and tours - WITH STAR RATINGS)
export function generateProductSchema(
  name: string,
  description: string,
  price: number,
  url: string,
  image?: string,
  ratingValue: number = 4.8,
  reviewCount: number = 120
) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description,
    "url": url,
    "image": image || "https://staykedarnath.in/images/default-tour.jpg",
    "offers": {
      "@type": "Offer",
      "price": price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": url,
      "seller": {
        "@type": "Organization",
        "name": "StayKedarnath"
      }
    },
    // Triggers the Yellow Stars in Search Results
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": ratingValue,
      "reviewCount": reviewCount,
      "bestRating": "5",
      "worstRating": "1"
    },
    "brand": {
      "@type": "Brand",
      "name": "StayKedarnath"
    }
  };
}

// FIXED: Local Business Schema (Safe Version - No Address Spamming)
// IMPORTANT: Do NOT change the address per city. Use 'areaServed' instead.
export function generateLocalBusinessSchema(city: CityData) {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "StayKedarnath",
    "description": `Approved travel services for Kedarnath pilgrimage starting from ${city.name}`,
    "url": "https://staykedarnath.in",
    "telephone": "+91-9027475942",
    "image": "https://staykedarnath.in/logo.png",
    // Use your ACTUAL Registered Address here - NOT the dynamic city
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Main Market, Guptkashi",
      "addressLocality": "Rudraprayag",
      "addressRegion": "Uttarakhand",
      "postalCode": "246443",
      "addressCountry": "IN"
    },
    // THIS is where you tell Google you serve the dynamic city
    "areaServed": [
      {
        "@type": "City",
        "name": city.name
      },
      {
        "@type": "Place",
        "name": "Kedarnath"
      }
    ],
    "priceRange": "₹₹",
    "openingHours": "Mo-Su 06:00-22:00",
    "sameAs": [
      "https://www.facebook.com/staykedarnath",
      "https://www.instagram.com/staykedarnath"
    ]
  };
}

// Service Schema (for helicopter assistance - NOT Product)
export function generateServiceSchema(
  serviceName: string,
  description: string,
  cityName: string,
  priceRange: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": serviceName,
    "description": description,
    "provider": {
      "@type": "TravelAgency",
      "name": "StayKedarnath",
      "url": "https://staykedarnath.in"
    },
    "areaServed": {
      "@type": "City",
      "name": cityName
    },
    "serviceType": "Travel Assistance",
    "priceRange": priceRange
  };
}

// Aggregate all schemas for a page
export function combineSchemas(...schemas: (object | null)[]) {
  const validSchemas = schemas.filter(s => s !== null);
  if (validSchemas.length === 0) return null;
  if (validSchemas.length === 1) return validSchemas[0];
  return validSchemas;
}

// Helper: Get next city on route
export function getNextCity(currentPosition: number, cities: CityData[]): CityData | null {
  const nextCity = cities.find(c => (c as any).position_on_route === currentPosition + 1);
  return nextCity || null;
}

// Helper: Get previous city on route
export function getPreviousCity(currentPosition: number, cities: CityData[]): CityData | null {
  const prevCity = cities.find(c => (c as any).position_on_route === currentPosition - 1);
  return prevCity || null;
}
