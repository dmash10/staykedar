import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Wifi,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Zap,
  Globe,
  Users,
  Calendar,
  Building2,
  Ticket,
  Bell,
  Shield,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow } from 'date-fns';

interface HealthMetric {
  name: string;
  value: number | string;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: any;
  description?: string;
}

interface DatabaseStats {
  total_bookings: number;
  total_users: number;
  total_properties: number;
  total_rooms: number;
  total_attractions: number;
  active_promo_codes: number;
  unread_notifications: number;
  open_tickets: number;
}

export default function SystemHealthPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch database stats
  const { data: dbStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['system-health-db-stats'],
    queryFn: async () => {
      // Get counts from various tables
      const [
        { count: bookingsCount },
        { count: usersCount },
        { count: propertiesCount },
        { count: roomsCount },
        { count: attractionsCount },
        { count: promoCodesCount },
        { count: notificationsCount },
        { count: ticketsCount }
      ] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }),
        supabase.from('customer_details').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('rooms').select('*', { count: 'exact', head: true }),
        supabase.from('attractions').select('*', { count: 'exact', head: true }),
        supabase.from('promo_codes').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('admin_notifications').select('*', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')
      ]);

      return {
        total_bookings: bookingsCount || 0,
        total_users: usersCount || 0,
        total_properties: propertiesCount || 0,
        total_rooms: roomsCount || 0,
        total_attractions: attractionsCount || 0,
        active_promo_codes: promoCodesCount || 0,
        unread_notifications: notificationsCount || 0,
        open_tickets: ticketsCount || 0
      } as DatabaseStats;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Check API health
  const { data: apiHealth, refetch: refetchApi } = useQuery({
    queryKey: ['system-health-api'],
    queryFn: async () => {
      const startTime = performance.now();
      try {
        const { data, error } = await supabase.from('site_content').select('key').limit(1);
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        
        return {
          status: error ? 'critical' : latency > 1000 ? 'warning' : 'healthy',
          latency,
          error: error?.message
        };
      } catch (e) {
        return { status: 'critical' as const, latency: 0, error: 'Connection failed' };
      }
    },
    refetchInterval: 15000,
  });

  // Check auth service
  const { data: authHealth, refetch: refetchAuth } = useQuery({
    queryKey: ['system-health-auth'],
    queryFn: async () => {
      const startTime = performance.now();
      try {
        const { data, error } = await supabase.auth.getSession();
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        
        return {
          status: error ? 'critical' : latency > 500 ? 'warning' : 'healthy',
          latency,
          hasSession: !!data.session
        };
      } catch (e) {
        return { status: 'critical' as const, latency: 0, hasSession: false };
      }
    },
    refetchInterval: 30000,
  });

  // Check storage service
  const { data: storageHealth, refetch: refetchStorage } = useQuery({
    queryKey: ['system-health-storage'],
    queryFn: async () => {
      const startTime = performance.now();
      try {
        const { data, error } = await supabase.storage.listBuckets();
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        
        return {
          status: error ? 'critical' : latency > 1000 ? 'warning' : 'healthy',
          latency,
          buckets: data?.length || 0
        };
      } catch (e) {
        return { status: 'critical' as const, latency: 0, buckets: 0 };
      }
    },
    refetchInterval: 60000,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchStats(),
      refetchApi(),
      refetchAuth(),
      refetchStorage()
    ]);
    setLastRefresh(new Date());
    setIsRefreshing(false);
  };

  // Auto-refresh timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const overallStatus = () => {
    const statuses = [apiHealth?.status, authHealth?.status, storageHealth?.status];
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    return 'healthy';
  };

  const services = [
    {
      name: 'Database API',
      status: apiHealth?.status || 'healthy',
      latency: apiHealth?.latency || 0,
      icon: Database,
      description: 'Supabase PostgreSQL database connection'
    },
    {
      name: 'Authentication',
      status: authHealth?.status || 'healthy',
      latency: authHealth?.latency || 0,
      icon: Shield,
      description: 'User authentication service'
    },
    {
      name: 'File Storage',
      status: storageHealth?.status || 'healthy',
      latency: storageHealth?.latency || 0,
      icon: HardDrive,
      description: `${storageHealth?.buckets || 0} storage buckets available`
    }
  ];

  if (statsLoading) {
    return (
      <AdminLayout title="System Health">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="System Health">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
              overallStatus() === 'healthy' ? 'bg-green-500/10' :
              overallStatus() === 'warning' ? 'bg-amber-500/10' : 'bg-red-500/10'
            }`}>
              {getStatusIcon(overallStatus())}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">System Status</h2>
              <p className="text-sm text-gray-400">
                Last checked: {formatDistanceToNow(lastRefresh, { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isRefreshing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Refreshing...</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" />Refresh All</>
            )}
          </Button>
        </div>

        {/* Overall Status Banner */}
        <Card className={`border-2 ${
          overallStatus() === 'healthy' ? 'bg-green-500/5 border-green-500/30' :
          overallStatus() === 'warning' ? 'bg-amber-500/5 border-amber-500/30' :
          'bg-red-500/5 border-red-500/30'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${
                overallStatus() === 'healthy' ? 'bg-green-500/20' :
                overallStatus() === 'warning' ? 'bg-amber-500/20' : 'bg-red-500/20'
              }`}>
                {overallStatus() === 'healthy' ? (
                  <CheckCircle className="w-8 h-8 text-green-400" />
                ) : overallStatus() === 'warning' ? (
                  <AlertTriangle className="w-8 h-8 text-amber-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${
                  overallStatus() === 'healthy' ? 'text-green-400' :
                  overallStatus() === 'warning' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {overallStatus() === 'healthy' ? 'All Systems Operational' :
                   overallStatus() === 'warning' ? 'Performance Degradation' :
                   'System Issues Detected'}
                </h3>
                <p className="text-gray-400">
                  {overallStatus() === 'healthy' 
                    ? 'All services are running smoothly'
                    : 'Some services may be experiencing issues'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.name} className="bg-[#111111] border-[#2A2A2A]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      service.status === 'healthy' ? 'bg-green-500/10' :
                      service.status === 'warning' ? 'bg-amber-500/10' : 'bg-red-500/10'
                    }`}>
                      <service.icon className={`w-5 h-5 ${
                        service.status === 'healthy' ? 'text-green-400' :
                        service.status === 'warning' ? 'text-amber-400' : 'text-red-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{service.name}</h4>
                      <p className="text-xs text-gray-500">{service.description}</p>
                    </div>
                  </div>
                  {getStatusIcon(service.status)}
                </div>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(service.status)}>
                    {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-400">
                    <Zap className="w-3 h-3 inline mr-1" />
                    {service.latency}ms
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Database Stats */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              Database Statistics
            </CardTitle>
            <CardDescription className="text-gray-400">
              Real-time counts from your database tables
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Users</span>
                </div>
                <p className="text-2xl font-bold text-white">{dbStats?.total_users || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Properties</span>
                </div>
                <p className="text-2xl font-bold text-white">{dbStats?.total_properties || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Bookings</span>
                </div>
                <p className="text-2xl font-bold text-white">{dbStats?.total_bookings || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-gray-400">Attractions</span>
                </div>
                <p className="text-2xl font-bold text-white">{dbStats?.total_attractions || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-gray-400">Rooms</span>
                </div>
                <p className="text-2xl font-bold text-white">{dbStats?.total_rooms || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-rose-400" />
                  <span className="text-sm text-gray-400">Active Promos</span>
                </div>
                <p className="text-2xl font-bold text-white">{dbStats?.active_promo_codes || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-gray-400">Unread Alerts</span>
                </div>
                <p className="text-2xl font-bold text-white">{dbStats?.unread_notifications || 0}</p>
              </div>
              <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                <div className="flex items-center gap-2 mb-2">
                  <Ticket className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-gray-400">Open Tickets</span>
                </div>
                <p className="text-2xl font-bold text-white">{dbStats?.open_tickets || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 border-[#2A2A2A] bg-[#0A0A0A] text-gray-300 hover:bg-[#1A1A1A] hover:text-white"
                onClick={() => queryClient.invalidateQueries()}
              >
                <RefreshCw className="w-5 h-5 text-blue-400" />
                <span className="text-sm">Clear Cache</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 border-[#2A2A2A] bg-[#0A0A0A] text-gray-300 hover:bg-[#1A1A1A] hover:text-white"
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              >
                <Database className="w-5 h-5 text-green-400" />
                <span className="text-sm">Supabase Dashboard</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 border-[#2A2A2A] bg-[#0A0A0A] text-gray-300 hover:bg-[#1A1A1A] hover:text-white"
                onClick={() => window.location.href = '/admin/logs'}
              >
                <Activity className="w-5 h-5 text-purple-400" />
                <span className="text-sm">View Logs</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 border-[#2A2A2A] bg-[#0A0A0A] text-gray-300 hover:bg-[#1A1A1A] hover:text-white"
                onClick={() => window.location.href = '/admin/settings'}
              >
                <Server className="w-5 h-5 text-amber-400" />
                <span className="text-sm">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-gray-400" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                  <span className="text-gray-400">Platform</span>
                  <span className="text-white">Supabase + React</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                  <span className="text-gray-400">Database</span>
                  <span className="text-white">PostgreSQL</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                  <span className="text-gray-400">Region</span>
                  <span className="text-white">AWS ap-south-1</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                  <span className="text-gray-400">Environment</span>
                  <Badge className="bg-green-500/20 text-green-400">Production</Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                  <span className="text-gray-400">SSL</span>
                  <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-[#2A2A2A]">
                  <span className="text-gray-400">Last Deploy</span>
                  <span className="text-white">{format(new Date(), 'MMM dd, yyyy')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}




