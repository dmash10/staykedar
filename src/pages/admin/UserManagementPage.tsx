import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Users, 
  Search, 
  Ban, 
  Loader2,
  Activity,
  Clock,
  Shield,
  UserX,
  UserCheck,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  History
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  is_banned?: boolean;
  ban_reason?: string;
  ban_expires?: string;
}

interface UserBan {
  id: string;
  user_id: string;
  reason: string;
  banned_by: string;
  banned_at: string;
  expires_at: string | null;
  is_permanent: boolean;
  is_active: boolean;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: any;
  ip_address: string;
  created_at: string;
}

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [isUnbanDialogOpen, setIsUnbanDialogOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banForm, setBanForm] = useState({
    reason: '',
    is_permanent: false,
    expires_at: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch users with ban status
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-management'],
    queryFn: async () => {
      const { data: customers, error } = await supabase
        .from('customer_details')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get active bans
      const { data: bans } = await supabase
        .from('user_bans')
        .select('*')
        .eq('is_active', true);

      // Merge ban info with users
      return customers?.map(user => {
        const ban = bans?.find(b => b.user_id === user.id);
        return {
          ...user,
          is_banned: !!ban,
          ban_reason: ban?.reason,
          ban_expires: ban?.expires_at
        };
      }) as User[];
    }
  });

  // Fetch bans
  const { data: bans, isLoading: bansLoading } = useQuery({
    queryKey: ['admin-user-bans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_bans')
        .select('*')
        .order('banned_at', { ascending: false });
      if (error) throw error;
      return data as UserBan[];
    }
  });

  // Fetch activity logs for selected user
  const { data: activityLogs, isLoading: activityLoading } = useQuery({
    queryKey: ['user-activity-logs', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select('*')
        .eq('user_id', selectedUser.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!selectedUser?.id && isActivityModalOpen
  });

  // Ban user mutation
  const banUserMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser) return;
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('user_bans').insert({
        user_id: selectedUser.id,
        reason: banForm.reason,
        is_permanent: banForm.is_permanent,
        expires_at: banForm.is_permanent ? null : banForm.expires_at || null,
        banned_by: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-bans'] });
      setIsBanModalOpen(false);
      setSelectedUser(null);
      setBanForm({ reason: '', is_permanent: false, expires_at: '' });
      toast({ title: "User Banned", description: "The user has been banned successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Unban user mutation
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_bans')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-bans'] });
      setIsUnbanDialogOpen(false);
      setSelectedUser(null);
      toast({ title: "User Unbanned", description: "The user has been unbanned successfully." });
    }
  });

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setIsBanModalOpen(true);
  };

  const handleUnbanUser = (user: User) => {
    setSelectedUser(user);
    setIsUnbanDialogOpen(true);
  };

  const handleViewActivity = (user: User) => {
    setSelectedUser(user);
    setIsActivityModalOpen(true);
  };

  // Filter users
  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'banned' && user.is_banned) ||
                          (statusFilter === 'active' && !user.is_banned);
    return matchesSearch && matchesStatus;
  });

  const bannedCount = users?.filter(u => u.is_banned).length || 0;

  const isLoading = usersLoading || bansLoading;

  if (isLoading) {
    return (
      <AdminLayout title="User Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Users</p>
                <p className="text-xl font-bold text-white">{users?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <UserCheck className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Active</p>
                <p className="text-xl font-bold text-white">{(users?.length || 0) - bannedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 rounded-lg">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Banned</p>
                <p className="text-xl font-bold text-white">{bannedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Bans</p>
                <p className="text-xl font-bold text-white">{bans?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <TabsList className="bg-[#0A0A0A] w-full sm:w-auto">
                  <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 flex-1 sm:flex-none">
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="bans" className="data-[state=active]:bg-blue-600 flex-1 sm:flex-none">
                    <Ban className="w-4 h-4 mr-2" />
                    Ban History
                  </TabsTrigger>
                </TabsList>
                {activeTab === 'users' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-56 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-36 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Users Tab */}
              <TabsContent value="users" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                        <TableHead className="text-gray-400">User</TableHead>
                        <TableHead className="text-gray-400 hidden md:table-cell">Contact</TableHead>
                        <TableHead className="text-gray-400 hidden lg:table-cell">Joined</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers?.map((user) => (
                          <TableRow key={user.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                  {user.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                  <p className="font-medium text-white">{user.name || 'Unknown'}</p>
                                  <p className="text-xs text-gray-500 md:hidden">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <div className="space-y-1">
                                <p className="text-sm text-gray-300 flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {user.email}
                                </p>
                                {user.phone && (
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {user.phone}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-gray-400 text-sm">
                              {format(new Date(user.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                              {user.is_banned ? (
                                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                  <UserX className="w-3 h-3 mr-1" />
                                  Banned
                                </Badge>
                              ) : (
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Active
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewActivity(user)}
                                  className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                                  title="View Activity"
                                >
                                  <History className="w-4 h-4" />
                                </Button>
                                {user.is_banned ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUnbanUser(user)}
                                    className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                    title="Unban User"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleBanUser(user)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    title="Ban User"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Ban History Tab */}
              <TabsContent value="bans" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                        <TableHead className="text-gray-400">User ID</TableHead>
                        <TableHead className="text-gray-400">Reason</TableHead>
                        <TableHead className="text-gray-400 hidden md:table-cell">Banned At</TableHead>
                        <TableHead className="text-gray-400 hidden lg:table-cell">Expires</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bans?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No ban history
                          </TableCell>
                        </TableRow>
                      ) : (
                        bans?.map((ban) => (
                          <TableRow key={ban.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                            <TableCell className="text-gray-300 font-mono text-sm">
                              {ban.user_id.slice(0, 8)}...
                            </TableCell>
                            <TableCell className="text-gray-300 max-w-xs truncate">
                              {ban.reason}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-gray-400 text-sm">
                              {format(new Date(ban.banned_at), 'MMM dd, yyyy HH:mm')}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-gray-400 text-sm">
                              {ban.is_permanent ? (
                                <Badge className="bg-red-500/20 text-red-400">Permanent</Badge>
                              ) : ban.expires_at ? (
                                format(new Date(ban.expires_at), 'MMM dd, yyyy')
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {ban.is_active ? (
                                <Badge className="bg-red-500/20 text-red-400">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-500/20 text-gray-400">Lifted</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>

      {/* Ban User Modal */}
      <Dialog open={isBanModalOpen} onOpenChange={setIsBanModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-400" />
              Ban User
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-400">
                You are about to ban: <strong>{selectedUser?.name || selectedUser?.email}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Reason for Ban *</Label>
              <Textarea
                value={banForm.reason}
                onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[100px]"
                placeholder="Explain why this user is being banned..."
              />
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]">
              <Switch
                checked={banForm.is_permanent}
                onCheckedChange={(checked) => setBanForm({ ...banForm, is_permanent: checked })}
              />
              <Label className="text-gray-300">Permanent Ban</Label>
            </div>
            {!banForm.is_permanent && (
              <div className="space-y-2">
                <Label className="text-gray-300">Ban Expires</Label>
                <Input
                  type="datetime-local"
                  value={banForm.expires_at}
                  onChange={(e) => setBanForm({ ...banForm, expires_at: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                />
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setIsBanModalOpen(false)}
              className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => banUserMutation.mutate()}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
              disabled={banUserMutation.isPending || !banForm.reason}
            >
              {banUserMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Banning...</>
              ) : (
                'Ban User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Confirmation */}
      <AlertDialog open={isUnbanDialogOpen} onOpenChange={setIsUnbanDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Unban User?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to unban {selectedUser?.name || selectedUser?.email}? They will regain access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A] w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && unbanUserMutation.mutate(selectedUser.id)}
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            >
              Unban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Activity Modal */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <History className="w-5 h-5 text-purple-400" />
              Activity History - {selectedUser?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : activityLogs?.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">No activity recorded for this user</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activityLogs?.map((log) => (
                  <div key={log.id} className="p-3 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A]">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-white font-medium">{log.action}</p>
                        {log.details && (
                          <p className="text-xs text-gray-500 mt-1">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {log.ip_address && (
                      <p className="text-xs text-gray-600 mt-2">IP: {log.ip_address}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

