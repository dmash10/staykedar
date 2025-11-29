import { useState } from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, FileText, Home, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Admin components (we'll create these next)
import BlogManager from "@/components/admin/BlogManager";
import UsersManager from "@/components/admin/UsersManager";
import SiteContentManager from "@/components/admin/SiteContentManager";
import AdminSettings from "@/components/admin/AdminSettings";

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("blog");

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | StayKedarnath</title>
        <meta name="description" content="Admin dashboard for StayKedarnath" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Nav />

        <main className="flex-grow py-10">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-1">Admin Dashboard</h2>
                    <p className="text-sm text-mist">
                      {user?.email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant={activeTab === "blog" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("blog")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Blog Manager
                    </Button>
                    <Button
                      variant={activeTab === "users" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("users")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Users
                    </Button>
                    <Button
                      variant={activeTab === "content" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("content")}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Site Content
                    </Button>
                    <Button
                      variant={activeTab === "settings" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {activeTab === "blog" && <BlogManager />}
                  {activeTab === "users" && <UsersManager />}
                  {activeTab === "content" && <SiteContentManager />}
                  {activeTab === "settings" && <AdminSettings />}
                </div>
              </div>
            </div>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminDashboard; 