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
  Mail, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  Eye,
  Code,
  Copy,
  CheckCircle,
  Calendar,
  CreditCard,
  User,
  Send
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  description: string;
  variables: string[];
  is_active: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: 'booking', label: 'Booking', icon: Calendar },
  { value: 'account', label: 'Account', icon: User },
  { value: 'payment', label: 'Payment', icon: CreditCard },
  { value: 'general', label: 'General', icon: Mail },
];

const DEFAULT_FORM: Partial<EmailTemplate> = {
  name: '',
  subject: '',
  body: '',
  description: '',
  variables: [],
  is_active: true,
  category: 'general'
};

export default function EmailTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<EmailTemplate>>(DEFAULT_FORM);
  const [newVariable, setNewVariable] = useState('');
  const [activeTab, setActiveTab] = useState('editor');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['admin-email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('category')
        .order('name');
      if (error) throw error;
      return data as EmailTemplate[];
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<EmailTemplate>) => {
      if (selectedTemplate) {
        const { error } = await supabase
          .from('email_templates')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', selectedTemplate.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('email_templates').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-templates'] });
      setIsModalOpen(false);
      setSelectedTemplate(null);
      setFormData(DEFAULT_FORM);
      toast({ title: "Saved!", description: "Email template saved successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('email_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-email-templates'] });
      setIsDeleteDialogOpen(false);
      setSelectedTemplate(null);
      toast({ title: "Deleted!", description: "Email template deleted successfully." });
    }
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('email_templates').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-email-templates'] })
  });

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData(template);
    setIsModalOpen(true);
  };

  const handleDelete = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteDialogOpen(true);
  };

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewOpen(true);
  };

  const addVariable = () => {
    if (newVariable && !formData.variables?.includes(newVariable)) {
      setFormData({
        ...formData,
        variables: [...(formData.variables || []), newVariable]
      });
      setNewVariable('');
    }
  };

  const removeVariable = (variable: string) => {
    setFormData({
      ...formData,
      variables: formData.variables?.filter(v => v !== variable)
    });
  };

  const copyVariable = (variable: string) => {
    navigator.clipboard.writeText(`{{${variable}}}`);
    toast({ title: "Copied!", description: `Variable {{${variable}}} copied to clipboard.` });
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat?.icon || Mail;
  };

  // Filter templates
  const filteredTemplates = templates?.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <AdminLayout title="Email Templates">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Email Templates">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 rounded-lg">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-xl font-bold text-white">{templates?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Active</p>
                <p className="text-xl font-bold text-white">{templates?.filter(t => t.is_active).length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Booking</p>
                <p className="text-xl font-bold text-white">{templates?.filter(t => t.category === 'booking').length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <User className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Account</p>
                <p className="text-xl font-bold text-white">{templates?.filter(t => t.category === 'account').length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Email Templates
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-56 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-36 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setFormData(DEFAULT_FORM);
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Create Template</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {filteredTemplates?.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No templates found</h3>
                <p className="text-gray-500">Create your first email template</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTemplates?.map((template) => {
                  const CategoryIcon = getCategoryIcon(template.category);
                  return (
                    <div
                      key={template.id}
                      className={`p-4 rounded-xl border ${
                        template.is_active 
                          ? 'border-[#2A2A2A] bg-[#0A0A0A]' 
                          : 'border-[#2A2A2A] bg-[#0A0A0A] opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            template.category === 'booking' ? 'bg-purple-500/10' :
                            template.category === 'account' ? 'bg-amber-500/10' :
                            template.category === 'payment' ? 'bg-green-500/10' :
                            'bg-blue-500/10'
                          }`}>
                            <CategoryIcon className={`w-4 h-4 ${
                              template.category === 'booking' ? 'text-purple-400' :
                              template.category === 'account' ? 'text-amber-400' :
                              template.category === 'payment' ? 'text-green-400' :
                              'text-blue-400'
                            }`} />
                          </div>
                          <div>
                            <h4 className="font-medium text-white text-sm">{template.name.replace(/_/g, ' ')}</h4>
                            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600 mt-1">
                              {template.category}
                            </Badge>
                          </div>
                        </div>
                        <Switch
                          checked={template.is_active}
                          onCheckedChange={(checked) => toggleActiveMutation.mutate({ id: template.id, is_active: checked })}
                        />
                      </div>

                      <p className="text-xs text-gray-500 mb-2">Subject:</p>
                      <p className="text-sm text-gray-300 mb-3 line-clamp-1">{template.subject}</p>

                      {template.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                      )}

                      {template.variables && template.variables.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {template.variables.slice(0, 3).map((variable) => (
                            <code key={variable} className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">
                              {`{{${variable}}}`}
                            </code>
                          ))}
                          {template.variables.length > 3 && (
                            <span className="text-xs text-gray-500">+{template.variables.length - 3} more</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1 pt-3 border-t border-[#2A2A2A]">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(template)}
                          className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(template)}
                          className="text-gray-400 hover:text-white hover:bg-[#2A2A2A]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template)}
                          className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              {selectedTemplate ? 'Edit Template' : 'Create Template'}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="bg-[#0A0A0A] w-full sm:w-auto">
              <TabsTrigger value="editor" className="data-[state=active]:bg-blue-600 flex-1 sm:flex-none">
                <Code className="w-4 h-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-blue-600 flex-1 sm:flex-none">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4 mt-4">
              {/* Basic Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-gray-300">Template Name *</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                    placeholder="booking_confirmation"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Category</Label>
                  <Select 
                    value={formData.category || 'general'} 
                    onValueChange={(v) => setFormData({ ...formData, category: v })}
                  >
                    <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Description</Label>
                <Input
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="When this email is sent..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Subject Line *</Label>
                <Input
                  value={formData.subject || ''}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                  placeholder="Your booking is confirmed - {{booking_id}}"
                />
              </div>

              {/* Variables */}
              <div className="space-y-2">
                <Label className="text-gray-300">Variables</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.variables?.map((variable) => (
                    <Badge
                      key={variable}
                      className="bg-blue-500/20 text-blue-400 border-blue-500/30 cursor-pointer hover:bg-blue-500/30"
                      onClick={() => copyVariable(variable)}
                    >
                      {`{{${variable}}}`}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeVariable(variable);
                        }}
                        className="ml-2 hover:text-red-400"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white flex-1"
                    placeholder="customer_name"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariable())}
                  />
                  <Button
                    type="button"
                    onClick={addVariable}
                    className="bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <Label className="text-gray-300">Email Body (HTML) *</Label>
                <Textarea
                  value={formData.body || ''}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white font-mono text-sm min-h-[250px]"
                  placeholder="<h1>Hello {{customer_name}}</h1>..."
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label className="text-gray-300">Active</Label>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-4">
              <div className="p-4 rounded-lg border border-[#2A2A2A] bg-white">
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <p className="text-sm text-gray-500">Subject:</p>
                  <p className="text-gray-900 font-medium">{formData.subject || 'No subject'}</p>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formData.body || '<p>No content</p>' }}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
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
                selectedTemplate ? 'Update Template' : 'Create Template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="bg-white text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Email Preview</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="border-b border-gray-200 pb-3 mb-4">
              <p className="text-sm text-gray-500">Subject:</p>
              <p className="text-gray-900 font-medium">{selectedTemplate?.subject}</p>
            </div>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedTemplate?.body || '' }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Template?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedTemplate?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A] w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTemplate && deleteMutation.mutate(selectedTemplate.id)}
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




