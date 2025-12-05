import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBannerTracking } from '@/hooks/useBannerTracking';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Phone, 
  Star, 
  Zap, 
  Gift, 
  AlertCircle,
  Flame,
  Clock,
  Tag,
  Mountain,
  Plane,
  Heart,
  Shield,
  Percent
} from 'lucide-react';

interface MarqueeBannerItem {
  id: string;
  title: string;
  subtitle?: string;
  link_url?: string;
  background_color?: string;
  text_color?: string;
  icon?: string;
}

interface BannerConfig {
  displayMode: 'icon' | 'text';
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
}

const parseConfig = (subtitle?: string): BannerConfig => {
  try {
    if (subtitle) {
      return JSON.parse(subtitle);
    }
  } catch (e) {}
  return {
    displayMode: 'icon',
    fontSize: 'base',
    fontWeight: 'medium',
    fontStyle: 'normal',
  };
};

const fontSizeClasses: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

const fontWeightClasses: Record<string, string> = {
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

const getFontClass = (config: BannerConfig) => {
  const sizeClass = fontSizeClasses[config.fontSize] || 'text-base';
  const weightClass = fontWeightClasses[config.fontWeight] || 'font-medium';
  const styleClass = config.fontStyle === 'italic' ? 'italic' : config.fontStyle === 'uppercase' ? 'uppercase tracking-wider' : '';
  return `${sizeClass} ${weightClass} ${styleClass}`;
};

const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="w-4 h-4" />,
  mappin: <MapPin className="w-4 h-4" />,
  calendar: <Calendar className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  star: <Star className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  gift: <Gift className="w-4 h-4" />,
  alert: <AlertCircle className="w-4 h-4" />,
  flame: <Flame className="w-4 h-4" />,
  clock: <Clock className="w-4 h-4" />,
  tag: <Tag className="w-4 h-4" />,
  mountain: <Mountain className="w-4 h-4" />,
  plane: <Plane className="w-4 h-4" />,
  heart: <Heart className="w-4 h-4" />,
  shield: <Shield className="w-4 h-4" />,
  percent: <Percent className="w-4 h-4" />,
};

const defaultContent: MarqueeBannerItem[] = [
  { id: 'default-1', title: '🏔️ Kedarnath Yatra 2025 Registrations Open', icon: 'calendar' },
  { id: 'default-2', title: '⭐ Best Price Guarantee on All Stays', icon: 'tag' },
  { id: 'default-3', title: '🚁 Helicopter Booking Available', icon: 'zap' },
  { id: 'default-4', title: '📞 24/7 Customer Support', icon: 'phone' },
  { id: 'default-5', title: '🎁 Special Monsoon Discounts - Up to 30% Off', icon: 'gift' },
  { id: 'default-6', title: '🔥 Limited Rooms Available for Peak Season', icon: 'flame' },
];

// Single item renderer (no tracking for clones)
const MarqueeItemDisplay = ({ 
  item, 
  onClick 
}: { 
  item: MarqueeBannerItem; 
  onClick: () => void;
}) => {
  const config = parseConfig(item.subtitle);

  return (
    <div
      onClick={onClick}
      className="inline-flex items-center gap-3 px-8 cursor-pointer select-none hover:opacity-80 transition-opacity"
    >
      {config.displayMode === 'icon' && (
        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 flex-shrink-0">
          {item.icon && iconMap[item.icon] ? iconMap[item.icon] : <Sparkles className="w-3.5 h-3.5" />}
        </span>
      )}
      <span className={`text-white whitespace-nowrap ${getFontClass(config)}`}>
        {item.title}
      </span>
      <span className="w-2 h-2 rounded-full bg-gray-600 ml-8 flex-shrink-0" />
    </div>
  );
};

// Tracked item for analytics
const MarqueeItemTracked = ({ 
  item, 
  onNavigate 
}: { 
  item: MarqueeBannerItem; 
  onNavigate: (url: string) => void;
}) => {
  const { ref, trackClick } = useBannerTracking({
    bannerId: item.id,
    bannerTitle: item.title,
    position: 'marquee'
  });

  const handleClick = () => {
    trackClick();
    if (item.link_url) {
      onNavigate(item.link_url);
    }
  };

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      <MarqueeItemDisplay item={item} onClick={handleClick} />
    </div>
  );
};

export default function MarqueeBanner() {
  const [isPaused, setIsPaused] = useState(false);
  const [repeatCount, setRepeatCount] = useState(10);
  const trackRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: banners = [] } = useQuery({
    queryKey: ['marquee-banners'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .eq('position', 'marquee')
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching marquee banners:', error);
        return [];
      }
      return data as MarqueeBannerItem[];
    },
    staleTime: 300000,
  });

  const content = banners.length > 0 ? banners : defaultContent;

  // Calculate how many times to repeat based on screen width
  useEffect(() => {
    const calculateRepeats = () => {
      const screenWidth = window.innerWidth;
      // Estimate ~300px per item average, need at least 2x screen width
      const minWidth = screenWidth * 3;
      const estimatedItemWidth = 350;
      const itemsNeeded = Math.ceil(minWidth / (content.length * estimatedItemWidth));
      setRepeatCount(Math.max(itemsNeeded, 6)); // Minimum 6 repeats
    };

    calculateRepeats();
    window.addEventListener('resize', calculateRepeats);
    return () => window.removeEventListener('resize', calculateRepeats);
  }, [content.length]);

  const handleNavigate = (url: string) => {
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      navigate(url);
    }
  };

  // Speed based on content - slower for less content (20% slower)
  const speed = Math.max(18, content.length * 10);

  return (
    <div 
      className="relative overflow-hidden bg-slate-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
      
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

      {/* Marquee Container */}
      <div className="py-3 overflow-hidden">
        <div 
          ref={trackRef}
          className="flex w-max"
          style={{
            animation: `marquee-scroll ${speed}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {/* Repeat content many times to ensure no gaps */}
          {[...Array(repeatCount)].map((_, repeatIndex) => (
            <div key={repeatIndex} className="flex">
              {content.map((item, itemIndex) => (
                repeatIndex === 0 ? (
                  <MarqueeItemTracked 
                    key={`tracked-${item.id}-${itemIndex}`} 
                    item={item} 
                    onNavigate={handleNavigate}
                  />
                ) : (
                  <MarqueeItemDisplay 
                    key={`clone-${repeatIndex}-${item.id}-${itemIndex}`} 
                    item={item} 
                    onClick={() => item.link_url && handleNavigate(item.link_url)}
                  />
                )
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      {/* Keyframes - translate by percentage based on repeat count */}
      <style>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / ${repeatCount} * ${Math.floor(repeatCount / 2)}));
          }
        }
      `}</style>
    </div>
  );
}
