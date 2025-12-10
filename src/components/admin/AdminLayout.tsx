
import { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronLeft, ChevronRight, LayoutDashboard, TrendingUp, Activity, BarChart3, Users, Package, MessageSquare, Calendar, Building2, Clock, Car, Wallet, CalendarDays, ClipboardCheck, RotateCcw, ShieldCheck, BanknoteIcon, Percent, Share2, Sparkles, Mail, FileCode, Smartphone, Layout, FileText, MapPin, RouteIcon, Map, Globe, Image, Ticket, Star, MessageSquareQuote, HelpCircle, Bell, Settings, Shield, ClipboardList, AlertOctagon, Zap, Puzzle, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// --- CONTEXT FOR SIDEBAR STATE ---
const AdminContext = createContext<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  isMobile: boolean;
}>({ collapsed: false, setCollapsed: () => { }, isMobile: false });

// --- ADMIN LAYOUT ---
export default function AdminLayout({ children }: { children: ReactNode, title?: string }) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('adminSidebarCollapsed') === 'true';
    }
    return false;
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCollapse = (val: boolean) => {
    setCollapsed(val);
    localStorage.setItem('adminSidebarCollapsed', String(val));
  };

  return (
    <AdminContext.Provider value={{ collapsed, setCollapsed: handleCollapse, isMobile }}>
      <div className="min-h-screen bg-[#020617] text-white flex overflow-hidden">

        {/* DESKTOP SIDEBAR - FIXED WIDTH TRANSITION */}
        {/* Uses a CSS transition on width, while main content adjusts via flex-1 */}
        {/* NEON SIDEBAR */}
        <aside
          className={cn(
            "hidden lg:flex flex-col h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out shrink-0",
            "bg-gradient-to-b from-[#0a0f1a] via-[#0d1321] to-[#080c14]",
            "border-r border-cyan-500/20",
            collapsed ? "w-[80px]" : "w-[280px]"
          )}
          style={{
            boxShadow: 'inset -1px 0 0 rgba(34, 211, 238, 0.1), 4px 0 20px rgba(0, 0, 0, 0.5)'
          }}
        >
          <AdminSidebarContent />
        </aside>

        {/* MOBILE SIDEBAR - SHEET */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" size="icon" className="shadow-lg border border-white/10 bg-black text-white">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] bg-gradient-to-b from-[#0a0f1a] via-[#0d1321] to-[#080c14] border-r border-cyan-500/20 text-white">
              <AdminSidebarContent mobile />
            </SheetContent>
          </Sheet>
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full relative">
          {/* Background Grid */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />

          <div className="relative z-10 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen pb-20">
            {children}
          </div>
        </main>

      </div>
    </AdminContext.Provider>
  );
}

// --- ADMIN SIDEBAR COMPONENT ---
function AdminSidebarContent({ mobile = false }: { mobile?: boolean }) {
  const { collapsed, setCollapsed } = useContext(AdminContext);
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>([]); // Allow multiple open groups? No, keep accordion.

  // NEON COLOR PALETTE PER SECTION
  const groupColors: Record<string, { primary: string; glow: string; text: string }> = {
    overview: { primary: 'rgb(34, 211, 238)', glow: 'rgba(34, 211, 238, 0.3)', text: 'text-cyan-300' },
    sales: { primary: 'rgb(251, 146, 60)', glow: 'rgba(251, 146, 60, 0.3)', text: 'text-orange-300' },
    operations: { primary: 'rgb(167, 139, 250)', glow: 'rgba(167, 139, 250, 0.3)', text: 'text-violet-300' },
    finance: { primary: 'rgb(52, 211, 153)', glow: 'rgba(52, 211, 153, 0.3)', text: 'text-emerald-300' },
    growth: { primary: 'rgb(244, 114, 182)', glow: 'rgba(244, 114, 182, 0.3)', text: 'text-pink-300' },
    content: { primary: 'rgb(96, 165, 250)', glow: 'rgba(96, 165, 250, 0.3)', text: 'text-blue-300' },
    support: { primary: 'rgb(251, 191, 36)', glow: 'rgba(251, 191, 36, 0.3)', text: 'text-amber-300' },
    system: { primary: 'rgb(251, 113, 133)', glow: 'rgba(251, 113, 133, 0.3)', text: 'text-rose-300' },
  };

  // Define Groups
  const navGroups = [
    {
      id: 'overview', label: 'HQ & Analytics', icon: LayoutDashboard,
      items: [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
        { name: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
        { name: 'Live Status', path: '/admin/live-status', icon: Activity },
        { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
      ]
    },
    {
      id: 'sales', label: 'Sales & CRM', icon: Users,
      items: [
        { name: 'Stay Leads', path: '/admin/stay-leads', icon: Users },
        { name: 'Sales Board', path: '/admin/sales', icon: TrendingUp },
        { name: 'Packages', path: '/admin/packages', icon: Package },
        { name: 'WhatsApp Logs', path: '/admin/whatsapp-logs', icon: MessageSquare },
      ]
    },
    {
      id: 'operations', label: 'Operations', icon: Building2,
      items: [
        { name: 'Bookings', path: '/admin/bookings', icon: Calendar },
        { name: 'Properties', path: '/admin/properties', icon: Building2 },
        { name: 'Blind Props', path: '/admin/blind-properties', icon: Building2 },
        { name: 'Urgent Inv.', path: '/admin/inventory', icon: Clock },
        { name: 'Drivers', path: '/admin/car-drivers', icon: Car },
        { name: 'Commission', path: '/admin/commissions', icon: Wallet },
        { name: 'Yatra Cal.', path: '/admin/yatra-calendar', icon: CalendarDays },
        { name: 'Verify Props', path: '/admin/property-verification', icon: ClipboardCheck },
      ]
    },
    {
      id: 'finance', label: 'Finance', icon: BanknoteIcon,
      items: [
        { name: 'Finance Hub', path: '/admin/finance', icon: BanknoteIcon },
        { name: 'Revenue & Ledger', path: '/admin/revenue', icon: BarChart3 },
        { name: 'Settlements', path: '/admin/settlements', icon: BanknoteIcon },
        { name: 'Refunds', path: '/admin/refunds', icon: RotateCcw },
        { name: 'Reliability', path: '/admin/host-reliability', icon: ShieldCheck },
      ]
    },
    {
      id: 'growth', label: 'Growth & Mkting', icon: Sparkles,
      items: [
        { name: 'Promos', path: '/admin/promos', icon: Percent },
        { name: 'Referrals', path: '/admin/marketing/referrals', icon: Share2 },
        { name: 'Banners', path: '/admin/banners', icon: Sparkles },
        { name: 'Email Camp.', path: '/admin/marketing/email', icon: Mail },
        { name: 'Email Tmpl.', path: '/admin/marketing/templates', icon: FileCode },
        { name: 'Push Notif.', path: '/admin/marketing/push', icon: Smartphone },
      ]
    },
    {
      id: 'content', label: 'CMS & SEO', icon: Globe,
      items: [
        { name: 'Homepage', path: '/admin/content/homepage', icon: Layout },
        { name: 'Blogs', path: '/admin/blog', icon: FileText },
        { name: 'SEO Cities', path: '/admin/seo-cities', icon: MapPin },
        { name: 'SEO Routes', path: '/admin/seo-routes', icon: RouteIcon },
        { name: 'Itineraries', path: '/admin/seo-itineraries', icon: Map },
        { name: 'Attractions', path: '/admin/attractions', icon: Globe },
        { name: 'Media Lib', path: '/admin/media', icon: Image },
      ]
    },
    {
      id: 'support', label: 'Support', icon: HelpCircle,
      items: [
        { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
        { name: 'Reviews', path: '/admin/reviews', icon: Star },
        { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquareQuote },
        { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
        { name: 'Help Articles', path: '/admin/help/articles', icon: FileText },
        { name: 'Notifications', path: '/admin/notifications', icon: Bell },
      ]
    },
    {
      id: 'system', label: 'System', icon: Settings,
      items: [
        { name: 'Settings', path: '/admin/settings', icon: Settings },
        { name: 'Users', path: '/admin/users/manage', icon: Users },
        { name: 'Roles', path: '/admin/system/roles', icon: Shield },
        { name: 'Activity', path: '/admin/logs', icon: ClipboardList },
        { name: 'Errors', path: '/admin/system/errors', icon: AlertOctagon },
        { name: 'Health', path: '/admin/system/health', icon: Activity },
        { name: 'Cache', path: '/admin/system/cache', icon: Zap },
        { name: 'Plugins', path: '/admin/plugins', icon: Puzzle },
      ]
    },
  ];

  /* Auto-open group logic */
  useEffect(() => {
    // Determine which group is active by finding the best match
    // We need to prioritize longer paths to avoid '/admin' matching everything
    let bestMatch: typeof navGroups[0] | null = null;
    let bestMatchLength = 0;

    for (const group of navGroups) {
      for (const item of group.items) {
        const itemPath = item.path;
        // Exact match for dashboard
        if (itemPath === '/admin' && location.pathname === '/admin') {
          if (itemPath.length > bestMatchLength) {
            bestMatch = group;
            bestMatchLength = itemPath.length;
          }
        }
        // startsWith for other routes (but not for '/admin' which would match everything)
        else if (itemPath !== '/admin' && location.pathname.startsWith(itemPath)) {
          if (itemPath.length > bestMatchLength) {
            bestMatch = group;
            bestMatchLength = itemPath.length;
          }
        }
      }
    }

    if (bestMatch && !mobile && !collapsed) {
      setOpenGroups([bestMatch.id]);
    }
  }, [location.pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => prev.includes(id) ? [] : [id]); // Accordion style: only 1 open
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const showLabels = mobile || !collapsed;

  return (
    <div className="flex flex-col h-full w-full">
      {/* NEON LOGO AREA */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 shrink-0 bg-black/30">
        <div className="flex items-center gap-3">
          {/* Neon Logo */}
          <div
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-pink-500 to-violet-600 flex items-center justify-center"
            style={{ boxShadow: '0 0 25px rgba(251, 146, 60, 0.4), 0 0 50px rgba(167, 139, 250, 0.2)' }}
          >
            <span className="font-black text-white text-sm">SK</span>
          </div>
          {showLabels && (
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-tight text-white">StayKedarnath<span className="text-orange-400">.in</span></span>
              <span className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">ADMIN CONSOLE</span>
            </div>
          )}
        </div>
        {/* Collapse Button */}
        {!mobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-7 w-7 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* SCROLLABLE NAV */}
      <ScrollArea className="flex-1 py-3">
        <div className="px-3 space-y-1.5">
          {navGroups.map(group => {
            const isGroupActive = group.items.some(i => isActive(i.path, i.exact));
            const isOpen = openGroups.includes(group.id);
            const colors = groupColors[group.id] || groupColors.overview;

            if (!showLabels) {
              // COLLAPSED NEON ICONS
              return (
                <TooltipProvider key={group.id} delayDuration={0}>
                  <div className="mb-3 pb-3 border-b border-white/5 last:border-0">
                    <div className="flex justify-center mb-2">
                      <group.icon className="w-3.5 h-3.5" style={{ color: colors.primary, opacity: 0.4 }} />
                    </div>
                    {group.items.map(item => {
                      const active = isActive(item.path, item.exact);
                      return (
                        <Tooltip key={item.path}>
                          <TooltipTrigger asChild>
                            <Link
                              to={item.path}
                              className={cn(
                                "w-11 h-11 flex items-center justify-center rounded-xl mb-1.5 mx-auto transition-all duration-200",
                                active
                                  ? "text-white border"
                                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                              )}
                              style={active ? {
                                backgroundColor: `${colors.primary}20`,
                                borderColor: `${colors.primary}50`,
                                boxShadow: `0 0 15px ${colors.glow}`
                              } : {}}
                            >
                              <item.icon className="w-5 h-5" style={active ? { color: colors.primary } : {}} />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-[#0a0f1a] border-white/10 text-white ml-3 z-[60] px-3 py-1.5 text-xs font-medium"
                          >
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </TooltipProvider>
              );
            }

            // EXPANDED NEON ACCORDION
            return (
              <Collapsible key={group.id} open={isOpen} onOpenChange={() => toggleGroup(group.id)}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center justify-between w-full px-3 py-2.5 rounded-xl mb-1 transition-all text-sm font-semibold",
                      "border",
                      isGroupActive
                        ? "text-white border-white/10"
                        : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
                    )}
                    style={isGroupActive ? {
                      background: `linear-gradient(to right, ${colors.primary}15, transparent)`,
                      borderColor: `${colors.primary}30`
                    } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                          !isGroupActive && "bg-white/5"
                        )}
                        style={isGroupActive ? {
                          background: `linear-gradient(135deg, ${colors.primary}40, ${colors.primary}10)`
                        } : {}}
                      >
                        <group.icon className="w-4 h-4" style={{ color: isGroupActive ? colors.primary : '#94a3b8' }} />
                      </div>
                      <span className="tracking-wide">{group.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 transition-transform duration-300 ease-out",
                        isOpen && "rotate-180"
                      )}
                      style={{ color: isGroupActive ? colors.primary : '#64748b' }}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent
                  className="relative pl-0 space-y-1 py-1 ml-4 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 duration-300"
                >
                  {/* Minial Tree Connection Line */}
                  <div className="absolute left-0 top-0 bottom-2 w-px bg-white/5" />

                  {group.items.map((item) => {
                    const active = isActive(item.path, item.exact);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "relative group/item flex items-center gap-3 px-3.5 py-2.5 rounded-r-lg text-[13px] transition-all duration-300 ml-3",
                          active
                            ? "font-semibold tracking-wide text-white"
                            : "text-slate-300 hover:text-white font-medium" // High contrast basic state
                        )}
                        style={active ? {
                          background: `linear-gradient(90deg, ${colors.primary}15 0%, transparent 100%)`,
                        } : {}}
                      >
                        {/* Neon Active Bar (Left) */}
                        {active && (
                          <div
                            className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-full"
                            style={{
                              backgroundColor: colors.primary,
                              boxShadow: `0 0 10px ${colors.glow}`
                            }}
                          />
                        )}

                        {/* Inactive Hover Indicator */}
                        {!active && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-white/40 group-hover/item:h-4 transition-all duration-300 rounded-r-full opacity-0 group-hover/item:opacity-100" />
                        )}

                        {/* Connector Dot/Line */}
                        <div className="absolute -left-3 top-1/2 w-2 h-px bg-white/5 group-hover/item:bg-white/20 transition-colors" />

                        <item.icon
                          className={cn("w-4 h-4 transition-all duration-300", active ? "scale-105" : "opacity-70 group-hover/item:opacity-100 group-hover/item:scale-105")}
                          style={active ? { color: colors.primary, filter: `drop-shadow(0 0 8px ${colors.glow})` } : {}}
                        />

                        <span className={cn("transition-all", active ? "translate-x-0.5" : "")}>{item.name}</span>

                        {/* Hover Overlay */}
                        {!active && <div className="absolute inset-0 bg-white/0 group-hover/item:bg-white/[0.03] pointer-events-none transition-colors rounded-r-lg" />}

                        {/* Active Pulse Dot right */}
                        {active && (
                          <div
                            className="ml-auto w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: colors.primary, boxShadow: `0 0 8px ${colors.glow}` }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      {/* NEON FOOTER */}
      {showLabels && (
        <div className="p-4 border-t border-white/5 shrink-0 bg-black/30">
          <div
            className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5"
          >
            <div
              className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center shrink-0"
              style={{ boxShadow: '0 0 12px rgba(167, 139, 250, 0.4)' }}
            >
              <span className="text-xs font-bold text-white">AD</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-[11px] text-slate-400 truncate">Super Admin</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.6)' }} />
          </div>
        </div>
      )}
    </div>
  );
}