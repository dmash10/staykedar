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
  Send, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  Mail,
  Users,
  Clock,
  CheckCircle,
  Eye,
  MousePointer,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  template_id: string;
  recipient_type: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  sent_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
}

const DEFAULT_FORM: Partial<EmailCampaign> = {
  name: '',
  subject: '',
  body: '',
  recipient_type: 'all',
  status: 'draft',
  scheduled_at: null
};

export default function EmailCampaignsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [formData, setFormData] = useState<Partial<EmailCampaign>>(DEFAULT_FORM);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch campaigns
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['admin-email-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as EmailCampaign[];
    }
  });

  // Fetch email templates
  const { data: templates } = useQuery({
    queryKey: ['email-templates-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('id, name, subject, body')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<EmailCampaign>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (selectedCampaign) {
        const { error } = await supabase
          .from('email_campaigns')
          .update(data)
          .eq('id', selectedCampaign.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('email_campaigns').insert({
          ...data,
          created_by: user?.id
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-campaigns'] });
      setIsModalOpen(false);
      setSelectedCampaign(null);
      setFormData(DEFAULT_FORM);
      toast({ title: "Saved!", description: "Campaign saved successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-campaigns'] });
      setIsDeleteDialogOpen(false);
      setSelectedCampaign(null);
      toast({ title: "Deleted!", description: "Campaign deleted successfully." });
    }
  });

  // Send campaign mutation
  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      // In a real app, this would trigger an email sending service
      const { error } = await supabase
        .from('email_campaigns')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString(),
          sent_count: 100 // Mock value
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-campaigns'] });
      toast({ title: "Sent!", description: "Campaign is being sent to recipients." });
    }
  });

  const handleEdit = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      ...campaign,
      scheduled_at: campaign.scheduled_at ? new Date(campaign.scheduled_at).toISOString().slice(0, 16) : null
    });
    setIsModalOpen(true);
  };

  const handleDelete = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    setIsDeleteDialogOpen(true);
  };

  const applyTemplate = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        template_id: templateId,
        subject: template.subject,
        body: template.body
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-500/20 text-gray-400',
      scheduled: 'bg-blue-500/20 text-blue-400',
      sending: 'bg-amber-500/20 text-amber-400',
      sent: 'bg-green-500/20 text-green-400',
      failed: 'bg-red-500/20 text-red-400'
    };
    return styles[status] || styles.draft;
  };

  // Filter campaigns
  const filteredCampaigns = campaigns?.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const sentCount = campaigns?.filter(c => c.status === 'sent').length || 0;
  const totalSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
  const totalOpens = campaigns?.reduce((sum, c) => sum + (c.open_count || 0), 0) || 0;

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
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Campaigns</p>
                <p className="text-xl font-bold text-white">{campaigns?.length || 0}</p>
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
                <p className="text-xs text-gray-400">Emails Sent</p>
                <p className="text-xl font-bold text-white">{totalSent}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <Eye className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Opens</p>
                <p className="text-xl font-bold text-white">{totalOpens}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                Email Campaigns
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-48 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    setSelectedCampaign(null);
                    setFormData(DEFAULT_FORM);
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Create Campaign</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {filteredCampaigns?.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No campaigns found</h3>
                <p className="text-gray-500">Create your first email campaign</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCampaigns?.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-4 rounded-xl border border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#3A3A3A] transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-white truncate">{campaign.name}</h4>
                          <Badge className={getStatusBadge(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 truncate">{campaign.subject}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {campaign.recipient_type}
                          </span>
                          {campaign.sent_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Sent {format(new Date(campaign.sent_at), 'MMM dd, yyyy')}
                            </span>
                          )}
                          {campaign.status === 'sent' && (
                            <>
                              <span className="flex items-center gap-1">
                                <Send className="w-3 h-3" /> {campaign.sent_count} sent
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" /> {campaign.open_count} opens
                              </span>
                              <span className="flex items-center gap-1">
                                <MousePointer className="w-3 h-3" /> {campaign.click_count} clicks
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => sendMutation.mutate(campaign.id)}
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
                          onClick={() => handleEdit(campaign)}
                          className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(campaign)}
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
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              {selectedCampaign ? 'Edit Campaign' : 'Create Campaign'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Campaign Name *</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Summer Sale Announcement"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Recipients</Label>
                <Select 
                  value={formData.recipient_type || 'all'} 
                  onValueChange={(v) => setFormData({ ...formData, recipient_type: v })}
                >
                  <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="customers">Customers Only</SelectItem>
                    <SelectItem value="property_owners">Property Owners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Use Template</Label>
                <Select onValueChange={applyTemplate}>
                  <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    {templates?.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Subject Line *</Label>
              <Input
                value={formData.subject || ''}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Don't miss our summer deals!"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Email Body (HTML) *</Label>
              <Textarea
                value={formData.body || ''}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white font-mono text-sm min-h-[200px]"
                placeholder="<h1>Hello!</h1>..."
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
              <p className="text-xs text-gray-500">Leave empty to save as draft</p>
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
              disabled={saveMutation.isPending || !formData.name || !formData.subject || !formData.body}
            >
              {saveMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                'Save Campaign'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Campaign?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedCampaign?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A] w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCampaign && deleteMutation.mutate(selectedCampaign.id)}
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}




