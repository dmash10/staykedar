import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Define the context interface
interface EditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  saveContent: (section: string, key: string, content: string) => Promise<boolean>;
  getContent: (section: string, key: string, defaultValue: string) => string;
}

// Storage key for content in localStorage
const CONTENT_STORAGE_KEY = "staykedar_content";

// Helper function to get content from localStorage
const getStoredContent = () => {
  try {
    const storedContent = localStorage.getItem(CONTENT_STORAGE_KEY);
    return storedContent ? JSON.parse(storedContent) : {};
  } catch (error) {
    console.error("Error reading content from localStorage:", error);
    return {};
  }
};

// Helper function to save content to localStorage
const setStoredContent = (content: Record<string, any>) => {
  try {
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
    return true;
  } catch (error) {
    console.error("Error saving content to localStorage:", error);
    return false;
  }
};

// Create the context with default values
const EditContext = createContext<EditContextType>({
  isEditMode: false,
  toggleEditMode: () => {},
  saveContent: async () => false,
  getContent: () => "",
});

// Define the provider props
interface EditProviderProps {
  children: ReactNode;
}

// Create the provider component
export const EditProvider = ({ children }: EditProviderProps) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => {
      const newState = !prev;
      
      // Show toast notification when edit mode changes
      if (newState) {
        toast({
          title: "Edit Mode Enabled",
          description: "You can now edit content on the page.",
        });
      } else {
        toast({
          title: "Edit Mode Disabled",
          description: "Content editing is now disabled.",
        });
      }
      
      return newState;
    });
  }, [toast]);

  // Log edit mode changes for debugging
  useEffect(() => {
    console.log("Edit mode is now:", isEditMode ? "ON" : "OFF");
  }, [isEditMode]);

  // Get content from localStorage
  const getContent = useCallback((section: string, key: string, defaultValue: string): string => {
    const content = getStoredContent();
    const contentKey = `${section}.${key}`;
    
    return content[contentKey] !== undefined ? content[contentKey] : defaultValue;
  }, []);

  // Save content to localStorage
  const saveContent = useCallback(async (section: string, key: string, content: string): Promise<boolean> => {
    try {
      console.log(`Saving content for ${section}.${key}...`);
      
      // Simulate API call delay for UX
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Get existing content
      const existingContent = getStoredContent();
      
      // Update content
      const contentKey = `${section}.${key}`;
      const updatedContent = {
        ...existingContent,
        [contentKey]: content
      };
      
      // Save to localStorage
      const success = setStoredContent(updatedContent);
      
      if (success) {
        console.log(`Saved content for ${section}.${key}:`, content);
        
        // Show success toast
        toast({
          title: "Content saved",
          description: `Successfully updated ${section}.${key}`,
        });
        
        return true;
      } else {
        throw new Error("Failed to save content to localStorage");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to save content. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [toast]);

  // Provide the context value
  const contextValue: EditContextType = {
    isEditMode,
    toggleEditMode,
    saveContent,
    getContent
  };

  return (
    <EditContext.Provider value={contextValue}>
      {children}
    </EditContext.Provider>
  );
};

// Create a hook for using the context
export const useEdit = () => {
  const context = useContext(EditContext);
  
  if (context === undefined) {
    throw new Error("useEdit must be used within an EditProvider");
  }
  
  return context;
}; 