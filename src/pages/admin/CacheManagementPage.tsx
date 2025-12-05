import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Database, 
  Loader2,
  Trash2,
  RefreshCw,
  CheckCircle,
  HardDrive,
  Image,
  FileText,
  Users,
  Package,
  Zap,
  Clock
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CacheItem {
  name: string;
  key: string;
  description: string;
  icon: any;
  size: string;
  lastUpdated: string;
}

const CACHE_ITEMS: CacheItem[] = [
  {
    name: 'Dashboard Stats',
    key: 'admin-dashboard-stats',
    description: 'Dashboard statistics and analytics data',
    icon: Zap,
    size: '~50 KB',
    lastUpdated: 'Auto-refresh'
  },
  {
    name: 'User Data',
    key: 'admin-users',
    description: 'User profiles and authentication data',
    icon: Users,
    size: '~200 KB',
    lastUpdated: 'On demand'
  },
  {
    name: 'Properties',
    key: 'admin-properties',
    description: 'Property listings and room data',
    icon: HardDrive,
    size: '~500 KB',
    lastUpdated: 'On demand'
  },
  {
    name: 'Media Library',
    key: 'admin-media',
    description: 'Uploaded images and files metadata',
    icon: Image,
    size: '~100 KB',
    lastUpdated: 'On demand'
  },
  {
    name: 'Blog & Content',
    key: 'admin-blog',
    description: 'Blog posts, FAQs, and help articles',
    icon: FileText,
    size: '~150 KB',
    lastUpdated: 'On demand'
  },
  {
    name: 'Packages',
    key: 'admin-packages',
    description: 'Travel packages and pricing data',
    icon: Package,
    size: '~100 KB',
    lastUpdated: 'On demand'
  }
];

export default function CacheManagementPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [clearingKey, setClearingKey] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clearType, setClearType] = useState<'all' | 'single'>('single');
  const [selectedCache, setSelectedCache] = useState<CacheItem | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleClearSingle = (item: CacheItem) => {
    setSelectedCache(item);
    setClearType('single');
    setIsConfirmOpen(true);
  };

  const handleClearAll = () => {
    setClearType('all');
    setIsConfirmOpen(true);
  };

  const executeClear = async () => {
    setIsClearing(true);
    
    try {
      if (clearType === 'all') {
        // Clear all React Query cache
        queryClient.clear();
        
        // Clear localStorage cache
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('admin-') || key.startsWith('cache-'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        toast({
          title: "Cache Cleared!",
          description: "All cached data has been cleared successfully.",
        });
      } else if (selectedCache) {
        setClearingKey(selectedCache.key);
        // Clear specific query
        queryClient.invalidateQueries({ queryKey: [selectedCache.key] });
        queryClient.removeQueries({ queryKey: [selectedCache.key] });
        
        // Simulate delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        toast({
          title: "Cache Cleared!",
          description: `${selectedCache.name} cache has been cleared.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cache. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
      setClearingKey(null);
      setIsConfirmOpen(false);
    }
  };

  const refreshAllData = async () => {
    setIsClearing(true);
    try {
      // Invalidate all queries to trigger refetch
      await queryClient.invalidateQueries();
      toast({
        title: "Data Refreshed!",
        description: "All data has been refreshed from the server.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Estimate total cache size
  const estimatedSize = CACHE_ITEMS.reduce((acc, item) => {
    const size = parseInt(item.size.replace(/[^0-9]/g, ''));
    return acc + size;
  }, 0);

  return (
    <AdminLayout title="Cache Management">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Database className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Cache Items</p>
                <p className="text-2xl font-bold text-white">{CACHE_ITEMS.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <HardDrive className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Est. Size</p>
                <p className="text-2xl font-bold text-white">~{estimatedSize} KB</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-2xl font-bold text-green-400">Healthy</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={refreshAllData}
                disabled={isClearing}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                {isClearing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh All Data
              </Button>
              <Button
                onClick={handleClearAll}
                disabled={isClearing}
                variant="outline"
                className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cache Items */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Cached Data
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage individual cache entries
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              {CACHE_ITEMS.map((item) => {
                const Icon = item.icon;
                const isItemClearing = clearingKey === item.key;
                
                return (
                  <div
                    key={item.key}
                    className="p-4 rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#3A3A3A] transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-500/10 rounded-lg">
                          <Icon className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm text-gray-400">{item.size}</p>
                          <p className="text-xs text-gray-600 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {item.lastUpdated}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClearSingle(item)}
                          disabled={isClearing}
                          className="border-[#3A3A3A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white"
                        >
                          {isItemClearing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Clear
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">About Cache</h4>
                <p className="text-sm text-gray-400">
                  Cache helps improve performance by storing frequently accessed data locally. 
                  Clearing cache will force the app to fetch fresh data from the server, which may 
                  temporarily slow down page loads. Data will be automatically re-cached as you 
                  navigate through the admin panel.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              {clearType === 'all' ? 'Clear All Cache?' : `Clear ${selectedCache?.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {clearType === 'all' 
                ? 'This will clear all cached data. The app will need to fetch fresh data from the server.'
                : `This will clear the ${selectedCache?.name} cache. Fresh data will be fetched on next access.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A] w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeClear}
              className={`w-full sm:w-auto ${
                clearType === 'all' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isClearing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                clearType === 'all' ? 'Clear All' : 'Clear Cache'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}




