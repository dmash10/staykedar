import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, X, Settings, ChevronUp, ChevronDown, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useSimpleEdit } from "@/contexts/SimpleEditContext";

// List of admin email addresses - keep in sync with AdminEditContext
const ADMIN_EMAILS: string[] = [];

export const AdminToolbar = () => {
  const { user } = useAuth();
  const { isEditMode, setIsEditMode } = useSimpleEdit();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!user?.email) {
      setIsAdmin(false);
      return;
    }

    // Check if user's email is in the admin list
    if (ADMIN_EMAILS.includes(user.email)) {
      setIsAdmin(true);
      return;
    }
  }, [user]);

  // If not admin, don't render anything
  if (!isAdmin) return null;

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Simulate retry
      await new Promise(resolve => setTimeout(resolve, 1000));
      setError(null);
    } catch (err) {
      console.error("Error retrying:", err);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleHeaderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  const handleAdminDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/admin');
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
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p>{error}</p>
                  <button
                    onClick={handleRetry}
                    className="mt-2 px-2 py-1 bg-red-100 text-red-700 rounded flex items-center text-xs hover:bg-red-200"
                    disabled={isRetrying}
                  >
                    {isRetrying ? (
                      <>
                        <div className="animate-spin h-3 w-3 border-2 border-red-700 border-t-transparent rounded-full mr-1"></div>
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

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