import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthContextProps {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<{ user: User | null; error: any | null }>;
    signUp: (email: string, password: string, userData: {
        full_name: string,
        phone_number: string,
        role?: 'customer' | 'property_owner' | 'admin',
        business_name?: string,
        business_address?: string,
        business_description?: string,
        has_existing_properties?: boolean,
        existing_properties_details?: string
    }) => Promise<{ error: any | null, data: any | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: any | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: any | null }>;
    updateProfile: (userData: { full_name: string, phone_number: string }) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { toast } = useToast();

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("SupabaseAuthContext: Auth state changed", _event, session?.user?.email);
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            console.log("SupabaseAuthContext: Signing in...");
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { user: data.user, error: null };
        } catch (error: any) {
            console.error("Sign in error:", error);
            return { user: null, error };
        }
    };

    const signUp = async (
        email: string,
        password: string,
        userData: {
            full_name: string,
            phone_number: string,
            role?: 'customer' | 'property_owner' | 'admin',
            business_name?: string,
            business_address?: string,
            business_description?: string,
            has_existing_properties?: boolean,
            existing_properties_details?: string
        }
    ) => {
        try {
            console.log("SupabaseAuthContext: Signing up...");

            // 1. Sign up with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: userData.full_name,
                        phone_number: userData.phone_number,
                        role: userData.role || 'customer',
                    } as any
                }
            });

            if (error) throw error;

            // Note: customer_details record is auto-created by database trigger
            // See migration: secure_customer_details_auto_creation
            // The trigger (handle_new_user) runs when auth.users gets a new row
            console.log("User signed up successfully, profile will be auto-created by trigger");

            return { data, error: null };
        } catch (error: any) {
            console.error("Sign up error:", error);
            return { data: null, error };
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            toast({
                title: "Logged out",
                description: "You have been logged out successfully",
            });
        } catch (error: any) {
            console.error("Sign out error:", error);
            toast({
                title: "Error",
                description: "Failed to log out",
                variant: "destructive",
            });
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth?tab=reset-password`,
            });
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error("Reset password error:", error);
            return { error };
        }
    };

    const updatePassword = async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            return { error: null };
        } catch (error: any) {
            console.error("Update password error:", error);
            return { error };
        }
    };

    const updateProfile = async (userData: { full_name: string, phone_number: string, avatar_url?: string }) => {
        try {
            if (!user) throw new Error("No user logged in");

            // Update auth metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    full_name: userData.full_name,
                    phone_number: userData.phone_number,
                    avatar_url: userData.avatar_url,
                }
            });

            if (authError) throw authError;

            // Update database profile
            const updateData: any = {
                name: userData.full_name,
                phone_number: userData.phone_number,
                updated_at: new Date().toISOString()
            };

            if (userData.avatar_url) {
                updateData.avatar_url = userData.avatar_url;
            }

            const { error: dbError } = await supabase
                .from('customer_details')
                .update(updateData)
                .eq('id', user.id);

            if (dbError) throw dbError;

            return { error: null };
        } catch (error: any) {
            console.error("Update profile error:", error);
            return { error };
        }
    };

    const value = {
        user,
        session,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
