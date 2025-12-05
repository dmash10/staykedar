import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Bell, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  Send,
  Users,
  CheckCircle,
  Clock,
  MousePointer,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PushNotification {
  id: string;
  title: string;
  body: string;
  image_url: string;
  action_url: string;
  target_type: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  sent_count: number;
  click_count: number;
  created_at: string;
}

const DEFAULT_FORM: Partial<PushNotification> = {
  title: '',
  body: '',
  image_url: '',
  action_url: '',
  target_type: 'all',
  status: 'draft',
  scheduled_at: null
};

export default function PushNotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);
  const [formData, setFormData] = useState<Partial<PushNotification>>(DEFAULT_FORM);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-push-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PushNotification[];
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<PushNotification>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (selectedNotification) {
        const { error } = await supabase
          .from('push_notifications')
          .update(data)
          .eq('id', selectedNotification.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('push_notifications').insert({
          ...data,
          created_by: user?.id
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-push-notifications'] });
      setIsModalOpen(false);
      setSelectedNotification(null);
      setFormData(DEFAULT_FORM);
      toast({ title: "Saved!", description: "Notification saved successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('push_notifications').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-push-notifications'] });
      setIsDeleteDialogOpen(false);
      setSelectedNotification(null);
      toast({ title: "Deleted!", description: "Notification deleted successfully." });
    }
  });

  // Send mutation
  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('push_notifications')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString(),
          sent_count: 500 // Mock value
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-push-notifications'] });
      toast({ title: "Sent!", description: "Push notification sent to users." });
    }
  });

  const handleEdit = (notification: PushNotification) => {
    setSelectedNotification(notification);
    setFormData({
      ...notification,
      scheduled_at: notification.scheduled_at ? new Date(notification.scheduled_at).toISOString().slice(0, 16) : null
    });
    setIsModalOpen(true);
  };

  const handleDelete = (notification: PushNotification) => {
    setSelectedNotification(notification);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      scheduled: 'bg-blue-500/20 text-blue-400',
      sent: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400'
    };
    return styles[status] || styles.draft;
  };

  // Filter
  const filteredNotifications = notifications?.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const sentCount = notifications?.filter(n => n.status === 'sent').length || 0;
  const totalSent = notifications?.reduce((sum, n) => sum + (n.sent_count || 0), 0) || 0;
  const totalClicks = notifications?.reduce((sum, n) => sum + (n.click_count || 0), 0) || 0;

  if (isLoading) {
    return (
      <AdminLayout title="Push Notifications">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Push Notifications">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Bell className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold text-white">{notifications?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Sent</p>
                <p className="text-xl font-bold text-white">{sentCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Delivered</p>
                <p className="text-xl font-bold text-white">{totalSent}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <MousePointer className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Clicks</p>
                <p className="text-xl font-bold text-white">{totalClicks}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                Push Notifications
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-48 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>
                <Button
                  onClick={() => {
                    setSelectedNotification(null);
                    setFormData(DEFAULT_FORM);
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Create</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {filteredNotifications?.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No notifications</h3>
                <p className="text-gray-500">Create your first push notification</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications?.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 rounded-xl border border-[#2A2A2A] bg-[#0A0A0A]"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-white">{notification.title}</h4>
                          <Badge className={getStatusBadge(notification.status)}>
                            {notification.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 line-clamp-2">{notification.body}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" /> {notification.target_type}
                          </span>
                          {notification.sent_at && (
                            <>
                              <span className="flex items-center gap-1">
                                <Send className="w-3 h-3" /> {notification.sent_count} sent
                              </span>
                              <span className="flex items-center gap-1">
                                <MousePointer className="w-3 h-3" /> {notification.click_count} clicks
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {notification.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => sendMutation.mutate(notification.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={sendMutation.isPending}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(notification)}
                          className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-400" />
              {selectedNotification ? 'Edit Notification' : 'Create Notification'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Title *</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Notification title"
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Body *</Label>
              <Textarea
                value={formData.body || ''}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Notification message"
                maxLength={200}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Target Audience</Label>
              <Select 
                value={formData.target_type || 'all'} 
                onValueChange={(v) => setFormData({ ...formData, target_type: v })}
              >
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="segment">Specific Segment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Image URL (optional)</Label>
              <Input
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Action URL (optional)</Label>
              <Input
                value={formData.action_url || ''}
                onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="/packages or https://..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Schedule (optional)</Label>
              <Input
                type="datetime-local"
                value={formData.scheduled_at || ''}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value || null })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => saveMutation.mutate(formData)}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              disabled={saveMutation.isPending || !formData.title || !formData.body}
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Notification?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A] w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedNotification && deleteMutation.mutate(selectedNotification.id)}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}




