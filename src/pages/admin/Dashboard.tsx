
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  IndianRupee, Building2, Zap, BanknoteIcon, LayoutDashboard,
  Download, Activity, CalendarDays, Users, AlertTriangle
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList
} from 'recharts';
import { format, subDays, eachDayOfInterval, isSameDay, isToday, startOfMonth, endOfMonth, getDay, getDate } from 'date-fns';

// New Components
import { StatsCard } from '@/components/admin/dashboard/StatsCard';
import { GlassCard } from '@/components/admin/dashboard/GlassCard';
import { LiveTicker, FeedItem } from '@/components/admin/dashboard/LiveTicker';
import { UrgentAlertsWidget } from '@/components/admin/dashboard/UrgentAlertsWidget';
import { DashboardMarquee } from '@/components/admin/dashboard/DashboardMarquee';
import { LeadsPageContent } from '@/pages/admin/LeadsPage';
import { InventoryManagerContent } from '@/pages/admin/InventoryManager';
import { FinancePageContent } from '@/pages/admin/FinancePage';

// ============================================
// TYPES & CONSTANTS
// ============================================

const COLORS = {
  blue: '#3B82F6',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  purple: '#8B5CF6',
  slate: '#64748B'
};

const PIE_COLORS = [COLORS.blue, COLORS.emerald, COLORS.amber, COLORS.rose];

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default function Dashboard() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // DATA FETCHING
  const { data: bookings } = useQuery({
    queryKey: ['dashboard-bookings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('bookings')
        .select('*, properties!bookings_property_id_fkey(name)')
        .order('created_at', { ascending: false });
      return data || [];
    },
    refetchInterval: 60000
  });

  const { data: promoUsage } = useQuery({
    queryKey: ['dashboard-promo-usage'],
    queryFn: async () => {
      const { data } = await supabase
        .from('promo_code_usage')
        .select('*')
        .order('used_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    refetchInterval: 60000
  });

  // Calculate Overview Stats
  const stats = useMemo(() => {
    if (!bookings) return null;
    const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
    const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const todayCheckins = bookings.filter(b => b.check_in && isToday(new Date(b.check_in))).length;

    // Daily buckets for chart
    const dates = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    const trendData = dates.map(date => {
      const dayBookings = bookings.filter(b => b.created_at && isSameDay(new Date(b.created_at), date));
      const dailyRev = dayBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
      return {
        date: format(date, 'MMM dd'),
        revenue: dailyRev,
        bookings: dayBookings.length
      };
    });

    return { revenue: totalRevenue, active: activeBookings, pending: pendingBookings, todayCheckins, trendData };
  }, [bookings]);


  // LEAD DATA FETCHING
  const { data: leads } = useQuery({
    queryKey: ['dashboard-leads'],
    queryFn: async () => {
      const { data } = await supabase
        .from('stay_leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    refetchInterval: 60000
  });


  // Feed Items
  const activityFeed: FeedItem[] = useMemo(() => {
    const bookingItems: FeedItem[] = (bookings?.slice(0, 10).map(b => ({
      id: `b-${b.id}`,
      type: 'booking',
      title: `Booking: ${b.customer_name}`,
      description: `${b.properties?.name || 'Property'} • ₹${b.total_amount}`,
      timestamp: new Date(b.created_at!),
      actionUrl: `/admin/bookings`,
    })) || []) as FeedItem[];

    // NEW: Leads integration (Replacing Promos)
    const leadItems: FeedItem[] = (leads?.map(l => ({
      id: `l-${l.id}`,
      type: 'lead',
      title: `New Lead: ${l.customer_name}`,
      description: `${l.budget_category?.toUpperCase()} • ${l.guests} PAX • ${l.is_urgent ? '🔥 Urgent' : 'Standard'}`,
      timestamp: new Date(l.created_at || new Date().toISOString()),
      actionUrl: `/admin/sales`,
    })) || []) as FeedItem[];


    const combined = [...bookingItems, ...leadItems].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);

    // FALLBACK "USEFUL" MOCK DATA (High Value Operational Events)
    if (combined.length === 0) {
      return [
        { id: 'm1', type: 'booking', title: 'New Booking: Rajesh Kumar', description: 'Hotel Kedar Heights • ₹12,500 • PAID via Razorpay', timestamp: new Date(), actionUrl: '/admin/bookings' },
        { id: 'm2', type: 'alert', title: 'Inventory Warning', description: 'Sonprayag Zone is 95% Sold Out for Tomorrow', timestamp: subDays(new Date(), 0), actionUrl: '/admin/inventory' },
        { id: 'm3', type: 'lead', title: 'VIP Inquiry: Amit Verma', description: 'PREMIUM Budget • 12 PAX • Needs Heli-Charter', timestamp: subDays(new Date(), 0), actionUrl: '/admin/sales' },
        { id: 'm4', type: 'payment', title: 'Payment Failed', description: 'Booking #8821 (Suresh R.) - ₹5,000 pending', timestamp: subDays(new Date(), 0), actionUrl: '/admin/bookings' },
        { id: 'm5', type: 'booking', title: 'Check-in Completed', description: 'Guest: David Miller (Room 302)', timestamp: subDays(new Date(), 1), actionUrl: '/admin/bookings' },
      ] as FeedItem[];
    }

    return combined;
  }, [bookings, leads]);


  // DUMMY DATA FOR CHARTS
  const funnelData = [
    { value: 100, name: 'Leads', fill: '#ea580c' },
    { value: 80, name: 'Quotes', fill: '#f97316' },
    { value: 50, name: 'Negot.', fill: '#fb923c' },
    { value: 30, name: 'Payment', fill: '#fdba74' },
    { value: 15, name: 'Booked', fill: '#fed7aa' },
  ];

  return (
    <>
      <div className="space-y-6 pb-10">

        {/* TOP MARQUEE HEADER */}
        <DashboardMarquee />

        {/* HEADER CONTROLS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-blue-500 animate-pulse" />
              Overview
            </h1>
            <p className="text-slate-400 mt-1">Real-time enterprise intelligence</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 p-1 rounded-lg backdrop-blur-md">
              {['7d', '30d', '90d'].map(r => (
                <Button
                  key={r}
                  variant={dateRange === r ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setDateRange(r)}
                  className={`text-xs h-8 capitalize ${dateRange === r ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  {r}
                </Button>
              ))}
            </div>
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        {/* TABS */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-black/40 border border-white/10 p-1 backdrop-blur-md">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Executive View</TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Sales & CRM</TabsTrigger>
            <TabsTrigger value="supply" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Inventory</TabsTrigger>
            <TabsTrigger value="financials" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">Financials</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">

            {/* KPI GRID (BENTO) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Gross Booking Value"
                value={`₹${(stats?.revenue || 0).toLocaleString()}`}
                subValue="Confirmed Trips (All Time)"
                trend="up" trendValue="15.2%" icon={IndianRupee} colorClass="text-emerald-500"
                sparkData={[40, 35, 55, 45, 60, 55, 75, 60, 80]}
              />
              <StatsCard
                title="Net Revenue"
                value={`₹${((stats?.revenue || 0) * 0.15).toLocaleString()}`}
                subValue="Est. Commission (15%)"
                trend="up" trendValue="8.4%" icon={BanknoteIcon} colorClass="text-blue-500"
                sparkData={[12, 10, 15, 13, 18, 16, 22, 18, 24]}
              />
              <StatsCard
                title="Active Leads"
                value="142"
                subValue="38 High Priority"
                trend="down" trendValue="Needs Action" icon={Users} colorClass="text-amber-500"
                sparkData={[45, 42, 48, 40, 38, 35, 30, 42, 38]}
              />
              <StatsCard
                title="Occupancy"
                value="78%"
                subValue="Peak Dates filling fast"
                trend="up" trendValue="+12%" icon={Building2} colorClass="text-purple-500"
                sparkData={[60, 65, 70, 68, 72, 75, 74, 76, 78]}
              />
            </div>

            {/* MAIN CHART + TICKER */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
              {/* Main Revenue Chart */}
              <GlassCard className="lg:col-span-2 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white">Revenue Performance</h3>
                    <p className="text-sm text-slate-400">Gross Booking Value vs Volume</p>
                  </div>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-xs text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Revenue</span>
                    <span className="flex items-center gap-1 text-xs text-white/50"><div className="w-2 h-2 rounded-full bg-white/20"></div> Bookings</span>
                  </div>
                </div>
                <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stats?.trendData || []}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                      <YAxis yAxisId="right" orientation="right" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                      <RechartsTooltip
                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#ccc' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#colorRevenue)" />
                      <Bar dataKey="bookings" yAxisId="right" fill="#fff" opacity={0.1} barSize={20} radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              {/* Live Ticker */}
              <div className="lg:col-span-1 h-full min-h-0">
                <LiveTicker items={activityFeed} />
              </div>
            </div>

            {/* ROW 3: URGENT ALERTS & MAP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UrgentAlertsWidget />

              <GlassCard className="p-6">
                <h3 className="text-white font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 hover:text-emerald-100 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
                    <Zap className="w-6 h-6" />
                    Create Booking
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:border-blue-500/50 hover:text-blue-100 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                    <IndianRupee className="w-6 h-6" />
                    Record Payment
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-100 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
                    <Users className="w-6 h-6" />
                    Add Lead
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 hover:text-amber-100 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
                    <CalendarDays className="w-6 h-6" />
                    Check Avail.
                  </Button>
                </div>
              </GlassCard>
            </div>
          </TabsContent>


          <TabsContent value="sales">
            <LeadsPageContent />
          </TabsContent>
          <TabsContent value="supply">
            <InventoryManagerContent />
          </TabsContent>
          <TabsContent value="financials">
            <FinancePageContent />
          </TabsContent>
        </Tabs>

      </div>
    </>
  );
}
