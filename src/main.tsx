import { createRoot } from 'react-dom/client'
console.log("DEBUG: main.tsx executing");
import App from './App.tsx'
import './index.css'

// Clear localStorage weather data to prevent caching issues
localStorage.removeItem('kedarnath_weather_data');
localStorage.removeItem('kedarnath_forecast_data');
localStorage.removeItem('kedarnath_weather_data_v2');
localStorage.removeItem('kedarnath_forecast_data_v2');

createRoot(document.getElementById("root")!).render(<App />);
