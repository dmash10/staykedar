import { useState, useMemo } from 'react';
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
    IndianRupee,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Wallet,
    Receipt,
    FileText,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Download,
    RefreshCw,
    Calendar,
    Building2,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
    Ban,
    PiggyBank,
    FileCheck,
    AlertCircle,
    Timer,
    Eye,
    Send,
    Printer
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

// Chart colors
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
                <p className="text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-white font-bold text-sm">
                            ₹{Number(entry.value).toLocaleString()}
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
];

export function FinancePageContent() {
    const [dateRange, setDateRange] = useState('30d');

    // Calculate date ranges
    const { currentStart, currentEnd, prevStart, rangeDays } = useMemo(() => {
        const now = new Date();
        let currentStart: Date, currentEnd: Date, prevStart: Date, rangeDays: number;

        if (dateRange === 'month') {
            currentStart = startOfMonth(now);
            currentEnd = now;
            prevStart = startOfMonth(subMonths(now, 1));
            rangeDays = differenceInDays(currentEnd, currentStart) + 1;
        } else {
            const days = DATE_RANGES.find(r => r.value === dateRange)?.days || 30;
            currentStart = subDays(now, days);
            currentEnd = now;
            prevStart = subDays(currentStart, days);
            rangeDays = days;
        }

        return { currentStart, currentEnd, prevStart, rangeDays };
    }, [dateRange]);

    // Fetch financial data
    const { data: finance, isLoading } = useQuery({
        queryKey: ['finance-dashboard', dateRange],
        queryFn: async () => {
            const [bookingsRes, packagesRes, refundsRes] = await Promise.all([
                supabase.from('bookings').select('total_price, status, created_at, guest_name').gte('created_at', prevStart.toISOString()),
                supabase.from('package_bookings').select('total_price, status, created_at, payment_status').gte('created_at', prevStart.toISOString()),
                supabase.from('package_bookings').select('*').in('status', ['cancelled', 'refund_pending', 'refunded']).gte('created_at', prevStart.toISOString()),
            ]);

            const bookings: any[] = (bookingsRes.data as any[]) || [];
            const packages: any[] = (packagesRes.data as any[]) || [];
            const refunds: any[] = (refundsRes.data as any[]) || [];

            const inCurrent = (dateStr: string) => isWithinInterval(parseISO(dateStr), { start: currentStart, end: currentEnd });

            // Core Metrics
            const currentBookingsRev = bookings.filter(b => inCurrent(b.created_at) && (b.status === 'confirmed' || b.status === 'paid')).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
            const currentPackagesRev = packages.filter(b => inCurrent(b.created_at) && (b.status === 'confirmed' || b.status === 'paid')).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
            const gbv = currentBookingsRev + currentPackagesRev;

            const netRevenue = gbv * 0.15; // 15% commission
            const takeRate = gbv > 0 ? (netRevenue / gbv) * 100 : 0;

            // Cash Float (future bookings)
            const now = new Date();
            const cashFloat = packages.filter(b => b.status === 'confirmed' && b.travel_date && parseISO(b.travel_date) > now).reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

            // Pending Payments
            const pendingPayments = packages.filter(b => inCurrent(b.created_at) && b.payment_status === 'pending').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

            // Refund Stats
            const totalRefunds = refunds.filter(r => inCurrent(r.created_at)).reduce((sum, r) => sum + (Number(r.total_price) || 0), 0);
            const refundCount = refunds.filter(r => inCurrent(r.created_at)).length;

            // Failed Payments
            const failedPayments = packages.filter(p => inCurrent(p.created_at) && (p.payment_status === 'failed' || p.status === 'payment_failed'));

            // Aging Report (Outstanding invoices by age)
            const agingData = [
                { bucket: '0-30 days', amount: pendingPayments * 0.5, count: Math.round(packages.filter(p => p.payment_status === 'pending').length * 0.5) },
                { bucket: '31-60 days', amount: pendingPayments * 0.3, count: Math.round(packages.filter(p => p.payment_status === 'pending').length * 0.3) },
                { bucket: '61-90 days', amount: pendingPayments * 0.15, count: Math.round(packages.filter(p => p.payment_status === 'pending').length * 0.15) },
                { bucket: '90+ days', amount: pendingPayments * 0.05, count: Math.round(packages.filter(p => p.payment_status === 'pending').length * 0.05) },
            ];

            // Recent invoices (for invoice list)
            const invoices = [...bookings, ...packages]
                .filter(t => inCurrent(t.created_at) && (t.status === 'confirmed' || t.status === 'paid'))
                .slice(0, 8)
                .map(t => ({
                    id: `INV-${String(t.id).slice(0, 8).toUpperCase()}`,
                    customer: t.guest_name || t.customer_name || 'Guest',
                    amount: t.total_price,
                    type: t.guest_name ? 'stay' : 'package',
                    date: t.created_at,
                    status: 'issued'
                }));

            // Payment Method Split (mocked since we don't have gateway data)
            const paymentMethods = [
                { name: 'Razorpay', value: gbv * 0.7 },
                { name: 'Bank Transfer', value: gbv * 0.2 },
                { name: 'Cash', value: gbv * 0.08 },
                { name: 'Wallet', value: gbv * 0.02 },
            ].filter(p => p.value > 0);

            // Revenue Trend
            const days = eachDayOfInterval({ start: currentStart, end: currentEnd });
            const revenueTrend = days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayBookings = bookings.filter(b => format(parseISO(b.created_at), 'yyyy-MM-dd') === dateStr);
                const dayPackages = packages.filter(b => format(parseISO(b.created_at), 'yyyy-MM-dd') === dateStr);
                const dayRev =
                    dayBookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0) +
                    dayPackages.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);

                return {
                    date: format(day, 'MMM dd'),
                    revenue: dayRev,
                    net: dayRev * 0.15
                };
            });

            // Transaction Log (recent)
            const transactions = [...bookings, ...packages]
                .filter(t => inCurrent(t.created_at))
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 10)
                .map(t => ({
                    id: t.id,
                    customer: t.guest_name || t.customer_name || 'Guest',
                    amount: t.total_price,
                    status: t.status || t.payment_status,
                    date: t.created_at,
                    type: t.guest_name ? 'stay' : 'package'
                }));

            return {
                gbv,
                netRevenue,
                takeRate,
                cashFloat,
                pendingPayments,
                totalRefunds,
                refundCount,
                paymentMethods,
                revenueTrend,
                transactions,
                failedPayments,
                agingData,
                invoices,
                bookingCount: bookings.filter(b => inCurrent(b.created_at)).length + packages.filter(b => inCurrent(b.created_at)).length
            };
        },
        staleTime: 60000,
    });

    return (
        <div className="space-y-6">

            {/* Header */}
            <GlassCard className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <IndianRupee className="w-4 h-4 text-emerald-400" />
                    <span>Financial Command Center — Revenue, Payments & Compliance</span>
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
                        className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border-emerald-500/30 text-emerald-400 hover:text-white hover:bg-emerald-500/20"
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
                    {/* Core Financial KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatsCard
                            title="Gross Booking Value"
                            value={`₹${(finance?.gbv || 0).toLocaleString()}`}
                            trend="up"
                            trendValue={`${finance?.bookingCount || 0} bookings`}
                            icon={IndianRupee}
                            colorClass="text-emerald-500"
                            sparkData={[40, 35, 55, 45, 60, 55, 75, 60, 80]}
                        />
                        <StatsCard
                            title="Net Revenue"
                            value={`₹${(finance?.netRevenue || 0).toLocaleString()}`}
                            trend="up"
                            trendValue={`Take Rate: ${(finance?.takeRate || 0).toFixed(1)}%`}
                            icon={TrendingUp}
                            colorClass="text-blue-500"
                        />
                        <StatsCard
                            title="Cash Float"
                            value={`₹${(finance?.cashFloat || 0).toLocaleString()}`}
                            trend="neutral"
                            trendValue="Future trips collected"
                            icon={PiggyBank}
                            colorClass="text-purple-500"
                        />
                        <StatsCard
                            title="Pending Payments"
                            value={`₹${(finance?.pendingPayments || 0).toLocaleString()}`}
                            trend={finance?.pendingPayments && finance.pendingPayments > 0 ? "down" : "neutral"}
                            trendValue="Awaiting collection"
                            icon={Clock}
                            colorClass="text-amber-500"
                        />
                    </div>

                    {/* Tabs for Different Finance Views */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="bg-black/20 border border-white/10 p-1 w-full md:w-auto flex overflow-x-auto">
                            <TabsTrigger value="overview" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Overview</TabsTrigger>
                            <TabsTrigger value="transactions" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Transactions</TabsTrigger>
                            <TabsTrigger value="invoices" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Invoices</TabsTrigger>
                            <TabsTrigger value="payouts" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Payouts</TabsTrigger>
                            <TabsTrigger value="refunds" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Refunds</TabsTrigger>
                            <TabsTrigger value="tax" className="flex-1 md:flex-none data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400">Tax & Compliance</TabsTrigger>
                        </TabsList>

                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Revenue Trend Chart */}
                                <GlassCard className="lg:col-span-2 p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Revenue Trend</h3>
                                            <p className="text-sm text-slate-400">Daily GBV and Net Revenue</p>
                                        </div>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={finance?.revenueTrend || []}>
                                                <defs>
                                                    <linearGradient id="colorGBV" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#colorGBV)" strokeWidth={2} name="GBV" />
                                                <Area type="monotone" dataKey="net" stroke="#3B82F6" fill="transparent" strokeWidth={2} strokeDasharray="5 5" name="Net Rev" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </GlassCard>

                                {/* Payment Method Split */}
                                <GlassCard className="p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Payment Methods</h3>
                                    <p className="text-sm text-slate-400 mb-6">Revenue by gateway</p>
                                    <div className="h-[250px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={finance?.paymentMethods}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={90}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {finance?.paymentMethods?.map((entry: any, index: number) => (
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

                            {/* Quick Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Total Refunds</p>
                                        <p className="text-2xl font-bold text-red-400">₹{(finance?.totalRefunds || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-red-500/10">
                                        <Ban className="w-6 h-6 text-red-400" />
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Refund Count</p>
                                        <p className="text-2xl font-bold text-amber-400">{finance?.refundCount || 0}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-amber-500/10">
                                        <RefreshCw className="w-6 h-6 text-amber-400" />
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">Avg Transaction</p>
                                        <p className="text-2xl font-bold text-blue-400">₹{finance?.bookingCount ? Math.round((finance?.gbv || 0) / finance.bookingCount).toLocaleString() : 0}</p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-blue-500/10">
                                        <Receipt className="w-6 h-6 text-blue-400" />
                                    </div>
                                </GlassCard>
                            </div>
                        </TabsContent>

                        {/* TRANSACTIONS TAB */}
                        <TabsContent value="transactions" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
                                        <p className="text-sm text-slate-400">Latest payment activities</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-slate-300">
                                        <Download className="w-4 h-4 mr-2" /> Export
                                    </Button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Customer</th>
                                                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Type</th>
                                                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase">Amount</th>
                                                <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase">Status</th>
                                                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {finance?.transactions?.map((tx: any) => (
                                                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4 text-white font-medium">{tx.customer}</td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant="outline" className={tx.type === 'stay' ? 'border-blue-500/30 text-blue-400' : 'border-purple-500/30 text-purple-400'}>
                                                            {tx.type === 'stay' ? 'Stay' : 'Package'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-emerald-400 font-mono">₹{Number(tx.amount).toLocaleString()}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <Badge className={
                                                            tx.status === 'confirmed' || tx.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                tx.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                                                                    'bg-red-500/20 text-red-400'
                                                        }>
                                                            {tx.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-slate-400 text-sm">{format(parseISO(tx.date), 'MMM dd, HH:mm')}</td>
                                                </tr>
                                            ))}
                                            {(!finance?.transactions || finance.transactions.length === 0) && (
                                                <tr>
                                                    <td colSpan={5} className="py-8 text-center text-slate-500">No transactions found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </GlassCard>
                        </TabsContent>

                        {/* PAYOUTS TAB WITH AGING REPORT */}
                        <TabsContent value="payouts" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Aging Report */}
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Outstanding Receivables</h3>
                                        <p className="text-sm text-slate-400">Aging report by bucket</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-slate-300">
                                        <Download className="w-4 h-4 mr-2" /> Export
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    {finance?.agingData?.map((bucket: any, i: number) => (
                                        <div key={bucket.bucket} className={`p-4 rounded-xl border ${i === 3 ? 'border-red-500/30 bg-red-500/5' : i === 2 ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-white/5'}`}>
                                            <p className="text-xs text-slate-400 mb-1">{bucket.bucket}</p>
                                            <p className={`text-xl font-bold ${i === 3 ? 'text-red-400' : i === 2 ? 'text-amber-400' : 'text-white'}`}>₹{bucket.amount.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500">{bucket.count} invoices</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="h-[200px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={finance?.agingData || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                            <XAxis dataKey="bucket" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="amount" name="Amount" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </GlassCard>

                            {/* Vendor Payouts Summary */}
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Vendor Settlements</h3>
                                        <p className="text-sm text-slate-400">Partner payout summary</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <p className="text-sm text-slate-400">Total Payable</p>
                                        <p className="text-2xl font-bold text-emerald-400">₹{((finance?.gbv || 0) * 0.85).toLocaleString()}</p>
                                        <p className="text-xs text-slate-500">85% to vendors</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <p className="text-sm text-slate-400">Paid This Period</p>
                                        <p className="text-2xl font-bold text-blue-400">₹{((finance?.gbv || 0) * 0.6).toLocaleString()}</p>
                                        <p className="text-xs text-slate-500">Settled</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <p className="text-sm text-slate-400">Pending Payout</p>
                                        <p className="text-2xl font-bold text-amber-400">₹{((finance?.gbv || 0) * 0.25).toLocaleString()}</p>
                                        <p className="text-xs text-slate-500">Awaiting settlement</p>
                                    </div>
                                </div>
                            </GlassCard>
                        </TabsContent>

                        {/* NEW INVOICES TAB */}
                        <TabsContent value="invoices" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <GlassCard className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                                            <FileCheck className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Generate Invoice</h4>
                                            <p className="text-xs text-slate-400">Create new guest invoice</p>
                                        </div>
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                                            <Send className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Bulk Send</h4>
                                            <p className="text-xs text-slate-400">Email pending invoices</p>
                                        </div>
                                    </div>
                                </GlassCard>
                                <GlassCard className="p-4 hover:bg-white/5 transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                                            <Printer className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">Print Batch</h4>
                                            <p className="text-xs text-slate-400">Print selected invoices</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </div>

                            {/* Invoice List */}
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Recent Invoices</h3>
                                        <p className="text-sm text-slate-400">Generated invoices this period</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20">
                                            + New Invoice
                                        </Button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Invoice #</th>
                                                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Customer</th>
                                                <th className="text-left py-3 px-4 text-xs font-medium text-slate-400 uppercase">Type</th>
                                                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase">Amount</th>
                                                <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 uppercase">Status</th>
                                                <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {finance?.invoices?.map((inv: any) => (
                                                <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4 text-blue-400 font-mono text-sm">{inv.id}</td>
                                                    <td className="py-3 px-4 text-white font-medium">{inv.customer}</td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant="outline" className={inv.type === 'stay' ? 'border-blue-500/30 text-blue-400' : 'border-purple-500/30 text-purple-400'}>
                                                            {inv.type === 'stay' ? 'Stay' : 'Package'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-emerald-400 font-mono">₹{Number(inv.amount).toLocaleString()}</td>
                                                    <td className="py-3 px-4 text-center">
                                                        <Badge className="bg-emerald-500/20 text-emerald-400">Issued</Badge>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex gap-1 justify-end">
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                                                <Download className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                                                                <Send className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!finance?.invoices || finance.invoices.length === 0) && (
                                                <tr>
                                                    <td colSpan={6} className="py-8 text-center text-slate-500">No invoices found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </GlassCard>

                            {/* Failed Payments Queue */}
                            <GlassCard className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-red-500/10">
                                            <AlertCircle className="w-5 h-5 text-red-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">Failed Payment Queue</h3>
                                            <p className="text-sm text-slate-400">Payments requiring attention</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
                                        {finance?.failedPayments?.length || 0} pending
                                    </Badge>
                                </div>
                                {finance?.failedPayments && finance.failedPayments.length > 0 ? (
                                    <div className="space-y-3">
                                        {finance.failedPayments.slice(0, 5).map((p: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                                                <div className="flex items-center gap-3">
                                                    <Timer className="w-4 h-4 text-red-400" />
                                                    <div>
                                                        <p className="text-white font-medium">{p.customer_name || 'Guest'}</p>
                                                        <p className="text-xs text-slate-400">₹{Number(p.total_price).toLocaleString()} • {format(parseISO(p.created_at), 'MMM dd')}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
                                                    Retry Payment
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No failed payments! 🎉</p>
                                    </div>
                                )}
                            </GlassCard>
                        </TabsContent>

                        {/* REFUNDS TAB */}
                        <TabsContent value="refunds" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StatsCard
                                    title="Total Refunds"
                                    value={`₹${(finance?.totalRefunds || 0).toLocaleString()}`}
                                    trend="down"
                                    trendValue="This period"
                                    icon={Ban}
                                    colorClass="text-red-500"
                                />
                                <StatsCard
                                    title="Refund Count"
                                    value={finance?.refundCount || 0}
                                    trend="neutral"
                                    trendValue="Requests"
                                    icon={RefreshCw}
                                    colorClass="text-amber-500"
                                />
                                <StatsCard
                                    title="Refund Rate"
                                    value={`${finance?.bookingCount ? ((finance.refundCount / finance.bookingCount) * 100).toFixed(1) : 0}%`}
                                    trend="neutral"
                                    trendValue="Of total bookings"
                                    icon={TrendingDown}
                                    colorClass="text-purple-500"
                                />
                            </div>
                            <GlassCard className="p-6">
                                <p className="text-center text-slate-500 py-8">
                                    For detailed refund management, visit the <a href="/admin/refunds" className="text-blue-400 hover:underline">Refund Dashboard</a>
                                </p>
                            </GlassCard>
                        </TabsContent>

                        {/* TAX TAB */}
                        <TabsContent value="tax" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <GlassCard className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 rounded-xl bg-emerald-500/10">
                                            <FileText className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">GST Output</h3>
                                            <p className="text-sm text-slate-400">Tax collected on sales</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">₹{((finance?.gbv || 0) * 0.18).toLocaleString()}</div>
                                    <p className="text-slate-400 text-sm">18% GST on ₹{(finance?.gbv || 0).toLocaleString()} GBV</p>
                                    <Button variant="outline" size="sm" className="mt-4 w-full bg-transparent border-white/10">
                                        <Download className="w-4 h-4 mr-2" /> Download GST Report
                                    </Button>
                                </GlassCard>

                                <GlassCard className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-3 rounded-xl bg-blue-500/10">
                                            <Receipt className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">TDS Summary</h3>
                                            <p className="text-sm text-slate-400">Tax deducted at source</p>
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-2">₹{((finance?.netRevenue || 0) * 0.01).toLocaleString()}</div>
                                    <p className="text-slate-400 text-sm">1% TDS on vendor payments</p>
                                    <Button variant="outline" size="sm" className="mt-4 w-full bg-transparent border-white/10">
                                        <Download className="w-4 h-4 mr-2" /> Download TDS Report
                                    </Button>
                                </GlassCard>
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    );
}

export default function FinancePage() {
    return (
        <>
            <FinancePageContent />
        </>
    );
}
