import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Container from "../Container";
import { OptimizedImage } from "@/components/OptimizedImage";
import MainSearchBar from "../search/MainSearchBar";

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  link_text?: string;
  link_url?: string;
  background_color?: string;
  text_color?: string;
  target_devices?: string[];
  target_pages?: string[];
}

const Hero = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const handleSearch = (data: any) => {
    console.log("Search data:", data);
  };

  // Device detection
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) setDeviceType('mobile');
      else if (width < 1024) setDeviceType('tablet');
      else setDeviceType('desktop');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Defer banner fetch until after initial render to optimize LCP
  const [shouldFetchBanners, setShouldFetchBanners] = useState(false);

  useEffect(() => {
    // Defer banner fetch to after initial paint
    const timer = setTimeout(() => {
      setShouldFetchBanners(true);
    }, 100); // Small delay to ensure LCP element renders first

    return () => clearTimeout(timer);
  }, []);

  // Fetch hero banners (deferred)
  const { data: banners = [] } = useQuery({
    queryKey: ['hero-banners'],
    enabled: shouldFetchBanners, // Only fetch after initial render
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .eq('position', 'hero')
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching hero banners:', error);
        return [];
      }
      return (data as Banner[]).filter(b => {
        // Device targeting
        if (b.target_devices && b.target_devices.length > 0) {
          if (!b.target_devices.includes(deviceType)) return false;
        }
        // Page targeting
        if (b.target_pages && b.target_pages.length > 0) {
          const currentPath = window.location.pathname;
          const isMatch = b.target_pages.some((pattern: string) => {
            if (pattern === '*') return true;
            if (pattern.endsWith('*')) return currentPath.startsWith(pattern.slice(0, -1));
            return currentPath === pattern;
          });
          if (!isMatch) return false;
        }
        return true;
      });
    },
    staleTime: 60000,
  });

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleClick = (banner: Banner) => {
    if (banner.link_url) {
      if (banner.link_url.startsWith('http')) {
        window.open(banner.link_url, '_blank');
      } else {
        navigate(banner.link_url);
      }
    }
  };

  const currentBanner = banners[currentIndex];

  // If we have hero banners, show the banner slider
  if (banners.length > 0 && currentBanner) {
    return (
      <section className="relative pb-32 md:pb-20">
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative h-[300px] md:h-[400px] cursor-pointer"
              style={{ backgroundColor: currentBanner.background_color || '#003580' }}
              onClick={() => handleClick(currentBanner)}
            >
              {currentBanner.image_url && (
                <OptimizedImage
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  width={1200}
                  height={600}
                  priority={true}
                  sizes="100vw"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              <Container className="relative z-10 h-full flex items-end pb-8">
                <div className="max-w-4xl">
                  <h1
                    className="text-3xl md:text-5xl font-bold mb-4"
                    style={{ color: currentBanner.text_color || '#ffffff' }}
                  >
                    {currentBanner.title}
                  </h1>
                  {currentBanner.subtitle && (
                    <p
                      className="text-lg md:text-xl mb-6 opacity-90"
                      style={{ color: currentBanner.text_color || '#ffffff' }}
                    >
                      {currentBanner.subtitle}
                    </p>
                  )}
                  {currentBanner.link_text && (
                    <Button
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100"
                    >
                      {currentBanner.link_text}
                    </Button>
                  )}
                </div>
              </Container>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors z-10"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white/30 transition-colors z-10"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'w-6 bg-white' : 'bg-white/50'
                      }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Booking Form */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 z-20">
          <Container>
            <MainSearchBar onSearch={handleSearch} />
          </Container>
        </div>
      </section>
    );
  }

  // Default hero when no banners are active
  return (
    <section className="bg-[#003580] relative pb-32 md:pb-20">
      <Container className="relative z-10 pt-12 pb-8">
        <div className="flex flex-col items-start text-left mb-4">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Discover Your Spiritual Journey<br className="hidden md:block" /> to Kedarnath
          </h1>
          <p className="text-base md:text-xl text-white/90 max-w-2xl">
            Find Serene Stays and Plan Your Yatra with Ease.
          </p>
        </div>
      </Container>

      {/* Booking Form */}
      <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 z-20">
        <Container>
          <MainSearchBar onSearch={handleSearch} />
        </Container>
      </div>
    </section>
  );
};

export default Hero;
