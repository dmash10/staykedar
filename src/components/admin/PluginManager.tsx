import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Download, Trash2, Info, Settings, Puzzle, ExternalLink } from 'lucide-react';
import { usePlugins, Plugin } from '@/contexts/PluginContext';
import { useToast } from '@/hooks/use-toast';

export default function PluginManager() {
  const { plugins, isLoading, refreshPlugins } = usePlugins();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('installed');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleTogglePlugin = async (plugin: Plugin) => {
    try {
      setIsUpdating(plugin.id);
      
      // In a real app, this would update the database
      // For now, just show a toast
      const newStatus = plugin.status === 'enabled' ? 'disabled' : 'enabled';
      
      toast({
        title: `Plugin ${newStatus}`,
        description: `${plugin.name} has been ${newStatus}.`,
      });
      
      // Simulate a delay for the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh plugins
      await refreshPlugins();
    } catch (error) {
      console.error('Error toggling plugin:', error);
      toast({
        title: 'Error',
        description: 'Failed to update plugin status.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeletePlugin = async (plugin: Plugin) => {
    if (!confirm(`Are you sure you want to delete ${plugin.name}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setIsUpdating(plugin.id);
      
      // In a real app, this would delete from the database
      // For now, just show a toast
      toast({
        title: 'Plugin deleted',
        description: `${plugin.name} has been deleted.`,
      });
      
      // Simulate a delay for the API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh plugins
      await refreshPlugins();
    } catch (error) {
      console.error('Error deleting plugin:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete plugin.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleInstallPlugin = () => {
    toast({
      title: 'Coming Soon',
      description: 'Plugin installation feature is coming soon!',
    });
  };

  const marketplacePlugins = [
    {
      id: 'mp1',
      name: 'SEO Optimizer',
      description: 'Automatically optimize your pages for search engines',
      version: '1.2.0',
      price: 'Free',
      downloads: '5.2k'
    },
    {
      id: 'mp2',
      name: 'Social Media Integration',
      description: 'Add social sharing buttons and feeds to your website',
      version: '2.0.1',
      price: '$19.99',
      downloads: '3.8k'
    },
    {
      id: 'mp3',
      name: 'Advanced Analytics',
      description: 'Detailed visitor analytics and conversion tracking',
      version: '1.5.0',
      price: '$29.99',
      downloads: '2.1k'
    }
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="installed" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="installed" className="data-[state=active]:bg-slate-700">
            Installed Plugins
          </TabsTrigger>
          <TabsTrigger value="marketplace" className="data-[state=active]:bg-slate-700">
            Plugin Marketplace
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
            Settings
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="installed" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : plugins.length === 0 ? (
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="text-center py-6">
                  <p className="text-slate-400 mb-4">No plugins installed yet</p>
                  <Button 
                    onClick={() => setActiveTab('marketplace')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" /> Browse Plugin Marketplace
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plugins.map((plugin) => (
                <Card key={plugin.id} className="bg-slate-900 border-slate-800">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center mr-3">
                          {plugin.icon ? (
                            <img 
                              src={plugin.icon} 
                              alt={`${plugin.name} icon`} 
                              className="w-6 h-6" 
                            />
                          ) : (
                            <div className="w-6 h-6 text-slate-400">
                              <Puzzle className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-slate-200">{plugin.name}</CardTitle>
                          <CardDescription className="text-slate-400">v{plugin.version}</CardDescription>
                        </div>
                      </div>
                      <Switch
                        checked={plugin.status === 'enabled'}
                        disabled={isUpdating === plugin.id}
                        onCheckedChange={() => handleTogglePlugin(plugin)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400 mb-4">{plugin.description}</p>
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                        onClick={() => {
                          toast({
                            title: 'Plugin Details',
                            description: `Viewing details for ${plugin.name}`,
                          });
                        }}
                      >
                        <Settings className="h-4 w-4 mr-2" /> Configure
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600 text-red-400 hover:text-red-300"
                        onClick={() => handleDeletePlugin(plugin)}
                        disabled={isUpdating === plugin.id}
                      >
                        {isUpdating === plugin.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="marketplace" className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-100">Plugin Marketplace</h2>
            <Button 
              variant="outline"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
            >
              <ExternalLink className="h-4 w-4 mr-2" /> Visit Full Marketplace
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {marketplacePlugins.map((plugin) => (
              <Card key={plugin.id} className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-md bg-slate-800 flex items-center justify-center mr-3">
                      <Puzzle className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-200">{plugin.name}</CardTitle>
                      <CardDescription className="text-slate-400">v{plugin.version}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400 mb-4">{plugin.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-slate-400">{plugin.downloads} downloads</span>
                    <span className={`text-sm ${plugin.price === 'Free' ? 'text-green-400' : 'text-blue-400'}`}>
                      {plugin.price}
                    </span>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleInstallPlugin}
                  >
                    <Download className="h-4 w-4 mr-2" /> Install
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">Plugin Settings</CardTitle>
              <CardDescription className="text-slate-400">
                Configure global settings for all plugins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 font-medium">Auto-update Plugins</p>
                    <p className="text-sm text-slate-400">Automatically update plugins when new versions are available</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 font-medium">Plugin Notifications</p>
                    <p className="text-sm text-slate-400">Receive notifications about plugin updates and issues</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-200 font-medium">Developer Mode</p>
                    <p className="text-sm text-slate-400">Enable advanced features for plugin development</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="pt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 