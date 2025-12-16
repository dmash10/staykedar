import { Helmet } from "react-helmet-async";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Hero from "../components/home/Hero";
import MarqueeBanner from "../components/home/MarqueeBanner";
import WhyUs from "../components/home/WhyUs";
import FeaturedDestinations from "../components/home/FeaturedDestinations";
import CuratedPackages from "../components/home/CuratedPackages";
import PropertyShowcase from "../components/home/PropertyShowcase";
import LiveActivityFeed from "../components/home/LiveActivityFeed";
import WeatherTrekWidget from "../components/home/WeatherTrekWidget";
import MobileQuickActions from "../components/home/MobileQuickActions";
import HowItWorks from "../components/home/HowItWorks";
import TrustSignals from "../components/home/TrustSignals";
import PromoBanner from "../components/home/PromoBanner";
import PluginRenderer from "../components/plugins/PluginRenderer";
import { GlobalSchemaMarkup } from "../components/SEO/SchemaMarkup";
import AIOptimizedFAQ, { KedarnathTravelFAQs } from "../components/SEO/AIOptimizedFAQ";
import { useSEOSettings, generateOrganizationSchema, generateWebsiteSchema } from "../hooks/useSEOSettings";


const Index = () => {
  // Load SEO settings from database
  const { seo } = useSEOSettings();

  // Homepage structured data for AI Search
  const homepageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": seo.site_title,
    "description": seo.site_description,
    "url": seo.canonical_base_url,
    "mainEntity": {
      "@type": "TouristDestination",
      "name": "Kedarnath",
      "description": "Kedarnath is one of the holiest Hindu temples dedicated to Lord Shiva, located in the Himalayan range of Uttarakhand, India. At 3,583 meters elevation, it is one of the four Char Dham pilgrimage sites.",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 30.7346,
        "longitude": 79.0669,
        "elevation": "3583"
      },
      "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23",
      "touristType": ["Pilgrimage", "Religious Tourism", "Trekking"],
      "includesAttraction": [
        {
          "@type": "TouristAttraction",
          "name": "Kedarnath Temple",
          "description": "Ancient Hindu temple dedicated to Lord Shiva, part of Char Dham Yatra"
        },
        {
          "@type": "TouristAttraction",
          "name": "Vasuki Tal",
          "description": "Glacial lake located 6 km from Kedarnath at 4,135 meters"
        },
        {
          "@type": "TouristAttraction",
          "name": "Chorabari Tal (Gandhi Sarovar)",
          "description": "Sacred lake located 3 km from Kedarnath Temple"
        }
      ]
    },
    "provider": {
      "@type": "TravelAgency",
      "name": seo.org_name,
      "url": seo.canonical_base_url
    }
  };

  // Generate dynamic schemas from SEO settings
  const organizationSchema = generateOrganizationSchema(seo);
  const websiteSchema = generateWebsiteSchema(seo);

  return (
    <>
      <Helmet>
        {/* Dynamic Title & Description from Admin SEO Settings */}
        <title>{seo.site_title}</title>
        <meta name="description" content={seo.site_description} />
        <meta name="keywords" content={seo.site_keywords} />
        <link rel="canonical" href={seo.canonical_base_url} />

        {/* Dynamic Favicon from Admin Settings */}
        {/* Dynamic Favicon from Admin Settings with Cache Busting */}
        {seo.site_favicon && <link rel="icon" href={seo.site_favicon} />}

        {/* Open Graph for Social Sharing - Dynamic */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seo.site_title} />
        <meta property="og:description" content={seo.site_description} />
        <meta property="og:url" content={seo.canonical_base_url} />
        <meta property="og:image" content={seo.og_image} />
        <meta property="og:site_name" content={seo.og_site_name} />
        <meta property="og:locale" content={seo.og_locale} />

        {/* Twitter Card - Dynamic */}
        <meta name="twitter:card" content={seo.twitter_card_type} />
        <meta name="twitter:site" content={seo.twitter_handle} />
        <meta name="twitter:title" content={seo.site_title} />
        <meta name="twitter:description" content={seo.site_description} />
        <meta name="twitter:image" content={seo.og_image} />

        {/* Google Search Console Verification */}
        {seo.google_search_console_verification && (
          <meta name="google-site-verification" content={seo.google_search_console_verification} />
        )}

        {/* Bing Verification */}
        {seo.bing_verification && (
          <meta name="msvalidate.01" content={seo.bing_verification} />
        )}

        {/* Homepage Schema */}
        <script type="application/ld+json">
          {JSON.stringify(homepageSchema)}
        </script>

        {/* Organization Schema - Dynamic from Admin */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>

        {/* Website Schema - Dynamic from Admin */}
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      </Helmet>

      {/* Global Schema Markup for Organization, Website, LocalBusiness */}
      <GlobalSchemaMarkup />

      <div className="min-h-screen flex flex-col">
        <Nav />

        {/* Promotional Banner Strip */}
        <PromoBanner position="homepage" />

        <main className="flex-grow">
          {/* Hero with search bar inside */}
          <Hero />

          {/* Animated Marquee Banner - Below Hero */}
          <MarqueeBanner />

          {/* Live Activity Feed - Social Proof & Urgency */}
          <LiveActivityFeed />

          <WhyUs />
          <FeaturedDestinations />

          {/* Weather & Trek Status Widget */}
          <WeatherTrekWidget />

          <CuratedPackages />

          {/* Property Showcase - Verified Stays */}
          <PropertyShowcase />

          <HowItWorks />
          <TrustSignals />

          {/* AI-Optimized FAQ Section for Search Visibility */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <AIOptimizedFAQ
                title="Kedarnath Yatra - Frequently Asked Questions"
                description="Everything you need to know about planning your sacred journey to Kedarnath"
                faqs={KedarnathTravelFAQs}
              />
            </div>
          </section>

          {/* Plugin Renderers */}
          <div className="fixed bottom-20 right-4 z-10 md:bottom-4">
            <PluginRenderer pluginName="Live Chat" />
          </div>

          {/* Legal Ownership for Verification */}
          <div className="bg-gray-50 pb-16 md:pb-4 text-center">
            <p className="text-[10px] text-gray-400">
              Owned and Operated by Ashutosh Singh
            </p>
          </div>
        </main>

        <Footer />

        {/* Popup Banner (shows after delay) */}
        <PromoBanner position="popup" />

        {/* Mobile Quick Actions Bar */}
        <MobileQuickActions />
      </div>
    </>
  );
};

export default Index;
