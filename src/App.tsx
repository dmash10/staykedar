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
import AdminDashboard from '@/pages/admin/Dashboard'; // Admin dashboard
import Packages from "./pages/Packages";
import PackageDetail from "./pages/PackageDetail";
import CarRentals from "./pages/CarRentals";
import TaxiServicePage from "./pages/TaxiServicePage";
import StaysLocationPage from "./pages/StaysLocationPage";
import AttractionsLocationPage from "./pages/AttractionsLocationPage";
import TravelGuidePage from "./pages/TravelGuidePage";
import RoutePage from "./pages/RoutePage";
import PackagesFromCityPage from "./pages/PackagesFromCityPage";
import SEORoutesPage from "./pages/admin/SEORoutesPage";
import DriverDetail from "./pages/DriverDetail";
import DriverRegistration from "./pages/DriverRegistration";
import { Helmet } from "react-helmet";
import WhatsAppButton from "./components/WhatsAppButton";
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AuthCallback from "./pages/AuthCallback";
import AdminBlogList from '@/pages/admin/AdminBlogList';
import AdminBlogEditor from '@/pages/admin/AdminBlogEditor';
import AdminArticleList from '@/pages/admin/AdminArticleList';
import AdminArticleEditor from '@/pages/admin/AdminArticleEditor';
import UsersPage from '@/pages/admin/UsersPage';
import BookingsPage from '@/pages/admin/BookingsPage';
import PropertiesPage from '@/pages/admin/PropertiesPage';
import PackagesPage from '@/pages/admin/PackagesPage';
import MediaLibraryPage from '@/pages/admin/MediaLibraryPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import RevenuePage from '@/pages/admin/RevenuePage';
import ReviewsPage from '@/pages/admin/ReviewsPage';
import SupportTicketsPage from '@/pages/admin/SupportTicketsPage';
import AdminTicketDetail from '@/pages/admin/AdminTicketDetail';
import NotificationsPage from '@/pages/admin/NotificationsPage';
import ReportsPage from '@/pages/admin/ReportsPage';
import ActivityLogsPage from '@/pages/admin/ActivityLogsPage';
import PluginsPage from '@/pages/admin/PluginsPage';
import CarDriversPage from '@/pages/admin/CarDriversPage';
import SEOCitiesPage from '@/pages/admin/SEOCitiesPage';
import PluginDemo from './pages/PluginDemo';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ShippingPolicy from './pages/ShippingPolicy';
import CancellationPolicy from './pages/CancellationPolicy';
import ContactUs from './pages/ContactUs';
import StayListing from './pages/StayListing';
import PropertyDetail from './pages/PropertyDetail';
import UserBookings from './pages/UserBookings';
import UserTickets from './pages/user/UserTickets';
import TicketDetail from './pages/user/TicketDetail';
import PropertyOnboarding from "./pages/PropertyOnboarding";
import PropertyManagement from './pages/PropertyManagement';
import PropertyEdit from './pages/PropertyEdit';
import RoomEdit from './pages/RoomEdit';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import PropertyOwnerSignup from './pages/PropertyOwnerSignup';
import EmailVerification from './pages/EmailVerification';
import RaiseTicket from './pages/support/RaiseTicket';
import TrackTicket from './pages/support/TrackTicket';
import PublicTicketDetail from './pages/support/PublicTicketDetail';
import HelpHome from './pages/help/HelpHome';
import HelpCategory from './pages/help/HelpCategory';
import HelpArticle from './pages/help/HelpArticle';

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
                    <Route path="/stays/:propertyId" element={<PropertyDetail />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route path="/packages/:slug" element={<PackageDetail />} />
                    <Route path="/car-rentals" element={<CarRentals />} />
                    <Route path="/car-rentals/driver/:slug" element={<DriverDetail />} />
                    
                    {/* Programmatic SEO Routes - Dynamic city pages */}
                    <Route path="/taxi/:citySlug" element={<TaxiServicePage />} />
                    <Route path="/stays/location/:citySlug" element={<StaysLocationPage />} />
                    <Route path="/attractions/in/:citySlug" element={<AttractionsLocationPage />} />
                    <Route path="/guide/:citySlug" element={<TravelGuidePage />} />
                    <Route path="/route/:routeSlug" element={<RoutePage />} />
                    <Route path="/packages/from/:citySlug" element={<PackagesFromCityPage />} />
                    <Route path="/driver-registration" element={<DriverRegistration />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blogs" element={<Navigate to="/blog" replace />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/shipping" element={<ShippingPolicy />} />
                    <Route path="/cancellation" element={<CancellationPolicy />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/property-owner-signup" element={<Signup />} />
                    <Route path="/become-a-host" element={<PropertyOwnerSignup />} />
                    <Route path="/email-verification" element={<EmailVerification />} />

                    {/* Support Routes */}
                    <Route path="/support/raise" element={<RaiseTicket />} />
                    <Route path="/support/track" element={<TrackTicket />} />
                    <Route path="/support/view" element={<PublicTicketDetail />} />

                    {/* Help Center Routes */}
                    <Route path="/help" element={<HelpHome />} />
                    <Route path="/help/categories/:categorySlug" element={<HelpCategory />} />
                    <Route path="/help/article/:slug" element={<HelpArticle />} />

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
                    <Route path="/dashboard/tickets" element={
                      <CustomerRoute>
                        <UserTickets />
                      </CustomerRoute>
                    } />
                    <Route path="/dashboard/tickets/:ticketId" element={
                      <CustomerRoute>
                        <TicketDetail />
                      </CustomerRoute>
                    } />

                    {/* Property owner routes */}
                    <Route path="/dashboard/properties" element={
                      <PropertyOwnerRoute>
                        <PropertyManagement />
                      </PropertyOwnerRoute>
                    } />
                    <Route path="/dashboard/list-property" element={
                      <PropertyOwnerRoute>
                        <PropertyOnboarding />
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
                    <Route path="/admin/help/articles" element={<AdminArticleList />} />
                    <Route path="/admin/help/articles/:articleId" element={<AdminArticleEditor />} />
                    <Route path="/admin/users" element={<UsersPage />} />
                    <Route path="/admin/bookings" element={<BookingsPage />} />
                    <Route path="/admin/properties" element={<PropertiesPage />} />
                    <Route path="/admin/packages" element={<PackagesPage />} />
                    <Route path="/admin/media" element={<MediaLibraryPage />} />
                    <Route path="/admin/settings" element={<SettingsPage />} />
                    <Route path="/admin/revenue" element={<RevenuePage />} />
                    <Route path="/admin/reviews" element={<ReviewsPage />} />
                    <Route path="/admin/tickets" element={<SupportTicketsPage />} />
                    <Route path="/admin/tickets/:ticketId" element={<AdminTicketDetail />} />
                    <Route path="/admin/notifications" element={<NotificationsPage />} />
                    <Route path="/admin/reports" element={<ReportsPage />} />
                    <Route path="/admin/logs" element={<ActivityLogsPage />} />
                    <Route path="/admin/plugins" element={<PluginsPage />} />
                    <Route path="/admin/car-drivers" element={<CarDriversPage />} />
                    <Route path="/admin/seo-cities" element={<SEOCitiesPage />} />
                    <Route path="/admin/seo-routes" element={<SEORoutesPage />} />

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
