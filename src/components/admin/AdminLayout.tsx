import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  FileText,
  Users,
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  LayoutDashboard,
  Image,
  Package,
  Puzzle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: 'Bookings',
      path: '/admin/bookings',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'Properties',
      path: '/admin/properties',
      icon: <Home className="h-5 w-5" />
    },
    {
      name: 'Blog Manager',
      path: '/admin/blog',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="h-5 w-5" />
    },
    {
      name: 'Packages',
      path: '/admin/packages',
      icon: <Package className="h-5 w-5" />
    },
    {
      name: 'Media Library',
      path: '/admin/media',
      icon: <Image className="h-5 w-5" />
    },
    {
      name: 'Plugins',
      path: '/admin/plugins',
      icon: <Puzzle className="h-5 w-5" />
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="h-5 w-5" />
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Helmet>
        <title>{title} | Admin Dashboard</title>
      </Helmet>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-100 hover:text-white hover:bg-slate-800 mr-2"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="text-xl font-bold">StayKedar Admin</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="text-slate-100 hover:text-white hover:bg-slate-800"
        >
          <Home className="h-4 w-4 mr-2" /> View Site
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform lg:translate-x-0 lg:static",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-800">
              <div className="hidden lg:flex items-center justify-between">
                <h1 className="text-xl font-bold">StayKedar Admin</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="text-slate-100 hover:text-white hover:bg-slate-800"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              {user && (
                <div className="mt-4 flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-lg font-semibold">
                    {user.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-slate-400">Administrator</p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path ||
                      (item.path !== '/admin' && location.pathname.startsWith(item.path))
                      ? "bg-slate-800 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="w-full justify-start mt-2 text-slate-300 hover:text-white hover:bg-slate-800"
              >
                <Home className="h-4 w-4 mr-2" /> View Site
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="hidden lg:flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
            <h1 className="text-xl font-bold">{title}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-slate-100 hover:text-white hover:bg-slate-800"
            >
              <Home className="h-4 w-4 mr-2" /> View Site
            </Button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}