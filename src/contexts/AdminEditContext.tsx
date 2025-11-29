import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// List of admin email addresses
const ADMIN_EMAILS: string[] = [];

interface AdminEditContextProps {
  isAdmin: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  saveContent: (section: string, key: string, value: string) => Promise<boolean>;
  getContent: (section: string, key: string, defaultValue: string) => string;
  contentCache: Record<string, Record<string, string>>;
  isLoading: boolean;
  error: string | null;
  retryLoadContent: () => Promise<void>;
}

// Create a default context value to avoid null checks
const defaultContextValue: AdminEditContextProps = {
  isAdmin: false,
  isEditMode: false,
  toggleEditMode: () => { },
  saveContent: async () => false,
  getContent: (_, __, defaultValue) => defaultValue,
  contentCache: {},
  isLoading: false,
  error: null,
  retryLoadContent: async () => { }
};

const AdminEditContext = createContext<AdminEditContextProps>(defaultContextValue);

export const AdminEditProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [contentCache, setContentCache] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isTogglingEditMode, setIsTogglingEditMode] = useState<boolean>(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      // Check if user's email is in the admin list
      if (ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      // Check if user has admin role in Supabase
      try {
        // First check if Supabase is available
        const isConnected = await checkSupabaseConnection();
        if (!isConnected) {
          throw new Error("Cannot connect to database. Please check your connection and try again.");
        }

        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', user.email)
          .single();

        setIsAdmin(!error && !!data);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to check admin status. Please try again.");
        }
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Load all site content
  const loadContent = async () => {
    if (!isAdmin) return;

    try {
      setIsLoading(true);
      setError(null);

      // First check if Supabase is available
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        throw new Error("Cannot connect to database. Please check your connection and try again.");
      }

      const { data, error } = await supabase
        .from('site_content')
        .select('*');

      if (error) {
        throw error;
      }

      // Organize content by section and key
      const contentBySection: Record<string, Record<string, string>> = {};
      data?.forEach(item => {
        if (!contentBySection[item.section]) {
          contentBySection[item.section] = {};
        }
        contentBySection[item.section][item.key] = item.value;
      });

      setContentCache(contentBySection);
    } catch (error) {
      console.error('Error loading site content:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to load site content. Please try again.");
      }
      toast({
        title: "Error",
        description: "Failed to load site content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Retry loading content
  const retryLoadContent = async () => {
    await loadContent();
  };

  useEffect(() => {
    if (isAdmin && isInitialized) {
      loadContent();
    }
  }, [isAdmin, isInitialized]);

  const toggleEditMode = () => {
    // Prevent multiple toggles at once
    if (isTogglingEditMode) return;

    setIsTogglingEditMode(true);

    try {
      // Always allow toggling edit mode, even if there's an error
      const newEditMode = !isEditMode;
      setIsEditMode(newEditMode);

      // If enabling edit mode and there's an error, try to reload content
      if (newEditMode && error) {
        loadContent().catch(err => {
          console.error("Error reloading content:", err);
          // Even if content loading fails, we still allow edit mode
        });
      }

      if (newEditMode) {
        toast({
          title: "Edit Mode Enabled",
          description: "You can now edit content directly on the page",
        });
      } else {
        toast({
          title: "Edit Mode Disabled",
          description: "Content editing is now disabled",
        });
      }
    } catch (err) {
      console.error("Error toggling edit mode:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to toggle edit mode. Please try again.");
      }
    } finally {
      setIsTogglingEditMode(false);
    }
  };

  const saveContent = async (section: string, key: string, value: string): Promise<boolean> => {
    try {
      // Check if Supabase is available
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        throw new Error("Cannot connect to database. Please check your connection and try again.");
      }

      // Update cache first for immediate UI update
      setContentCache(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }));

      // Check if content exists
      const { data: existingData, error: checkError } = await supabase
        .from('site_content')
        .select('id')
        .eq('section', section)
        .eq('key', key)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // Not found error
        throw checkError;
      }

      if (existingData) {
        // Update existing content
        const { error } = await supabase
          .from('site_content')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        // Insert new content
        const { error } = await supabase
          .from('site_content')
          .insert([{
            section,
            key,
            value,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      toast({
        title: "Content Saved",
        description: "Your changes have been saved successfully",
      });

      return true;
    } catch (error) {
      console.error('Error saving content:', error);

      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });

      return false;
    }
  };

  const getContent = (section: string, key: string, defaultValue: string): string => {
    // If content exists in cache, return it
    if (contentCache[section] && contentCache[section][key] !== undefined) {
      return contentCache[section][key];
    }

    // Otherwise return default value
    return defaultValue;
  };

  return (
    <AdminEditContext.Provider
      value={{
        isAdmin,
        isEditMode,
        toggleEditMode,
        saveContent,
        getContent,
        contentCache,
        isLoading,
        error,
        retryLoadContent
      }}
    >
      {children}
    </AdminEditContext.Provider>
  );
};

export const useAdminEdit = () => {
  const context = useContext(AdminEditContext);
  if (context === undefined) {
    throw new Error('useAdminEdit must be used within an AdminEditProvider');
  }
  return context;
}; 