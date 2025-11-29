import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";
import { EditProvider } from "@/contexts/EditContext";
import { PluginProvider } from "@/contexts/PluginContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import CustomerRoute from "@/components/CustomerRoute";
import PropertyOwnerRoute from "@/components/PropertyOwnerRoute";
import AdminRoute from "@/components/AdminRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import About from "./pages/About";
import Weather from "./pages/Weather";
import Attractions from "./pages/Attractions";
import NotFound from "./pages/NotFound";
import ContentCreator from "./pages/ContentCreator";
import PartnerWithUs from "./pages/PartnerWithUs";
import Auth from "./pages/Auth";
import Dashboard from './pages/Dashboard'; // Customer dashboard
import AdminDashboard from './pages/admin/Dashboard'; // Admin dashboard
import Packages from "./pages/Packages";
import { Helmet } from "react-helmet";
import WhatsAppButton from "./components/WhatsAppButton";
import { AdminToolbar } from "./components/admin/AdminToolbar";
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AuthCallback from "./pages/AuthCallback";
import AdminBlogList from './pages/admin/AdminBlogList';
import AdminBlogEditor from './pages/admin/AdminBlogEditor';
import UsersPage from './pages/admin/UsersPage';
import BookingsPage from './pages/admin/BookingsPage';
import PropertiesPage from './pages/admin/PropertiesPage';
import PackagesPage from './pages/admin/PackagesPage';
import MediaLibraryPage from './pages/admin/MediaLibraryPage';
import SettingsPage from './pages/admin/SettingsPage';
import PluginsPage from './pages/admin/PluginsPage';
import PluginDemo from './pages/PluginDemo';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import CancellationPolicy from './pages/CancellationPolicy';
import ContactUs from './pages/ContactUs';
import StayListing from './pages/StayListing';
import RoomDetail from './pages/RoomDetail';
import UserBookings from './pages/UserBookings';
import PropertyManagement from './pages/PropertyManagement';
import PropertyEdit from './pages/PropertyEdit';
import RoomEdit from './pages/RoomEdit';
import Signup from './pages/Signup';
import Profile from './pages/Profile';

const queryClient = new QueryClient();

const App = () => {
  console.log("DEBUG: App component rendering");
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <EditProvider>
              <PluginProvider>
                <TooltipProvider>
                  <Helmet>
                    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
                    <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
                  </Helmet>

                  <Toaster />
                  <Sonner />
                  <WhatsAppButton />
                  <ErrorBoundary>
                    <AdminToolbar />
                  </ErrorBoundary>
                  <Routes>
                    {/* Auth callback route */}
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/weather" element={<Weather />} />
                    <Route path="/attractions" element={<Attractions />} />
                    <Route path="/content-creator" element={<ContentCreator />} />
                    <Route path="/partner-with-us" element={<PartnerWithUs />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/stays" element={<StayListing />} />
                    <Route path="/stays/:roomId" element={<RoomDetail />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blogs" element={<Navigate to="/blog" replace />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/shipping" element={<ShippingPolicy />} />
                    <Route path="/cancellation" element={<CancellationPolicy />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/property-owner-signup" element={<Signup />} />

                    {/* Customer routes - Use CUSTOMER Dashboard */}
                    <Route path="/dashboard" element={
                      <CustomerRoute>
                        <Dashboard />
                      </CustomerRoute>
                    } />
                    <Route path="/dashboard/bookings" element={
                      <CustomerRoute>
                        <UserBookings />
                      </CustomerRoute>
                    } />

                    {/* Property owner routes */}
                    <Route path="/dashboard/properties" element={
                      <PropertyOwnerRoute>
                        <PropertyManagement />
                      </PropertyOwnerRoute>
                    } />
                    <Route path="/dashboard/properties/:propertyId/edit" element={
                      <PropertyOwnerRoute>
                        <PropertyEdit />
                      </PropertyOwnerRoute>
                    } />
                    <Route path="/dashboard/rooms/:roomId/edit" element={
                      <PropertyOwnerRoute>
                        <RoomEdit />
                      </PropertyOwnerRoute>
                    } />

                    {/* Admin routes - Use ADMIN Dashboard */}
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/blog" element={<AdminBlogList />} />
                    <Route path="/admin/blog/:postId" element={<AdminBlogEditor />} />
                    <Route path="/admin/users" element={<UsersPage />} />
                    <Route path="/admin/bookings" element={<BookingsPage />} />
                    <Route path="/admin/properties" element={<PropertiesPage />} />
                    <Route path="/admin/packages" element={<PackagesPage />} />
                    <Route path="/admin/media" element={<MediaLibraryPage />} />
                    <Route path="/admin/settings" element={<SettingsPage />} />
                    <Route path="/admin/plugins" element={<PluginsPage />} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </PluginProvider>
            </EditProvider>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
