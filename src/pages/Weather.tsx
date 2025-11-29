import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudFog, 
  CloudLightning, 
  Wind as WindIcon, 
  Thermometer, 
  Umbrella, 
  Wind, 
  Eye,
  RefreshCw,
  Calendar,
  Droplets,
  Snowflake,
  CloudSun,
  Moon,
  CloudMoon
} from "lucide-react";
import { motion } from "framer-motion";
import { getWeatherData, WeatherData, ForecastDay } from "@/utils/weatherApi";

// Component interfaces
interface WeatherProps {
  temp_c: number;
  feelslike_c: number;
  humidity: number;
  wind_kph: number;
  vis_km: number;
  last_updated: string;
  condition: {
    text: string;
    icon: string;
  };
}

const Weather = () => {
  const [weatherData, setWeatherData] = useState<WeatherProps | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get weather data from API or cache
        const weatherResult = await getWeatherData();
        if (!weatherResult) {
          throw new Error('Failed to fetch weather data');
        }
        
        const forecastResult = weatherResult.forecast;
        
        // Transform to match the expected format
        const transformedWeatherData: WeatherProps = {
          temp_c: weatherResult.temperature,
          feelslike_c: weatherResult.feelsLike,
          humidity: weatherResult.humidity,
          wind_kph: weatherResult.windSpeed,
          vis_km: weatherResult.visibility,
          last_updated: weatherResult.lastUpdated,
          condition: {
            text: weatherResult.condition,
            icon: weatherResult.icon
          }
        };
        
        setWeatherData(transformedWeatherData);
        setForecastData(forecastResult);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather data:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    // Fetch data immediately on component mount
    fetchData();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      console.log('Auto-refreshing weather data...');
      fetchData();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds
    
    // Clean up the interval when component unmounts
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Helper functions
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  const getWeatherIcon = (condition: string, isDay: number = 1) => {
    const conditionLower = condition.toLowerCase();
    
    // Animation variants for different weather types
    const sunnyAnimation = {
      animate: { 
        rotate: [0, 10, 0, -10, 0],
        scale: [1, 1.05, 1, 1.05, 1]
      },
      transition: { 
        duration: 8, 
        repeat: Infinity,
        ease: "easeInOut" 
      }
    };
    
    const cloudAnimation = {
      animate: { 
        x: [0, 5, 0, -5, 0],
        y: [0, -3, 0, 3, 0]
      },
      transition: { 
        duration: 6, 
        repeat: Infinity,
        ease: "easeInOut" 
      }
    };
    
    const rainAnimation = {
      animate: { 
        y: [0, 3, 0],
        scale: [1, 0.98, 1]
      },
      transition: { 
        duration: 2, 
        repeat: Infinity,
        ease: "easeInOut" 
      }
    };
    
    const snowAnimation = {
      animate: { 
        rotate: [0, 10, 0, -10, 0],
        y: [0, 2, 0, -2, 0]
      },
      transition: { 
        duration: 4, 
        repeat: Infinity,
        ease: "easeInOut" 
      }
    };
    
    const fogAnimation = {
      animate: { 
        opacity: [0.7, 0.9, 0.7],
        scale: [1, 1.03, 1]
      },
      transition: { 
        duration: 5, 
        repeat: Infinity,
        ease: "easeInOut" 
      }
    };
    
    const lightningAnimation = {
      animate: { 
        scale: [1, 1.1, 1],
        filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"]
      },
      transition: { 
        duration: 3, 
        repeat: Infinity,
        ease: "easeInOut" 
      }
    };

    const partlyCloudyAnimation = {
      animate: { 
        x: [0, 3, 0, -3, 0],
        y: [0, -2, 0, 2, 0]
      },
      transition: { 
        duration: 7, 
        repeat: Infinity,
        ease: "easeInOut" 
      }
    };
    
    // Night-time icons have a dark blue/purple color scheme
    if (!isDay) {
      // At night
      if (conditionLower.includes('partly cloudy')) {
        return (
          <motion.div 
            className="w-full h-full text-blue-300 flex items-center justify-center"
            {...partlyCloudyAnimation}
          >
            <CloudMoon size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
        return (
          <motion.div 
            className="w-full h-full text-blue-400 flex items-center justify-center"
            {...sunnyAnimation}
          >
            <Moon size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
        return (
          <motion.div 
            className="w-full h-full text-blue-500 flex items-center justify-center"
            {...rainAnimation}
          >
            <CloudRain size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('snow')) {
        return (
          <motion.div 
            className="w-full h-full text-blue-200 flex items-center justify-center"
            {...snowAnimation}
          >
            <CloudSnow size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
        return (
          <motion.div 
            className="w-full h-full text-blue-200 flex items-center justify-center"
            {...fogAnimation}
          >
            <CloudFog size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('thunder') || conditionLower.includes('lightning')) {
        return (
          <motion.div 
            className="w-full h-full text-blue-500 flex items-center justify-center"
            {...lightningAnimation}
          >
            <CloudLightning size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
        return (
          <motion.div 
            className="w-full h-full text-blue-300 flex items-center justify-center"
            {...cloudAnimation}
          >
            <Cloud size={32} strokeWidth={2} />
          </motion.div>
        );
      } else {
        return (
          <motion.div 
            className="w-full h-full text-blue-300 flex items-center justify-center"
            {...cloudAnimation}
          >
            <Cloud size={32} strokeWidth={2} />
          </motion.div>
        );
      }
    } else {
      // Daytime icons
      if (conditionLower.includes('partly cloudy')) {
        return (
          <motion.div 
            className="w-full h-full text-orange-400 flex items-center justify-center"
            {...partlyCloudyAnimation}
          >
            <CloudSun size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
        return (
          <motion.div 
            className="w-full h-full text-yellow-400 flex items-center justify-center"
            {...sunnyAnimation}
          >
            <Sun size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
        return (
          <motion.div 
            className="w-full h-full text-blue-400 flex items-center justify-center"
            {...rainAnimation}
          >
            <CloudRain size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('snow')) {
        return (
          <motion.div 
            className="w-full h-full text-blue-200 flex items-center justify-center"
            {...snowAnimation}
          >
            <CloudSnow size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('fog') || conditionLower.includes('mist')) {
        return (
          <motion.div 
            className="w-full h-full text-gray-400 flex items-center justify-center"
            {...fogAnimation}
          >
            <CloudFog size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('thunder') || conditionLower.includes('lightning')) {
        return (
          <motion.div 
            className="w-full h-full text-yellow-500 flex items-center justify-center"
            {...lightningAnimation}
          >
            <CloudLightning size={32} strokeWidth={2} />
          </motion.div>
        );
      } else if (conditionLower.includes('cloudy') || conditionLower.includes('overcast')) {
        return (
          <motion.div 
            className="w-full h-full text-gray-400 flex items-center justify-center"
            {...cloudAnimation}
          >
            <CloudSun size={32} strokeWidth={2} />
          </motion.div>
        );
      } else {
        return (
          <motion.div 
            className="w-full h-full text-gray-400 flex items-center justify-center"
            {...cloudAnimation}
          >
            <CloudSun size={32} strokeWidth={2} />
          </motion.div>
        );
      }
    }
  };
  
  const getWeatherAdvice = (temp: number, condition: string) => {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('rain')) {
      return "Don't forget your umbrella!";
    } else if (temp < 5) {
      return "Bundle up, it's freezing!";
    } else if (temp > 30) {
      return "Stay hydrated and seek shade.";
    } else if (conditionLower.includes('snow')) {
      return "Dress warmly and watch for slippery paths.";
    } else if (conditionLower.includes('fog')) {
      return "Be cautious while traveling, visibility is low.";
    } else if (conditionLower.includes('wind')) {
      return "Secure loose items and be careful outdoors.";
    } else if (conditionLower.includes('sunny') || conditionLower.includes('clear')) {
      return "Great day for outdoor activities!";
    } else {
      return "Check for weather updates before heading out.";
    }
  };
  
  // Helper functions to identify day and night
  const isNightTime = () => {
    const hours = new Date().getHours();
    return hours < 6 || hours >= 18; // Night time is between 6pm and 6am
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <Helmet>
        <title>Weather Forecast | StayKedarnath</title>
        <meta name="description" content="Get the latest weather forecast for Kedarnath and plan your trip accordingly." />
      </Helmet>
      
      <Nav />
      
      {/* Hero section with dynamic weather icon and blue background */}
      <section className="relative pt-28 pb-16 bg-blue-600" style={{ 
        backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.9), rgba(37, 99, 235, 0.9)), 
                          url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
      }}>
        <Container>
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            <motion.div
              animate={{ 
                rotate: weatherData?.condition?.text?.toLowerCase().includes('sunny') ? [0, 10, 0, -10, 0] : [0, 5, 0, -5, 0],
                scale: [1, 1.05, 1, 1.05, 1]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-6 w-16 h-16 bg-blue-500/30 rounded-full p-2 backdrop-blur-sm"
            >
              {!loading && weatherData ? (
                <span className="text-white">
                  {isNightTime() ? (
                    // Night time icons
                    weatherData.condition.text.toLowerCase().includes('partly cloudy') ? (
                      <CloudMoon className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('sunny') || weatherData.condition.text.toLowerCase().includes('clear') ? (
                      <Moon className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('rain') || weatherData.condition.text.toLowerCase().includes('drizzle') ? (
                      <CloudRain className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('snow') || weatherData.condition.text.toLowerCase().includes('freezing') ? (
                      <CloudSnow className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('thunder') || weatherData.condition.text.toLowerCase().includes('lightning') ? (
                      <CloudLightning className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('fog') || weatherData.condition.text.toLowerCase().includes('mist') ? (
                      <CloudFog className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('cloud') || weatherData.condition.text.toLowerCase().includes('overcast') ? (
                      <Cloud className="w-full h-full" />
                    ) : (
                      <Cloud className="w-full h-full" />
                    )
                  ) : (
                    // Day time icons
                    weatherData.condition.text.toLowerCase().includes('partly cloudy') ? (
                      <CloudSun className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('sunny') || weatherData.condition.text.toLowerCase().includes('clear') ? (
                      <Sun className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('rain') || weatherData.condition.text.toLowerCase().includes('drizzle') ? (
                      <CloudRain className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('snow') || weatherData.condition.text.toLowerCase().includes('freezing') ? (
                      <CloudSnow className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('thunder') || weatherData.condition.text.toLowerCase().includes('lightning') ? (
                      <CloudLightning className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('fog') || weatherData.condition.text.toLowerCase().includes('mist') ? (
                      <CloudFog className="w-full h-full" />
                    ) : weatherData.condition.text.toLowerCase().includes('cloud') || weatherData.condition.text.toLowerCase().includes('overcast') ? (
                      <Cloud className="w-full h-full" />
                    ) : (
                      <Cloud className="w-full h-full" />
                    )
                  )}
                </span>
              ) : (
                <Snowflake className="w-full h-full text-white" />
              )}
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-4 md:text-5xl lg:text-6xl">
              Kedarnath Weather Updates
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl">
              Plan your Yatra with real-time weather information
            </p>
          </div>
        </Container>
      </section>
      
      {/* Weather content */}
      <section className="py-12">
        <Container>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              <span className="ml-3 text-lg">Loading weather data...</span>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-6 text-center dark:bg-red-900/30">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Error</h3>
              <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
              <button 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" 
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="inline-block mr-2 h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Current weather and Forecast combined in one UI box */}
              <div className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-gray-800">
                {/* Current weather section */}
                {weatherData && (
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Current Weather</h2>
                    <div className="flex flex-col md:flex-row items-start gap-6">
                      <div className="flex items-center">
                        <div className="w-20 h-20 mr-4">
                          {getWeatherIcon(weatherData.condition.text, new Date().getHours() >= 6 && new Date().getHours() < 18 ? 1 : 0)}
                        </div>
                        <div>
                          <div className="text-4xl font-bold">{weatherData.temp_c}°C</div>
                          <div className="text-lg text-gray-600 dark:text-gray-300">{weatherData.condition.text}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Updated: {formatTime(weatherData.last_updated)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                          <div className="w-10 h-10 mr-3 text-blue-500">
                            <Thermometer className="w-full h-full" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Feels Like</p>
                            <p className="text-xl font-medium">{weatherData.feelslike_c}°C</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                          <div className="w-10 h-10 mr-3 text-blue-500">
                            <Droplets className="w-full h-full" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Humidity</p>
                            <p className="text-xl font-medium">{weatherData.humidity}%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                          <div className="w-10 h-10 mr-3 text-blue-500">
                            <WindIcon className="w-full h-full" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
                            <p className="text-xl font-medium">{weatherData.wind_kph} km/h</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg dark:bg-blue-900/20">
                          <div className="w-10 h-10 mr-3 text-blue-500">
                            <Eye className="w-full h-full" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Visibility</p>
                            <p className="text-xl font-medium">{weatherData.vis_km} km</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 7-Day Forecast section */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">7-Day Forecast</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                    {forecastData.map((forecast, index) => (
                      <motion.div 
                        key={forecast.date} 
                        className={`rounded-lg ${index === 0 ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-700'} p-3 flex flex-col h-full`}
                      >
                        {/* Day and Date */}
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium text-sm">
                            {index === 0 ? 'Today' : new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Mar {new Date(forecast.date).getDate()}
                          </p>
                        </div>
                        
                        {/* Weather Icon and Temperature */}
                        <div className="flex justify-center mb-2">
                          <div className="w-10 h-10">
                            {getWeatherIcon(forecast.condition, 1)}
                          </div>
                        </div>
                        
                        {/* Weather Condition - Full text without truncation */}
                        <p className="text-xs text-center text-gray-600 dark:text-gray-300 mb-2 h-8">
                          {forecast.condition}
                        </p>
                        
                        {/* Temperature - Min temp on right side of max temp */}
                        <div className="flex justify-center items-center mb-3">
                          <p className="text-lg font-bold">{forecast.maxTemp}°</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">{forecast.minTemp}°</p>
                        </div>
                        
                        {/* Weather Details */}
                        <div className="grid grid-cols-3 gap-2 mt-auto text-center">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Rain</p>
                            <div className="flex items-center justify-center">
                              <p className="text-xs font-medium">--</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Wind</p>
                            <div className="flex items-center justify-center">
                              <p className="text-xs font-medium">{forecast.windSpeed}</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Hum</p>
                            <div className="flex items-center justify-center">
                              <p className="text-xs font-medium">{forecast.humidity}%</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Weather safety tips */}
              <div className="overflow-hidden rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Kedarnath Weather Safety</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Calendar className="text-blue-500 w-8 h-8 mr-2" />
                      <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200">Best Time to Visit</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      The Kedarnath temple is open from April to November, with May-June and September-October offering the best weather conditions.
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Thermometer className="text-yellow-500 w-8 h-8 mr-2" />
                      <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">Temperature Awareness</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Temperatures can drop below freezing. Pack warm clothes, gloves, woolen caps, and thermal wear even in summer months.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <CloudRain className="text-red-500 w-8 h-8 mr-2" />
                      <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Monsoon Warning</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Avoid visiting during heavy monsoon (July-August). Landslides and flash floods are common during this period.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <Umbrella className="text-green-500 w-8 h-8 mr-2" />
                      <h3 className="text-lg font-medium text-green-800 dark:text-green-200">Safety Essentials</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Always carry a raincoat, umbrella, first-aid kit, and necessary medications. Weather can change rapidly in mountainous regions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>
      
      <Footer />
    </div>
  );
};

export default Weather;
