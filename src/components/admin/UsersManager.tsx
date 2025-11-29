import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Search, UserCheck, UserX, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  firebase_uid: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  created_at: string;
}

const UsersManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_details')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.phone_number && user.phone_number.includes(searchTerm))
    );
  });

  const handleMakeAdmin = async (user: User) => {
    if (!confirm(`Make ${user.name || user.email} an admin?`)) {
      return;
    }
    
    try {
      // Check if admin_users table exists
      const { data: adminUser, error: checkError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (!checkError && adminUser) {
        toast({
          title: "Info",
          description: "User is already an admin",
        });
        return;
      }
      
      // Add user to admin_users table
      const { error } = await supabase
        .from('admin_users')
        .insert({
          email: user.email,
          firebase_uid: user.firebase_uid,
          name: user.name,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "User is now an admin",
      });
    } catch (error) {
      console.error('Error making user admin:', error);
      toast({
        title: "Error",
        description: "Failed to make user an admin",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAdmin = async (user: User) => {
    if (!confirm(`Remove admin privileges from ${user.name || user.email}?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('email', user.email);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "Admin privileges removed",
      });
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin privileges",
        variant: "destructive",
      });
    }
  };

  const handleSendEmail = (email: string | null) => {
    if (!email) return;
    window.open(`mailto:${email}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-mist" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-mist">
          <p>No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{user.name || "No Name"}</h3>
                    <p className="text-sm text-mist">
                      {user.email}
                    </p>
                    <p className="text-sm text-mist">
                      {user.phone_number || "No Phone"} • Joined {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleSendEmail(user.email)}
                      disabled={!user.email}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleMakeAdmin(user)}
                      className="text-green-600 border-green-600 hover:bg-green-50"
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveAdmin(user)}
                      className="text-red-500 border-red-500 hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersManager; 