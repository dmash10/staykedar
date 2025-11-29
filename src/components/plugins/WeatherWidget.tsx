import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Umbrella, Cloud, Sun, CloudRain, Loader2, CloudSnow, CloudLightning, CloudSun } from 'lucide-react';
import { getWeatherData, WeatherData } from '@/utils/weatherApi';

interface WeatherWidgetProps {
  title?: string;
  showIcon?: boolean;
}

export default function WeatherWidget({ 
  title = "Kedarnath Weather", 
  showIcon = true 
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getWeatherData();
        if (data) {
          setWeather(data);
        } else {
          setError('Weather data not available');
        }
      } catch (error) {
        console.error('Failed to fetch weather:', error);
        setError('Failed to load weather data');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data immediately
    fetchWeather();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing WeatherWidget data...');
      fetchWeather();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Clean up interval on unmount
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  const getWeatherIcon = () => {
    if (!weather) return <Cloud className="h-8 w-8 text-blue-400" />;
    
    const condition = weather.condition.toLowerCase();
    
    if (condition.includes('thunder') || condition.includes('lightning')) {
      return <CloudLightning className="h-8 w-8 text-gray-600" />;
    } else if (condition.includes('snow') || condition.includes('freezing') || condition.includes('blizzard')) {
      return <CloudSnow className="h-8 w-8 text-blue-300" />;
    } else if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower')) {
      return <CloudRain className="h-8 w-8 text-blue-400" />;
    } else if (condition.includes('partly cloudy') || condition.includes('partly sunny')) {
      return <CloudSun className="h-8 w-8 text-orange-400" />;
    } else if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('fog') || condition.includes('mist')) {
      return <Cloud className="h-8 w-8 text-gray-400" />;
    } else if (condition.includes('sun') || condition.includes('clear')) {
      return <Sun className="h-8 w-8 text-yellow-400" />;
    } else {
      return <Umbrella className="h-8 w-8 text-blue-400" />;
    }
  };

  return (
    <Card className="bg-white shadow-md border border-gray-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          {showIcon && <Umbrella className="h-5 w-5 mr-2 text-blue-500" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">
            <p>{error}</p>
          </div>
        ) : weather ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {getWeatherIcon()}
              <div className="ml-4">
                <p className="text-2xl font-bold">{weather.temperature}°C</p>
                <p className="text-gray-600">{weather.condition}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Humidity: {weather.humidity}%</p>
              <p className="text-sm text-gray-600">Wind: {weather.windSpeed} km/h</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <p>No weather data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 