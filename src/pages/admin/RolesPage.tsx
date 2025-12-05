import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Users,
  Lock,
  Unlock,
  Key,
  CheckCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminRole {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
  is_system_role: boolean;
  created_at: string;
}

const PERMISSION_GROUPS = [
  {
    label: 'Dashboard & Analytics',
    permissions: [
      { key: 'dashboard_view', label: 'View Dashboard' },
      { key: 'analytics_view', label: 'View Analytics' },
      { key: 'reports_view', label: 'View Reports' },
      { key: 'reports_export', label: 'Export Reports' },
    ]
  },
  {
    label: 'Properties & Rooms',
    permissions: [
      { key: 'properties_view', label: 'View Properties' },
      { key: 'properties_create', label: 'Create Properties' },
      { key: 'properties_edit', label: 'Edit Properties' },
      { key: 'properties_delete', label: 'Delete Properties' },
    ]
  },
  {
    label: 'Bookings',
    permissions: [
      { key: 'bookings_view', label: 'View Bookings' },
      { key: 'bookings_manage', label: 'Manage Bookings' },
      { key: 'bookings_cancel', label: 'Cancel Bookings' },
    ]
  },
  {
    label: 'Users',
    permissions: [
      { key: 'users_view', label: 'View Users' },
      { key: 'users_edit', label: 'Edit Users' },
      { key: 'users_ban', label: 'Ban/Suspend Users' },
      { key: 'users_delete', label: 'Delete Users' },
    ]
  },
  {
    label: 'Content',
    permissions: [
      { key: 'blog_manage', label: 'Manage Blog' },
      { key: 'faq_manage', label: 'Manage FAQ' },
      { key: 'testimonials_manage', label: 'Manage Testimonials' },
      { key: 'media_manage', label: 'Manage Media' },
      { key: 'attractions_manage', label: 'Manage Attractions' },
    ]
  },
  {
    label: 'Support',
    permissions: [
      { key: 'tickets_view', label: 'View Tickets' },
      { key: 'tickets_respond', label: 'Respond to Tickets' },
      { key: 'tickets_close', label: 'Close Tickets' },
    ]
  },
  {
    label: 'System',
    permissions: [
      { key: 'settings_view', label: 'View Settings' },
      { key: 'settings_edit', label: 'Edit Settings' },
      { key: 'roles_manage', label: 'Manage Roles' },
      { key: 'logs_view', label: 'View Activity Logs' },
    ]
  },
];

const DEFAULT_FORM: Partial<AdminRole> = {
  name: '',
  description: '',
  permissions: {},
  is_system_role: false
};

export default function RolesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AdminRole | null>(null);
  const [formData, setFormData] = useState<Partial<AdminRole>>(DEFAULT_FORM);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('*')
        .order('is_system_role', { ascending: false })
        .order('name');
      if (error) throw error;
      return data as AdminRole[];
    }
  });

  // Fetch user counts per role
  const { data: userCounts } = useQuery({
    queryKey: ['admin-role-user-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_user_roles')
        .select('role_id');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data?.forEach(ur => {
        counts[ur.role_id] = (counts[ur.role_id] || 0) + 1;
      });
      return counts;
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<AdminRole>) => {
      if (selectedRole) {
        const { error } = await supabase
          .from('admin_roles')
          .update(data)
          .eq('id', selectedRole.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('admin_roles').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setIsModalOpen(false);
      setSelectedRole(null);
      setFormData(DEFAULT_FORM);
      toast({ title: "Saved!", description: "Role saved successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_roles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-roles'] });
      setIsDeleteDialogOpen(false);
      setSelectedRole(null);
      toast({ title: "Deleted!", description: "Role deleted successfully." });
    }
  });

  const handleEdit = (role: AdminRole) => {
    setSelectedRole(role);
    setFormData(role);
    setIsModalOpen(true);
  };

  const handleDelete = (role: AdminRole) => {
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  const togglePermission = (key: string) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions?.[key]
      }
    });
  };

  const selectAllInGroup = (permissions: { key: string }[]) => {
    const updates: Record<string, boolean> = {};
    permissions.forEach(p => {
      updates[p.key] = true;
    });
    setFormData({
      ...formData,
      permissions: { ...formData.permissions, ...updates }
    });
  };

  const getPermissionCount = (permissions: Record<string, boolean>) => {
    return Object.values(permissions || {}).filter(Boolean).length;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Roles & Permissions">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Roles & Permissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Admin Roles</h2>
            <p className="text-sm text-gray-400">Manage roles and their permissions</p>
          </div>
          <Button
            onClick={() => {
              setSelectedRole(null);
              setFormData(DEFAULT_FORM);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Role
          </Button>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles?.map((role) => (
            <Card key={role.id} className="bg-[#111111] border-[#2A2A2A] hover:border-[#3A3A3A] transition">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      role.is_system_role ? 'bg-amber-500/10' : 'bg-blue-500/10'
                    }`}>
                      {role.is_system_role ? (
                        <Lock className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Shield className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{role.name}</h3>
                      {role.is_system_role && (
                        <Badge className="bg-amber-500/20 text-amber-400 text-xs mt-1">System Role</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{role.description || 'No description'}</p>

                <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Key className="w-4 h-4 text-blue-400" />
                      <span className="text-white font-medium">{getPermissionCount(role.permissions)}</span> permissions
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">{userCounts?.[role.id] || 0}</span> users
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(role)}
                      className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!role.is_system_role && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(role)}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              {selectedRole ? 'Edit Role' : 'Create Role'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Role Name *</Label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="e.g., Content Manager"
                  disabled={selectedRole?.is_system_role}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="Brief description of this role"
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <Label className="text-gray-300 text-base">Permissions</Label>
              <div className="space-y-4">
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.label} className="p-4 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A]">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-white">{group.label}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => selectAllInGroup(group.permissions)}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Select All
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {group.permissions.map((perm) => (
                        <label
                          key={perm.key}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1A1A1A] cursor-pointer transition"
                        >
                          <Checkbox
                            checked={formData.permissions?.[perm.key] || false}
                            onCheckedChange={() => togglePermission(perm.key)}
                            className="border-[#3A3A3A] data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          />
                          <span className="text-sm text-gray-300">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
              disabled={saveMutation.isPending || !formData.name}
            >
              {saveMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                selectedRole ? 'Update Role' : 'Create Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Role?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedRole?.name}"? Users with this role will lose their permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A] w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRole && deleteMutation.mutate(selectedRole.id)}
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




