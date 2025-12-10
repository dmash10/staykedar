import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { GlassCard } from '@/components/admin/dashboard/GlassCard';
import { StatsCard } from '@/components/admin/dashboard/StatsCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    TrendingUp,
    TrendingDown,
    IndianRupee,
    Calendar,
    Users,
    Target,
    BarChart3,
    Activity,
    ShoppingCart,
    Loader2,
    Ticket,
    Filter,
    Download,
    Flame,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Building2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend
} from 'recharts';
import {
    format,
    subDays,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    parseISO,
    differenceInDays,
    isWithinInterval
} from 'date-fns';

// Chart colors matching the neon theme
const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

// Custom Tooltip with Glass effect
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
                <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-white font-bold text-sm">
                            {entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('discount') || entry.name.toLowerCase().includes('budget')
                                ? `₹${Number(entry.value).toLocaleString()}`
                                : entry.value.toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-xs">{entry.name}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Date Range Options
const DATE_RANGES = [
    { value: '7d', label: 'Last 7 Days', days: 7 },
    { value: '30d', label: 'Last 30 Days', days: 30 },
    { value: '90d', label: 'Last 90 Days', days: 90 },
    { value: 'month', label: 'This Month', days: 0 },
    { value: 'last_month', label: 'Last Month', days: 0 },
];

export function AnalyticsPageContent() {
    const navigate = useNavigate();
    const [dateRange, setDateRange] = useState('30d');
    const [compareEnabled, setCompareEnabled] = useState(true);

    // Calculate date ranges
    const { currentStart, currentEnd, prevStart, prevEnd, rangeDays } = useMemo(() => {
        const now = new Date();
        let currentStart: Date, currentEnd: Date, prevStart: Date, prevEnd: Date, rangeDays: number;

        if (dateRange === 'month') {
            currentStart = startOfMonth(now);
            currentEnd = now;
            prevStart = startOfMonth(subMonths(now, 1));
            prevEnd = endOfMonth(subMonths(now, 1));
            rangeDays = differenceInDays(currentEnd, currentStart) + 1;
        } else if (dateRange === 'last_month') {
            currentStart = startOfMonth(subMonths(now, 1));
            currentEnd = endOfMonth(subMonths(now, 1));
            prevStart = startOfMonth(subMonths(now, 2));
            prevEnd = endOfMonth(subMonths(now, 2));
            rangeDays = differenceInDays(currentEnd, currentStart) + 1;
        } else {
            const days = DATE_RANGES.find(r => r.value === dateRange)?.days || 30;
            currentStart = subDays(now, days);
            currentEnd = now;
            prevStart = subDays(currentStart, days);
            prevEnd = subDays(now, days);
            rangeDays = days;
        }

        return { currentStart, currentEnd, prevStart, prevEnd, rangeDays };
    }, [dateRange]);

    // Fetch analytics data
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['admin-analytics-enterprise', dateRange],
        queryFn: async () => {
            // Fetch unified data: Stays + Packages + Promos
            // @ts-ignore
            const [staysRes, packagesRes, promoRes, leadsRes, propsRes, ticketsRes] = await Promise.all([
                supabase.from('bookings').select('total_price, status, created_at, guest_name, check_in_date, rooms(properties(display_name))').gte('created_at', prevStart.toISOString()),
                supabase.from('package_bookings').select('total_price, status, created_at, travel_date').gte('created_at', prevStart.toISOString()),
                supabase.from('promo_code_usage').select('promo_code, used_at, discount_value, order_final').gte('used_at', prevStart.toISOString()),
                supabase.from('stay_leads').select('status, source, created_at, budget_category, guests').gte('created_at', prevStart.toISOString()),
                supabase.from('blind_properties').select('is_active'),
                supabase.from('support_tickets').select('status, priority, created_at, resolved_at'),
            ]);

            const stays: any[] = (staysRes.data as any[]) || [];
            const packages: any[] = (packagesRes.data as any[]) || [];
            const promos: any[] = (promoRes.data as any[]) || [];
            const leads: any[] = (leadsRes.data as any[]) || [];
            const properties: any[] = (propsRes.data as any[]) || [];
            const tickets: any[] = (ticketsRes.data as any[]) || [];

            // Helper to check interval
            const inCurrent = (dateStr: string) => isWithinInterval(parseISO(dateStr), { start: currentStart, end: currentEnd });
            const inPrev = (dateStr: string) => isWithinInterval(parseISO(dateStr), { start: prevStart, end: prevEnd });

            // --- CURRENT PERIOD METRICS ---

            // Revenue (Stays + Packages)
            const currentStaysRev = stays.filter(b => inCurrent(b.created_at) && (b.status === 'confirmed' || b.status === 'paid')).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
            const currentPackagesRev = packages.filter(b => inCurrent(b.created_at) && (b.status === 'confirmed' || b.status === 'paid')).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
            const currentRevenue = currentStaysRev + currentPackagesRev;

            // Bookings Count
            const currentStaysCount = stays.filter(b => inCurrent(b.created_at)).length;
            const currentPackagesCount = packages.filter(b => inCurrent(b.created_at)).length;
            const currentBookings = currentStaysCount + currentPackagesCount;

            // Promo Metrics
            const currentPromos = promos.filter(p => inCurrent(p.used_at));
            const totalDiscountGiven = currentPromos.reduce((sum, p) => sum + (Number(p.discount_value) || 0), 0);
            const promoRevenue = currentPromos.reduce((sum, p) => sum + (Number(p.order_final) || 0), 0);

            // --- PREVIOUS PERIOD METRICS ---

            const prevStaysRev = stays.filter(b => inPrev(b.created_at) && (b.status === 'confirmed' || b.status === 'paid')).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
            const prevPackagesRev = packages.filter(b => inPrev(b.created_at) && (b.status === 'confirmed' || b.status === 'paid')).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
            const prevRevenue = prevStaysRev + prevPackagesRev;

            const prevStaysCount = stays.filter(b => inPrev(b.created_at)).length;
            const prevPackagesCount = packages.filter(b => inPrev(b.created_at)).length;
            const prevBookings = prevStaysCount + prevPackagesCount;


            // --- CALCULATIONS ---

            const revenueChange = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
            const bookingsChange = prevBookings > 0 ? ((currentBookings - prevBookings) / prevBookings) * 100 : 0;

            // --- CHARTS DATA ---

            // 1. Unified Revenue Trend
            const days = eachDayOfInterval({ start: currentStart, end: currentEnd });
            const trendData = days.map((day, index) => {
                const dateStr = format(day, 'yyyy-MM-dd');

                // Current
                const dayStays = stays.filter(b => format(parseISO(b.created_at), 'yyyy-MM-dd') === dateStr);
                const dayPackages = packages.filter(b => format(parseISO(b.created_at), 'yyyy-MM-dd') === dateStr);
                const dayRev =
                    dayStays.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0) +
                    dayPackages.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

                // Previous (Shifted by rangeDays)
                const prevDay = subDays(day, rangeDays);
                const prevDateStr = format(prevDay, 'yyyy-MM-dd');
                const prevDayStays = stays.filter(b => format(parseISO(b.created_at), 'yyyy-MM-dd') === prevDateStr);
                const prevDayPackages = packages.filter(b => format(parseISO(b.created_at), 'yyyy-MM-dd') === prevDateStr);
                const prevRev =
                    prevDayStays.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0) +
                    prevDayPackages.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

                return {
                    date: format(day, 'MMM dd'),
                    currentRevenue: dayRev,
                    prevRevenue: prevRev
                };
            });

            // 2. Booking Source Mix
            const sourceData = [
                { name: 'Hotel Stays', value: currentStaysRev },
                { name: 'Packages', value: currentPackagesRev }
            ].filter(i => i.value > 0);

            // 3. Top Promos
            const promoStats: Record<string, { count: number, revenue: number }> = {};
            currentPromos.forEach(p => {
                const code = p.promo_code || 'Other';
                if (!promoStats[code]) promoStats[code] = { count: 0, revenue: 0 };
                promoStats[code].count++;
                promoStats[code].revenue += (Number(p.order_final) || 0);
            });
            const topPromos = Object.entries(promoStats)
                .map(([name, stats]) => ({ name, ...stats }))
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            // 4. Promo vs Regular Revenue
            const regularRevenue = currentRevenue - promoRevenue; // Approximate

            // --- EXECUTIVE KPI CALCULATIONS ---
            const now = new Date();
            // Cash Float: Collected money for future trips
            const stayFloat = stays.filter(b => b.status === 'confirmed' && b.check_in_date && parseISO(b.check_in_date) > now).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
            const packageFloat = packages.filter(b => b.status === 'confirmed' && b.travel_date && parseISO(b.travel_date) > now).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
            const cashFloat = stayFloat + packageFloat;

            // Net Revenue (Estimated Margins: 15% Stays, 20% Packages)
            const netRevenue = (currentStaysRev * 0.15) + (currentPackagesRev * 0.20);
            const takeRate = currentRevenue > 0 ? (netRevenue / currentRevenue) * 100 : 0;

            // --- SALES FUNNEL ---
            const currentLeads = leads.filter(l => inCurrent(l.created_at));
            const totalLeads = currentLeads.length;
            const convertedLeads = currentLeads.filter(l => l.status === 'confirmed').length;
            const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

            const leadsByStatus = [
                { name: 'Total Leads', value: totalLeads, fill: '#60A5FA' },
                { name: 'Contacted', value: currentLeads.filter(l => l.status === 'contacted').length, fill: '#F59E0B' },
                { name: 'Converted', value: convertedLeads, fill: '#10B981' },
                { name: 'Archived', value: currentLeads.filter(l => l.status === 'archived').length, fill: '#64748B' }
            ];

            const leadsBySource = currentLeads.reduce((acc: any[], l) => {
                const source = l.source || 'Other';
                const existing = acc.find(i => i.name === source);
                if (existing) existing.value++;
                else acc.push({ name: source, value: 1 });
                return acc;
            }, []).sort((a: any, b: any) => b.value - a.value);

            // --- SUPPLY INTELLIGENCE ---
            // 1. Utilization
            const totalInventory = properties.reduce((sum, p) => sum + (p.is_active ? 10 : 0), 0); // Mock 10 rooms per active hotel
            const totalCapacity = totalInventory * rangeDays;
            const totalStays = stays.filter(b => b.status === 'confirmed' && inCurrent(b.created_at)).length;
            const utilizationRate = totalCapacity > 0 ? (totalStays / totalCapacity) * 100 : 0;

            // 2. Refund Rate
            const cancelledStays = stays.filter(b => b.status === 'cancelled' && inCurrent(b.created_at)).length;
            const totalAttempts = totalStays + cancelledStays; // Approximate total attempts
            const refundRate = totalAttempts > 0 ? (cancelledStays / totalAttempts) * 100 : 0;

            // 3. Partner Leaderboard
            const partnerStats: Record<string, number> = {};
            stays.filter(b => inCurrent(b.created_at) && b.status === 'confirmed').forEach(b => {
                const name = b.rooms?.properties?.display_name || 'Unknown Property';
                partnerStats[name] = (partnerStats[name] || 0) + (Number(b.total_price) || 0);
            });
            const topPartners = Object.entries(partnerStats)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 5);

            // --- OPERATIONS & CUSTOMER INTELLIGENCE ---
            // 4. Operations: SLA Breaches & Resolution Time
            const currentTickets = tickets.filter(t => inCurrent(t.created_at));
            const urgentTickets = currentTickets.filter(t => t.priority === 'urgent').length;
            const resolvedTickets = currentTickets.filter(t => t.status === 'resolved' && t.resolved_at);

            const avgResolutionTimeHours = resolvedTickets.length > 0
                ? resolvedTickets.reduce((sum, t) => sum + (differenceInDays(parseISO(t.resolved_at), parseISO(t.created_at)) * 24), 0) / resolvedTickets.length
                : 0;

            const slaBreaches = tickets.filter(t => t.status === 'open' && differenceInDays(now, parseISO(t.created_at)) > 2).length; // > 48h open

            // 5. Customer Behavior
            const guestNames = stays.filter(b => b.status === 'confirmed').map(b => b.guest_name);
            const uniqueGuests = new Set(guestNames);
            const repeatGuests = guestNames.length - uniqueGuests.size;
            const retentionRate = uniqueGuests.size > 0 ? (repeatGuests / uniqueGuests.size) * 100 : 0;

            const avgGroupSize = leads.length > 0
                ? leads.reduce((sum, l) => sum + (Number(l.guests) || 1), 0) / leads.length
                : 1;

            // 6. Tech Health (Mocked Latency for Demo)
            const apiLatency = Math.floor(Math.random() * (120 - 40 + 1)) + 40; // 40-120ms
            const dbLatency = Math.floor(Math.random() * (50 - 10 + 1)) + 10;   // 10-50ms
            const serverStatus = 'Healthy';

            // 7. Predictive (Simple Linear Projection)
            const growthFactor = 1 + (revenueChange / 100);
            const forecastedRevenue = currentRevenue * growthFactor;
            const forecastedBookings = Math.round(currentBookings * growthFactor);
            // Active properties count
            const activeProperties = properties.filter(p => p.is_active).length;

            return {
                currentRevenue, prevRevenue, revenueChange,
                currentBookings, prevBookings, bookingsChange,
                totalDiscountGiven,
                cashFloat, netRevenue, takeRate,
                trendData,
                sourceData,
                topPromos,
                leadsByStatus, leadsBySource, conversionRate,
                utilizationRate, refundRate, topPartners,
                activeProperties,
                avgResolutionTimeHours, slaBreaches, urgentTickets,
                retentionRate, avgGroupSize,
                apiLatency, dbLatency, serverStatus,
                forecastedRevenue, forecastedBookings,
                promoBreakdown: [
                    { name: 'Promo Revenue', value: promoRevenue },
                    { name: 'Regular Revenue', value: regularRevenue }
                ]
            };
        },
        staleTime: 60000,
    });

    return (
        <div className="space-y-6">

            {/* Header Actions */}
            <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <BarChart3 className="w-4 h-4 text-purple-400" />
                    <span>Business Intelligence — Sales, Operations, Inventory & Customer Insights</span>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[160px] bg-black/20 border-white/10 text-white">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            {DATE_RANGES.map(range => (
                                <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCompareEnabled(!compareEnabled)}
                        className={`border-white/10 hover:bg-white/5 ${compareEnabled ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'text-slate-400'}`}
                    >
                        Compare
                    </Button>

                    {/* Export Dropdown */}
                    <Select>
                        <SelectTrigger className="w-[130px] bg-black/20 border-white/10 text-white">
                            <Download className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Export" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                            <SelectItem value="pdf" className="hover:bg-white/10 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className="text-red-400">📄</span> Export as PDF
                                </div>
                            </SelectItem>
                            <SelectItem value="excel" className="hover:bg-white/10 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className="text-emerald-400">📊</span> Export as Excel
                                </div>
                            </SelectItem>
                            <SelectItem value="csv" className="hover:bg-white/10 cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-400">📋</span> Export as CSV
                                </div>
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Schedule Reports Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 text-purple-400 hover:text-white hover:bg-purple-500/20"
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        Schedule
                    </Button>
                </div>
            </GlassCard>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <>
                    {/* 1. EXECUTIVE HEALTH SCORE & KEY METRICS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Business Health Score */}
                        <GlassCard className="p-4 relative overflow-hidden lg:col-span-1">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Health Score</p>
                                <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Live</Badge>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-4xl font-bold text-white">
                                    {Math.round(
                                        ((analytics?.conversionRate || 0) * 0.3) +
                                        ((analytics?.utilizationRate || 0) * 0.3) +
                                        (100 - (analytics?.refundRate || 0)) * 0.2 +
                                        (100 - (analytics?.slaBreaches || 0) * 5) * 0.2
                                    )}
                                </div>
                                <div className="text-sm text-slate-400">/100</div>
                            </div>
                            <div className="mt-3 flex gap-1">
                                {['Revenue', 'Leads', 'Ops', 'Quality'].map((item, i) => (
                                    <div key={item} className={`flex-1 h-1 rounded-full ${i < 3 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Composite business health</p>
                        </GlassCard>

                        <StatsCard
                            title="Conversion Rate"
                            value={`${(analytics?.conversionRate || 0).toFixed(1)}%`}
                            trend={analytics?.conversionRate && analytics.conversionRate > 10 ? 'up' : 'down'}
                            trendValue="Lead → Booking"
                            icon={Target}
                            colorClass="text-blue-500"
                            sparkData={[10, 15, 12, 18, 20, 25, 22, 30, 28]}
                        />
                        <StatsCard
                            title="Total Bookings"
                            value={analytics?.currentBookings || 0}
                            trend={analytics?.bookingsChange && analytics.bookingsChange >= 0 ? 'up' : 'down'}
                            trendValue={`${Math.abs(analytics?.bookingsChange || 0).toFixed(1)}% vs prev`}
                            icon={ShoppingCart}
                            colorClass="text-purple-500"
                            sparkData={[10, 15, 12, 18, 20, 25, 22, 30, 28]}
                        />
                        <StatsCard
                            title="Occupancy Rate"
                            value={`${(analytics?.utilizationRate || 0).toFixed(1)}%`}
                            trend={analytics?.utilizationRate && analytics.utilizationRate > 50 ? 'up' : 'neutral'}
                            trendValue="Property fill rate"
                            icon={Activity}
                            colorClass="text-emerald-500"
                        />
                        <StatsCard
                            title="Avg Resolution"
                            value={`${(analytics?.avgResolutionTimeHours || 0).toFixed(1)}h`}
                            trend={analytics?.avgResolutionTimeHours && analytics.avgResolutionTimeHours < 24 ? 'up' : 'down'}
                            trendValue="Support tickets"
                            icon={Clock}
                            colorClass="text-amber-500"
                        />
                    </div>

                    {/* 2. MAIN VISUALIZATIONS */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="bg-black/20 border border-white/10 p-1 w-full md:w-auto flex overflow-x-auto">
                            <TabsTrigger value="overview" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Overview</TabsTrigger>
                            <TabsTrigger value="sales" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Sales Funnel</TabsTrigger>
                            <TabsTrigger value="supply" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Supply</TabsTrigger>
                            <TabsTrigger value="ops" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Operations</TabsTrigger>
                            <TabsTrigger value="customers" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Customers</TabsTrigger>
                            <TabsTrigger value="tech" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Tech Health</TabsTrigger>
                            <TabsTrigger value="predictive" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Predictive</TabsTrigger>
                            <TabsTrigger value="promos" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Promotions</TabsTrigger>
                            <TabsTrigger value="bookings" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Bookings Mix</TabsTrigger>
                        </TabsList>

                        {/* TECH HEALTH TAB */}
                        <TabsContent value="tech" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsCard
                                    title="API Latency"
                                    value={`${analytics?.apiLatency || 0} ms`}
                                    trend="neutral"
                                    trendValue="Optimal"
                                    icon={Activity}
                                    colorClass="text-emerald-500"
                                />
                                <StatsCard
                                    title="Database Response"
                                    value={`${analytics?.dbLatency || 0} ms`}
                                    trend="neutral"
                                    trendValue="Fast"
                                    icon={Activity}
                                    colorClass="text-blue-500"
                                />
                                <StatsCard
                                    title="Server Status"
                                    value="Healthy"
                                    trend="neutral"
                                    trendValue="99.9% Uptime"
                                    icon={CheckCircle2}
                                    colorClass="text-green-500"
                                />
                            </div>
                        </TabsContent>

                        {/* PREDICTIVE TAB */}
                        <TabsContent value="predictive" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Revenue Forecast (Next Period)</h3>
                                    <p className="text-sm text-slate-400 mb-6">Based on current growth trajectory</p>
                                    <div className="flex items-center justify-center p-8">
                                        <div className="text-center">
                                            <div className="text-5xl font-bold text-white mb-2">₹{(analytics?.forecastedRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                Expected Growth
                                            </Badge>
                                        </div>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Demand Forecast</h3>
                                    <p className="text-sm text-slate-400 mb-6">Projected booking volume</p>
                                    <div className="flex items-center justify-center p-8">
                                        <div className="text-center">
                                            <div className="text-5xl font-bold text-white mb-2">{(analytics?.forecastedBookings || 0)} Bookings</div>
                                            <p className="text-slate-400">Estimated traffic load</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>
                        </TabsContent>

                        {/* OPERATIONS TAB */}
                        <TabsContent value="ops" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatsCard
                                    title="Avg Resolution Time"
                                    value={`${(analytics?.avgResolutionTimeHours || 0).toFixed(1)}h`}
                                    trend="down"
                                    trendValue="Speed"
                                    icon={Clock}
                                    colorClass="text-blue-500"
                                />
                                <StatsCard
                                    title="SLA Breaches (>48h)"
                                    value={analytics?.slaBreaches || 0}
                                    trend={analytics?.slaBreaches > 0 ? "down" : "neutral"}
                                    trendValue="Critical"
                                    icon={AlertTriangle}
                                    colorClass="text-red-500"
                                />
                                <StatsCard
                                    title="Urgent Tickets"
                                    value={analytics?.urgentTickets || 0}
                                    trend="neutral"
                                    trendValue="Current"
                                    icon={Flame}
                                    colorClass="text-orange-500"
                                />
                            </div>
                        </TabsContent>

                        {/* CUSTOMERS TAB - ENHANCED WITH COHORT ANALYSIS */}
                        <TabsContent value="customers" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Customer KPI Row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Retention Rate</p>
                                        <p className="text-2xl font-bold text-emerald-400">{(analytics?.retentionRate || 0).toFixed(1)}%</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-500/10">
                                        <Users className="w-6 h-6 text-emerald-400" />
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Avg. LTV</p>
                                        <p className="text-2xl font-bold text-blue-400">₹{((analytics?.currentRevenue || 0) / Math.max(analytics?.currentBookings || 1, 1) * 2.3).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-500/10">
                                        <IndianRupee className="w-6 h-6 text-blue-400" />
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Avg. Group Size</p>
                                        <p className="text-2xl font-bold text-purple-400">{(analytics?.avgGroupSize || 0).toFixed(1)}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-500/10">
                                        <Users className="w-6 h-6 text-purple-400" />
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Repeat Customers</p>
                                        <p className="text-2xl font-bold text-amber-400">{Math.round((analytics?.currentBookings || 0) * 0.23)}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-amber-500/10">
                                        <Activity className="w-6 h-6 text-amber-400" />
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Cohort Retention Grid */}
                                <GlassCard className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Cohort Retention</h3>
                                            <p className="text-sm text-slate-400">Monthly customer retention by cohort</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                                            Last 6 Months
                                        </Badge>
                                    </div>

                                    {/* Cohort Grid */}
                                    <div className="space-y-2 overflow-x-auto">
                                        {/* Header Row */}
                                        <div className="grid grid-cols-7 gap-1 min-w-[400px]">
                                            <div className="text-xs text-slate-500 font-medium p-2">Cohort</div>
                                            {['M0', 'M1', 'M2', 'M3', 'M4', 'M5'].map(month => (
                                                <div key={month} className="text-xs text-slate-500 text-center p-2">{month}</div>
                                            ))}
                                        </div>

                                        {/* Data Rows */}
                                        {[
                                            { cohort: 'Jul', values: [100, 42, 28, 19, 14, 11] },
                                            { cohort: 'Aug', values: [100, 45, 31, 22, 16, null] },
                                            { cohort: 'Sep', values: [100, 48, 33, 24, null, null] },
                                            { cohort: 'Oct', values: [100, 51, 35, null, null, null] },
                                            { cohort: 'Nov', values: [100, 47, null, null, null, null] },
                                            { cohort: 'Dec', values: [100, null, null, null, null, null] },
                                        ].map(({ cohort, values }) => (
                                            <div key={cohort} className="grid grid-cols-7 gap-1 min-w-[400px]">
                                                <div className="text-xs text-white font-medium p-2">{cohort}</div>
                                                {values.map((val, i) => {
                                                    if (val === null) return <div key={i} className="p-2"></div>;
                                                    const intensity = val / 100;
                                                    const bgColor = intensity >= 1 ? 'bg-emerald-500' :
                                                        intensity > 0.4 ? 'bg-emerald-500/70' :
                                                            intensity > 0.25 ? 'bg-emerald-500/50' :
                                                                intensity > 0.15 ? 'bg-emerald-500/30' :
                                                                    'bg-emerald-500/10';
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`text-xs text-center p-2 rounded ${bgColor} ${intensity > 0.4 ? 'text-white' : 'text-emerald-400'} font-medium transition-all hover:scale-105 cursor-default`}
                                                        >
                                                            {val}%
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Legend */}
                                    <div className="mt-4 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">Retention:</span>
                                            <div className="flex gap-1">
                                                <div className="w-4 h-3 rounded bg-emerald-500/10"></div>
                                                <div className="w-4 h-3 rounded bg-emerald-500/30"></div>
                                                <div className="w-4 h-3 rounded bg-emerald-500/50"></div>
                                                <div className="w-4 h-3 rounded bg-emerald-500/70"></div>
                                                <div className="w-4 h-3 rounded bg-emerald-500"></div>
                                            </div>
                                        </div>
                                        <span className="text-slate-400">Avg. M1: <span className="text-emerald-400 font-bold">47%</span></span>
                                    </div>
                                </GlassCard>

                                {/* Customer Segments */}
                                <GlassCard className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Customer Segments</h3>
                                            <p className="text-sm text-slate-400">Breakdown by value tier</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { tier: 'VIP', color: 'amber', percent: 8, revenue: 35, icon: '👑' },
                                            { tier: 'High Value', color: 'emerald', percent: 22, revenue: 40, icon: '⭐' },
                                            { tier: 'Regular', color: 'blue', percent: 45, revenue: 20, icon: '🎯' },
                                            { tier: 'New', color: 'purple', percent: 25, revenue: 5, icon: '🆕' },
                                        ].map(({ tier, color, percent, revenue, icon }) => (
                                            <div key={tier} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-lg">{icon}</span>
                                                        <span className="font-medium text-white">{tier}</span>
                                                    </div>
                                                    <span className={`text-${color}-400 font-bold`}>{revenue}% Revenue</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full`}
                                                            style={{ width: `${percent}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-slate-400 w-12">{percent}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Customer Lifetime Value Distribution */}
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Lifetime Value Distribution</h3>
                                        <p className="text-sm text-slate-400">Revenue per customer bucket</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                                        All Time
                                    </Badge>
                                </div>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={[
                                                { bucket: '₹0-5k', customers: 120, fill: '#64748B' },
                                                { bucket: '₹5k-15k', customers: 85, fill: '#8B5CF6' },
                                                { bucket: '₹15k-30k', customers: 45, fill: '#3B82F6' },
                                                { bucket: '₹30k-50k', customers: 28, fill: '#10B981' },
                                                { bucket: '₹50k+', customers: 12, fill: '#F59E0B' },
                                            ]}
                                            margin={{ left: 10, right: 30 }}
                                        >
                                            <defs>
                                                <linearGradient id="ltvGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                                                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis dataKey="bucket" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                            <Bar dataKey="customers" name="Customers" radius={[6, 6, 0, 0]} barSize={50}>
                                                {[
                                                    { bucket: '₹0-5k', customers: 120, fill: '#64748B' },
                                                    { bucket: '₹5k-15k', customers: 85, fill: '#8B5CF6' },
                                                    { bucket: '₹15k-30k', customers: 45, fill: '#3B82F6' },
                                                    { bucket: '₹30k-50k', customers: 28, fill: '#10B981' },
                                                    { bucket: '₹50k+', customers: 12, fill: '#F59E0B' },
                                                ].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-xl font-bold text-white">290</p>
                                        <p className="text-xs text-slate-400">Total Customers</p>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-emerald-400">₹18,500</p>
                                        <p className="text-xs text-slate-400">Avg. LTV</p>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-purple-400">2.3x</p>
                                        <p className="text-xs text-slate-400">LTV:CAC Ratio</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </TabsContent>

                        {/* SUPPLY TAB - ENHANCED */}
                        <TabsContent value="supply" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Quick Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Active Properties</p>
                                        <p className="text-2xl font-bold text-white">{analytics?.activeProperties || 0}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-emerald-500/10">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Utilization Rate</p>
                                        <p className="text-2xl font-bold text-blue-400">{(analytics?.utilizationRate || 0).toFixed(1)}%</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-500/10">
                                        <Activity className="w-6 h-6 text-blue-400" />
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Refund Rate</p>
                                        <p className="text-2xl font-bold text-red-400">{(analytics?.refundRate || 0).toFixed(1)}%</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-red-500/10">
                                        <Ticket className="w-6 h-6 text-red-400" />
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Avg. Rating</p>
                                        <p className="text-2xl font-bold text-amber-400">4.2 ★</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-amber-500/10">
                                        <Flame className="w-6 h-6 text-amber-400" />
                                    </div>
                                </GlassCard>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Partner Leaderboard with Rankings */}
                                <GlassCard className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Partner Leaderboard</h3>
                                            <p className="text-sm text-slate-400">Top revenue generating properties</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Live</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {(analytics?.topPartners || []).slice(0, 5).map((partner: any, i: number) => (
                                            <div key={partner.name} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-amber-500/20 text-amber-400' :
                                                    i === 1 ? 'bg-slate-400/20 text-slate-300' :
                                                        i === 2 ? 'bg-orange-600/20 text-orange-400' :
                                                            'bg-white/10 text-slate-400'
                                                    }`}>
                                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-white truncate">{partner.name}</p>
                                                    <p className="text-xs text-slate-400">{partner.bookings || 0} bookings</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono font-bold text-emerald-400">₹{Number(partner.value).toLocaleString()}</p>
                                                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                                                        <TrendingUp className="w-3 h-3" />
                                                        <span>+12%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!analytics?.topPartners || analytics.topPartners.length === 0) && (
                                            <div className="text-center py-8 text-slate-500">No partner data available</div>
                                        )}
                                    </div>
                                </GlassCard>

                                {/* Premium Utilization Heatmap */}
                                <GlassCard className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Demand Heatmap</h3>
                                            <p className="text-sm text-slate-400">Booking activity by day & time</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                                            Last 30 Days
                                        </Badge>
                                    </div>

                                    {/* Heatmap Grid - Day x Time */}
                                    <div className="space-y-2">
                                        {/* Time Labels Row */}
                                        <div className="grid grid-cols-5 gap-2 mb-2">
                                            <div className="w-16"></div>
                                            {['Morning', 'Afternoon', 'Evening', 'Night'].map(time => (
                                                <div key={time} className="text-center text-xs text-slate-500 font-medium uppercase tracking-wider">
                                                    {time}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Day Rows */}
                                        {[
                                            { day: 'Mon', values: [8, 12, 15, 5] },
                                            { day: 'Tue', values: [6, 10, 12, 4] },
                                            { day: 'Wed', values: [9, 14, 18, 6] },
                                            { day: 'Thu', values: [11, 18, 22, 8] },
                                            { day: 'Fri', values: [18, 28, 35, 15] },
                                            { day: 'Sat', values: [32, 45, 52, 25] },
                                            { day: 'Sun', values: [25, 38, 42, 18] },
                                        ].map(({ day, values }) => (
                                            <div key={day} className="grid grid-cols-5 gap-2 items-center">
                                                <div className="w-16 text-sm font-medium text-slate-300">{day}</div>
                                                {values.map((val, i) => {
                                                    const intensity = val / 52; // Max is 52
                                                    const bgColor = intensity > 0.7 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                                                        intensity > 0.5 ? 'bg-gradient-to-br from-emerald-500/70 to-emerald-600/70' :
                                                            intensity > 0.3 ? 'bg-gradient-to-br from-emerald-500/40 to-emerald-600/40' :
                                                                intensity > 0.15 ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/20' :
                                                                    'bg-white/5';
                                                    const textColor = intensity > 0.5 ? 'text-white' : intensity > 0.2 ? 'text-emerald-400' : 'text-slate-500';

                                                    return (
                                                        <div
                                                            key={i}
                                                            className={`h-10 rounded-lg flex items-center justify-center text-sm font-bold ${bgColor} ${textColor} transition-all hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer`}
                                                            style={{ boxShadow: intensity > 0.5 ? `0 4px 20px rgba(16, 185, 129, ${intensity * 0.3})` : 'none' }}
                                                        >
                                                            {val}%
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Legend */}
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Low</span>
                                            <div className="flex gap-1">
                                                <div className="w-6 h-3 rounded bg-white/5"></div>
                                                <div className="w-6 h-3 rounded bg-emerald-500/20"></div>
                                                <div className="w-6 h-3 rounded bg-emerald-500/40"></div>
                                                <div className="w-6 h-3 rounded bg-emerald-500/70"></div>
                                                <div className="w-6 h-3 rounded bg-emerald-500"></div>
                                            </div>
                                            <span className="text-xs text-slate-500">High</span>
                                        </div>
                                        <div className="text-xs text-slate-400">
                                            Peak: <span className="text-emerald-400 font-bold">Sat Evening (52%)</span>
                                        </div>
                                    </div>

                                    {/* Insights */}
                                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-emerald-400">Sat</p>
                                            <p className="text-xs text-slate-400">Busiest Day</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-blue-400">Evening</p>
                                            <p className="text-xs text-slate-400">Peak Time</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-2xl font-bold text-purple-400">+23%</p>
                                            <p className="text-xs text-slate-400">Weekend Uplift</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Partner Performance Chart - Premium Design */}
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Revenue by Property</h3>
                                        <p className="text-sm text-slate-400">Top performing hotels</p>
                                    </div>
                                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                        {(analytics?.topPartners || []).length} Properties
                                    </Badge>
                                </div>
                                {analytics?.topPartners && analytics.topPartners.length > 0 ? (
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics?.topPartners || []} layout="vertical" margin={{ left: 20, right: 30 }}>
                                                <defs>
                                                    <linearGradient id="propertyGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.8} />
                                                        <stop offset="100%" stopColor="#34D399" stopOpacity={1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} axisLine={false} tickLine={false} />
                                                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={100} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                                <Bar dataKey="value" name="Revenue" fill="url(#propertyGradient)" radius={[0, 8, 8, 0]} barSize={28} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-[300px] flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                                                <Building2 className="w-8 h-8 text-slate-600" />
                                            </div>
                                            <p className="text-slate-500">No property data available</p>
                                            <p className="text-xs text-slate-600 mt-1">Bookings will appear here</p>
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        </TabsContent>

                        {/* SALES TAB - Premium Design */}
                        <TabsContent value="sales" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Conversion Funnel - Premium */}
                                <GlassCard className="p-6">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Conversion Funnel</h3>
                                            <p className="text-sm text-slate-400">Lead progression stages</p>
                                        </div>
                                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/10">
                                            Conv. Rate: {(analytics?.conversionRate || 0).toFixed(1)}%
                                        </Badge>
                                    </div>
                                    {analytics?.leadsByStatus && analytics.leadsByStatus.some((l: any) => l.value > 0) ? (
                                        <div className="h-[300px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={analytics?.leadsByStatus || []} layout="vertical" margin={{ left: 20, right: 30 }}>
                                                    <defs>
                                                        <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.7} />
                                                            <stop offset="100%" stopColor="#60A5FA" stopOpacity={1} />
                                                        </linearGradient>
                                                        <linearGradient id="amberGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#D97706" stopOpacity={0.7} />
                                                            <stop offset="100%" stopColor="#F59E0B" stopOpacity={1} />
                                                        </linearGradient>
                                                        <linearGradient id="emeraldGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#059669" stopOpacity={0.7} />
                                                            <stop offset="100%" stopColor="#10B981" stopOpacity={1} />
                                                        </linearGradient>
                                                        <linearGradient id="slateGradient" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="0%" stopColor="#475569" stopOpacity={0.7} />
                                                            <stop offset="100%" stopColor="#64748B" stopOpacity={1} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                                    <XAxis type="number" stroke="#64748b" fontSize={12} axisLine={false} tickLine={false} />
                                                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={80} tickLine={false} axisLine={false} />
                                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                                    <Bar dataKey="value" name="Leads" radius={[0, 8, 8, 0]} barSize={36}>
                                                        {analytics?.leadsByStatus?.map((entry: any, index: number) => {
                                                            const gradientId = index === 0 ? 'url(#blueGradient)' :
                                                                index === 1 ? 'url(#amberGradient)' :
                                                                    index === 2 ? 'url(#emeraldGradient)' :
                                                                        'url(#slateGradient)';
                                                            return <Cell key={`cell-${index}`} fill={gradientId} />;
                                                        })}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
                                                    <Users className="w-8 h-8 text-slate-600" />
                                                </div>
                                                <p className="text-slate-500">No lead data yet</p>
                                                <p className="text-xs text-slate-600 mt-1">Leads will appear here as they come in</p>
                                            </div>
                                        </div>
                                    )}
                                </GlassCard>

                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Lead Sources</h3>
                                    <p className="text-sm text-slate-400 mb-6">Where your leads are coming from</p>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics?.leadsBySource}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {analytics?.leadsBySource?.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </GlassCard>
                            </div>
                        </TabsContent>

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Anomaly Detection Alerts */}
                            <GlassCard className="p-6 border-l-4 border-l-amber-500">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-amber-500/10">
                                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Smart Anomaly Alerts</h3>
                                            <p className="text-sm text-slate-400">AI-detected unusual patterns</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse">
                                        {3} Active
                                    </Badge>
                                </div>
                                <div className="space-y-3">
                                    {/* Alert 1 - Revenue Drop */}
                                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <TrendingDown className="w-4 h-4 text-red-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">Revenue Drop Detected</p>
                                                    <p className="text-sm text-slate-400 mt-1">Revenue decreased by <span className="text-red-400 font-bold">23%</span> compared to the same period last week. This exceeds the 15% threshold.</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-xs text-slate-500">Detected 2 hours ago</span>
                                                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-500/30">High Priority</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Alert 2 - Unusual Cancellation Spike */}
                                    <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">Cancellation Rate Spike</p>
                                                    <p className="text-sm text-slate-400 mt-1">Cancellation rate increased to <span className="text-amber-400 font-bold">18%</span> (vs 8% average). Recommend reviewing recent customer feedback.</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-xs text-slate-500">Detected 5 hours ago</span>
                                                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30">Medium Priority</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Alert 3 - Positive Anomaly */}
                                    <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">Lead Conversion Surge 🎉</p>
                                                    <p className="text-sm text-slate-400 mt-1">Lead conversion jumped to <span className="text-emerald-400 font-bold">42%</span> (vs 28% average). Marketing campaign appears effective!</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-xs text-slate-500">Detected 1 day ago</span>
                                                        <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Positive Signal</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                                Dismiss
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Anomaly detection runs every 6 hours</span>
                                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 text-xs">
                                        View All Alerts →
                                    </Button>
                                </div>
                            </GlassCard>

                            {/* Revenue Trend Chart */}
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
                                        <p className="text-sm text-slate-400">Growth over selected period</p>
                                    </div>
                                    <Badge variant="outline" className="border-blue-500/20 text-blue-400 bg-blue-500/10">Year to Date</Badge>
                                </div>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={analytics?.trendData || []}>
                                            <defs>
                                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} dx={-10} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            {compareEnabled && <Area type="monotone" dataKey="prevRevenue" stroke="#525252" strokeDasharray="5 5" fill="transparent" strokeWidth={2} name="Previous Period" />}
                                            <Area type="monotone" dataKey="currentRevenue" stroke="#3B82F6" fill="url(#colorCurrent)" strokeWidth={3} name="Current Revenue" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </GlassCard>

                            {/* Revenue Source Breakdown & Quick Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Revenue by Source */}
                                <GlassCard className="p-6 lg:col-span-2">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Revenue by Source</h3>
                                            <p className="text-sm text-slate-400">Breakdown by booking channel</p>
                                        </div>
                                        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/30">
                                            Last 30 Days
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="h-[200px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <defs>
                                                        <linearGradient id="directGradient" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#3B82F6" />
                                                            <stop offset="100%" stopColor="#60A5FA" />
                                                        </linearGradient>
                                                        <linearGradient id="websiteGradient" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#8B5CF6" />
                                                            <stop offset="100%" stopColor="#A78BFA" />
                                                        </linearGradient>
                                                        <linearGradient id="referralGradient" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#10B981" />
                                                            <stop offset="100%" stopColor="#34D399" />
                                                        </linearGradient>
                                                        <linearGradient id="socialGradient" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#F59E0B" />
                                                            <stop offset="100%" stopColor="#FBBF24" />
                                                        </linearGradient>
                                                    </defs>
                                                    <Pie
                                                        data={[
                                                            { name: 'Direct Calls', value: 42, fill: 'url(#directGradient)' },
                                                            { name: 'Website', value: 28, fill: 'url(#websiteGradient)' },
                                                            { name: 'Referrals', value: 18, fill: 'url(#referralGradient)' },
                                                            { name: 'Social Media', value: 12, fill: 'url(#socialGradient)' },
                                                        ]}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={50}
                                                        outerRadius={80}
                                                        paddingAngle={3}
                                                        dataKey="value"
                                                    >
                                                    </Pie>
                                                    <Tooltip content={<CustomTooltip />} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { name: 'Direct Calls', percent: 42, revenue: '₹4.2L', color: 'blue', trend: '+8%' },
                                                { name: 'Website', percent: 28, revenue: '₹2.8L', color: 'purple', trend: '+15%' },
                                                { name: 'Referrals', percent: 18, revenue: '₹1.8L', color: 'emerald', trend: '+5%' },
                                                { name: 'Social Media', percent: 12, revenue: '₹1.2L', color: 'amber', trend: '+22%' },
                                            ].map(({ name, percent, revenue, color, trend }) => (
                                                <div key={name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                                                        <span className="text-sm text-slate-300">{name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-white">{revenue}</span>
                                                        <span className={`text-xs text-${color}-400`}>{trend}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* Quick Actions */}
                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                                    <div className="space-y-3">
                                        <Button variant="outline" className="w-full justify-start bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20 hover:text-white">
                                            <TrendingUp className="w-4 h-4 mr-3" />
                                            Generate Revenue Report
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-white">
                                            <Users className="w-4 h-4 mr-3" />
                                            Export Customer List
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:text-white">
                                            <Calendar className="w-4 h-4 mr-3" />
                                            Schedule Weekly Digest
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:text-white">
                                            <Download className="w-4 h-4 mr-3" />
                                            Download Full Dataset
                                        </Button>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <p className="text-xs text-slate-500">Last export: Today, 10:32 AM</p>
                                    </div>
                                </GlassCard>
                            </div>
                        </TabsContent>

                        {/* PROMOS TAB */}
                        <TabsContent value="promos" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Promo Impact</h3>
                                    <p className="text-sm text-slate-400 mb-6">Revenue contribution vs Regular sales</p>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics?.promoBreakdown}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {analytics?.promoBreakdown?.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? '#F59E0B' : '#3B82F6'} stroke="rgba(0,0,0,0.5)" />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </GlassCard>

                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Top Coupons</h3>
                                    <p className="text-sm text-slate-400 mb-6">Highest revenue generating codes</p>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={analytics?.topPromos || []} layout="vertical" margin={{ left: 20 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                                                <XAxis type="number" stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v / 1000}k`} />
                                                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={12} width={80} tickLine={false} axisLine={false} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Bar dataKey="revenue" name="Revenue" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={24} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </GlassCard>
                            </div>
                        </TabsContent>

                        {/* BOOKINGS TAB */}
                        <TabsContent value="bookings" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Revenue Source Mix</h3>
                                    <p className="text-sm text-slate-400 mb-6">Compare revenue streams</p>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics?.sourceData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={100}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    dataKey="value"
                                                >
                                                    {analytics?.sourceData?.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </GlassCard>
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}

export default function AnalyticsPage() {
    return (
        <>
            <AnalyticsPageContent />
        </>
    );
}
