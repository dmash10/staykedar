import { createRoot } from 'react-dom/client'
console.log("DEBUG: main.tsx executing");
import App from './App.tsx'
import './index.css'
import './attraction-global.css' // Global styles for attraction content

// Vercel Speed Insights - must run on client side only
import { injectSpeedInsights } from '@vercel/speed-insights';
injectSpeedInsights();

// Clear localStorage weather data to prevent caching issues
localStorage.removeItem('kedarnath_weather_data');
localStorage.removeItem('kedarnath_forecast_data');
localStorage.removeItem('kedarnath_weather_data_v2');
localStorage.removeItem('kedarnath_forecast_data_v2');

import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <App />
    </HelmetProvider>
);
