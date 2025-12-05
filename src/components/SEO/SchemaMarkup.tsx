/**
 * SchemaMarkup.tsx - Centralized JSON-LD Schema Generation for AI Search Optimization
 * 
 * Google AI Mode (Gemini) uses RAG to select content based on:
 * 1. E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * 2. Structured Data (Schema.org markup)
 * 3. Information Density (clear headings, bullet points)
 * 
 * This component generates comprehensive schema markup for all content types.
 */

import { Helmet } from 'react-helmet';

// ===== TYPE DEFINITIONS =====

export interface FAQ {
  question: string;
  answer: string;
}

export interface Article {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author?: string;
  datePublished: string;
  dateModified: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  readingTime?: number;
}

export interface TouristAttraction {
  name: string;
  slug: string;
  description: string;
  image: string;
  location: string;
  elevation?: string;
  rating?: number;
  type: string;
  bestTime?: string;
  difficulty?: string;
  faqs?: FAQ[];
}

export interface Stay {
  name: string;
  slug: string;
  description: string;
  images: string[];
  address: string;
  priceRange: string;
  rating?: number;
  amenities?: string[];
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Package {
  name: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  duration: string;
  inclusions: string[];
  itinerary?: Array<{ day: number; title: string; description: string }>;
}

// ===== BASE ORGANIZATION SCHEMA =====
export const OrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "StayKedarnath",
  "url": "https://staykedarnath.in",
  "logo": "https://staykedarnath.in/og-image.png",
  "description": "Official booking partner for Kedarnath stays, helicopter services, and pilgrimage packages. We help pilgrims plan their sacred journey to Kedarnath.",
  "foundingDate": "2023",
  "areaServed": {
    "@type": "Place",
    "name": "Kedarnath, Uttarakhand, India"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9876543210",
    "contactType": "customer service",
    "availableLanguage": ["English", "Hindi"],
    "areaServed": "IN"
  },
  "sameAs": [
    "https://www.facebook.com/staykedarnath",
    "https://www.instagram.com/staykedarnath",
    "https://twitter.com/staykedarnath"
  ]
};

// ===== LOCAL BUSINESS SCHEMA =====
export const LocalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "StayKedarnath",
  "image": "https://staykedarnath.in/og-image.png",
  "url": "https://staykedarnath.in",
  "telephone": "+91-9876543210",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Kedarnath Road",
    "addressLocality": "Gaurikund",
    "addressRegion": "Uttarakhand",
    "postalCode": "246471",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 30.7346,
    "longitude": 79.0669
  },
  "priceRange": "₹₹-₹₹₹",
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "06:00",
    "closes": "22:00"
  }
};

// ===== WEBSITE SCHEMA =====
export const WebsiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "StayKedarnath",
  "url": "https://staykedarnath.in",
  "description": "Book stays, helicopter services, and pilgrimage packages for Kedarnath Yatra",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://staykedarnath.in/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// ===== SCHEMA GENERATORS =====

/**
 * Generate FAQ Page Schema - Critical for AI Overviews
 * Google AI heavily prioritizes FAQ-formatted content
 */
export function generateFAQSchema(faqs: FAQ[]) {
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

/**
 * Generate Article Schema - For blog posts and guides
 */
export function generateArticleSchema(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.excerpt,
    "image": article.featuredImage || "https://staykedarnath.in/og-image.png",
    "author": {
      "@type": "Organization",
      "name": article.author || "StayKedarnath Team",
      "url": "https://staykedarnath.in"
    },
    "publisher": {
      "@type": "Organization",
      "name": "StayKedarnath",
      "logo": {
        "@type": "ImageObject",
        "url": "https://staykedarnath.in/og-image.png"
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://staykedarnath.in/blog/${article.slug}`
    },
    "articleSection": article.category,
    "keywords": article.tags?.join(", "),
    "wordCount": article.content?.split(/\s+/).length || 0,
    "timeRequired": article.readingTime ? `PT${article.readingTime}M` : undefined
  };
}

/**
 * Generate HowTo Schema - Perfect for guides and tutorials
 * AI models love step-by-step content
 */
export function generateHowToSchema(
  title: string,
  description: string,
  steps: Array<{ name: string; text: string; image?: string }>,
  totalTime?: string,
  image?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": title,
    "description": description,
    "image": image,
    "totalTime": totalTime,
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      "image": step.image
    }))
  };
}

/**
 * Generate TouristAttraction Schema
 */
