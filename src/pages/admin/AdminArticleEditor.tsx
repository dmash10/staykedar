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
import { Loader2, Save, ArrowLeft, ChevronDown, ChevronUp, Search, Image, Clock, User } from 'lucide-react';
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
    // New SEO fields
    excerpt?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    featured_image?: string;
    reading_time?: number;
    author?: string;
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
        helpful_count: 0,
        excerpt: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        featured_image: '',
        reading_time: 5,
        author: 'StayKedarnath Team'
    });
    const [showSeoSection, setShowSeoSection] = useState(false);
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
                created_at: article.created_at || now,
                // SEO fields
                excerpt: article.excerpt || '',
                meta_title: article.meta_title || article.title,
                meta_description: article.meta_description || article.excerpt || '',
                meta_keywords: article.meta_keywords || '',
                featured_image: article.featured_image || '',
                reading_time: article.reading_time || 5,
                author: article.author || 'StayKedarnath Team'
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div>
                                    <Label htmlFor="author" className="text-slate-200 text-base">Author</Label>
                                    <Input
                                        id="author"
                                        name="author"
                                        value={article.author || ''}
                                        onChange={handleInputChange}
                                        placeholder="Author name"
                                        className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
                                    />
                                </div>
                            </div>

                            {/* Excerpt */}
                            <div>
                                <Label htmlFor="excerpt" className="text-slate-200 text-base">
                                    Excerpt / Summary
                                    <span className="text-slate-400 text-sm ml-2">(Shows in article previews)</span>
                                </Label>
                                <Textarea
                                    id="excerpt"
                                    name="excerpt"
                                    value={article.excerpt || ''}
                                    onChange={handleInputChange}
                                    placeholder="A brief summary of the article (150-200 characters recommended)"
                                    className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100 min-h-[80px]"
                                    maxLength={300}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {(article.excerpt || '').length}/300 characters
                                </p>
                            </div>

                            {/* Reading Time & Featured Image */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="reading_time" className="text-slate-200 text-base flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> Reading Time (minutes)
                                    </Label>
                                    <Input
                                        id="reading_time"
                                        name="reading_time"
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={article.reading_time || 5}
                                        onChange={(e) => setArticle(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 5 }))}
                                        className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="featured_image" className="text-slate-200 text-base flex items-center gap-2">
                                        <Image className="w-4 h-4" /> Featured Image URL
                                    </Label>
                                    <Input
                                        id="featured_image"
                                        name="featured_image"
                                        value={article.featured_image || ''}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/image.jpg"
                                        className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* SEO Section - Collapsible */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardContent className="p-6">
                        <button
                            type="button"
                            onClick={() => setShowSeoSection(!showSeoSection)}
                            className="w-full flex items-center justify-between text-left"
                        >
                            <div className="flex items-center gap-2">
                                <Search className="w-5 h-5 text-blue-400" />
                                <Label className="text-slate-200 text-base cursor-pointer">SEO Settings</Label>
                                <span className="text-xs text-slate-500">(Optional but recommended)</span>
                            </div>
                            {showSeoSection ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                        </button>

                        {showSeoSection && (
                            <div className="grid gap-4 mt-4 pt-4 border-t border-slate-800">
                                <div>
                                    <Label htmlFor="meta_title" className="text-slate-200 text-base">
                                        Meta Title
                                        <span className="text-slate-400 text-sm ml-2">(60 chars max)</span>
                                    </Label>
                                    <Input
                                        id="meta_title"
                                        name="meta_title"
                                        value={article.meta_title || ''}
                                        onChange={handleInputChange}
                                        placeholder="SEO title for search engines"
                                        className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
                                        maxLength={60}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        {(article.meta_title || '').length}/60 characters
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="meta_description" className="text-slate-200 text-base">
                                        Meta Description
                                        <span className="text-slate-400 text-sm ml-2">(160 chars max)</span>
                                    </Label>
                                    <Textarea
                                        id="meta_description"
                                        name="meta_description"
                                        value={article.meta_description || ''}
                                        onChange={handleInputChange}
                                        placeholder="Brief description for search engine results"
                                        className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100 min-h-[80px]"
                                        maxLength={160}
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        {(article.meta_description || '').length}/160 characters
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="meta_keywords" className="text-slate-200 text-base">
                                        Meta Keywords
                                        <span className="text-slate-400 text-sm ml-2">(comma separated)</span>
                                    </Label>
                                    <Input
                                        id="meta_keywords"
                                        name="meta_keywords"
                                        value={article.meta_keywords || ''}
                                        onChange={handleInputChange}
                                        placeholder="kedarnath, booking, travel, help"
                                        className="mt-1.5 bg-slate-800 border-slate-700 text-slate-100"
                                    />
                                </div>

                                {/* SEO Preview */}
                                <div className="mt-4 p-4 bg-slate-950 rounded-lg border border-slate-800">
                                    <p className="text-xs text-slate-500 mb-2">Search Engine Preview:</p>
                                    <div className="space-y-1">
                                        <p className="text-blue-400 text-lg hover:underline cursor-pointer truncate">
                                            {article.meta_title || article.title || 'Article Title'}
                                        </p>
                                        <p className="text-green-500 text-sm">
                                            staykedarnath.in/help/article/{article.slug || 'article-slug'}
                                        </p>
                                        <p className="text-slate-400 text-sm line-clamp-2">
                                            {article.meta_description || article.excerpt || 'Article description will appear here...'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
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
