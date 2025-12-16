import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";
import { EditProvider } from "@/contexts/EditContext";
import { PluginProvider } from "@/contexts/PluginContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import CustomerRoute from "@/components/CustomerRoute";
import PropertyOwnerRoute from "@/components/PropertyOwnerRoute";
import AdminRoute from "@/components/AdminRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Index from "./pages/Index";
import About from "./pages/company/AboutUs";
import Weather from "./pages/Weather";
import LiveStatusPage from "./pages/LiveStatusPage";
import Attractions from "./pages/attractions/Attractions";
import AttractionDetail from "./pages/attractions/AttractionDetail";
import NotFound from "./pages/NotFound";
import ContentCreator from "./pages/company/ContentCreator";
import PartnerWithUs from "./pages/company/PartnerWithUs";
import Auth from "./pages/auth/Auth";
import Dashboard from './pages/user/Dashboard'; // Customer dashboard
import AdminDashboard from '@/pages/admin/Dashboard'; // Admin dashboard
import Packages from "./pages/packages/Packages";
import PackageDetail from "./pages/packages/PackageDetail";
import CarRentals from "./pages/transport/CarRentals";
import TaxiServicePage from "./pages/transport/TaxiServicePage";
import StaysLocationPage from "./pages/stays/StaysLocationPage";
import AttractionsLocationPage from "./pages/attractions/AttractionsLocationPage";
import TravelGuidePage from "./pages/content/TravelGuidePage";
import RoutePage from "./pages/transport/RoutePage";
import PackagesFromCityPage from "./pages/packages/PackagesFromCityPage";
import SEORoutesPage from "./pages/admin/SEORoutesPage";
import DriverDetail from "./pages/transport/DriverDetail";
import DriverRegistration from "./pages/transport/DriverRegistration";
import { Helmet } from "react-helmet-async";
import WhatsAppButton from "./components/WhatsAppButton";
import ItineraryPage from "./pages/packages/ItineraryPage";
import Blog from './pages/content/Blog';
import BlogPost from './pages/content/BlogPost';
import AuthCallback from "./pages/auth/AuthCallback";
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
import AttractionsPage from '@/pages/admin/AttractionsPage';
import ReportsPage from '@/pages/admin/ReportsPage';
import ActivityLogsPage from '@/pages/admin/ActivityLogsPage';
import PluginsPage from '@/pages/admin/PluginsPage';
import CarDriversPage from '@/pages/admin/CarDriversPage';
import SEOCitiesPage from '@/pages/admin/SEOCitiesPage';
import LiveStatusAdminPage from '@/pages/admin/LiveStatusAdminPage';
import SEOItinerariesPage from '@/pages/admin/SEOItinerariesPage';
import BannersPage from '@/pages/admin/BannersPage';
import UrgentStaysPage from '@/pages/stays/UrgentStaysPage';
import InventoryManager from '@/pages/admin/InventoryManager';
import BlindPropertiesPage from '@/pages/admin/BlindPropertiesPage';
import LeadsPage from '@/pages/admin/LeadsPage';

import AttractionEditorPage from '@/pages/admin/AttractionEditorPage';
import MarqueeBannerManager from '@/pages/admin/MarqueeBannerManager';
import PromoCodesPage from '@/pages/admin/PromoCodesPage';
import TestimonialsPage from '@/pages/admin/TestimonialsPage';
import FAQPage from '@/pages/admin/FAQPage';
import EmailCampaignsPage from '@/pages/admin/EmailCampaignsPage';
import CacheManagementPage from '@/pages/admin/CacheManagementPage';
import EmailTemplatesPage from '@/pages/admin/EmailTemplatesPage';
import ErrorLogsPage from '@/pages/admin/ErrorLogsPage';
import HomepageEditorPage from '@/pages/admin/HomepageEditorPage';
import PushNotificationsPage from '@/pages/admin/PushNotificationsPage';
import ReferralProgramPage from '@/pages/admin/ReferralProgramPage';
import RolesPage from '@/pages/admin/RolesPage';
import SystemHealthPage from '@/pages/admin/SystemHealthPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import RefundDashboardPage from '@/pages/admin/RefundDashboardPage';
import HostReliabilityPage from '@/pages/admin/HostReliabilityPage';
import PaymentSettlementPage from '@/pages/admin/PaymentSettlementPage';
import WhatsAppLogsPage from '@/pages/admin/WhatsAppLogsPage';
import YatraCalendarPage from '@/pages/admin/YatraCalendarPage';
import PropertyVerificationPage from '@/pages/admin/PropertyVerificationPage';
import AnalyticsPage from '@/pages/admin/AnalyticsPage';
import FinancePage from '@/pages/admin/FinancePage';
import SalesDashboard from '@/pages/admin/SalesDashboard';
import CommissionsDashboard from '@/pages/admin/CommissionsDashboard';
import VoucherPrintPage from '@/pages/admin/VoucherPrintPage';
import WalletPage from '@/pages/WalletPage';

