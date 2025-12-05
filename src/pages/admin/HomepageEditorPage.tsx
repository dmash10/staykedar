import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  LayoutTemplate, 
  Edit, 
  Loader2,
  Eye,
  EyeOff,
  GripVertical,
  Save,
  Home,
  Image,
  Package,
  MapPin,
  MessageSquare,
  Award,
  MousePointer
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HomepageSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string;
  content: any;
  is_visible: boolean;
  display_order: number;
  settings: any;
  updated_at: string;
}

const SECTION_ICONS: Record<string, any> = {
  hero: Home,
  featured_properties: Image,
  packages: Package,
  attractions: MapPin,
  testimonials: MessageSquare,
  why_us: Award,
  cta: MousePointer
};

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  featured_properties: 'Featured Properties',
  packages: 'Curated Packages',
  attractions: 'Nearby Attractions',
  testimonials: 'Testimonials',
  why_us: 'Why Choose Us',
  cta: 'Call to Action'
};

export default function HomepageEditorPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<HomepageSection | null>(null);
  const [formData, setFormData] = useState<Partial<HomepageSection>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sections
  const { data: sections, isLoading } = useQuery({
    queryKey: ['admin-homepage-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as HomepageSection[];
    }
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<HomepageSection>) => {
      if (!selectedSection) return;
      const { error } = await supabase
        .from('homepage_sections')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', selectedSection.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
      setIsModalOpen(false);
      setSelectedSection(null);
      toast({ title: "Saved!", description: "Section updated successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Toggle visibility mutation
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ is_visible, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-sections'] });
    }
  });

  const handleEdit = (section: HomepageSection) => {
    setSelectedSection(section);
    setFormData(section);
    setIsModalOpen(true);
  };

  const updateSettings = (key: string, value: any) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [key]: value
      }
    });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Homepage Editor">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Homepage Editor">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Homepage Sections</h2>
            <p className="text-sm text-gray-400">Customize your homepage content and layout</p>
          </div>
          <Button
            onClick={() => window.open('/', '_blank')}
            variant="outline"
            className="border-[#3A3A3A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A]"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Homepage
          </Button>
        </div>

        {/* Sections List */}
        <div className="space-y-4">
          {sections?.map((section, index) => {
            const Icon = SECTION_ICONS[section.section_key] || LayoutTemplate;
            return (
              <Card 
                key={section.id} 
                className={`bg-[#111111] border-[#2A2A2A] ${!section.is_visible ? 'opacity-60' : ''}`}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <GripVertical className="w-5 h-5" />
                        <span className="text-sm font-mono">{index + 1}</span>
                      </div>
                      <div className={`p-3 rounded-lg ${section.is_visible ? 'bg-blue-500/10' : 'bg-gray-500/10'}`}>
                        <Icon className={`w-5 h-5 ${section.is_visible ? 'text-blue-400' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {SECTION_LABELS[section.section_key] || section.section_key}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-1">
                          {section.title || 'No title set'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-auto sm:ml-0">
                      <Badge className={section.is_visible ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                        {section.is_visible ? 'Visible' : 'Hidden'}
                      </Badge>
                      <Switch
                        checked={section.is_visible}
                        onCheckedChange={(checked) => toggleVisibilityMutation.mutate({ id: section.id, is_visible: checked })}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(section)}
                        className="border-[#3A3A3A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A]"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>

                  {/* Section Preview */}
                  <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Title</p>
                        <p className="text-gray-300 truncate">{section.title || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Subtitle</p>
                        <p className="text-gray-300 truncate">{section.subtitle || '-'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Order</p>
                        <p className="text-gray-300">{section.display_order}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Updated</p>
                        <p className="text-gray-300">{new Date(section.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-blue-400" />
              Edit {SECTION_LABELS[selectedSection?.section_key || ''] || 'Section'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label className="text-gray-300">Section Title</Label>
              <Input
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Section title"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Subtitle</Label>
              <Textarea
                value={formData.subtitle || ''}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Section subtitle or description"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-gray-300">Display Order</Label>
                <Input
                  type="number"
                  value={formData.display_order || 0}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Visibility</Label>
                <div className="flex items-center gap-3 h-10">
                  <Switch
                    checked={formData.is_visible}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                  />
                  <span className="text-gray-400">{formData.is_visible ? 'Visible' : 'Hidden'}</span>
                </div>
              </div>
            </div>

            {/* Section-specific Settings */}
            <div className="space-y-4 pt-4 border-t border-[#2A2A2A]">
              <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Section Settings</h4>
              
              {selectedSection?.section_key === 'hero' && (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]">
                    <Switch
                      checked={formData.settings?.show_search}
                      onCheckedChange={(checked) => updateSettings('show_search', checked)}
                    />
                    <Label className="text-gray-300">Show Search Bar</Label>
                  </div>
                </>
              )}

              {(selectedSection?.section_key === 'featured_properties' || 
                selectedSection?.section_key === 'packages' ||
                selectedSection?.section_key === 'attractions') && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Maximum Items to Show</Label>
                  <Input
                    type="number"
                    value={formData.settings?.max_items || 6}
                    onChange={(e) => updateSettings('max_items', parseInt(e.target.value))}
                    className="bg-[#1A1A1A] border-[#2A2A2A] text-white w-32"
                  />
                </div>
              )}

              {selectedSection?.section_key === 'testimonials' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Maximum Testimonials</Label>
                    <Input
                      type="number"
                      value={formData.settings?.max_items || 4}
                      onChange={(e) => updateSettings('max_items', parseInt(e.target.value))}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white w-32"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1A1A]">
                    <Switch
                      checked={formData.settings?.show_ratings}
                      onCheckedChange={(checked) => updateSettings('show_ratings', checked)}
                    />
                    <Label className="text-gray-300">Show Star Ratings</Label>
                  </div>
                </>
              )}

              {selectedSection?.section_key === 'cta' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Button Text</Label>
                    <Input
                      value={formData.settings?.button_text || ''}
                      onChange={(e) => updateSettings('button_text', e.target.value)}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      placeholder="Explore Stays"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Button Link</Label>
                    <Input
                      value={formData.settings?.button_link || ''}
                      onChange={(e) => updateSettings('button_link', e.target.value)}
                      className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                      placeholder="/stays"
                    />
                  </div>
                </>
              )}
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
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" />Save Changes</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}




