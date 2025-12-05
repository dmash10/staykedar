import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CustomerRouteProps {
  children: ReactNode;
}

const CustomerRoute = ({ children }: CustomerRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // First check if email is verified
      if (!user.email_confirmed_at) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log("CustomerRoute: Checking role for", user.id, user.email);
        const { data, error } = await supabase
          .from('customer_details')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("CustomerRoute: Error checking user role:", error);
          setRole(null);
        } else if (data) {
          console.log("CustomerRoute: User data from Supabase:", data);
          // Check if role property exists, if not use 'customer' as default
          const customer = data as any;
          const userRole = customer.role || 'customer';
          console.log("CustomerRoute: Setting user role to:", userRole);
          setRole(userRole);
        } else {
          console.log("CustomerRoute: No user data found, setting role to null");
          setRole(null);
        }
      } catch (error) {
        console.error("CustomerRoute: Error fetching user role:", error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      checkUserRole();
    }
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    console.log("CustomerRoute: No user, redirecting to login");
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} />;
  }

  // If email not verified, redirect to verification page
  if (!user.email_confirmed_at) {
    console.log("CustomerRoute: Email not verified, redirecting to auth");
    return <Navigate to="/auth" />;
  }

  // If role is admin/super_admin, redirect to admin dashboard
  const adminRoles = ['admin', 'super_admin', 'manager', 'content_editor', 'support_agent'];
  if (adminRoles.includes(role)) {
    console.log("CustomerRoute: User is admin, redirecting to admin dashboard");
    return <Navigate to="/admin" />;
  }

  // If role is property_owner, redirect to property owner dashboard
  if (role === 'property_owner') {
    console.log("CustomerRoute: User is property owner, redirecting to properties page");
    return <Navigate to="/dashboard/properties" />;
  }

  // If role is customer or null, allow access
  console.log("CustomerRoute: User is customer, allowing access");
  return <>{children}</>;
};

export default CustomerRoute; 