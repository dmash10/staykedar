import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Define a type for the customer data from Supabase
interface CustomerData {
  created_at: string;
  email: string;
  firebase_uid: string;
  id: string;
  name: string;
  phone_number: string;
  updated_at: string;
  role?: 'customer' | 'property_owner' | 'admin';
  is_approved?: boolean;
}

interface PropertyOwnerRouteProps {
  children: ReactNode;
}

const PropertyOwnerRoute = ({ children }: PropertyOwnerRouteProps) => {
  const { user, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        console.log("PropertyOwnerRoute: No user found, redirecting to login");
        setIsLoading(false);
        return;
      }

      // First check if email is verified
      if (!user.emailVerified) {
        console.log("PropertyOwnerRoute: Email not verified, redirecting to auth");
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log("PropertyOwnerRoute: Checking role for user:", user.uid, user.email);
        const { data, error } = await supabase
          .from('customer_details')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("PropertyOwnerRoute: Error checking user role:", error);
          setRole(null);
          setIsApproved(false);
        } else if (data) {
          // Cast the data to our CustomerData type with the extended properties
          const userData = data as CustomerData;
          console.log("PropertyOwnerRoute: User data from Supabase:", userData);
          console.log("PropertyOwnerRoute: Role value:", userData.role);
          console.log("PropertyOwnerRoute: Is approved value:", userData.is_approved);

          // Use optional chaining and nullish coalescing for safer access to properties
          setRole(userData.role ?? 'customer');
          setIsApproved(userData.is_approved ?? false);
        } else {
          console.log("PropertyOwnerRoute: No user data found in Supabase");
          setRole(null);
          setIsApproved(false);
        }
      } catch (error) {
        console.error("PropertyOwnerRoute: Error fetching user role:", error);
        setRole(null);
        setIsApproved(false);
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

  // If email not verified, redirect to verification page
  if (!user.emailVerified) {
    console.log("PropertyOwnerRoute: Email not verified, redirecting to auth");
    return <Navigate to="/auth" />;
  }

  // If role is admin, allow access (admins can access all areas)
  if (role === 'admin') {
    console.log("PropertyOwnerRoute: User is admin, allowing access");
    return <>{children}</>;
  }

  // If not property_owner, redirect to appropriate dashboard
  if (role !== 'property_owner') {
    console.log("PropertyOwnerRoute: User is not property owner (role:", role, "), redirecting to dashboard");
    return <Navigate to="/dashboard" />;
  }

  // If property owner and approved, allow access
  console.log("PropertyOwnerRoute: User is property owner and", isApproved ? "approved" : "not approved");
  return <>{children}</>;
};

export default PropertyOwnerRoute; 