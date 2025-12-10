
import { GlassCard } from "@/components/admin/dashboard/GlassCard";
import {
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Defs,
    LinearGradient,
    Stop
} from "recharts";
import { Info, AlertTriangle, TrendingUp } from "lucide-react";
import {
    Tooltip as UiTooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Generate realistic mock data
const generateData = () => {
    const data = [];
    const baseDemand = 40;
    const baseSupply = 45;

    for (let i = 1; i <= 30; i++) {
        const isWeekend = i % 7 === 0 || i % 7 === 6;
        const demandSpike = isWeekend ? Math.floor(Math.random() * 40) + 20 : Math.floor(Math.random() * 20) - 10;
        const dip = isWeekend ? Math.floor(Math.random() * 10) : 0;

        const demand = baseDemand + demandSpike;
        const supply = Math.max(0, baseSupply - dip + Math.floor(Math.random() * 5));

        // Critical: Supply < Demand
        const gap = supply - demand;
        const status = gap < 0 ? 'critical' : gap < 10 ? 'warning' : 'safe';

        data.push({
            day: `May ${i}`,
            supply,
            demand,
            shortage: gap < 0 ? Math.abs(gap) : 0,
            status
        });
    }
    return data;
};

const DATA = generateData();

export function InventoryAnalytics() {
    return (
        <GlassCard className="p-6 h-[500px] flex flex-col space-y-4">
            {/* Header with Title and "How it works" Tooltip */}
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Demand vs. Availability Intelligence
                    </h3>
                    <p className="text-sm text-slate-400">Predictive analysis of inventory pressure</p>
                </div>

                <TooltipProvider>
                    <UiTooltip>
                        <TooltipTrigger asChild>
                            <div className="cursor-help flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs hover:bg-blue-500/20 transition-colors">
                                <Info className="w-4 h-4" />
                                <span>How this works</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 border-white/10 p-4 max-w-sm text-slate-300 transform transition-all duration-200" side="left">
                            <div className="space-y-2">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                                    Smart Alerts
                                </h4>
                                <p className="text-xs leading-relaxed">
                                    <b className="text-white">Green Bars</b> represent your available room count.<br />
                                    <b className="text-white">Orange Line</b> represents customer search demand.<br /><br />
                                    <span className="text-red-400 block border-l-2 border-red-500 pl-2">
                                        When the <b className="text-red-300">Orange Line</b> goes ABOVE the green bars, you have a <b className="text-red-300">Supply Deficit</b>.
                                        This is a perfect time to enable "Surge Pricing" to maximize revenue.
                                    </span>
                                </p>
                            </div>
                        </TooltipContent>
                    </UiTooltip>
                </TooltipProvider>
            </div>

            {/* Chart Area */}
            <div className="flex-1 w-full min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                            </linearGradient>
                            <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="day"
                            stroke="#64748b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            interval={4}
                        />
                        <YAxis
                            stroke="#64748b"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                borderColor: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(8px)',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                            }}
                            itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}
                        />
                        {/* Supply Bars */}
                        <Bar
                            name="Available Rooms"
                            dataKey="supply"
                            fill="url(#colorSupply)"
                            barSize={8}
                            radius={[4, 4, 0, 0]}
                        />
                        {/* Demand Line */}
                        <Area
                            type="monotone"
                            name="Search Volume"
                            dataKey="demand"
                            stroke="#f59e0b"
                            fill="url(#colorDemand)"
                            strokeWidth={3}
                            dot={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>

                {/* Overlay Legend / Guide (static) */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 bg-black/40 p-2 rounded-lg border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500/50 rounded-sm"></div>
                        <span className="text-[10px] text-slate-300">Room Supply</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-1 bg-amber-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-300">Customer Demand</span>
                    </div>
                </div>
            </div>

            {/* Footer Text Explanation */}
            <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-full shrink-0">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                    <p className="text-xs text-slate-300">
                        <span className="font-bold text-white">Pro Tip:</span> Dates where the <span className="text-amber-400 font-bold">Orange Curve</span> rises above the green bars indicate potential sell-outs.
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                        These are your "High Value" dates. Increase prices in <span className="text-white hover:underline cursor-pointer">Surge Control</span> for these days.
                    </p>
                </div>

            </div>
        </GlassCard>
    );
}
