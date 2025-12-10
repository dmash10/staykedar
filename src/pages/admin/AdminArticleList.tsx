import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, FileText, Plus, Search, Loader2, Eye, Edit, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';

interface HelpArticle {
    id: string;
    title: string;
    slug: string;
    category_id: string;
    is_published: boolean;
    helpful_count: number;
    created_at: string;
    category?: {
        name: string;
        slug: string;
    };
}

export default function AdminArticleList() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    // Fetch categories
    const { data: categories } = useQuery({
        queryKey: ['help-categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('help_categories')
                .select('*')
                .order('name');
            if (error) throw error;
            return data;
        }
    });

    // Fetch articles
    const { data: articles, isLoading, refetch } = useQuery({
        queryKey: ['help-articles-admin', statusFilter, categoryFilter],
        queryFn: async () => {
            let query = supabase
                .from('help_articles')
                .select(`
                    *,
                    category:help_categories(name, slug)
                `)
                .order('created_at', { ascending: false });

            if (statusFilter === 'published') {
                query = query.eq('is_published', true);
            } else if (statusFilter === 'draft') {
                query = query.eq('is_published', false);
            }

            if (categoryFilter !== 'all') {
                query = query.eq('category_id', categoryFilter);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as HelpArticle[];
        }
    });

    const filteredArticles = articles?.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const deleteArticle = async (id: string) => {
        if (!confirm('Are you sure you want to delete this article?')) return;

        try {
            const { error } = await supabase
                .from('help_articles')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Article deleted successfully',
            });

            refetch();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: `Failed to delete article: ${error.message}`,
                variant: 'destructive',
            });
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search articles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-800 border-slate-700 text-slate-100"
                            />
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/admin/help/articles/new')}
                        className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Article
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-100">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-slate-100">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-slate-100">
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Articles Table */}
                <div className="border border-slate-800 rounded-lg bg-slate-900">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-slate-800/50">
                                    <TableHead className="text-slate-300">Title</TableHead>
                                    <TableHead className="text-slate-300">Category</TableHead>
                                    <TableHead className="text-slate-300">Status</TableHead>
                                    <TableHead className="text-slate-300">Helpful Count</TableHead>
                                    <TableHead className="text-slate-300">Created</TableHead>
                                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredArticles && filteredArticles.length > 0 ? (
                                    filteredArticles.map((article) => (
                                        <TableRow key={article.id} className="border-slate-800 hover:bg-slate-800/50">
                                            <TableCell className="font-medium text-slate-200">
                                                {article.title}
                                            </TableCell>
                                            <TableCell className="text-slate-400">
                                                {article.category?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={article.is_published ? 'default' : 'secondary'}>
                                                    {article.is_published ? 'Published' : 'Draft'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-400">
                                                {article.helpful_count}
                                            </TableCell>
                                            <TableCell className="text-slate-400">
                                                {new Date(article.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-100">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-100">
                                                        <DropdownMenuItem
                                                            onClick={() => window.open(`/help/article/${article.slug}`, '_blank')}
                                                            className="hover:bg-slate-700"
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => navigate(`/admin/help/articles/${article.id}`)}
                                                            className="hover:bg-slate-700"
                                                        >
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => deleteArticle(article.id)}
                                                            className="hover:bg-slate-700 text-red-400"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-slate-400 h-32">
                                            No articles found. Create your first article!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </>
    );
}