import WishlistPage from '@/pages/WishlistPage';

import TermsAndConditions from './pages/legal/TermsAndConditions';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import ShippingPolicy from './pages/legal/ShippingPolicy';
import CancellationPolicy from './pages/legal/CancellationPolicy';
import DisclaimerPolicy from './pages/legal/DisclaimerPolicy';
import ContactUs from './pages/company/ContactUs';
import StayListing from './pages/stays/StayListing';
import SmartStaysPage from './pages/stays/SmartStaysPage';
import PropertyAuditPage from './pages/stays/PropertyAuditPage';
import PropertyDetail from './pages/stays/PropertyDetail';
import UserBookings from './pages/user/UserBookings';
import UserTickets from './pages/user/UserTickets';
import TicketDetail from './pages/user/TicketDetail';
import PropertyOnboarding from "./pages/property-owner/PropertyOnboarding";
import PropertyManagement from './pages/property-owner/PropertyManagement';
import PropertyEdit from './pages/property-owner/PropertyEdit';
import RoomEdit from './pages/property-owner/RoomEdit';
import Signup from './pages/property-owner/Signup';
import Profile from './pages/user/Profile';
import PropertyOwnerSignup from './pages/property-owner/PropertyOwnerSignup';
import BudgetCalculatorPage from "./pages/tools/BudgetCalculatorPage";
import WeatherCheckPage from "./pages/tools/WeatherCheckPage";
import ItineraryPlannerPage from "./pages/tools/ItineraryPlannerPage";
import CompareCitiesPage from "./pages/compare/CompareCitiesPage";
import CompareDirectoryPage from "./pages/compare/CompareDirectoryPage";
import EmailVerification from './pages/auth/EmailVerification';
import RaiseTicket from './pages/support/RaiseTicket';
import TrackTicket from './pages/support/TrackTicket';
import PublicTicketDetail from './pages/support/PublicTicketDetail';
import HelpHome from './pages/help/HelpHome';
import HelpCategory from './pages/help/HelpCategory';
import HelpArticle from './pages/help/HelpArticle';

// Char Dham Hub Pages
import BadrinathPage from './pages/chardham/BadrinathPage';
import CharDhamPage from './pages/chardham/CharDhamPage';
import DoDhamPage from './pages/chardham/DoDhamPage';
import WorkFromPahadPage from './pages/chardham/WorkFromPahadPage';

const queryClient = new QueryClient();

