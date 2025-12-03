import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, Home, Cloud, Landmark, UserPlus, Package, FileText, Puzzle, MapPin, Bed, BookOpen, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import Container from "./Container";
import { EditableButton } from "./editable";
import { useEdit } from "@/contexts/EditContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// List of admin email addresses
const ADMIN_EMAILS: string[] = [];

// Regular navigation links visible to all users
const publicNavLinks = [
  { name: "Home", path: "/", icon: <Home className="w-4 h-4" /> },
  { name: "Stays", path: "/stays", icon: <Bed className="w-4 h-4" /> },
  { name: "Weather", path: "/weather", icon: <Cloud className="w-4 h-4" /> },
  { name: "Attractions", path: "/attractions", icon: <MapPin className="w-4 h-4" /> },
  { name: "Packages", path: "/packages", icon: <Package className="w-4 h-4" /> },
  { name: "Blog", path: "/blog", icon: <FileText className="w-4 h-4" /> },
];

// Admin-only navigation links
const adminNavLinks = [
  { name: "Plugins", path: "/plugins", icon: <Puzzle className="w-4 h-4" /> },
];

const Nav = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showNavFade, setShowNavFade] = useState(true);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isEditMode } = useEdit();
  const [userName, setUserName] = useState<string | null>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Check if user is admin and get user details
  useEffect(() => {
    const getUserDetails = async () => {
      if (!user?.id) {
        setIsAdmin(false);
        setUserRole(null);
        setUserName(null);
        return;
      }

      // Check if user's email is in the admin list
      if (ADMIN_EMAILS.includes(user.email || '')) {
        setIsAdmin(true);
      }

      // Get user details from customer_details table
      try {
        const { data, error } = await supabase
          .from('customer_details')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          console.log("User details from Supabase:", data);
          // Use type assertion to handle missing properties in TypeScript
          const userData = data as any;
          setUserName(userData.name || user.email?.split('@')[0] || 'User');
          setUserRole(userData.role || 'customer');

          // Check admin status 
          if (userData.role === 'admin') {
            setIsAdmin(true);
          }
        } else {
          console.log("User not found in customer_details table");
          setUserName(user.email?.split('@')[0] || 'User');
          setUserRole('customer');
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserName(user.email?.split('@')[0] || 'User');
        setUserRole('customer');
      }
    };

    getUserDetails();
  }, [user]);

  // Combine the navigation links based on admin status
  const navLinks = [...publicNavLinks, ...(isAdmin ? adminNavLinks : [])];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Get the scroll position before unlocking
      const scrollY = document.body.style.top;
      
      // Unlock body scroll
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function to ensure overflow is reset
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Setup scroll listener for fade effect (only once)
  useEffect(() => {
    const handleNavScroll = () => {
      if (mobileNavRef.current) {
        const isScrolled = mobileNavRef.current.scrollLeft > 10;
        setShowNavFade(!isScrolled);
      }
    };

    const navElement = mobileNavRef.current;
    if (navElement) {
      navElement.addEventListener('scroll', handleNavScroll);
      return () => {
        navElement.removeEventListener('scroll', handleNavScroll);
      };
    }
  }, []);

  // Auto-scroll to active item when route changes
  useEffect(() => {
    if (mobileNavRef.current) {
      const activeLink = mobileNavRef.current.querySelector('.bg-white\\/20');
      if (activeLink) {
        // Use instant scroll to prevent visible jump
        activeLink.scrollIntoView({ behavior: 'instant', block: 'nearest', inline: 'center' });
      }
    }
  }, [location]);

  // Function to check if a path is active
  const isActivePath = (path: string) => {
    return location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path));
  };

  const handleSignOut = async () => {
    setShowSignOutDialog(true);
  };

  const confirmSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    setShowSignOutDialog(false);
    navigate('/');
  };

  // Get dashboard route based on user role
  const getDashboardRoute = () => {
    if (isAdmin) return '/admin';
    if (userRole === 'property_owner') return '/dashboard/properties';
    return '/dashboard';
  };

  return (
    <>
      <nav className="bg-[#003580] text-white">
        <Container>
          <div className="py-4 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-lg md:text-2xl font-bold">
              StayKedarnath.in
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* List Property */}
              {!user && (
                <Link
                  to="/become-a-host"
                  className="hidden lg:inline-flex items-center justify-center rounded-md bg-transparent border border-white px-3 py-2 text-white font-medium hover:bg-white hover:text-[#003580] transition-colors"
                >
                  <span className="text-sm font-semibold">List your property</span>
                </Link>
              )}

              {/* Button Group - Show only when not logged in */}
              {!user ? (
                <div className="hidden md:flex">
                  <Link to="/auth">
                    <Button className="bg-white text-[#003580] hover:bg-gray-100 rounded-l-lg rounded-r-none border-r border-gray-300">
                      Register
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button className="bg-white text-[#003580] hover:bg-gray-100 rounded-l-none rounded-r-lg">
                      Sign in
                    </Button>
                  </Link>
                </div>
              ) : (
                /* User Profile */
                <div className="relative" ref={userMenuRef}>
                  <div
                    className="flex items-center gap-2 cursor-pointer bg-transparent hover:bg-[#004cb8] py-2 px-3 rounded-full transition-colors"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <Avatar className="h-8 w-8 border-2 border-white">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-[#004cb8]">
                        {userName?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{userName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </div>

                  {/* User dropdown menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <Link
                          to={getDashboardRoute()}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Account Settings
                        </Link>
                        <button
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={handleSignOut}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button + Profile Icon */}
              <div className="md:hidden flex items-center gap-2">
                {/* Profile Icon for Mobile */}
                {!user ? (
                  <Link to="/auth">
                    <div className="p-2 rounded-full border-2 border-white hover:bg-white/10 transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                  </Link>
                ) : (
                  <div
                    className="p-2 rounded-full border-2 border-white hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User className="h-5 w-5" />
                  </div>
                )}

                {/* Hamburger Menu */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-white p-2"
                >
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Navigation Tabs (Mobile) */}
          <div className="md:hidden relative">
            <div
              ref={mobileNavRef}
              className="overflow-x-auto snap-x snap-mandatory pt-2 pb-4"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <style>{`
                .overflow-x-auto::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="flex gap-2 px-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-white transition duration-200 whitespace-nowrap flex-shrink-0 snap-start",
                      isActivePath(link.path)
                        ? "bg-white/20 border-2 border-white"
                        : "hover:bg-white/10 border border-white/50"
                    )}
                  >
                    {link.icon}
                    <span className="font-medium text-sm">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            {/* Fade gradient overlay on right - only show when not scrolled */}
            {showNavFade && (
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#003580] to-transparent pointer-events-none transition-opacity duration-300" />
            )}
          </div>

          {/* Bottom Navigation (Desktop) */}
          <div className="hidden md:flex items-center space-x-6 py-2 relative">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-full text-white transition duration-200",
                  isActivePath(link.path) ? "bg-[#004cb8]" : "hover:bg-[#004cb8]"
                )}
              >
                {link.icon}
                <span className="font-medium">{link.name}</span>
              </Link>
            ))}
          </div>
        </Container>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[72px] bg-[#003580] z-50 overflow-y-auto">
            <div className="flex flex-col space-y-2 py-4 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-white transition duration-200",
                    isActivePath(link.path) ? "bg-[#004cb8]" : "hover:bg-[#004cb8]"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.icon}
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}

              {!user && (
                <div className="pt-4 mt-2 border-t border-[#004cb8] flex flex-col gap-3">
                  <Link
                    to="/auth"
                    className="w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-white text-[#003580] hover:bg-gray-100">
                      Sign In / Register
                    </Button>
                  </Link>
                  <Link
                    to="/property-owner-signup"
                    className="w-full text-center py-2 text-white border border-white rounded-md font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    List your property
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSignOut}>Sign Out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Nav;
