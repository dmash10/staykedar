import React, { useEffect, useState } from 'react';
import { CloudRain, Sun, CloudSnow, Wind, Droplets, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getWeatherData, WeatherData } from '@/utils/weatherApi';
import { Link } from 'react-router-dom';

export default function WeatherWidget({ className }: { className?: string }) {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const weather = await getWeatherData();
            setData(weather);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="h-48 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />;

    if (!data) return null;

    // Determine "Is it raining/snowing?"
    const conditionLower = data.condition.toLowerCase();
    const isBadWeather = conditionLower.includes('rain') || conditionLower.includes('snow') || conditionLower.includes('drizzle') || conditionLower.includes('thunder');

    return (
        <Card className={`overflow-hidden border-0 shadow-lg ${className}`}>
            <div className={`p-6 ${isBadWeather ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white' : 'bg-gradient-to-br from-sky-400 to-blue-600 text-white'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-medium opacity-90">Current Status</h3>
                        <h2 className="text-3xl font-bold mt-1">
                            {isBadWeather ? "Yes, it might be." : "No, it looks clear."}
                        </h2>
                        <p className="text-sm opacity-75 mt-2">
                            {data.condition} in Kedarnath
                        </p>
                    </div>
                    {isBadWeather ? <CloudRain className="w-12 h-12 opacity-80" /> : <Sun className="w-12 h-12 opacity-80" />}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="flex justify-center mb-1"><Wind className="w-4 h-4" /></div>
                        <div className="text-sm font-bold">{data.windSpeed} km/h</div>
                    </div>
                    <div className="text-center border-l border-white/20">
                        <div className="flex justify-center mb-1"><Droplets className="w-4 h-4" /></div>
                        <div className="text-sm font-bold">{data.humidity}%</div>
                    </div>
                    <div className="text-center border-l border-white/20">
                        <div className="text-xs uppercase opacity-70 mb-1">Temp</div>
                        <div className="text-sm font-bold">{data.temperature}°C</div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="text-xs opacity-60">Updated: {new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <Link to="/weather">
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hover:text-white p-0 h-auto">
                            Full Forecast <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
}
