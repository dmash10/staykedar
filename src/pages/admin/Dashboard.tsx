import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Users,
  Loader2,
  DollarSign,
  Calendar,
  Home
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalUsers: number;
  totalProperties: number;
  recentActivity: any[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 1250000,
    totalBookings: 142,
    totalUsers: 850,
    totalProperties: 24,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  return (
    <AdminLayout title="Dashboard Overview">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">₹{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-slate-400">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">+{stats.totalBookings}</div>
                <p className="text-xs text-slate-400">+180.1% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Active Users</CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">+{stats.totalUsers}</div>
                <p className="text-xs text-slate-400">+19% from last month</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">Properties</CardTitle>
                <Home className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-100">+{stats.totalProperties}</div>
                <p className="text-xs text-slate-400">+4 new this week</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Bookings / Activity */}
            <Card className="col-span-4 bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-200">Recent Activity</CardTitle>
                <CardDescription className="text-slate-400">
                  You made 265 sales this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                        <Users className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none text-slate-200">New Booking #{1000 + i}</p>
                        <p className="text-sm text-slate-400">
                          Customer {i} booked Kedarnath Heights
                        </p>
                      </div>
                      <div className="ml-auto font-medium text-slate-200">+₹1,999.00</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="col-span-3 bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-200">Quick Actions</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your platform efficiently
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200"
                  onClick={() => navigate('/admin/bookings')}
                >
                  <Calendar className="mr-2 h-4 w-4" /> View All Bookings
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200"
                  onClick={() => navigate('/admin/users')}
                >
                  <Users className="mr-2 h-4 w-4" /> Manage Users
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200"
                  onClick={() => navigate('/admin/properties')}
                >
                  <Home className="mr-2 h-4 w-4" /> Manage Properties
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-slate-200"
                  onClick={() => navigate('/admin/blog/new')}
                >
                  <FileText className="mr-2 h-4 w-4" /> Create Blog Post
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}