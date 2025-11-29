import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  User,
  LogIn,
  LogOut,
  ChevronDown,
  Settings,
  Building,
  Calendar,
  Bed,
  ShieldCheck,
  Users,
  FileText,
  Map,
  Clock,
  Heart,
  Menu,
  Cloud,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = 'customer' | 'property_owner' | 'admin';

interface MenuItem {
  label: string;
  icon: JSX.Element;
  path: string;
  disabled?: boolean;
}

const NavMenu = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [isApproved, setIsApproved] = useState(false);
  const [userName, setUserName] = useState<string>("");

  // Check user role
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setUserRole('customer');
        setUserName("");
        return;
      }

      // If email is not verified, treat as customer
      if (!user.emailVerified) {
        setUserRole('customer');
        setUserName(user.email?.split('@')[0] || 'User');
        setIsApproved(false);
        return;
      }

      try {
        // Check customer_details for role
        const { data: customerData, error: customerError } = await supabase
          .from('customer_details')
          .select('*')
          .eq('id', user.id)
          .single();

        if (customerError || !customerData) {
          console.error("Error checking customer details:", customerError);
          setUserRole('customer');
          setIsApproved(false);
          setUserName(user.email?.split('@')[0] || 'User');
          return;
        }

        // Set user name from customer details
        setUserName(customerData.name || user.email?.split('@')[0] || 'User');

        // Set role based on customer_details
        if (customerData.role === 'admin') {
          // Verify admin status in admin_users table
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (adminData && !adminError) {
            setUserRole('admin');
            setIsApproved(true);
            return;
          }
        }

        // Handle property owner role
        if (customerData.role === 'property_owner') {
          setUserRole('property_owner');
          setIsApproved(customerData.is_approved || false);
          return;
        }

        // Default to customer for any other role
        setUserRole('customer');
        setIsApproved(true);

      } catch (error) {
        console.error("Error checking user role:", error);
        setUserRole('customer');
        setIsApproved(false);
        setUserName(user.email?.split('@')[0] || 'User');
      }
    };

    checkUserRole();
  }, [user]);

  const getMenuItems = (): MenuItem[] => {
    const commonItems: MenuItem[] = [
      { label: 'Home', icon: <Home className="h-4 w-4 mr-2" />, path: '/' },
      { label: 'Find Stays', icon: <Bed className="h-4 w-4 mr-2" />, path: '/stays' },
      { label: 'Weather', icon: <Cloud className="h-4 w-4 mr-2" />, path: '/weather' },
      { label: 'Travel Guide', icon: <Map className="h-4 w-4 mr-2" />, path: '/travel-guide' },
      { label: 'Blog', icon: <FileText className="h-4 w-4 mr-2" />, path: '/blog' },
    ];

    const customerItems: MenuItem[] = [
      { label: 'My Bookings', icon: <Calendar className="h-4 w-4 mr-2" />, path: '/dashboard/bookings' },
      { label: 'Favorites', icon: <Heart className="h-4 w-4 mr-2" />, path: '/dashboard/favorites' },
      { label: 'Account Settings', icon: <Settings className="h-4 w-4 mr-2" />, path: '/dashboard/settings' },
    ];

    const propertyOwnerItems: MenuItem[] = [
      { label: 'My Properties', icon: <Building className="h-4 w-4 mr-2" />, path: '/dashboard/properties' },
      { label: 'Bookings', icon: <Calendar className="h-4 w-4 mr-2" />, path: '/dashboard/owner-bookings' },
      { label: 'Account Settings', icon: <Settings className="h-4 w-4 mr-2" />, path: '/dashboard/settings' },
    ];

    const adminItems: MenuItem[] = [
      { label: 'Dashboard', icon: <ShieldCheck className="h-4 w-4 mr-2" />, path: '/admin' },
      { label: 'User Management', icon: <Users className="h-4 w-4 mr-2" />, path: '/admin/users' },
      { label: 'Property Owners', icon: <Building className="h-4 w-4 mr-2" />, path: '/admin/property-owners' },
      { label: 'Stays Management', icon: <Bed className="h-4 w-4 mr-2" />, path: '/admin/stays' },
      { label: 'Content Management', icon: <FileText className="h-4 w-4 mr-2" />, path: '/admin/content' },
    ];

    // Display message if property owner is not approved
    if (userRole === 'property_owner' && !isApproved) {
      return [
        ...commonItems,
        {
          label: 'Approval Pending',
          icon: <Clock className="h-4 w-4 mr-2" />,
          path: '/dashboard/approval-status',
          disabled: true
        },
        { label: 'Account Settings', icon: <Settings className="h-4 w-4 mr-2" />, path: '/dashboard/settings' },
      ];
    }

    // Role-based menu items
    switch (userRole) {
      case 'admin':
        return [...commonItems, ...adminItems];
      case 'property_owner':
        return [...commonItems, ...propertyOwnerItems];
      default:
        return [...commonItems, ...(user ? customerItems : [])];
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const menuItems = getMenuItems();

  return (
    <div className="flex items-center space-x-2">
      {/* Mobile Menu */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Navigation</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {menuItems.map((item, index) => (
                <DropdownMenuItem key={index} disabled={item.disabled} asChild>
                  <Link to={item.path} className="flex items-center">
                    {item.icon}
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {user ? (
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild>
                <Link to="/auth" className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center space-x-1">
        {menuItems.slice(0, 4).map((item, index) => (
          <Button
            key={index}
            variant={location.pathname === item.path ? "default" : "ghost"}
            asChild
            disabled={item.disabled}
          >
            <Link to={item.path}>
              {item.label}
            </Link>
          </Button>
        ))}

        {/* More dropdown for additional items */}
        {menuItems.length > 4 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost">
                More <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {menuItems.slice(4).map((item, index) => (
                <DropdownMenuItem key={index} disabled={item.disabled} asChild>
                  <Link to={item.path} className="flex items-center">
                    {item.icon}
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* User menu or sign in button */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-4">
                <User className="mr-2 h-4 w-4" />
                {userName}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userRole === 'admin' && "Admin Account"}
                    {userRole === 'property_owner' && "Property Owner"}
                    {userRole === 'customer' && "Customer Account"}
                  </p>
                </div>
              </DropdownMenuLabel>

              {userRole === 'property_owner' && !isApproved && (
                <div className="px-2 py-1.5 text-xs text-yellow-600 bg-yellow-50 rounded my-1">
                  Your account is pending approval
                </div>
              )}

              <DropdownMenuSeparator />

              {userRole === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </DropdownMenuItem>
              )}

              {userRole === 'property_owner' && isApproved && (
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/properties" className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    My Properties
                  </Link>
                </DropdownMenuItem>
              )}

              {(userRole === 'customer' || userRole === 'property_owner') && (
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/bookings" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    My Bookings
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button asChild className="ml-4">
              <Link to="/auth">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>

            <Button variant="outline" asChild className="ml-2">
              <Link to="/property-owner-signup">
                <Building className="mr-2 h-4 w-4" />
                List Your Property
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default NavMenu; 