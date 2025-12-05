import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
  Gift, 
  Save, 
  Loader2,
  Users,
  IndianRupee,
  Percent,
  CheckCircle,
  Clock,
  TrendingUp,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralSettings {
  id: string;
  is_enabled: boolean;
  referrer_reward_type: 'fixed' | 'percentage';
  referrer_reward_value: number;
  referee_reward_type: 'fixed' | 'percentage';
  referee_reward_value: number;
  min_booking_value: number;
  max_referrals_per_user: number;
  reward_expiry_days: number;
  terms_and_conditions: string;
}

interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  referral_code: string;
  status: string;
  reward_claimed: boolean;
  created_at: string;
  completed_at: string;
}

const DEFAULT_SETTINGS: Partial<ReferralSettings> = {
  is_enabled: false,
  referrer_reward_type: 'fixed',
  referrer_reward_value: 100,
  referee_reward_type: 'fixed',
  referee_reward_value: 50,
  min_booking_value: 1000,
  max_referrals_per_user: 10,
  reward_expiry_days: 90,
  terms_and_conditions: ''
};

export default function ReferralProgramPage() {
  const [formData, setFormData] = useState<Partial<ReferralSettings>>(DEFAULT_SETTINGS);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referral_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as ReferralSettings | null;
    }
  });

  // Fetch referrals
  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ['admin-referrals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Referral[];
    }
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ReferralSettings>) => {
      if (settings?.id) {
        const { error } = await supabase
          .from('referral_settings')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('referral_settings').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-settings'] });
      toast({ title: "Saved!", description: "Referral settings updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-500/20 text-amber-400',
      completed: 'bg-green-500/20 text-green-400',
      expired: 'bg-gray-500/20 text-gray-400',
      cancelled: 'bg-red-500/20 text-red-400'
    };
    return styles[status] || styles.pending;
  };

  // Stats
  const completedReferrals = referrals?.filter(r => r.status === 'completed').length || 0;
  const pendingReferrals = referrals?.filter(r => r.status === 'pending').length || 0;
  const totalRewards = completedReferrals * (settings?.referrer_reward_value || 0);

  const isLoading = settingsLoading || referralsLoading;

  if (isLoading) {
    return (
      <AdminLayout title="Referral Program">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Referral Program">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Share2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Referrals</p>
                <p className="text-xl font-bold text-white">{referrals?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Completed</p>
                <p className="text-xl font-bold text-white">{completedReferrals}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Pending</p>
                <p className="text-xl font-bold text-white">{pendingReferrals}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <IndianRupee className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Rewards Given</p>
                <p className="text-xl font-bold text-white">₹{totalRewards}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Card */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-purple-400" />
              Referral Program Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure rewards for referrers and new users
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A]">
              <div>
                <Label className="text-base text-white">Enable Referral Program</Label>
                <p className="text-sm text-gray-500 mt-1">
                  {formData.is_enabled ? 'Program is active' : 'Program is disabled'}
                </p>
              </div>
              <Switch
                checked={formData.is_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
              />
            </div>

            <Separator className="bg-[#2A2A2A]" />

            {/* Referrer Rewards */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Referrer Reward</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-300">Reward Type</Label>
                  <Select 
                    value={formData.referrer_reward_type} 
                    onValueChange={(v: 'fixed' | 'percentage') => setFormData({ ...formData, referrer_reward_type: v })}
                  >
                    <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Reward Value</Label>
                  <div className="relative">
                    {formData.referrer_reward_type === 'fixed' ? (
                      <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    ) : (
                      <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    )}
                    <Input
                      type="number"
                      value={formData.referrer_reward_value || ''}
                      onChange={(e) => setFormData({ ...formData, referrer_reward_value: parseFloat(e.target.value) })}
                      className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-[#2A2A2A]" />

            {/* Referee Rewards */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">New User Reward</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-300">Reward Type</Label>
                  <Select 
                    value={formData.referee_reward_type} 
                    onValueChange={(v: 'fixed' | 'percentage') => setFormData({ ...formData, referee_reward_type: v })}
                  >
                    <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                      <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Reward Value</Label>
                  <div className="relative">
                    {formData.referee_reward_type === 'fixed' ? (
                      <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    ) : (
                      <Percent className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    )}
                    <Input
                      type="number"
                      value={formData.referee_reward_value || ''}
                      onChange={(e) => setFormData({ ...formData, referee_reward_value: parseFloat(e.target.value) })}
                      className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-[#2A2A2A]" />

            {/* Rules */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Rules & Limits</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-gray-300">Min Booking Value (₹)</Label>
                  <Input
                    type="number"
                    value={formData.min_booking_value || ''}
                    onChange={(e) => setFormData({ ...formData, min_booking_value: parseFloat(e.target.value) })}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Max Referrals/User</Label>
                  <Input
                    type="number"
                    value={formData.max_referrals_per_user || ''}
                    onChange={(e) => setFormData({ ...formData, max_referrals_per_user: parseInt(e.target.value) })}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Reward Expiry (Days)</Label>
                  <Input
                    type="number"
                    value={formData.reward_expiry_days || ''}
                    onChange={(e) => setFormData({ ...formData, reward_expiry_days: parseInt(e.target.value) })}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>
              </div>
            </div>

            <Separator className="bg-[#2A2A2A]" />

            {/* Terms */}
            <div className="space-y-2">
              <Label className="text-gray-300">Terms & Conditions</Label>
              <Textarea
                value={formData.terms_and_conditions || ''}
                onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[100px]"
                placeholder="Enter referral program terms..."
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={() => saveMutation.mutate(formData)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" />Save Settings</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-white">Recent Referrals</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#2A2A2A] hover:bg-transparent">
                    <TableHead className="text-gray-400">Code</TableHead>
                    <TableHead className="text-gray-400">Referrer</TableHead>
                    <TableHead className="text-gray-400 hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400 hidden sm:table-cell">Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No referrals yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    referrals?.slice(0, 10).map((referral) => (
                      <TableRow key={referral.id} className="border-[#2A2A2A] hover:bg-[#1A1A1A]">
                        <TableCell>
                          <code className="text-blue-400 bg-blue-500/10 px-2 py-1 rounded text-sm">
                            {referral.referral_code}
                          </code>
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-sm">
                          {referral.referrer_id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-gray-400 text-sm">
                          {format(new Date(referral.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(referral.status)}>
                            {referral.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {referral.reward_claimed ? (
                            <Badge className="bg-green-500/20 text-green-400">Claimed</Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}




