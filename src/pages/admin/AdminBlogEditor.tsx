import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TiptapEditor from '@/components/editor/TiptapEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Loader2, Save, ArrowLeft, Image as ImageIcon, X, Plus, 
    Tag, Upload, ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';

interface BlogPost {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    published: boolean;
    created_at?: string;
    updated_at?: string;
    featured_image: string | null;
    image_position: string; // top, center, bottom
    author: string | null;
    category: string | null;
    tags: string[];
    views: number;
    reading_time: number | null;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    is_featured: boolean;
}

interface BlogCategory {
    id: string;
    name: string;
    slug: string;
}

export default function AdminBlogEditor() {
    const { postId } = useParams<{ postId: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<BlogPost>({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        published: false,
        featured_image: null,
        image_position: 'center',
        author: 'StayKedarnath Team',
        category: null,
        tags: [],
        views: 0,
        reading_time: 5,
        meta_title: null,
        meta_description: null,
        meta_keywords: null,
        is_featured: false
    });
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchCategories();
        if (postId && postId !== 'new') {
            loadPost(postId);
        }
    }, [postId]);

    const fetchCategories = async () => {
        const { data } = await supabase
            .from('blog_categories')
            .select('id, name, slug')
            .eq('is_active', true)
            .order('name');
        if (data) setCategories(data);
    };

    const loadPost = async (id: string) => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (data) {
                setPost({
                    ...data,
                    tags: data.tags || [],
                    is_featured: data.is_featured || false,
                    image_position: data.image_position || 'center'
                });
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to load post: ${error.message}`,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPost(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (content: string) => {
        setPost(prev => ({ ...prev, content }));
    };

    const handleStatusChange = (value: string) => {
        setPost(prev => ({ ...prev, published: value === 'published' }));
    };

    const generateSlug = () => {
        const slug = post.title
            .toLowerCase()
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, '-');
        setPost(prev => ({ ...prev, slug }));
    };

    const calculateReadingTime = (content: string) => {
        const text = content.replace(/<[^>]*>/g, '');
        const words = text.split(/\s+/).length;
        return Math.max(1, Math.ceil(words / 200));
    };

    const addTag = () => {
        if (newTag.trim() && !post.tags.includes(newTag.trim())) {
            setPost(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setPost(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingImage(true);
            
            const fileExt = file.name.split('.').pop();
            const fileName = `blog-${Date.now()}.${fileExt}`;
            const filePath = `blog/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            setPost(prev => ({ ...prev, featured_image: publicUrl }));
            
            toast({
                title: 'Success',
                description: 'Image uploaded successfully',
            });
        } catch (error) {
            console.error('Error uploading image:', error);
            toast({
                title: 'Error',
                description: 'Failed to upload image. You can paste a URL instead.',
                variant: 'destructive',
            });
        } finally {
            setIsUploadingImage(false);
        }
    };

    const savePost = async () => {
        try {
            setIsSaving(true);

            let finalSlug = post.slug.trim();
            if (!finalSlug && post.title) {
                finalSlug = post.title
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

            const readingTime = calculateReadingTime(post.content);
            const now = new Date().toISOString();
            
            const postData = {
                title: post.title,
                slug: finalSlug,
                excerpt: post.excerpt,
                content: post.content,
                published: post.published,
                featured_image: post.featured_image,
                image_position: post.image_position,
                author: post.author,
                category: post.category,
                tags: post.tags,
                reading_time: readingTime,
                meta_title: post.title, // Use title as meta_title
                meta_description: post.excerpt, // Use excerpt as meta_description
                meta_keywords: post.meta_keywords,
                is_featured: post.is_featured,
                updated_at: now,
                created_at: post.created_at || now
            };

            let result;
            if (postId && postId !== 'new') {
                result = await supabase
                    .from('blog_posts')
                    .update(postData)
                    .eq('id', postId)
                    .select();
            } else {
                result = await supabase
                    .from('blog_posts')
                    .insert([postData])
                    .select();
            }

            if (result.error) {
                console.error('Supabase error:', result.error);
                throw result.error;
            }

            toast({
                title: 'Success',
                description: postId && postId !== 'new' ? 'Post updated successfully' : 'Post created successfully',
            });

            setPost(prev => ({ ...prev, slug: finalSlug }));

            if ((!postId || postId === 'new') && result.data && result.data[0]?.id) {
                navigate(`/admin/blog/${result.data[0].id}`);
            }
        } catch (error: any) {
            console.error('Error saving post:', error);
            const errorMessage = error?.message || error?.hint || 'Failed to save post';
            toast({
                title: 'Error',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const previewPost = () => {
        if (post.slug) {
            window.open(`/blog/${post.slug}`, '_blank');
        }
    };

    const pageTitle = postId && postId !== 'new' ? 'Edit Blog Post' : 'Create Blog Post';

    if (isLoading) {
        return (
            <AdminLayout title={pageTitle}>
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={pageTitle}>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/admin/blog')}
                        className="bg-[#0a0a0a] border-[#333333] hover:bg-[#1a1a1a] text-white"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    {post.slug && post.published && (
                        <Button
                            variant="outline"
                            onClick={previewPost}
                            className="bg-[#0a0a0a] border-[#333333] hover:bg-[#1a1a1a] text-white"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" /> Preview
                        </Button>
                    )}
                    <Button
                        onClick={savePost}
                        disabled={isSaving || !post.title}
                        className="bg-[#0a0a0a] border-[#333333] hover:bg-[#1a1a1a] text-white min-w-[100px]"
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
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Editor */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <Label htmlFor="title" className="text-white text-base">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={post.title}
                                    onChange={handleInputChange}
                                    placeholder="Enter post title"
                                    className="mt-1.5 bg-[#1a1a1a] border-[#333333] text-white text-lg"
                                />
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                <div className="col-span-3">
                                    <Label htmlFor="slug" className="text-white">URL Slug</Label>
                                    <div className="flex mt-1.5">
                                        <Input
                                            id="slug"
                                            name="slug"
                                            value={post.slug}
                                            onChange={handleInputChange}
                                            placeholder="post-url-slug"
                                            className="rounded-r-none bg-[#1a1a1a] border-[#333333] text-white"
                                        />
                                        <Button
                                            onClick={generateSlug}
                                            variant="secondary"
                                            className="rounded-l-none bg-[#2a2a2a] hover:bg-[#333333] text-white"
                                            type="button"
                                        >
                                            Generate
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="status" className="text-white">Status</Label>
                                    <Select
                                        value={post.published ? 'published' : 'draft'}
                                        onValueChange={handleStatusChange}
                                    >
                                        <SelectTrigger className="mt-1.5 bg-[#1a1a1a] border-[#333333] text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1a1a] border-[#333333] text-white">
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="excerpt" className="text-white">Excerpt / Meta Description</Label>
                                <Textarea
                                    id="excerpt"
                                    name="excerpt"
                                    value={post.excerpt}
                                    onChange={handleInputChange}
                                    placeholder="Brief description (shown in previews & search results)"
                                    className="mt-1.5 min-h-[80px] bg-[#1a1a1a] border-[#333333] text-white"
                                />
                                <p className="text-xs text-[#888888] mt-1">
                                    {post.excerpt.length}/160 characters recommended for SEO
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="meta_keywords" className="text-white">Meta Keywords</Label>
                                <Input
                                    id="meta_keywords"
                                    name="meta_keywords"
                                    value={post.meta_keywords || ''}
                                    onChange={handleInputChange}
                                    placeholder="kedarnath, pilgrimage, travel guide (comma separated)"
                                    className="mt-1.5 bg-[#1a1a1a] border-[#333333] text-white"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                        <CardContent className="p-6">
                            <Label className="text-white text-base mb-3 block">Content</Label>
                            <TiptapEditor
                                content={post.content}
                                onChange={handleContentChange}
                                placeholder="Start writing your blog post... Click 'Generate with AI' to auto-write!"
                                onAIMetadataGenerated={(metadata) => {
                                    setPost(prev => ({
                                        ...prev,
                                        title: metadata.title,
                                        slug: metadata.slug,
                                        excerpt: metadata.excerpt
                                    }));
                                    toast({
                                        title: "AI Generated Blog",
                                        description: "Title, slug, and excerpt have been auto-filled!",
                                    });
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Google Search Preview */}
                    <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-sm">Google Search Preview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-4">
                                <p className="text-blue-400 text-lg hover:underline cursor-pointer truncate font-medium">
                                    {post.title || 'Post Title'} | StayKedarnath Blog
                                </p>
                                <p className="text-green-400 text-sm truncate">
                                    staykedarnath.in › blog › {post.slug || 'post-slug'}
                                </p>
                                <p className="text-[#aaaaaa] text-sm mt-1 line-clamp-2">
                                    {post.excerpt || 'Your post excerpt will appear here as the search description...'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Featured Image */}
                    <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Featured Image (16:9)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {post.featured_image ? (
                                <div className="relative">
                                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-[#1a1a1a]">
                                        <img 
                                            src={post.featured_image} 
                                            alt="Featured" 
                                            className="w-full h-full object-cover"
                                            style={{ objectPosition: post.image_position }}
                                        />
                                    </div>
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-8 w-8 bg-red-600 hover:bg-red-700"
                                        onClick={() => setPost(prev => ({ ...prev, featured_image: null }))}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-[#333333] rounded-lg cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                                    {isUploadingImage ? (
                                        <Loader2 className="h-8 w-8 animate-spin text-[#888888]" />
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-[#888888] mb-2" />
                                            <span className="text-sm text-[#aaaaaa]">Click to upload (16:9)</span>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isUploadingImage}
                                    />
                                </label>
                            )}
                            
                            <div className="mt-3">
                                <Input
                                    placeholder="Or paste image URL"
                                    value={post.featured_image || ''}
                                    onChange={(e) => setPost(prev => ({ ...prev, featured_image: e.target.value || null }))}
                                    className="bg-[#1a1a1a] border-[#333333] text-white text-sm"
                                />
                            </div>

                            {/* Image Position Control */}
                            {post.featured_image && (
                                <div className="mt-3">
                                    <Label className="text-[#aaaaaa] text-xs mb-2 block">Image Focus Position</Label>
                                    <div className="flex gap-1">
                                        {['top', 'center', 'bottom'].map((pos) => (
                                            <button
                                                key={pos}
                                                type="button"
                                                onClick={() => setPost(prev => ({ ...prev, image_position: pos }))}
                                                className={`flex-1 py-1.5 text-xs rounded capitalize transition-colors ${
                                                    post.image_position === pos
                                                        ? 'bg-[#333333] text-white'
                                                        : 'bg-[#1a1a1a] text-[#aaaaaa] hover:bg-[#2a2a2a]'
                                                }`}
                                            >
                                                {pos}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Category */}
                    <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                        <CardContent className="p-4">
                            <Label className="text-white">Category</Label>
                            <Select 
                                value={post.category || ''} 
                                onValueChange={(value) => setPost(prev => ({ ...prev, category: value }))}
                            >
                                <SelectTrigger className="mt-1.5 bg-[#1a1a1a] border-[#333333] text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1a] border-[#333333] text-white">
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    {/* Author */}
                    <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                        <CardContent className="p-4">
                            <Label htmlFor="author" className="text-white">Author</Label>
                            <Input
                                id="author"
                                name="author"
                                value={post.author || ''}
                                onChange={handleInputChange}
                                placeholder="Author name"
                                className="mt-1.5 bg-[#1a1a1a] border-[#333333] text-white"
                            />
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-sm flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Tags
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-3">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add tag"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                    className="bg-[#1a1a1a] border-[#333333] text-white"
                                />
                                <Button type="button" size="icon" onClick={addTag} className="bg-[#2a2a2a] hover:bg-[#333333] text-white">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="bg-[#1a1a1a] text-white flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-400">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Featured Toggle */}
                    <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="is_featured" className="text-white">Featured Post</Label>
                                <Switch
                                    id="is_featured"
                                    checked={post.is_featured}
                                    onCheckedChange={(checked) => setPost(prev => ({ ...prev, is_featured: checked }))}
                                />
                            </div>
                            <p className="text-xs text-[#888888] mt-2">
                                Featured posts appear prominently on the blog homepage
                            </p>
                        </CardContent>
                    </Card>

                    {/* Statistics (only for existing posts) */}
                    {postId && postId !== 'new' && (
                        <Card className="bg-[#0a0a0a] border-[#2a2a2a]">
                            <CardContent className="p-4">
                                <Label className="text-white mb-2 block">Statistics</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-[#1a1a1a] p-3 rounded-lg text-center">
                                        <p className="text-xs text-[#aaaaaa]">Views</p>
                                        <p className="text-xl font-bold text-white">{post.views || 0}</p>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-3 rounded-lg text-center">
                                        <p className="text-xs text-[#aaaaaa]">Read Time</p>
                                        <p className="text-xl font-bold text-white">{post.reading_time || 5}m</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
