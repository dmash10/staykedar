import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import WeatherWidget from '@/components/plugins/WeatherWidget';
import LiveChat from '@/components/plugins/LiveChat';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'enabled' | 'disabled';
  icon: string;
  component_name: string;
  created_at: string;
}

interface PluginContextType {
  plugins: Plugin[];
  isLoading: boolean;
  error: string | null;
  refreshPlugins: () => Promise<void>;
  isPluginEnabled: (pluginName: string) => boolean;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

// Mock data for plugins until we have a real database table
const mockPlugins: Plugin[] = [
  {
    id: '1',
    name: 'Weather Widget',
    description: 'Displays real-time weather information for Kedarnath',
    version: '1.0.0',
    status: 'enabled',
    icon: '',
    component_name: 'WeatherWidget',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Live Chat',
    description: 'Adds a live chat support feature to your website',
    version: '1.0.0',
    status: 'disabled', // Disabled - using WhatsAppButton instead
    icon: '',
    component_name: 'LiveChat',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Booking Calendar',
    description: 'Displays availability calendar for accommodations',
    version: '1.0.0',
    status: 'disabled',
    icon: '',
    component_name: 'BookingCalendar',
    created_at: new Date().toISOString()
  }
];

export const PluginProvider = ({ children }: { children: ReactNode }) => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlugins = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // In a real app, we would fetch from Supabase
      // For now, use mock data
      setPlugins(mockPlugins);

      // When the plugins table exists, uncomment this code:
      /*
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setPlugins(data || []);
      */
    } catch (err) {
      console.error('Error loading plugins:', err);
      setError('Failed to load plugins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const refreshPlugins = async () => {
    await loadPlugins();
  };

  const isPluginEnabled = (pluginName: string): boolean => {
    const plugin = plugins.find(p => p.name === pluginName);
    return plugin ? plugin.status === 'enabled' : false;
  };

  return (
    <PluginContext.Provider
      value={{
        plugins,
        isLoading,
        error,
        refreshPlugins,
        isPluginEnabled,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }
  return context;
};

// Plugin Registry - Map component names to actual components
export const PluginRegistry: Record<string, React.ComponentType<any>> = {
  'WeatherWidget': WeatherWidget,
  // LiveChat is removed because we're using the WhatsAppButton instead
  // Add more plugins as they are created
}; 