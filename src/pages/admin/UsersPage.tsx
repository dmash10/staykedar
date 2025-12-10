import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Phone, Calendar, MoreVertical, Users as UsersIcon, Shield, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: string }) => {
      const { error } = await supabase
        .from('customer_details')
        .update({ role })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Success",
        description: "User role updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update: " + error.message,
        variant: "destructive",
      });
    }
  });

  const getRoleBadge = (role: string | null) => {
    const styles = {
      admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      property_owner: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      customer: 'bg-green-500/10 text-green-400 border-green-500/20',
    };
    const roleDisplay = role || 'customer';
    return (
      <Badge className={`${styles[roleDisplay as keyof typeof styles] || styles.customer} hover:opacity-80`}>
        {roleDisplay === 'property_owner' ? 'Property Owner' : roleDisplay.charAt(0).toUpperCase() + roleDisplay.slice(1)}
      </Badge>
    );
  };

  const filteredUsers = users?.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number?.includes(searchTerm)
  ) || [];

  const adminRoles = ['admin', 'super_admin', 'manager', 'content_editor', 'support_agent'];
  const stats = {
    total: users?.length || 0,
    admins: users?.filter(u => adminRoles.includes(u.role)).length || 0,
    propertyOwners: users?.filter(u => u.role === 'property_owner').length || 0,
    customers: users?.filter(u => u.role === 'customer' || !u.role).length || 0,
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-none text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Users</p>
                <h3 className="text-3xl font-bold">{stats.total}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <UsersIcon className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Admins</p>
                <h3 className="text-3xl font-bold text-white">{stats.admins}</h3>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Property Owners</p>
                <h3 className="text-3xl font-bold text-white">{stats.propertyOwners}</h3>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">Customers</p>
                <h3 className="text-3xl font-bold text-white">{stats.customers}</h3>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <User className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-[#111111] border-[#2A2A2A]">
        <CardHeader className="border-b border-[#2A2A2A]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle className="text-white text-xl font-semibold">All Users</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                placeholder="Search users..."
                className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-white placeholder:text-gray-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A] hover:bg-[#0A0A0A]">
                    <TableHead className="text-gray-400 font-semibold">User</TableHead>
                    <TableHead className="text-gray-400 font-semibold">Email</TableHead>
                    <TableHead className="text-gray-400 font-semibold">Phone</TableHead>
                    <TableHead className="text-gray-400 font-semibold">Role</TableHead>
                    <TableHead className="text-gray-400 font-semibold">Joined</TableHead>
                    <TableHead className="text-gray-400 font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-400 py-12">
                        <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No users found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-[#2A2A2A] hover:bg-[#0A0A0A] transition">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-blue-500/20">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-white">{user.name || 'Unnamed User'}</p>
                              <p className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-gray-300">
                            <Mail className="w-4 h-4 mr-1.5 text-gray-500 flex-shrink-0" />
                            <span className="truncate max-w-xs">{user.email || 'No email'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-gray-300">
                            <Phone className="w-4 h-4 mr-1.5 text-gray-500 flex-shrink-0" />
                            {user.phone_number || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-300">
                            <Calendar className="w-3 h-3 mr-1.5 text-gray-500" />
                            {format(new Date(user.created_at), 'MMM dd, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-[#1A1A1A]">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                              <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                              <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer">
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                              <DropdownMenuLabel className="text-xs text-gray-500">Change Role</DropdownMenuLabel>
                              <DropdownMenuItem
                                className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer"
                                onSelect={() => updateRoleMutation.mutate({ id: user.id, role: 'customer' })}
                              >
                                <User className="w-4 h-4 mr-2" />
                                Customer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer"
                                onSelect={() => updateRoleMutation.mutate({ id: user.id, role: 'property_owner' })}
                              >
                                <UsersIcon className="w-4 h-4 mr-2" />
                                Property Owner
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-gray-300 hover:text-white hover:bg-[#2A2A2A] cursor-pointer"
                                onSelect={() => updateRoleMutation.mutate({ id: user.id, role: 'admin' })}
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Admin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
