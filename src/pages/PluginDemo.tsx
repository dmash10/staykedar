import { Helmet } from "react-helmet";
import { useState, useEffect } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import PluginRenderer from "../components/plugins/PluginRenderer";
import { usePlugins } from "@/contexts/PluginContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Puzzle } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";

// List of admin email addresses
const ADMIN_EMAILS: string[] = [];

const PluginDemo = () => {
  const { plugins, isLoading } = usePlugins();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const enabledPlugins = plugins.filter(plugin => plugin.status === "enabled");

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        return;
      }

      // Check if user's email is in the admin list
      if (ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        return;
      }

      // If not in hardcoded list, check if they're in the admin_users table
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', user.email)
          .eq('id', user.id) // Additional security check
          .single();

        if (!error && data) {
          console.log("User found in admin_users table");
          setIsAdmin(true);
        } else {
          console.log("User not found in admin_users table");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <>
      <Helmet>
        <title>Plugin Demo | StayKedarnath</title>
        <meta name="description" content="Explore our plugin system that enhances your Kedarnath trip planning experience." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Nav />

        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold mb-4">StayKedarnath Plugin System</h1>
              <p className="text-lg text-gray-600">
                Explore our plugin ecosystem that enhances your Kedarnath trip planning experience.
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p>Loading plugins...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {enabledPlugins.map(plugin => (
                    <div key={plugin.id} className="border rounded-lg p-6 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <Puzzle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{plugin.name}</h3>
                          <p className="text-sm text-gray-500">v{plugin.version}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{plugin.description}</p>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm font-medium mb-2">Plugin Preview:</p>
                        <div className="border rounded-md p-4 bg-white">
                          <PluginRenderer pluginName={plugin.name} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Only show Manage Plugins button to admin users */}
                {isAdmin && (
                  <div className="text-center">
                    <Button
                      onClick={() => navigate('/admin/plugins')}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Puzzle className="h-4 w-4 mr-2" />
                      Manage Plugins
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Fixed position plugins */}
          <div className="fixed top-24 right-4 z-10">
            <PluginRenderer pluginName="Weather Widget" />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PluginDemo; 