import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Snowflake, Wind, Mountain, Calendar, CheckCircle2, AlertTriangle, ArrowRight, Bell, Droplets } from "lucide-react";
import Container from "../Container";
import { supabase } from "@/integrations/supabase/client";
import { TransitionLink } from "../TransitionLink";
import { useQuery } from "@tanstack/react-query";
import { getWeatherData } from "@/utils/weatherApi";

interface LiveUpdate {
    id: string;
    title: string;
    content: string;
    category: string;
    is_pinned: boolean;
    published_at: string;
}

const getTrekStatus = () => {
    const month = new Date().getMonth();
    if (month >= 4 && month <= 10) {
        return { isOpen: true, status: 'Open', subtext: 'Season Active' };
    }
    return { isOpen: false, status: 'Closed', subtext: 'Opens May 2025' };
};

// Subtle weather tints and glows
const getWeatherTheme = (condition: string, temp: number) => {
    const c = condition.toLowerCase();

    if (c.includes('snow') && (c.includes('heavy') || c.includes('blizzard'))) {
        // Heavy snow - whitish tint
        return {
            bg: 'bg-white/[0.06]',
            border: 'border-white/20',
            glow: 'shadow-[0_0_15px_rgba(255,255,255,0.08)]',
            icon: Snowflake,
            iconColor: 'text-white/80'
        };
    }
    if (c.includes('snow') || temp < 0) {
        // Snow/cold - subtle blue tint
        return {
            bg: 'bg-cyan-500/[0.06]',
            border: 'border-cyan-400/20',
            glow: 'shadow-[0_0_15px_rgba(34,211,238,0.1)]',
            icon: Snowflake,
            iconColor: 'text-cyan-300'
        };
    }
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
        // Rain - greyish tint
        return {
            bg: 'bg-slate-400/[0.06]',
            border: 'border-slate-400/20',
            glow: 'shadow-[0_0_15px_rgba(148,163,184,0.08)]',
            icon: CloudRain,
            iconColor: 'text-slate-300'
        };
    }
    if (c.includes('cloud') || c.includes('overcast') || c.includes('mist')) {
        // Cloudy - neutral grey
        return {
            bg: 'bg-gray-400/[0.05]',
            border: 'border-gray-400/15',
            glow: 'shadow-[0_0_12px_rgba(156,163,175,0.06)]',
            icon: Cloud,
            iconColor: 'text-gray-300'
        };
    }
    if (c.includes('sunny') || c.includes('clear')) {
        // Sunny - warm amber tint
        return {
            bg: 'bg-amber-500/[0.06]',
            border: 'border-amber-400/20',
            glow: 'shadow-[0_0_15px_rgba(251,191,36,0.1)]',
            icon: Sun,
            iconColor: 'text-amber-300'
        };
    }

    // Default - subtle neutral
    return {
        bg: 'bg-white/[0.04]',
        border: 'border-white/10',
        glow: 'shadow-[0_0_10px_rgba(255,255,255,0.03)]',
        icon: Cloud,
        iconColor: 'text-white/70'
    };
};

const formatTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
};

