import { ReactNode, useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  TrendingUp,
  Star,
  Package,
  FileText,
  Image,
  Ticket,
  Bell,
  BarChart3,
  Settings,
  ClipboardList,
  LogOut,
  Search,
  ChevronDown,
  Menu,
  X,
  Puzzle,
  Car,
  Globe,
  RouteIcon,

  MapPin,
  Map,
  Sparkles,
  Percent,
  Mail,
  MessageSquareQuote,
  HelpCircle,
  Zap,
  Shield,
  Activity,
  FileCode,
  Smartphone,
  Share2,
  Layout,
  AlertOctagon,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navGroups = [
    {
      label: 'Overview',
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Analytics', path: '/admin/revenue', icon: TrendingUp },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
      ]
    },
    {
      label: 'Management',
      items: [
        { name: 'Properties', path: '/admin/properties', icon: Building2 },
        { name: 'Car Drivers', path: '/admin/car-drivers', icon: Car },
        { name: 'Packages', path: '/admin/packages', icon: Package },
        { name: 'Urgent Inventory', path: '/admin/inventory', icon: Clock },
        { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
        { name: 'Users', path: '/admin/users', icon: Users },
      ]
    },
    {
      label: 'SEO Pages',
      items: [
        { name: 'Live Status', path: '/admin/live-status', icon: Globe },
        { name: 'SEO Cities', path: '/admin/seo-cities', icon: MapPin },
        { name: 'SEO Routes', path: '/admin/seo-routes', icon: RouteIcon },
        { name: 'Itineraries', path: '/admin/seo-itineraries', icon: Map },
        { name: 'Attractions', path: '/admin/attractions', icon: Globe },
      ]
    },
    {
      label: 'Marketing',
      items: [
        { name: 'Banners', path: '/admin/banners', icon: Sparkles },
        { name: 'Promo Codes', path: '/admin/promos', icon: Percent },
        { name: 'Email Campaigns', path: '/admin/marketing/email', icon: Mail },
        { name: 'Email Templates', path: '/admin/marketing/templates', icon: FileCode },
        { name: 'Push Notifications', path: '/admin/marketing/push', icon: Smartphone },
        { name: 'Referral Program', path: '/admin/marketing/referrals', icon: Share2 },
      ]
    },
    {
      label: 'Content',
      items: [
        { name: 'Homepage Editor', path: '/admin/content/homepage', icon: Layout },
        { name: 'Blog Manager', path: '/admin/blog', icon: FileText },
        { name: 'Help Articles', path: '/admin/help/articles', icon: FileText },
        { name: 'Media Library', path: '/admin/media', icon: Image },
        { name: 'Reviews', path: '/admin/reviews', icon: Star },
        { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
        { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
      ]
    },
    {
      label: 'Support',
      items: [
        { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
        { name: 'Notifications', path: '/admin/notifications', icon: Bell },
      ]
    },
    {
      label: 'System',
      items: [
        { name: 'Settings', path: '/admin/settings', icon: Settings },
        { name: 'User Management', path: '/admin/users/manage', icon: Users },
        { name: 'Activity Logs', path: '/admin/logs', icon: ClipboardList },
        { name: 'Error Logs', path: '/admin/system/errors', icon: AlertOctagon },
        { name: 'Cache Management', path: '/admin/system/cache', icon: Zap },
        { name: 'System Health', path: '/admin/system/health', icon: Activity },
        { name: 'Roles & Permissions', path: '/admin/system/roles', icon: Shield },
        { name: 'Plugins', path: '/admin/plugins', icon: Puzzle },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-black border-b border-[#1F1F1F] backdrop-blur-lg bg-opacity-90">
        <div className="max-w-[1920px] mx-auto">
          {/* Main Nav Row */}
          <div className="flex items-center justify-between h-16 px-6">
            {/* Logo */}
            <Link to="/admin" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">SK</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-lg">StayKedar</h1>
                <p className="text-xs text-gray-400">Admin Dashboard</p>
              </div>
            </Link>

            {/* Desktop Navigation - Horizontal Menu */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-4xl mx-8">
              {navGroups.map((group) => (
                <DropdownMenu key={group.label}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-gray-300 hover:text-white hover:bg-[#1A1A1A] font-medium px-4"
                    >
                      {group.label}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#111111] border-[#2A2A2A] min-w-[200px]">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.path);
                      return (
                        <DropdownMenuItem
                          key={item.path}
                          onClick={() => navigate(item.path)}
                          className={`cursor-pointer ${active
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:text-white hover:bg-[#1A1A1A]'
                            }`}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
            </nav>

            {/* Right Side - Search, Notifications, Profile */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  type="search"
                  placeholder="Quick search..."
                  className="pl-10 w-64 bg-[#111111] border-[#2A2A2A] text-white placeholder:text-gray-500 focus:border-blue-500 h-9"
                />
              </div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative text-gray-400 hover:text-white hover:bg-[#1A1A1A] h-9 w-9 p-0"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
              </Button>

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-[#1A1A1A] rounded-lg px-2 py-1 transition">
                    <Avatar className="w-8 h-8 border-2 border-blue-500/30">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#111111] border-[#2A2A2A]" align="end">
                  <DropdownMenuLabel className="text-white">
                    <p className="font-medium">Admin</p>
                    <p className="text-xs text-gray-400 font-normal truncate">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#1A1A1A] cursor-pointer">
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#1A1A1A] cursor-pointer">
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-[#1A1A1A] cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-white h-9 w-9 p-0"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-[#1F1F1F] bg-black">
              <div className="px-4 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {group.label}
                    </p>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${active
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-300 hover:text-white hover:bg-[#1A1A1A]'
                              }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area - Full Width */}
      <main className="max-w-[1920px] mx-auto">
        {/* Page Title Bar */}
        <div className="bg-[#0A0A0A] border-b border-[#1F1F1F] px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
              <p className="text-sm text-gray-400 mt-1">
                {location.pathname.split('/').filter(Boolean).join(' / ')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}