import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  RefreshCw,
  CheckCheck,
  Calendar,
  Ticket,
  Settings,
  MapPin,
  Users
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  is_read: boolean;
  entity_type: string | null;
  entity_id: string | null;
  action_url: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications from database
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "All Caught Up!",
        description: "All notifications marked as read.",
      });
    }
  });

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "Deleted",
        description: "Notification removed.",
      });
    }
  });

  // Clear all notifications mutation
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "Cleared",
        description: "All notifications have been cleared.",
      });
    }
  });

  const filteredNotifications = notifications?.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'read') return n.is_read;
    return true;
  }) || [];

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const getIcon = (type: string, category?: string) => {
    // Category-based icons
    if (category === 'booking') return <Calendar className="w-5 h-5 text-blue-400" />;
    if (category === 'support') return <Ticket className="w-5 h-5 text-purple-400" />;
    if (category === 'user') return <Users className="w-5 h-5 text-cyan-400" />;
    if (category === 'attraction') return <MapPin className="w-5 h-5 text-green-400" />;
    if (category === 'system') return <Settings className="w-5 h-5 text-gray-400" />;
    
    // Type-based icons
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      success: 'bg-green-500/20 text-green-400 border-green-500/30',
      warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      error: 'bg-red-500/20 text-red-400 border-red-500/30',
      info: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return styles[type as keyof typeof styles] || styles.info;
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Bell className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold text-white">{notifications?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-white">{unreadCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Read</p>
                <p className="text-2xl font-bold text-white">{(notifications?.length || 0) - unreadCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white ml-2">{unreadCount} new</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="border-[#3A3A3A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                    className="border-[#3A3A3A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white"
                  >
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
                {(notifications?.length || 0) > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => clearAllMutation.mutate()}
                    disabled={clearAllMutation.isPending}
                    className="border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
              <div className="border-b border-[#2A2A2A] px-4">
                <TabsList className="bg-transparent h-12">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
                  >
                    All ({notifications?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="unread"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
                  >
                    Unread ({unreadCount})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="read"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400"
                  >
                    Read ({(notifications?.length || 0) - unreadCount})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={filter} className="m-0">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-16">
                    <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications</h3>
                    <p className="text-gray-500">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#2A2A2A]">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-[#1A1A1A] transition-colors ${
                          !notification.is_read ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            notification.type === 'success' ? 'bg-green-500/10' :
                            notification.type === 'warning' ? 'bg-amber-500/10' :
                            notification.type === 'error' ? 'bg-red-500/10' :
                            'bg-blue-500/10'
                          }`}>
                            {getIcon(notification.type, notification.category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className={`font-medium ${notification.is_read ? 'text-gray-300' : 'text-white'}`}>
                                  {notification.title}
                                </h4>
                                <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                  </span>
                                  <Badge variant="outline" className={`text-xs ${getTypeBadge(notification.type)}`}>
                                    {notification.category || notification.type}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {notification.action_url && (
                                  <Link to={notification.action_url}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                    >
                                      View
                                    </Button>
                                  </Link>
                                )}
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsReadMutation.mutate(notification.id)}
                                    className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteMutation.mutate(notification.id)}
                                  className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
