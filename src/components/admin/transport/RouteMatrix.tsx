import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RefreshCw, Zap } from 'lucide-react';

interface RouteData {
    id: number;
    route_name: string;
    vehicle_type: string;
    net_rate: number;
    sell_price: number;
}

const INITIAL_ROUTES: RouteData[] = [
    { id: 1, route_name: 'Haridwar -> Sonprayag', vehicle_type: 'Sedan (Dzire)', net_rate: 5500, sell_price: 7500 },
    { id: 2, route_name: 'Haridwar -> Sonprayag', vehicle_type: 'SUV (Innova)', net_rate: 8500, sell_price: 11500 },
    { id: 3, route_name: 'Haridwar -> Sonprayag', vehicle_type: 'Tempo Traveller', net_rate: 14000, sell_price: 18000 },
    { id: 4, route_name: 'Dehradun -> Kedarnath', vehicle_type: 'Sedan (Dzire)', net_rate: 6000, sell_price: 8500 },
    { id: 5, route_name: 'Dehradun -> Kedarnath', vehicle_type: 'SUV (Innova)', net_rate: 9000, sell_price: 12500 },
];

export function RouteMatrix() {
    const [routes, setRoutes] = useState<RouteData[]>(INITIAL_ROUTES);
    const [surgeMultiplier, setSurgeMultiplier] = useState(0); // Percentage

    const handleRateChange = (id: number, field: 'net_rate' | 'sell_price', value: string) => {
        const numVal = parseInt(value) || 0;
        setRoutes(routes.map(r => r.id === id ? { ...r, [field]: numVal } : r));
    };

    const applySurge = () => {
        // Just visual for now or update sell_price based on base * surge
        // To be simpler: we update sell_price = current_sell_price * (1 + surge/100)
        // But for this demo, let's just show the calculated "Surge Price" column
    };

    const getSurgePrice = (price: number) => {
        if (surgeMultiplier === 0) return price;
        return Math.floor(price * (1 + surgeMultiplier / 100));
    };

    return (
        <div className="space-y-6">
            {/* Surge Controller */}
            <Card className="bg-gradient-to-r from-amber-600/10 to-orange-600/10 border-amber-500/20">
                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="p-3 bg-amber-500/20 rounded-full">
                            <Zap className="w-6 h-6 text-amber-400 fill-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">Peak Season Surge</h3>
                            <p className="text-amber-200/60 text-sm">Global Price Increase</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Current Surge</span>
                            <span className="text-amber-400 font-bold font-mono">+{surgeMultiplier}%</span>
                        </div>
                        <Slider
                            defaultValue={[0]}
                            max={50}
                            step={5}
                            className="w-full"
                            onValueChange={(val) => setSurgeMultiplier(val[0])}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Matrix Table */}
            <div className="rounded-xl border border-[#2A2A2A] bg-[#111111]/80 backdrop-blur-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#1A1A1A] text-gray-400 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Route</th>
                            <th className="p-4">Vehicle</th>
                            <th className="p-4 w-[150px]">Net Rate (Driver)</th>
                            <th className="p-4 w-[150px]">Base Sell Price</th>
                            <th className="p-4 w-[150px]">Live Price (+Surge)</th>
                            <th className="p-4 w-[120px]">Net Margin</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2A2A2A]">
                        {routes.map((route) => {
                            const surgedPrice = getSurgePrice(route.sell_price);
                            const margin = surgedPrice - route.net_rate;
                            const marginPercent = Math.round((margin / surgedPrice) * 100);

                            return (
                                <tr key={route.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                    <td className="p-4 text-white font-medium">{route.route_name}</td>
                                    <td className="p-4 text-gray-300">
                                        <Badge variant="outline" className="border-blue-500/30 text-blue-300 bg-blue-500/10">
                                            {route.vehicle_type}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-500 text-xs">₹</span>
                                            <Input
                                                value={route.net_rate}
                                                onChange={(e) => handleRateChange(route.id, 'net_rate', e.target.value)}
                                                className="pl-6 h-9 bg-[#0A0A0A] border-[#333] text-gray-300 font-mono text-sm w-full"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5 text-gray-500 text-xs">₹</span>
                                            <Input
                                                value={route.sell_price}
                                                onChange={(e) => handleRateChange(route.id, 'sell_price', e.target.value)}
                                                className="pl-6 h-9 bg-[#0A0A0A] border-[#333] text-white font-mono text-sm w-full"
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`font-mono font-bold text-lg ${surgeMultiplier > 0 ? 'text-amber-400' : 'text-white'}`}>
                                            ₹{surgedPrice.toLocaleString()}
                                        </span>
                                        {surgeMultiplier > 0 && <span className="text-[10px] ml-2 text-amber-500/80">SURGE</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className={`font-bold font-mono ${margin > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                ₹{margin.toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-gray-500">{marginPercent}% Profit</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Save className="w-4 h-4 mr-2" /> Save Rate Card
                </Button>
            </div>
        </div>
    );
}
