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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  FolderPlus,
  Star,
  Eye,
  ThumbsUp,
  ThumbsDown,
  GripVertical,
  ChevronRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

interface FAQItem {
  id: string;
  category_id: string;
  question: string;
  answer: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
}

const DEFAULT_CATEGORY: Partial<FAQCategory> = {
  name: '',
  slug: '',
  description: '',
  icon: 'HelpCircle',
  display_order: 0,
  is_active: true
};

const DEFAULT_FAQ: Partial<FAQItem> = {
  category_id: '',
  question: '',
  answer: '',
  display_order: 0,
  is_featured: false,
  is_active: true
};

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState('faqs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'category' | 'faq'>('faq');
  const [selectedItem, setSelectedItem] = useState<FAQCategory | FAQItem | null>(null);
  const [categoryForm, setCategoryForm] = useState<Partial<FAQCategory>>(DEFAULT_CATEGORY);
  const [faqForm, setFaqForm] = useState<Partial<FAQItem>>(DEFAULT_FAQ);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-faq-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq_categories')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as FAQCategory[];
    }
  });

  // Fetch FAQ items
  const { data: faqItems, isLoading: faqsLoading } = useQuery({
    queryKey: ['admin-faq-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faq_items')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as FAQItem[];
    }
  });

  // Save category mutation
  const saveCategoryMutation = useMutation({
    mutationFn: async (data: Partial<FAQCategory>) => {
      if ((selectedItem as FAQCategory)?.id) {
        const { error } = await supabase
          .from('faq_categories')
          .update(data)
          .eq('id', (selectedItem as FAQCategory).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('faq_categories').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faq-categories'] });
      setIsCategoryModalOpen(false);
      setSelectedItem(null);
      setCategoryForm(DEFAULT_CATEGORY);
      toast({ title: "Saved!", description: "Category saved successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Save FAQ mutation
  const saveFAQMutation = useMutation({
    mutationFn: async (data: Partial<FAQItem>) => {
      if ((selectedItem as FAQItem)?.id) {
        const { error } = await supabase
          .from('faq_items')
          .update(data)
          .eq('id', (selectedItem as FAQItem).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('faq_items').insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] });
      setIsFAQModalOpen(false);
      setSelectedItem(null);
      setFaqForm(DEFAULT_FAQ);
      toast({ title: "Saved!", description: "FAQ saved successfully." });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItem) return;
      const table = deleteType === 'category' ? 'faq_categories' : 'faq_items';
      const { error } = await supabase.from(table).delete().eq('id', selectedItem.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deleteType === 'category' ? ['admin-faq-categories'] : ['admin-faq-items'] });
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      toast({ title: "Deleted!", description: `${deleteType === 'category' ? 'Category' : 'FAQ'} deleted successfully.` });
    }
  });

  // Toggle mutations
  const toggleFAQActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('faq_items').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] })
  });

  const toggleFAQFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase.from('faq_items').update({ is_featured }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-faq-items'] })
  });

  const handleEditCategory = (category: FAQCategory) => {
    setSelectedItem(category);
    setCategoryForm(category);
    setIsCategoryModalOpen(true);
  };

  const handleEditFAQ = (faq: FAQItem) => {
    setSelectedItem(faq);
    setFaqForm(faq);
    setIsFAQModalOpen(true);
  };

  const handleDeleteCategory = (category: FAQCategory) => {
    setSelectedItem(category);
    setDeleteType('category');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteFAQ = (faq: FAQItem) => {
    setSelectedItem(faq);
    setDeleteType('faq');
    setIsDeleteDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  // Filter FAQs
  const filteredFAQs = faqItems?.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group FAQs by category
  const faqsByCategory = categories?.reduce((acc, cat) => {
    acc[cat.id] = filteredFAQs?.filter(faq => faq.category_id === cat.id) || [];
    return acc;
  }, {} as Record<string, FAQItem[]>);

  const isLoading = categoriesLoading || faqsLoading;

  if (isLoading) {
    return (
      <AdminLayout title="FAQ Management">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="FAQ Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <HelpCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total FAQs</p>
                <p className="text-2xl font-bold text-white">{faqItems?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <FolderPlus className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-white">{categories?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Featured</p>
                <p className="text-2xl font-bold text-white">{faqItems?.filter(f => f.is_featured).length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#111111] border-[#2A2A2A]">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-white">{faqItems?.reduce((sum, f) => sum + f.view_count, 0) || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-[#111111] border-[#2A2A2A]">
          <CardHeader className="border-b border-[#2A2A2A]">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <TabsList className="bg-[#0A0A0A]">
                  <TabsTrigger value="faqs" className="data-[state=active]:bg-blue-600">FAQs</TabsTrigger>
                  <TabsTrigger value="categories" className="data-[state=active]:bg-blue-600">Categories</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-3">
                  {activeTab === 'faqs' && (
                    <>
                      <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search FAQs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-64 bg-[#1A1A1A] border-[#2A2A2A] text-white"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48 bg-[#1A1A1A] border-[#2A2A2A] text-white">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories?.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => {
                          setSelectedItem(null);
                          setFaqForm(DEFAULT_FAQ);
                          setIsFAQModalOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add FAQ
                      </Button>
                    </>
                  )}
                  {activeTab === 'categories' && (
                    <Button
                      onClick={() => {
                        setSelectedItem(null);
                        setCategoryForm(DEFAULT_CATEGORY);
                        setIsCategoryModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Category
                    </Button>
                  )}
                </div>
              </div>

              {/* FAQs Tab */}
              <TabsContent value="faqs" className="mt-6">
                {categories?.map(category => {
                  const categoryFAQs = faqsByCategory?.[category.id] || [];
                  if (selectedCategory !== 'all' && selectedCategory !== category.id) return null;
                  if (categoryFAQs.length === 0 && searchQuery) return null;
                  
                  return (
                    <div key={category.id} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                        <Badge variant="outline" className="text-gray-400 border-gray-600">
                          {categoryFAQs.length}
                        </Badge>
                      </div>
                      {categoryFAQs.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">No FAQs in this category</p>
                      ) : (
                        <Accordion type="single" collapsible className="space-y-2">
                          {categoryFAQs.map((faq) => (
                            <AccordionItem 
                              key={faq.id} 
                              value={faq.id}
                              className="border border-[#2A2A2A] rounded-lg bg-[#0A0A0A] px-4"
                            >
                              <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 text-left">
                                  <GripVertical className="w-4 h-4 text-gray-600" />
                                  <span className={`${faq.is_active ? 'text-white' : 'text-gray-500'}`}>
                                    {faq.question}
                                  </span>
                                  {faq.is_featured && (
                                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                  )}
                                  {!faq.is_active && (
                                    <Badge className="bg-gray-500/20 text-gray-400">Inactive</Badge>
                                  )}
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pb-4">
                                <div className="pl-7 space-y-4">
                                  <p className="text-gray-300 whitespace-pre-wrap">{faq.answer}</p>
                                  <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2A]">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Eye className="w-4 h-4" /> {faq.view_count}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <ThumbsUp className="w-4 h-4" /> {faq.helpful_count}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <ThumbsDown className="w-4 h-4" /> {faq.not_helpful_count}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFAQFeaturedMutation.mutate({ id: faq.id, is_featured: !faq.is_featured })}
                                        className={faq.is_featured ? 'text-amber-400' : 'text-gray-400'}
                                      >
                                        <Star className={`w-4 h-4 ${faq.is_featured ? 'fill-current' : ''}`} />
                                      </Button>
                                      <Switch
                                        checked={faq.is_active}
                                        onCheckedChange={(checked) => toggleFAQActiveMutation.mutate({ id: faq.id, is_active: checked })}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEditFAQ(faq)}
                                        className="text-gray-400 hover:text-white"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteFAQ(faq)}
                                        className="text-gray-400 hover:text-red-400"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </div>
                  );
                })}
              </TabsContent>

              {/* Categories Tab */}
              <TabsContent value="categories" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories?.map((category) => (
                    <div
                      key={category.id}
                      className="p-4 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] hover:border-[#3A3A3A] transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <HelpCircle className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{category.name}</h4>
                            <p className="text-xs text-gray-500">/{category.slug}</p>
                          </div>
                        </div>
                        <Badge className={category.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                          {category.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{category.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                        <span className="text-sm text-gray-500">
                          {faqItems?.filter(f => f.category_id === category.id).length || 0} FAQs
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>

      {/* Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedItem ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Name *</Label>
              <Input
                value={categoryForm.name || ''}
                onChange={(e) => {
                  setCategoryForm({ 
                    ...categoryForm, 
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  });
                }}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Slug</Label>
              <Input
                value={categoryForm.slug || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="category-slug"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Description</Label>
              <Textarea
                value={categoryForm.description || ''}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="Brief description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Display Order</Label>
                <Input
                  type="number"
                  value={categoryForm.display_order || 0}
                  onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={categoryForm.is_active}
                    onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_active: checked })}
                  />
                  <span className="text-gray-400">{categoryForm.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)} className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A]">
              Cancel
            </Button>
            <Button
              onClick={() => saveCategoryMutation.mutate(categoryForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={saveCategoryMutation.isPending || !categoryForm.name}
            >
              {saveCategoryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Modal */}
      <Dialog open={isFAQModalOpen} onOpenChange={setIsFAQModalOpen}>
        <DialogContent className="bg-[#111111] border-[#2A2A2A] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedItem ? 'Edit FAQ' : 'Add FAQ'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Category *</Label>
              <Select 
                value={faqForm.category_id || ''} 
                onValueChange={(v) => setFaqForm({ ...faqForm, category_id: v })}
              >
                <SelectTrigger className="bg-[#1A1A1A] border-[#2A2A2A] text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                  {categories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Question *</Label>
              <Input
                value={faqForm.question || ''}
                onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                placeholder="What is your question?"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Answer *</Label>
              <Textarea
                value={faqForm.answer || ''}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                className="bg-[#1A1A1A] border-[#2A2A2A] text-white min-h-[150px]"
                placeholder="Provide a detailed answer..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Display Order</Label>
                <Input
                  type="number"
                  value={faqForm.display_order || 0}
                  onChange={(e) => setFaqForm({ ...faqForm, display_order: parseInt(e.target.value) })}
                  className="bg-[#1A1A1A] border-[#2A2A2A] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Options</Label>
                <div className="flex items-center gap-4 h-10">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <Switch
                      checked={faqForm.is_featured}
                      onCheckedChange={(checked) => setFaqForm({ ...faqForm, is_featured: checked })}
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <Switch
                      checked={faqForm.is_active}
                      onCheckedChange={(checked) => setFaqForm({ ...faqForm, is_active: checked })}
                    />
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFAQModalOpen(false)} className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A]">
              Cancel
            </Button>
            <Button
              onClick={() => saveFAQMutation.mutate(faqForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={saveFAQMutation.isPending || !faqForm.question || !faqForm.answer || !faqForm.category_id}
            >
              {saveFAQMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#111111] border-[#2A2A2A]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete {deleteType === 'category' ? 'Category' : 'FAQ'}?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {deleteType === 'category' 
                ? 'This will also delete all FAQs in this category. This action cannot be undone.'
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[#2A2A2A] text-gray-300 hover:bg-[#1A1A1A]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}




