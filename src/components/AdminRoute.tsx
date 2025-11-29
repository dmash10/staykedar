import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  console.log("DEBUG: AdminRoute rendering");
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Default to not admin
      setIsAdmin(false);

      if (!user) {
        console.log("No user found, redirecting to login");
        setIsCheckingAdmin(false);
        return;
      }

      // Ensure email is verified
      if (!user.email_confirmed_at) {
        console.log("Email not verified, denying admin access");
        setIsCheckingAdmin(false);
        return;
      }

      console.log("Checking admin status for:", user.email);

      let isUserAdmin = false;

      // Check the customer_details table for role
      try {
        const { data: customerData, error: customerError } = await supabase
          .from('customer_details')
          .select('*')
          .eq('id', user.id)
          .single();

        const customer = customerData as any;

        if (!customerError && customer && customer.role === 'admin') {
          console.log("User has admin role in customer_details");

          // Double check admin_users table for extra security
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', user.email)
            .single();

          if (!adminError && adminData) {
            console.log("User is confirmed in admin_users table");
            isUserAdmin = true;
          } else {
            console.log("User has admin role but not in admin_users table. Denying access.");
          }
        } else {
          console.log("User does not have admin role");
        }
      } catch (error) {
        console.error("Error checking admin status in tables:", error);
      }

      // Set the final admin status
      setIsAdmin(isUserAdmin);
      setIsCheckingAdmin(false);
    };

    checkAdminStatus();
  }, [user]);

  if (isLoading || isCheckingAdmin) {
    // If we have no user, we stop checking admin status immediately to allow guest access
    if (!isLoading && !user) {
      // fall through to render
    } else {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-deep"></div>
        </div>
      );
    }
  }

  // TEMPORARY: Bypass all checks for development/demo purposes
  // Original checks:
  // if (!user) return <Navigate to="/auth" />;
  // if (!isAdmin) return <Navigate to="/dashboard" />;

  console.log("Admin access granted (Bypassed) to:", user?.email || "Guest");
  return <>{children}</>;
};

export default AdminRoute;