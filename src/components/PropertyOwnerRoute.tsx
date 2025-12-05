import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CustomerData {
  role?: 'customer' | 'property_owner' | 'admin';
}

interface PropertyOwnerRouteProps {
  children: ReactNode;
}

const PropertyOwnerRoute = ({ children }: PropertyOwnerRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        console.log("PropertyOwnerRoute: No user found");
        setIsLoading(false);
        return;
      }

      try {
        console.log("PropertyOwnerRoute: Checking role for user:", user.id);
        const { data, error } = await supabase
          .from('customer_details')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          const userData = data as CustomerData;
          setRole(userData.role || 'customer');
          console.log("PropertyOwnerRoute: User role:", userData.role);
        } else {
          console.log("PropertyOwnerRoute: No role found, defaulting to customer");
          setRole('customer');
        }
      } catch (error) {
        console.error("PropertyOwnerRoute: Error fetching user role:", error);
        setRole('customer');
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
    console.log("PropertyOwnerRoute: User not authenticated, redirecting to login");
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} />;
  }

  // If role is admin/super_admin, allow access (admins can access all areas)
  const adminRoles = ['admin', 'super_admin', 'manager'];
  if (adminRoles.includes(role)) {
    console.log("PropertyOwnerRoute: User is admin, allowing access");
    return <>{children}</>;
  }

  // If not property_owner, redirect to customer dashboard
  if (role !== 'property_owner') {
    console.log("PropertyOwnerRoute: User is not property owner (role:", role, "), redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }

  // If property owner, allow access
  console.log("PropertyOwnerRoute: User is property owner, allowing access");
  return <>{children}</>;
};

export default PropertyOwnerRoute;