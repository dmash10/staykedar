import { toast } from "@/components/ui/use-toast";

// Weather data types
export interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  icon: string;
  isDay: number;
  forecast: ForecastDay[];
  updated: string;
  lastUpdated: string;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

// Cache weather data in localStorage to minimize API calls
const WEATHER_CACHE_KEY = 'kedarnath_weather_data_v3'; // Changed key to force fresh data
const FORECAST_CACHE_KEY = 'kedarnath_forecast_data_v3'; // Changed key to force fresh data
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// API credentials
const WEATHER_API_KEY = '2925f874ba9d4a5b93531256251203'; // WeatherAPI.com API key
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/forecast.json';

// Flag to use fixed data for demo purposes
const USE_FIXED_DATA = false; // Changed to false to use real API data

// Clear any existing weather data to force refresh
if (typeof window !== 'undefined') {
  localStorage.removeItem('kedarnath_weather_data');
  localStorage.removeItem('kedarnath_forecast_data');
  localStorage.removeItem('kedarnath_weather_data_v2');
  localStorage.removeItem('kedarnath_forecast_data_v2');
}

export const getWeatherData = async (): Promise<WeatherData | null> => {
  try {
    // Use fixed data for the demo if the flag is set
    if (USE_FIXED_DATA) {
      console.log('Using fixed weather data for demo');
      return getAccurateFallbackWeatherData();
    }

    // Check if we have cached data that's still valid
    const cachedData = localStorage.getItem(WEATHER_CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isValid = Date.now() - timestamp < CACHE_DURATION;

      if (isValid) {
        console.log('Using cached weather data');
        return data;
      }
    }

    // If no valid cache, fetch new data from WeatherAPI.com
    console.log('Fetching fresh weather data from WeatherAPI.com');
    const response = await fetch(
      `${WEATHER_API_URL}?key=${WEATHER_API_KEY}&q=Kedarnath&days=7&aqi=no&alerts=no`
    );

    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const result = await response.json();

    // Transform the API response into our format
    const weatherData: WeatherData = {
      location: 'Kedarnath',
      temperature: result.current.temp_c,
      condition: result.current.condition.text,
      icon: result.current.condition.icon,
      isDay: result.current.is_day,
      updated: new Date().toLocaleString(),
      lastUpdated: new Date().toLocaleString(),
      feelsLike: result.current.feelslike_c,
      humidity: result.current.humidity,
      windSpeed: result.current.wind_kph,
      visibility: result.current.vis_km,
      forecast: result.forecast.forecastday.map((day: any) => ({
        date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        maxTemp: day.day.maxtemp_c,
        minTemp: day.day.mintemp_c,
        condition: day.day.condition.text,
        icon: day.day.condition.icon,
        humidity: day.day.avghumidity,
        windSpeed: day.day.maxwind_kph
      }))
    };

    // Cache the data
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({
        data: weatherData,
        timestamp: Date.now()
      })
    );

    return weatherData;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    toast({
      title: "Weather data unavailable",
      description: "Using fallback weather information",
      variant: "destructive",
    });

    // Return fallback data if API fails
    return getAccurateFallbackWeatherData();
  }
};

// Function to get forecast data
export const getForecastData = async (): Promise<ForecastDay[]> => {
  try {
    // Check if we have cached data that's still valid
    const cachedData = localStorage.getItem(FORECAST_CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      const isValid = Date.now() - timestamp < CACHE_DURATION;

      if (isValid) {
        console.log('Using cached forecast data');
        return data;
      }
    }

    // If no valid cache, fetch from main weather data
    const weatherData = await getWeatherData();
    if (weatherData && weatherData.forecast) {
      // Cache the data
      localStorage.setItem(
        FORECAST_CACHE_KEY,
        JSON.stringify({
          data: weatherData.forecast,
          timestamp: Date.now()
        })
      );

      return weatherData.forecast;
    }

    throw new Error('Forecast data not available');
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return getAccurateFallbackForecastData();
  }
};

// Accurate fallback data based on real Kedarnath conditions
const getAccurateFallbackWeatherData = (): WeatherData => {
  // Current time to determine if it's day or night
  const currentHour = new Date().getHours();
  const isDay = currentHour >= 6 && currentHour < 18 ? 1 : 0;

  // Updated to match actual Kedarnath weather (partly cloudy)
  const currentCondition = {
    text: "Partly Cloudy",
    icon: "//cdn.weatherapi.com/weather/64x64/day/116.png"
  };

  const forecastData = getAccurateFallbackForecastData();

  return {
    location: 'Kedarnath',
    temperature: 1.5, // Updated to match today's range between max and min temps
    condition: currentCondition.text,
    icon: currentCondition.icon,
    isDay: isDay,
    updated: new Date().toLocaleString(),
    lastUpdated: new Date().toLocaleString(),
    feelsLike: -1.0, // Updated to feel colder than actual
    humidity: 33, // From screenshot
    windSpeed: 3.6, // From screenshot
    visibility: 10, // From screenshot
    forecast: forecastData
  };
};

// Accurate fallback forecast data based on real conditions
const getAccurateFallbackForecastData = (): ForecastDay[] => {
  const today = new Date();

  return [
    {
      date: today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      maxTemp: 2.0,
      minTemp: -5.0,
      condition: "Partly Cloudy",
      icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
      humidity: 54,
      windSpeed: 28.1
    },
    {
      date: new Date(today.getTime() + 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      maxTemp: 2.0,
      minTemp: -8.0,
      condition: "Moderate rain",
      icon: '//cdn.weatherapi.com/weather/64x64/day/302.png',
      humidity: 57,
      windSpeed: 20.2
    },
    {
      date: new Date(today.getTime() + 2 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      maxTemp: 1.0,
      minTemp: -7.0,
      condition: "Partly cloudy with snow",
      icon: '//cdn.weatherapi.com/weather/64x64/day/326.png',
      humidity: 70,
      windSpeed: 24.8
    },
    {
      date: new Date(today.getTime() + 3 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      maxTemp: -4.0,
      minTemp: -12.3,
      condition: "Moderate or heavy snow with thunder",
      icon: '//cdn.weatherapi.com/weather/64x64/day/395.png',
      humidity: 74,
      windSpeed: 24.8
    },
    {
      date: new Date(today.getTime() + 4 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      maxTemp: -4.8,
      minTemp: -12.6,
      condition: "Moderate snow",
      icon: '//cdn.weatherapi.com/weather/64x64/day/332.png',
      humidity: 55,
      windSpeed: 38.2
    },
    {
      date: new Date(today.getTime() + 5 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      maxTemp: 5.0,
      minTemp: -2.0,
      condition: "Sunny",
      icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
      humidity: 45,
      windSpeed: 37.4
    },
    {
      date: new Date(today.getTime() + 6 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      maxTemp: 8.0,
      minTemp: -2.0,
      condition: "Sunny",
      icon: '//cdn.weatherapi.com/weather/64x64/day/113.png',
      humidity: 54,
      windSpeed: 33.1
    }
  ];
};

// A special function that bypasses the API call entirely to ensure consistent display
// This is used for demo purposes to show accurate data without making API calls
export const getFixedWeatherData = (): WeatherData => {
  console.log('Using fixed demo data from WeatherAPI.com format');
  return getAccurateFallbackWeatherData();
};
