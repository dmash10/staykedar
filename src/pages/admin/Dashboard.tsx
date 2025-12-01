import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Users,
  Home,
  ArrowUpRight,
  Activity,
  Clock
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();

  // Fetch comprehensive dashboard stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      // Users
      const { count: usersCount, error: usersError } = await supabase
        .from('customer_details')
        .select('*', { count: 'exact', head: true });
      if (usersError) throw usersError;

      // Properties
      const { count: propertiesCount, error: propertiesError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });
      if (propertiesError) throw propertiesError;

      // Bookings with details
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          customer_details (name),
          rooms (
            name,
            properties (name)
          )
        `)
        .order('created_at', { ascending: false });
      if (bookingsError) throw bookingsError;

      const totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

      // Status breakdown
      const statusBreakdown = {
        confirmed: bookings?.filter(b => b.status === 'confirmed').length || 0,
        pending: bookings?.filter(b => b.status === 'pending').length || 0,
        cancelled: bookings?.filter(b => b.status === 'cancelled').length || 0,
        completed: bookings?.filter(b => b.status === 'completed').length || 0,
      };

      // Revenue trend (last 7 days)
      const revenueTrend = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dayBookings = bookings?.filter(b =>
          format(new Date(b.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        ) || [];
        const revenue = dayBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
        return {
          date: format(date, 'MMM dd'),
          revenue: revenue,
          bookings: dayBookings.length
        };
      });

      return {
        totalRevenue,
        totalBookings: bookings?.length || 0,
        totalUsers: usersCount || 0,
        totalProperties: propertiesCount || 0,
        statusBreakdown,
        revenueTrend,
        recentBookings: bookings?.slice(0, 5) || [],
        avgBookingValue: totalRevenue / (bookings?.length || 1)
      };
    }
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  const pieData = [
    { name: 'Confirmed', value: stats?.statusBreakdown.confirmed || 0 },
    { name: 'Pending', value: stats?.statusBreakdown.pending || 0 },
    { name: 'Cancelled', value: stats?.statusBreakdown.cancelled || 0 },
    { name: 'Completed', value: stats?.statusBreakdown.completed || 0 },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Total Revenue</p>
                  <h3 className="text-3xl font-bold">₹{stats?.totalRevenue.toLocaleString()}</h3>
                  <div className="flex items-center mt-2 text-blue-100">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">From {stats?.totalBookings} bookings</span>
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Bookings */}
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Total Bookings</p>
                  <h3 className="text-3xl font-bold text-white">{stats?.totalBookings}</h3>
                  <div className="flex items-center mt-2 text-green-400">
                    <Activity className="w-4 h-4 mr-1" />
                    <span className="text-sm">Active bookings</span>
                  </div>
                </div>
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Users */}
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Total Users</p>
                  <h3 className="text-3xl font-bold text-white">{stats?.totalUsers}</h3>
                  <div className="flex items-center mt-2 text-purple-400">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">Registered users</span>
                  </div>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Properties */}
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">Total Properties</p>
                  <h3 className="text-3xl font-bold text-white">{stats?.totalProperties}</h3>
                  <div className="flex items-center mt-2 text-amber-400">
                    <Home className="w-4 h-4 mr-1" />
                    <span className="text-sm">Listed properties</span>
                  </div>
                </div>
                <div className="bg-amber-500/10 p-3 rounded-lg">
                  <Home className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Trend */}
          <Card className="lg:col-span-2 bg-[#111111] border-[#2A2A2A]">
            <CardHeader className="border-b border-[#2A2A2A] pb-4">
              <CardTitle className="text-white text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #2A2A2A',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue (₹)" />
                  <Line type="monotone" dataKey="bookings" stroke="#10B981" strokeWidth={2} name="Bookings" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Booking Status Distribution */}
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardHeader className="border-b border-[#2A2A2A] pb-4">
              <CardTitle className="text-white text-lg font-semibold">Booking Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #2A2A2A',
                      borderRadius: '8px',
                      color: '#FFFFFF'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <Card className="lg:col-span-2 bg-[#111111] border-[#2A2A2A]">
            <CardHeader className="border-b border-[#2A2A2A] pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg font-semibold">Recent Bookings</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/bookings')}
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  View All <ArrowUpRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                  stats.recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A] hover:border-blue-500/30 transition">
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{booking.customer_details?.name || 'Guest'}</p>
                          <p className="text-sm text-gray-400">
                            {booking.rooms?.properties?.name || 'Unknown Property'} • {booking.rooms?.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">₹{booking.total_price?.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 flex items-center justify-end gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(booking.created_at), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No recent bookings</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardHeader className="border-b border-[#2A2A2A] pb-4">
              <CardTitle className="text-white text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/admin/bookings')}
                  className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View All Bookings
                </Button>
                <Button
                  onClick={() => navigate('/admin/users')}
                  className="w-full justify-start bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border border-[#2A2A2A]"
                  variant="outline"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button
                  onClick={() => navigate('/admin/properties')}
                  className="w-full justify-start bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border border-[#2A2A2A]"
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Manage Properties
                </Button>
                <Button
                  onClick={() => navigate('/admin/revenue')}
                  className="w-full justify-start bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white border border-[#2A2A2A]"
                  variant="outline"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Revenue Analytics
                </Button>

                {/* Key Metric */}
                <div className="mt-6 p-4 bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm font-medium mb-1">Avg. Booking Value</p>
                  <p className="text-2xl font-bold text-white">₹{Math.round(stats?.avgBookingValue || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}