const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const WeatherTrekWidget = () => {
    const trekStatus = getTrekStatus();

    const { data: weather, isLoading: weatherLoading } = useQuery({
        queryKey: ['home-weather'],
        queryFn: getWeatherData,
        staleTime: 5 * 60 * 1000,
    });

    const { data: updates = [], isLoading: updatesLoading } = useQuery({
        queryKey: ['home-live-updates'],
        queryFn: async () => {
            const { data } = await supabase
                .from('live_status_updates')
                .select('*')
                .eq('is_active', true)
                .order('is_pinned', { ascending: false })
                .order('published_at', { ascending: false })
                .limit(2);
            return (data || []) as LiveUpdate[];
        },
        staleTime: 5 * 60 * 1000,
    });

    const theme = weather ? getWeatherTheme(weather.condition, weather.temperature) : getWeatherTheme('cloudy', 10);
    const WeatherIcon = theme.icon;

    return (
        <section className="py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
            <Container>
                <div className="flex items-stretch gap-3">
                    {/* Weather Card - Tinted Glass */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`relative w-[220px] flex-shrink-0 rounded-xl overflow-hidden ${theme.glow}`}
                    >
                        {/* Glass with tint */}
                        <div className={`absolute inset-0 ${theme.bg} backdrop-blur-xl`} />
                        <div className={`absolute inset-0 border ${theme.border} rounded-xl`} />

                        {/* Shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full animate-[shimmer_4s_infinite]" />

                        <div className="relative p-3 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${theme.bg}`}>
                                <WeatherIcon className={`w-6 h-6 ${theme.iconColor}`} />
                            </div>

                            {weatherLoading ? (
                                <div className="animate-pulse">
                                    <div className="h-6 w-12 bg-white/10 rounded mb-1" />
                                    <div className="h-3 w-16 bg-white/5 rounded" />
                                </div>
                            ) : weather ? (
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-2xl font-semibold text-white">{Math.round(weather.temperature)}°</span>
                                        <span className="text-xs text-white/50">C</span>
                                    </div>
                                    <p className="text-[11px] text-white/70 truncate">{weather.condition}</p>
                                </div>
                            ) : null}

                            <div className="text-right">
                                <div className="flex items-center gap-1 text-[10px] text-white/60">
                                    <Mountain className="w-3 h-3" />
                                    <span>3,583m</span>
                                </div>
                                {weather && (
                                    <div className="flex items-center gap-1 text-[10px] text-white/50 mt-0.5">
                                        <Wind className="w-2.5 h-2.5" />
                                        <span>{Math.round(weather.windSpeed)}km/h</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Trek Status - Tinted Glass with Status Color */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.05 }}
                        className={`relative w-[140px] flex-shrink-0 rounded-xl overflow-hidden ${trekStatus.isOpen
                            ? 'shadow-[0_0_15px_rgba(52,211,153,0.12)]'
                            : 'shadow-[0_0_15px_rgba(251,113,133,0.12)]'
                            }`}
                    >
                        {/* Glass with status tint */}
                        <div className={`absolute inset-0 backdrop-blur-xl ${trekStatus.isOpen ? 'bg-emerald-500/[0.08]' : 'bg-rose-500/[0.08]'
                            }`} />
                        <div className={`absolute inset-0 border rounded-xl ${trekStatus.isOpen ? 'border-emerald-400/25' : 'border-rose-400/25'
                            }`} />

                        <div className="relative p-3 h-full flex flex-col justify-center">
                            <p className="text-[9px] text-white/40 uppercase tracking-wider mb-1">Yatra Status</p>
                            <div className="flex items-center gap-2">
                                {trekStatus.isOpen ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                                )}
                                <div>
                                    <p className={`text-sm font-semibold ${trekStatus.isOpen ? 'text-emerald-300' : 'text-rose-300'}`}>
                                        {trekStatus.status}
                                    </p>
                                    <p className="text-[10px] text-white/60">{trekStatus.subtext}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Live Updates - Subtle Blue Tinted Glass */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="relative flex-1 rounded-xl overflow-hidden shadow-[0_0_12px_rgba(147,197,253,0.06)]"
                    >
                        {/* Glass with subtle blue tint */}
                        <div className="absolute inset-0 bg-blue-500/[0.03] backdrop-blur-xl" />
                        <div className="absolute inset-0 border border-blue-400/10 rounded-xl" />

                        <div className="relative h-full flex">
                            {/* Header */}
                            <div className="flex items-center gap-2 px-3 border-r border-white/[0.08]">
                                <Bell className="w-4 h-4 text-blue-300/70" />
                                <span className="text-[11px] text-white/70 font-medium">Updates</span>
                            </div>

                            {/* Updates */}
                            <div className="flex-1 flex items-center px-3 gap-4 overflow-hidden">
                                {updatesLoading ? (
                                    <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                                ) : updates.length === 0 ? (
                                    <span className="text-[11px] text-white/50">No recent updates</span>
                                ) : (
                                    updates.map((update) => (
                                        <div key={update.id} className="flex items-center gap-2 min-w-0">
                                            <span className={`shrink-0 w-1.5 h-1.5 rounded-full ${update.category === 'alert' ? 'bg-rose-400' :
                                                update.category === 'weather' ? 'bg-cyan-400' :
                                                    update.category === 'route' ? 'bg-amber-400' : 'bg-blue-400'
                                                }`} />
                                            <span className="text-[11px] text-white/80 truncate max-w-[200px]">
                                                {stripHtml(update.title)}
                                            </span>
                                            <span className="text-[9px] text-white/40">{formatTimeAgo(update.published_at)}</span>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* View All */}
                            <TransitionLink
                                to="/live-status"
                                className="flex items-center gap-1 px-3 text-[10px] text-blue-300/60 hover:text-blue-300 transition-colors border-l border-white/[0.08]"
                            >
                                All <ArrowRight className="w-3 h-3" />
                            </TransitionLink>
                        </div>
                    </motion.div>
                </div>
            </Container>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </section>
    );
};

export default WeatherTrekWidget;
