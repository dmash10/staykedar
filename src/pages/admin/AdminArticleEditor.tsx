import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TiptapArticleEditor from '@/components/editor/TiptapArticleEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';

interface HelpArticle {
    id?: string;
    title: string;
    slug: string;
    content: string;
    category_id: string;
    is_published: boolean;
    helpful_count?: number;
    created_at?: string;
    updated_at?: string;
}

interface HelpCategory {
    id: string;
    name: string;
    slug: string;
}

export default function AdminArticleEditor() {
    const { articleId } = useParams<{ articleId: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<HelpArticle>({
        title: '',
        slug: '',
        content: '',
        category_id: '',
        is_published: false,
        helpful_count: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    // Fetch categories
    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['help-categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('help_categories')
                .select('*')
                .order('name');
            if (error) throw error;
            return data as HelpCategory[];
        }
    });

    useEffect(() => {
        if (articleId && articleId !== 'new') {
            loadArticle(articleId);
        }
    }, [articleId]);

    const loadArticle = async (id: string) => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('help_articles')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setArticle(data);
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to load article: ${error.message}`,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setArticle(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content: string) => {
        setArticle(prev => ({ ...prev, content }));
    };

    const handleStatusChange = (value: string) => {
        setArticle(prev => ({ ...prev, is_published: value === 'published' }));
    };

    const handleCategoryChange = (value: string) => {
        setArticle(prev => ({ ...prev, category_id: value }));
    };

    const generateSlug = () => {
        const slug = article.title
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
        setArticle(prev => ({ ...prev, slug }));
    };

    const saveArticle = async () => {
        try {
            setIsSaving(true);

            let finalSlug = article.slug.trim();
            if (!finalSlug && article.title) {
                finalSlug = article.title
                    .toLowerCase()
                    .replace(/[^\w\s]/gi, '')
                    .replace(/\s+/g, '-');
            }

            if (!finalSlug) {
                toast({
                    title: 'Error',
                    description: 'Please enter a title to generate a slug',
                    variant: 'destructive',
                });
                setIsSaving(false);
                return;
            }

            if (!article.category_id) {
                toast({
                    title: 'Error',
                    description: 'Please select a category',
                    variant: 'destructive',
                });
                setIsSaving(false);
                return;
            }

            const now = new Date().toISOString();
            const articleData = {
                title: article.title,
                slug: finalSlug,
                content: article.content,
                category_id: article.category_id,
                is_published: article.is_published,
                helpful_count: article.helpful_count || 0,
                updated_at: now,
                created_at: article.created_at || now
            };

            let result;
            if (articleId && articleId !== 'new') {
                result = await supabase
                    .from('help_articles')
                    .update(articleData)
                    .eq('id', articleId)
                    .select();
            } else {
                result = await supabase
                    .from('help_articles')
                    .insert([articleData])
                    .select();
            }

            if (result.error) {
                console.error('Supabase error:', result.error);
                throw result.error;
            }

            toast({
                title: 'Success',
                description: articleId && articleId !== 'new' ? 'Article updated successfully' : 'Article created successfully',
            });

            setArticle(prev => ({ ...prev, slug: finalSlug }));

            if ((!articleId || articleId === 'new') && result.data && result.data[0]?.id) {
                navigate(`/admin/help/articles/${result.data[0].id}`);
            }
        } catch (error: any) {
            console.error('Error saving article:', error);
            const errorMessage = error?.message || error?.hint || 'Failed to save article';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const pageTitle = articleId && articleId !== 'new' ? 'Edit Help Article' : 'Create Help Article';

    if (isLoading || categoriesLoading) {
        return (
            <AdminLayout title={pageTitle}>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={pageTitle}>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/help/articles')}
                        className="bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Articles
                    </Button>
                </div>

                <Button
                    onClick={saveArticle}
                    disabled={isSaving || !article.title || !article.category_id}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[100px]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" /> Save
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6">
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <div className="grid gap-4">
                            <div>
                                <Label htmlFor="title" className="text-slate-200 text-base">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={article.title}
                                    onChange={handleInputChange}
                                    placeholder="Article title"
                                    className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="slug" className="text-slate-200 text-base">Slug</Label>
                                    <div className="flex mt-1.5">
                                        <Input
                                            id="slug"
                                            name="slug"
                                            value={article.slug}
                                            onChange={handleInputChange}
                                            placeholder="article-slug"
                                            className="rounded-r-none bg-slate-800 border-slate-700 text-slate-100"
                                        />
                                        <Button
                                            onClick={generateSlug}
                                            variant="secondary"
                                            className="rounded-l-none bg-slate-700 hover:bg-slate-600"
                                            type="button"
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="category" className="text-slate-200 text-base">Category</Label>
                                    <Select
                                        value={article.category_id}
                                        onValueChange={handleCategoryChange}
                                    >
                                        <SelectTrigger className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                            {categories?.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="status" className="text-slate-200 text-base">Status</Label>
                                <Select
                                    value={article.is_published ? 'published' : 'draft'}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <Label htmlFor="content" className="text-slate-200 text-base mb-3 block">Content</Label>
                        <TiptapArticleEditor
                            content={article.content}
                            onChange={handleContentChange}
                            placeholder="Start writing your help article... Click 'AI Assistant' to auto-write!"
                            categoryName={categories?.find(c => c.id === article.category_id)?.name}
                            onAIMetadataGenerated={(metadata) => {
                                setArticle(prev => ({
                                    ...prev,
                                    title: metadata.title,
                                    slug: metadata.slug
                                }));
                                toast({
                                    title: "AI Generated Article",
                                    description: "Title and slug have been auto-filled!",
                                });
                            }}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
