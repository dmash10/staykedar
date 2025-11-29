import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { Button } from "@/components/ui/button";
import {
  User, Settings, Calendar, Bell, LogOut,
  ShieldCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
}

const DashboardSidebar = ({
  activeTab,
  onTabChange,
  onSignOut
}: DashboardSidebarProps) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) return;

      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!error && data) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-1">My Account</h2>
        <p className="text-sm text-mist">
          {user?.email}
        </p>
      </div>

      <div className="space-y-2">
        <Button
          variant={activeTab === "profile" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onTabChange("profile")}
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>
        <Button
          variant={activeTab === "bookings" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onTabChange("bookings")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          My Bookings
        </Button>
        <Button
          variant={activeTab === "notifications" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onTabChange("notifications")}
        >
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </Button>
        <Button
          variant={activeTab === "settings" ? "default" : "ghost"}
          className="w-full justify-start"
          onClick={() => onTabChange("settings")}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>

        {isAdmin && (
          <Link to="/admin">
            <Button
              variant="outline"
              className="w-full justify-start text-primary border-primary"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Button>
          </Link>
        )}

        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