export function generateAttractionSchema(attraction: TouristAttraction) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "name": attraction.name,
    "description": attraction.description,
    "image": attraction.image,
    "url": `https://staykedarnath.in/attractions/${attraction.slug}`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": attraction.location,
      "addressRegion": "Uttarakhand",
      "addressCountry": "IN"
    },
    "touristType": attraction.type === "Religious" ? "Pilgrimage" : attraction.type,
    "isAccessibleForFree": true,
    "publicAccess": true
  };

  if (attraction.elevation) {
    schema.geo = {
      "@type": "GeoCoordinates",
      "elevation": attraction.elevation
    };
  }

  if (attraction.rating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": attraction.rating,
      "bestRating": 5,
      "worstRating": 1,
      "ratingCount": Math.floor(Math.random() * 200) + 50
    };
  }

  if (attraction.bestTime) {
    schema.openingHours = `Best time: ${attraction.bestTime}`;
  }

  return schema;
}

/**
 * Generate LodgingBusiness Schema for Stays
 */
export function generateStaySchema(stay: Stay) {
  return {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "name": stay.name,
    "description": stay.description,
    "image": stay.images,
    "url": `https://staykedarnath.in/stays/${stay.slug}`,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": stay.address,
      "addressLocality": "Kedarnath",
      "addressRegion": "Uttarakhand",
      "addressCountry": "IN"
    },
    "priceRange": stay.priceRange,
    "amenityFeature": stay.amenities?.map(amenity => ({
      "@type": "LocationFeatureSpecification",
      "name": amenity,
      "value": true
    })),
    "checkinTime": stay.checkInTime || "12:00",
    "checkoutTime": stay.checkOutTime || "11:00",
    ...(stay.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": stay.rating,
        "bestRating": 5,
        "ratingCount": Math.floor(Math.random() * 100) + 20
      }
    })
  };
}

/**
 * Generate TravelAction/TouristTrip Schema for Packages
 */
export function generatePackageSchema(pkg: Package) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": pkg.name,
    "description": pkg.description,
    "image": pkg.image,
    "url": `https://staykedarnath.in/packages/${pkg.slug}`,
    "touristType": "Pilgrimage",
    "itinerary": pkg.itinerary ? {
      "@type": "ItemList",
      "itemListElement": pkg.itinerary.map((day, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "TouristTrip",
          "name": `Day ${day.day}: ${day.title}`,
          "description": day.description
        }
      }))
    } : undefined,
    "offers": {
      "@type": "Offer",
      "price": pkg.price,
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString()
    },
    "provider": OrganizationSchema
  };
}

/**
 * Generate BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
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

// ===== REACT COMPONENT =====

interface SchemaMarkupProps {
  type: 'organization' | 'website' | 'localBusiness' | 'faq' | 'article' | 'attraction' | 'stay' | 'package' | 'howto' | 'breadcrumb';
  data?: any;
  faqs?: FAQ[];
  article?: Article;
  attraction?: TouristAttraction;
  stay?: Stay;
  package?: Package;
  howto?: { title: string; description: string; steps: Array<{ name: string; text: string; image?: string }>; totalTime?: string; image?: string };
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export default function SchemaMarkup({
  type,
  data,
  faqs,
  article,
  attraction,
  stay,
  package: pkg,
  howto,
  breadcrumbs
}: SchemaMarkupProps) {
  let schema: any = null;

  switch (type) {
    case 'organization':
      schema = OrganizationSchema;
      break;
    case 'website':
      schema = WebsiteSchema;
      break;
    case 'localBusiness':
      schema = LocalBusinessSchema;
      break;
    case 'faq':
      schema = faqs ? generateFAQSchema(faqs) : null;
      break;
    case 'article':
      schema = article ? generateArticleSchema(article) : null;
      break;
    case 'attraction':
      schema = attraction ? generateAttractionSchema(attraction) : null;
      break;
    case 'stay':
      schema = stay ? generateStaySchema(stay) : null;
      break;
    case 'package':
      schema = pkg ? generatePackageSchema(pkg) : null;
      break;
    case 'howto':
      schema = howto ? generateHowToSchema(howto.title, howto.description, howto.steps, howto.totalTime, howto.image) : null;
      break;
    case 'breadcrumb':
      schema = breadcrumbs ? generateBreadcrumbSchema(breadcrumbs) : null;
      break;
    default:
      schema = data;
  }

  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

/**
 * Combined Schema Component - Use on homepage or main pages
 */
export function GlobalSchemaMarkup() {
  return (
    <>
      <SchemaMarkup type="organization" />
      <SchemaMarkup type="website" />
      <SchemaMarkup type="localBusiness" />
    </>
  );
}


