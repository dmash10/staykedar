import { memo } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Cloud, CloudRain, Sun, CloudLightning, Snowflake, CloudFog, Wind } from "lucide-react";

interface WeatherCardProps {
  temperature: number;
  condition: string;
  time?: string;
  date?: string;
  className?: string;
}

const WeatherCard = memo(({ temperature, condition, time, date, className }: WeatherCardProps) => {
  const getWeatherIcon = (condition: string) => {
    const conditions = condition.toLowerCase();
    if (conditions.includes('rain') || conditions.includes('drizzle')) {
      return <CloudRain className="w-full h-full" />;
    } else if (conditions.includes('clear') || conditions.includes('sunny')) {
      return <Sun className="w-full h-full" />;
    } else if (conditions.includes('cloud')) {
      return <Cloud className="w-full h-full" />;
    } else if (conditions.includes('thunder') || conditions.includes('lightning')) {
      return <CloudLightning className="w-full h-full" />;
    } else if (conditions.includes('snow')) {
      return <Snowflake className="w-full h-full" />;
    } else if (conditions.includes('fog') || conditions.includes('mist')) {
      return <CloudFog className="w-full h-full" />;
    } else {
      return <Cloud className="w-full h-full" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-6",
        "hover:bg-white/20 transition-all duration-300",
        "group",
        className
      )}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-light/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 mb-4 text-white">
          {getWeatherIcon(condition)}
        </div>

        <div className="space-y-2">
          <div className="text-4xl font-bold text-white">
            {temperature}°C
          </div>
          
          <div className="text-white/90 font-medium">
            {condition}
          </div>

          {(time || date) && (
            <div className="text-sm text-white/70 space-y-1">
              {time && <div>{time}</div>}
              {date && <div>{date}</div>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

WeatherCard.displayName = "WeatherCard";

export { WeatherCard }; 