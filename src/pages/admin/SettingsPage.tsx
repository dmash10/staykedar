import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, Loader2, Globe, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SiteSettings {
  siteName: string;
  supportEmail: string;
  phoneNumber: string;
  socials: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
  maintenanceMode: boolean;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'StayKedar',
  supportEmail: 'support@staykedar.com',
  phoneNumber: '+91 98765 43210',
  socials: {
    facebook: '',
    twitter: '',
    instagram: ''
  },
  maintenanceMode: false
};

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('key', 'global_settings')
        .maybeSingle();

      if (error) throw error;
      return data?.content as unknown as SiteSettings | null;
    }
  });

  // Update local state when data loads
  useEffect(() => {
    if (settings) {
      setFormData(prev => ({ ...prev, ...settings }));
    }
  }, [settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (newSettings: SiteSettings) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Upsert settings
      const { error: settingsError } = await supabase
        .from('site_content')
        .upsert({
          key: 'global_settings',
          content: newSettings as any
        }, { onConflict: 'key' });

      if (settingsError) throw settingsError;

      // 2. Log activity
      await supabase.from('admin_activity_logs').insert({
        admin_id: user.id,
        action: 'update_settings',
        entity_type: 'settings',
        details: newSettings as any
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: "Settings Saved",
        description: "Global site settings have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings: " + error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                General Settings
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage your website's global configuration and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">

              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Basic Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Site Name</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        value={formData.siteName}
                        onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="StayKedar"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* Contact Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Contact Details</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Support Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        value={formData.supportEmail}
                        onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="support@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* Social Media */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Social Media</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Facebook URL</Label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        value={formData.socials.facebook}
                        onChange={(e) => setFormData({
                          ...formData,
                          socials: { ...formData.socials, facebook: e.target.value }
                        })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Twitter URL</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        value={formData.socials.twitter}
                        onChange={(e) => setFormData({
                          ...formData,
                          socials: { ...formData.socials, twitter: e.target.value }
                        })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Instagram URL</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        value={formData.socials.instagram}
                        onChange={(e) => setFormData({
                          ...formData,
                          socials: { ...formData.socials, instagram: e.target.value }
                        })}
                        className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-[#2A2A2A]" />

              {/* System Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">System Status</h3>
                <div className="flex items-center justify-between p-4 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A]">
                  <div className="space-y-0.5">
                    <Label className="text-base text-white">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">
                      Temporarily disable the public site for maintenance.
                    </p>
                  </div>
                  <Switch
                    checked={formData.maintenanceMode}
                    onCheckedChange={(checked) => setFormData({ ...formData, maintenanceMode: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]"
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  );
}