const App = () => {
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
                    {/* <link rel="icon" type="image/svg+xml" href="/favicon.ico" /> - Removed to allow dynamic favicon from Index.tsx */}
                  </Helmet>

                  <Toaster />
                  <Sonner />
                  <WhatsAppButton />
                  <SpeedInsights />
                  <Routes>
                    {/* Auth callback route */}
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Public routes */}
                    <Route path="/" element={<Index />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/weather" element={<Weather />} />
                    <Route path="/live-status" element={<LiveStatusPage />} />
                    <Route path="/attractions" element={<Attractions />} />
                    <Route path="/content-creator" element={<ContentCreator />} />
                    <Route path="/partner-with-us" element={<PartnerWithUs />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/stays" element={<SmartStaysPage />} />
                    <Route path="/stays/view/:propertyId" element={<PropertyAuditPage />} />
                    <Route path="/stays/old" element={<StayListing />} />
                    <Route path="/stays/:propertyId" element={<PropertyDetail />} />
                    <Route path="/packages" element={<Packages />} />
                    <Route path="/packages/:slug" element={<PackageDetail />} />
                    <Route path="/car-rentals" element={<CarRentals />} />
                    <Route path="/car-rentals/driver/:slug" element={<DriverDetail />} />

                    {/* Localized Main Routes */}
                    <Route path="/:lang" element={<Index />} />
                    <Route path="/:lang/stays" element={<StayListing />} />

                    {/* Vernacular SEO Routes */}
                    <Route path="/:lang/taxi/:citySlug" element={<TaxiServicePage />} />
                    <Route path="/:lang/stays/location/:citySlug" element={<StaysLocationPage />} />
                    <Route path="/:lang/route/:routeSlug" element={<RoutePage />} />
                    <Route path="/:lang/itinerary/:slug" element={<ItineraryPage />} />

                    {/* Programmatic SEO Routes - Dynamic city pages */}
                    <Route path="/taxi/:citySlug" element={<TaxiServicePage />} />
                    <Route path="/stays/location/:citySlug" element={<StaysLocationPage />} />
                    <Route path="/attractions/in/:citySlug" element={<AttractionsLocationPage />} />
                    <Route path="/attractions/:slug" element={<AttractionDetail />} />
                    <Route path="/guide/:citySlug" element={<TravelGuidePage />} />
                    <Route path="/route/:routeSlug" element={<RoutePage />} />
                    <Route path="/packages/from/:citySlug" element={<PackagesFromCityPage />} />
                    <Route path="/driver-registration" element={<DriverRegistration />} />
                    <Route path="/itinerary/:slug" element={<ItineraryPage />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blogs" element={<Navigate to="/blog" replace />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/shipping" element={<ShippingPolicy />} />
                    <Route path="/cancellation" element={<CancellationPolicy />} />
                    <Route path="/disclaimer" element={<DisclaimerPolicy />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/property-owner-signup" element={<Signup />} />
                    <Route path="/become-a-host" element={<PropertyOwnerSignup />} />
                    <Route path="/email-verification" element={<EmailVerification />} />

                    {/* Char Dham Hub Routes */}
                    <Route path="/badrinath" element={<BadrinathPage />} />
                    <Route path="/char-dham" element={<CharDhamPage />} />
                    <Route path="/do-dham" element={<DoDhamPage />} />
                    <Route path="/work-from-pahad" element={<WorkFromPahadPage />} />
                    <Route path="/tools/itinerary-planner" element={<ItineraryPlannerPage />} />

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
                    <Route path="/wallet" element={
                      <ProtectedRoute>
                        <WalletPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/wishlist" element={
                      <ProtectedRoute>
                        <WishlistPage />
                      </ProtectedRoute>
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

                    {/* Admin routes - Use ADMIN Dashboard and AdminRoute wrapper */}

                    {/* Admin routes - Nested Layout */}
                    <Route path="/admin" element={
                      <AdminRoute>
                        <AdminLayout>
                          <Outlet />
                        </AdminLayout>
                      </AdminRoute>
                    }>
                      <Route index element={<AdminDashboard />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="finance" element={<FinancePage />} />
                      <Route path="sales" element={<SalesDashboard />} />
                      <Route path="commissions" element={<CommissionsDashboard />} />
                      <Route path="print/voucher" element={<VoucherPrintPage />} />
                      <Route path="blog" element={<AdminBlogList />} />
                      <Route path="blog/:postId" element={<AdminBlogEditor />} />
                      <Route path="help/articles" element={<AdminArticleList />} />
                      <Route path="help/articles/:articleId" element={<AdminArticleEditor />} />
                      <Route path="users" element={<UsersPage />} />
                      <Route path="bookings" element={<BookingsPage />} />
                      <Route path="properties" element={<PropertiesPage />} />
                      <Route path="packages" element={<PackagesPage />} />
                      <Route path="media" element={<MediaLibraryPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                      <Route path="revenue" element={<RevenuePage />} />
                      <Route path="reviews" element={<ReviewsPage />} />
                      <Route path="tickets" element={<SupportTicketsPage />} />
                      <Route path="tickets/:ticketNumber" element={<AdminTicketDetail />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="logs" element={<ActivityLogsPage />} />
                      <Route path="plugins" element={<PluginsPage />} />
                      <Route path="car-drivers" element={<CarDriversPage />} />
                      <Route path="seo-cities" element={<SEOCitiesPage />} />
                      <Route path="seo-routes" element={<SEORoutesPage />} />
                      <Route path="seo-itineraries" element={<SEOItinerariesPage />} />
                      <Route path="live-status" element={<LiveStatusAdminPage />} />
                      <Route path="attractions" element={<AttractionsPage />} />
                      <Route path="attractions/new" element={<AttractionEditorPage />} />
                      <Route path="attractions/:id" element={<AttractionEditorPage />} />
                      <Route path="banners" element={<BannersPage />} />
                      <Route path="promos" element={<PromoCodesPage />} />
                      <Route path="inventory" element={<InventoryManager />} />
                      <Route path="blind-properties" element={<BlindPropertiesPage />} />
                      <Route path="stay-leads" element={<LeadsPage />} />
                      <Route path="testimonials" element={<TestimonialsPage />} />
                      <Route path="faqs" element={<FAQPage />} />
                      <Route path="marketing/email" element={<EmailCampaignsPage />} />
                      <Route path="marketing/templates" element={<EmailTemplatesPage />} />
                      <Route path="marketing/push" element={<PushNotificationsPage />} />
                      <Route path="marketing/referrals" element={<ReferralProgramPage />} />
                      <Route path="content/homepage" element={<HomepageEditorPage />} />
                      <Route path="system/cache" element={<CacheManagementPage />} />
                      <Route path="system/errors" element={<ErrorLogsPage />} />
                      <Route path="system/roles" element={<RolesPage />} />
                      <Route path="system/health" element={<SystemHealthPage />} />
                      <Route path="users/manage" element={<UserManagementPage />} />
                      <Route path="refunds" element={<RefundDashboardPage />} />
                      <Route path="host-reliability" element={<HostReliabilityPage />} />
                      <Route path="settlements" element={<PaymentSettlementPage />} />
                      <Route path="whatsapp-logs" element={<WhatsAppLogsPage />} />
                      <Route path="yatra-calendar" element={<YatraCalendarPage />} />
                      <Route path="property-verification" element={<PropertyVerificationPage />} />
                    </Route>

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
