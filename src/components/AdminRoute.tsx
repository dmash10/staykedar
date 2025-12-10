import { ReactNode, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children?: ReactNode;
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
        const adminRoles = ['admin', 'super_admin', 'manager', 'content_editor', 'support_agent'];

        if (!customerError && customer && adminRoles.includes(customer.role)) {
          console.log("User has admin role in customer_details:", customer.role);

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
            // Also check admin_user_roles table
            const { data: roleData, error: roleError } = await supabase
              .from('admin_user_roles')
              .select('*, admin_roles(*)')
              .eq('user_id', user.id)
              .single();

            if (!roleError && roleData) {
              console.log("User has assigned role in admin_user_roles:", roleData);
              isUserAdmin = true;
            } else {
              console.log("User has admin role but not in admin_users or admin_user_roles table. Denying access.");
            }
          }
        } else {
          console.log("User does not have admin role, current role:", customer?.role);
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

  // Proper admin access control
  if (!user) {
    console.log("No user, redirecting to auth");
    return <Navigate to="/auth" />;
  }

  if (!isAdmin) {
    console.log("User is not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }

  console.log("Admin access granted to:", user?.email);
  return <>{children ? children : <Outlet />}</>;
};

export default AdminRoute;