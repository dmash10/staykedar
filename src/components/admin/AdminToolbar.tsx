import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, X, Settings, ChevronUp, ChevronDown, Puzzle } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useEdit } from "@/contexts/EditContext";
import { supabase } from "@/integrations/supabase/client";

// List of admin email addresses
const ADMIN_EMAILS: string[] = [];

export const AdminToolbar = () => {
  const { user } = useAuth();
  const { isEditMode, toggleEditMode } = useEdit();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

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
          console.log("User not found in admin_users table, hiding admin toolbar");
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // If not admin, don't render anything
  if (!isAdmin) return null;

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  const handleToggleEditMode = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleEditMode();
  };

  const handleAdminDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/admin');
    setIsExpanded(false);
  };

  const handlePluginsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('/admin/plugins');
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div
          className="flex items-center justify-between p-3 bg-primary text-white cursor-pointer"
          onClick={handleHeaderClick}
        >
          <div className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            <span className="font-medium">Admin Controls</span>
          </div>
          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </div>

        {isExpanded && (
          <div className="p-4 space-y-3">
            {!isEditMode ? (
              <button
                onClick={handleToggleEditMode}
                className="w-full flex items-center justify-between p-2 rounded-md bg-green-100 text-green-700"
              >
                <span className="font-medium">Edit Mode</span>
                <Edit className="h-5 w-5" />
              </button>
            ) : (
              <div className="p-3 bg-red-100 text-red-700 rounded-md flex items-center justify-between">
                <span className="font-medium">Edit Mode</span>
                <button
                  onClick={handleToggleEditMode}
                  className="p-1 hover:bg-red-200 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}

            <button
              onClick={handleAdminDashboardClick}
              className="w-full flex items-center justify-between p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <span className="font-medium">Admin Dashboard</span>
              <Settings className="h-5 w-5" />
            </button>

            <button
              onClick={handlePluginsClick}
              className="w-full flex items-center justify-between p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
            >
              <span className="font-medium">Manage Plugins</span>
              <Puzzle className="h-5 w-5" />
            </button>

            {isEditMode && (
              <div className="p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm">
                <p className="font-medium">Edit Mode Active</p>
                <p className="mt-1">Hover over content to edit. Click the pencil icon to make changes.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 