import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Container from '@/components/Container';
import { getWeatherData, WeatherData, ForecastDay } from '@/utils/weatherApi';
import { 
  Cloud, Sun, CloudRain, Loader2, CloudSnow, CloudLightning, CloudSun,
  Thermometer, Droplets, Wind, Eye, Calendar, MapPin, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import AIOptimizedFAQ, { FAQItem } from '@/components/SEO/AIOptimizedFAQ';

// Weather FAQs for AI Search
const WeatherFAQs: FAQItem[] = [
  {
    question: "What is the current weather in Kedarnath?",
    answer: "Kedarnath weather varies significantly by season. Summer (May-June) sees temperatures between 5-15°C, making it ideal for pilgrimage. Winter (November-April) brings heavy snowfall with temperatures dropping to -10°C or lower. Check the live weather above for current conditions."
  },
  {
    question: "What is the best time to visit Kedarnath weather-wise?",
    answer: "The best weather for visiting Kedarnath is May-June and September-October. May-June offers pleasant temperatures (10-15°C) with clear skies. September-October has cooler weather (5-10°C) with fewer crowds. Avoid July-August (monsoon) and November-April (heavy snow, temple closed)."
  },
  {
    question: "Does it rain in Kedarnath?",
    answer: "Yes, Kedarnath receives significant rainfall during monsoon (July-August) with 200-300mm monthly. Light showers can occur in May-June too. The trek becomes risky during heavy rains due to landslides. Always carry waterproof gear regardless of season."
  },
  {
    question: "How cold does Kedarnath get in winter?",
    answer: "Kedarnath temperatures in winter (November-April) drop to -10°C to -20°C. The area receives 5-10 feet of snow, making it inaccessible. The temple closes in November (Diwali period) and reopens in late April/early May when snow melts."
  },
  {
    question: "What should I wear for Kedarnath weather?",
    answer: "Pack layered clothing regardless of season: thermal inners, fleece jackets, and a waterproof outer layer. Even in summer, temperatures drop below 5°C at night. Carry: warm jacket, rain poncho, sturdy trekking shoes, sunglasses, and sunscreen."
  }
];

const Weather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchWeather = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      const data = await getWeatherData();
      if (data) {
        setWeather(data);
      } else {
        setError('Weather data not available');
      }
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError('Failed to load weather data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (condition: string, size: string = "h-8 w-8") => {
    const c = condition.toLowerCase();
    if (c.includes('thunder') || c.includes('lightning')) {
      return <CloudLightning className={`${size} text-purple-500`} />;
    } else if (c.includes('snow') || c.includes('freezing') || c.includes('blizzard')) {
      return <CloudSnow className={`${size} text-blue-300`} />;
    } else if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return <CloudRain className={`${size} text-blue-500`} />;
    } else if (c.includes('partly cloudy') || c.includes('partly sunny')) {
      return <CloudSun className={`${size} text-orange-400`} />;
    } else if (c.includes('cloud') || c.includes('overcast') || c.includes('fog') || c.includes('mist')) {
      return <Cloud className={`${size} text-gray-400`} />;
    } else if (c.includes('sun') || c.includes('clear')) {
      return <Sun className={`${size} text-yellow-500`} />;
    }
    return <Cloud className={`${size} text-gray-400`} />;
  };

  // Schema for Weather page
  const weatherSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Kedarnath Weather - Live Forecast & Best Time to Visit",
    "description": "Check live Kedarnath weather forecast, temperature, and 7-day prediction. Plan your Kedarnath Yatra with accurate weather information.",
    "url": "https://staykedarnath.in/weather",
    "mainEntity": {
      "@type": "Place",
      "name": "Kedarnath",
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "30.7346",
        "longitude": "79.0669"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      <Helmet>
        <title>Kedarnath Weather - Live Forecast & 7-Day Prediction | StayKedarnath</title>
        <meta name="description" content="Check live Kedarnath weather today. Get 7-day forecast, temperature, humidity, and wind conditions. Best time to visit Kedarnath for pilgrimage." />
        <meta name="keywords" content="Kedarnath weather, Kedarnath temperature, Kedarnath forecast, Kedarnath weather today, best time to visit Kedarnath" />
        <link rel="canonical" href="https://staykedarnath.in/weather" />
        <meta property="og:title" content="Kedarnath Weather - Live Forecast | StayKedarnath" />
        <meta property="og:description" content="Check live Kedarnath weather forecast and 7-day prediction. Plan your Kedarnath Yatra with accurate weather information." />
        <meta property="og:url" content="https://staykedarnath.in/weather" />
        <script type="application/ld+json">{JSON.stringify(weatherSchema)}</script>
      </Helmet>

      <Nav />

      <main className="pt-20 pb-16">
        <Container>
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
            >
              <MapPin className="w-4 h-4" />
              Kedarnath, Uttarakhand (3,583m)
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kedarnath Weather
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Live weather forecast and 7-day prediction for planning your sacred journey
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-500">Loading weather data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <Cloud className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchWeather} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </div>
          ) : weather ? (
            <>
              {/* Current Weather Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white overflow-hidden mb-8">
                  <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      {/* Main Temperature */}
                      <div className="flex items-center gap-6">
                        <div className="bg-white/20 rounded-full p-6">
                          {getWeatherIcon(weather.condition, "h-16 w-16")}
                        </div>
                        <div>
                          <p className="text-7xl font-bold">{Math.round(weather.temperature)}°C</p>
                          <p className="text-xl text-blue-100 mt-2">{weather.condition}</p>
                          <p className="text-sm text-blue-200 mt-1">Feels like {Math.round(weather.feelsLike)}°C</p>
                        </div>
                      </div>

                      {/* Weather Details */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <Droplets className="h-6 w-6 text-blue-200" />
                          <div>
                            <p className="text-blue-200 text-sm">Humidity</p>
                            <p className="text-xl font-semibold">{weather.humidity}%</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Wind className="h-6 w-6 text-blue-200" />
                          <div>
                            <p className="text-blue-200 text-sm">Wind</p>
                            <p className="text-xl font-semibold">{weather.windSpeed} km/h</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Eye className="h-6 w-6 text-blue-200" />
                          <div>
                            <p className="text-blue-200 text-sm">Visibility</p>
                            <p className="text-xl font-semibold">{weather.visibility} km</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Thermometer className="h-6 w-6 text-blue-200" />
                          <div>
                            <p className="text-blue-200 text-sm">Elevation</p>
                            <p className="text-xl font-semibold">3,583 m</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-blue-400/30">
                      <p className="text-sm text-blue-200">
                        Last updated: {weather.lastUpdated}
                      </p>
                      <Button 
                        onClick={fetchWeather} 
                        disabled={isRefreshing}
                        variant="ghost" 
                        size="sm" 
                        className="text-white hover:bg-white/10"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 7-Day Forecast */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      7-Day Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                      {weather.forecast.map((day: ForecastDay, index: number) => (
                        <motion.div
                          key={day.date}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={`p-4 rounded-xl text-center ${
                            index === 0 ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            {index === 0 ? 'Today' : day.date.split(',')[0]}
                          </p>
                          <div className="flex justify-center my-3">
                            {getWeatherIcon(day.condition, "h-10 w-10")}
                          </div>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-1">{day.condition}</p>
                          <div className="flex justify-center gap-2 text-sm">
                            <span className="font-bold text-gray-900">{Math.round(day.maxTemp)}°</span>
                            <span className="text-gray-400">{Math.round(day.minTemp)}°</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Weather Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="mb-12 bg-amber-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-800">Weather Tips for Kedarnath Trek</CardTitle>
                  </CardHeader>
                  <CardContent className="text-amber-700">
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span><strong>Temperature drops at night:</strong> Even in summer, temperatures can fall below 5°C. Pack warm layers.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span><strong>Weather changes quickly:</strong> Mountain weather is unpredictable. Carry rain gear always.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span><strong>Start early:</strong> Begin your trek by 5-6 AM to avoid afternoon clouds and rain.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">•</span>
                        <span><strong>High altitude:</strong> At 3,583m, oxygen levels are lower. Acclimatize and stay hydrated.</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : null}

          {/* FAQ Section */}
          <AIOptimizedFAQ
            title="Kedarnath Weather - Frequently Asked Questions"
            description="Everything you need to know about weather conditions for your Kedarnath Yatra"
            faqs={WeatherFAQs}
          />
        </Container>
      </main>

      <Footer />
    </div>
  );
};

export default Weather;


