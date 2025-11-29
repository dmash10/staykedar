import { usePlugins, PluginRegistry } from '@/contexts/PluginContext';

interface PluginRendererProps {
  pluginName: string;
  props?: Record<string, any>;
}

export default function PluginRenderer({ pluginName, props = {} }: PluginRendererProps) {
  const { isPluginEnabled } = usePlugins();
  
  // Check if the plugin is enabled
  if (!isPluginEnabled(pluginName)) {
    return null;
  }
  
  // Find the component in the registry
  const componentName = pluginName.replace(/\s+/g, '');
  const Component = PluginRegistry[componentName];
  
  if (!Component) {
    console.warn(`Plugin component "${componentName}" not found in registry`);
    return null;
  }
  
  // Render the plugin component with the provided props
  return <Component {...props} />;
} 