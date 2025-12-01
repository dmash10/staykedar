import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    Cell
} from 'recharts';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Calendar,
    Download,
    Filter
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function RevenuePage() {
    const [timeRange, setTimeRange] = useState('30days');

    const { data: revenueData, isLoading } = useQuery({
        queryKey: ['admin-revenue', timeRange],
        queryFn: async () => {
            // Fetch bookings
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select(`
          *,
          rooms (
            name,
            properties (name)
          )
        `)
                .eq('status', 'confirmed') // Only confirmed bookings count as revenue
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Calculate totals
            const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;
            const totalBookings = bookings?.length || 0;
            const avgOrderValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

            // Process daily revenue for chart
            const days = 30;
            const endDate = new Date();
            const startDate = subDays(endDate, days);

            const dailyData = eachDayOfInterval({ start: startDate, end: endDate }).map(date => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const dayBookings = bookings?.filter(b =>
                    format(new Date(b.created_at), 'yyyy-MM-dd') === dateStr
                ) || [];

                return {
                    date: format(date, 'MMM dd'),
                    revenue: dayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0),
                    bookings: dayBookings.length
                };
            });

            // Process revenue by property
            const propertyRevenue: Record<string, number> = {};
            bookings?.forEach(b => {
                const propName = b.rooms?.properties?.name || 'Unknown';
                propertyRevenue[propName] = (propertyRevenue[propName] || 0) + (b.total_price || 0);
            });

            const propertyData = Object.entries(propertyRevenue)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5); // Top 5 properties

            return {
                totalRevenue,
                totalBookings,
                avgOrderValue,
                dailyData,
                propertyData,
                recentTransactions: bookings?.slice(-5).reverse() || []
            };
        }
    });

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
        <AdminLayout title="Revenue Analytics">
            {/* Header Actions */}
            <div className="flex justify-end mb-6 gap-3">
                <Select defaultValue="30days" onValueChange={setTimeRange}>
                    <SelectTrigger className="w-[180px] bg-[#111111] border-[#2A2A2A] text-white">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#2A2A2A] text-white">
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="30days">Last 30 Days</SelectItem>
                        <SelectItem value="90days">Last 3 Months</SelectItem>
                        <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" className="bg-[#111111] border-[#2A2A2A] text-white hover:bg-[#1A1A1A]">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 border-none text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium mb-1">Total Revenue</p>
                                <h3 className="text-3xl font-bold">₹{revenueData?.totalRevenue.toLocaleString()}</h3>
                                <div className="flex items-center mt-2 text-emerald-100">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    <span className="text-sm">+12.5% vs last month</span>
                                </div>
                            </div>
                            <div className="bg-white/20 p-3 rounded-lg">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Avg. Order Value</p>
                                <h3 className="text-3xl font-bold text-white">₹{Math.round(revenueData?.avgOrderValue || 0).toLocaleString()}</h3>
                                <div className="flex items-center mt-2 text-green-400">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    <span className="text-sm">+5.2%</span>
                                </div>
                            </div>
                            <div className="bg-blue-500/10 p-3 rounded-lg">
                                <CreditCard className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Total Transactions</p>
                                <h3 className="text-3xl font-bold text-white">{revenueData?.totalBookings}</h3>
                                <div className="flex items-center mt-2 text-gray-400">
                                    <span className="text-sm">Confirmed bookings</span>
                                </div>
                            </div>
                            <div className="bg-purple-500/10 p-3 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Revenue Over Time */}
                <Card className="lg:col-span-2 bg-[#111111] border-[#2A2A2A]">
                    <CardHeader className="border-b border-[#2A2A2A]">
                        <CardTitle className="text-white text-lg font-semibold">Revenue Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData?.dailyData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6B7280"
                                        tick={{ fill: '#6B7280' }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#6B7280"
                                        tick={{ fill: '#6B7280' }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `₹${value / 1000}k`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1A1A1A',
                                            border: '1px solid #2A2A2A',
                                            borderRadius: '8px',
                                            color: '#FFFFFF'
                                        }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10B981"
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue by Property */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader className="border-b border-[#2A2A2A]">
                        <CardTitle className="text-white text-lg font-semibold">Top Properties</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData?.propertyData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#2A2A2A' }}
                                        contentStyle={{
                                            backgroundColor: '#1A1A1A',
                                            border: '1px solid #2A2A2A',
                                            borderRadius: '8px',
                                            color: '#FFFFFF'
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                        {revenueData?.propertyData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-[#111111] border-[#2A2A2A]">
                <CardHeader className="border-b border-[#2A2A2A]">
                    <CardTitle className="text-white text-lg font-semibold">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#2A2A2A] text-left">
                                    <th className="p-4 text-gray-400 font-medium text-sm">Transaction ID</th>
                                    <th className="p-4 text-gray-400 font-medium text-sm">Date</th>
                                    <th className="p-4 text-gray-400 font-medium text-sm">Property</th>
                                    <th className="p-4 text-gray-400 font-medium text-sm">Status</th>
                                    <th className="p-4 text-gray-400 font-medium text-sm text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenueData?.recentTransactions.map((booking) => (
                                    <tr key={booking.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A] transition">
                                        <td className="p-4 text-gray-300 font-mono text-sm">#{booking.id.slice(0, 8)}</td>
                                        <td className="p-4 text-gray-300 text-sm">
                                            {format(new Date(booking.created_at), 'MMM dd, yyyy HH:mm')}
                                        </td>
                                        <td className="p-4 text-white text-sm font-medium">
                                            {booking.rooms?.properties?.name}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                Completed
                                            </span>
                                        </td>
                                        <td className="p-4 text-white font-bold text-right">
                                            ₹{booking.total_price?.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
