import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, AlertTriangle, Fuel, Wallet, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ROUTE_PROFIT_DATA = [
    { name: 'Dehradun -> Airport', profit: 4500, margin: '35%' },
    { name: 'Haridwar -> Sonprayag', profit: 3200, margin: '22%' },
    { name: 'Rishikesh -> Chopta', profit: 2800, margin: '18%' },
    { name: 'Delhi -> Haridwar', profit: 1500, margin: '12%' },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function TaxiAnalytics() {

    // FETCH REAL VEHICLE DEMAND
    const { data: vehicleDemand, isLoading: loadingDemand } = useQuery({
        queryKey: ['vehicle-demand'],
        queryFn: async () => {
            console.log("Fetching vehicle demand stats...");
            // Cast to any because types are not regenerated yet after migration
            const { data, error } = await supabase
                .from('bookings')
                .select('vehicle_type_requested') as any;

            if (error) {
                console.error("Supabase Analytics Error:", error);
                throw error;
            }

            // Aggregate Counts
            const counts: Record<string, number> = {};
            data?.forEach((booking: any) => {
                // Normalize type name
                let type = booking.vehicle_type_requested || 'Unspecified';
                // Capitalize first letter
                type = type.charAt(0).toUpperCase() + type.slice(1);
                counts[type] = (counts[type] || 0) + 1;
            });

            const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));

            // If empty, return placeholder to avoid broken chart
            if (chartData.length === 0) return [{ name: 'No Data', value: 1 }];

            return chartData;
        }
    });

    return (
        <div className="space-y-6">
            {/* KPI Cards (Mocked until Financial Tables exist) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs uppercase font-bold">Dead Mileage Loss</p>
                            <h3 className="text-2xl font-bold text-red-500">₹0</h3>
                            <p className="text-xs text-gray-500 mt-1">Requires GPS Tracking</p>
                        </div>
                        <div className="bg-red-500/10 p-2 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
                    </CardContent>
                </Card>
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs uppercase font-bold">Fuel Advances</p>
                            <h3 className="text-2xl font-bold text-amber-500">₹0</h3>
                            <p className="text-xs text-gray-500 mt-1">Requires Expense Log</p>
                        </div>
                        <div className="bg-amber-500/10 p-2 rounded-lg"><Fuel className="w-5 h-5 text-amber-500" /></div>
                    </CardContent>
                </Card>
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs uppercase font-bold">Net Margin</p>
                            <h3 className="text-2xl font-bold text-emerald-500">--%</h3>
                            <p className="text-xs text-gray-500 mt-1">Needs Cost Data</p>
                        </div>
                        <div className="bg-emerald-500/10 p-2 rounded-lg"><TrendingUp className="w-5 h-5 text-emerald-500" /></div>
                    </CardContent>
                </Card>
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs uppercase font-bold">Driver Payouts</p>
                            <h3 className="text-2xl font-bold text-blue-500">₹0</h3>
                            <p className="text-xs text-gray-500 mt-1">Pending Settlement</p>
                        </div>
                        <div className="bg-blue-500/10 p-2 rounded-lg"><Wallet className="w-5 h-5 text-blue-500" /></div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Route Profitability (Mocked) */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="text-white text-lg">Most Profitable Routes (Simulated)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={ROUTE_PROFIT_DATA} margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#333' }}
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        labelStyle={{ color: '#aaa' }}
                                    />
                                    <Bar dataKey="profit" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Demand (REAL DATA) */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="text-white text-lg flex items-center gap-2">
                            Vehicle Demand
                            {loadingDemand && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                            <span className="text-xs font-normal text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">LIVE</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center">
                            {vehicleDemand ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={vehicleDemand}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {vehicleDemand.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#aaa' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-gray-500 text-sm">No booking data available</div>
                            )}
                        </div>
                        <div className="flex justify-center gap-4 mt-4 flex-wrap">
                            {vehicleDemand?.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-sm text-gray-400">{entry.name} ({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Driver Reliability List (Mocked) */}
            <Card className="bg-[#111111] border-[#2A2A2A]">
                <CardHeader>
                    <CardTitle className="text-white text-lg">Top Rated Drivers (mock)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-[#1A1A1A] rounded-lg border border-[#2A2A2A]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center font-bold text-white">
                                        D{i}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white">Driver Name {i}</h4>
                                        <p className="text-xs text-gray-500">Innova Crysta • UK07-TX-000{i}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-emerald-400 font-bold text-lg">98%</div>
                                    <p className="text-xs text-gray-500">Acceptance Rate</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
