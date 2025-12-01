import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Search, FileText, ArrowRight, BookOpen, Layers, Shield, CreditCard, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Icon mapping for categories
const iconMap: Record<string, any> = {
    'getting-started': BookOpen,
    'account-profile': User,
    'bookings-payments': CreditCard,
    'cancellation-refund-policy': Shield,
    'travel-guide': Layers,
};

export default function HelpArticlesBrowser() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch Categories
    const { data: categories } = useQuery({
        queryKey: ['help-categories'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('help_categories')
                .select('*')
                .order('sort_order');
            if (error) throw error;
            return data;
        }
    });

    // Fetch All Articles
    const { data: articles, isLoading } = useQuery({
        queryKey: ['all-help-articles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('help_articles')
                .select('*, category:help_categories(slug, name)')
                .eq('is_published', true)
                .order('helpful_count', { ascending: false });

            if (error) throw error;
            // Cast for type safety
            return data as unknown as {
                id: string;
                title: string;
                slug: string;
                content: string;
                helpful_count: number;
                category_id: string;
                category: { name: string; slug: string };
            }[];
        }
    });

    // Filter articles based on tab and search
    const filteredArticles = useMemo(() => {
        if (!articles) return [];

        let filtered = articles;

        // Filter by Category (Tab)
        if (activeTab !== 'all') {
            filtered = filtered.filter(article => article.category?.slug === activeTab);
        }

        // Filter by Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(query) ||
                article.content.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [articles, activeTab, searchQuery]);

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-10 w-32 bg-gray-100 rounded-full animate-pulse flex-shrink-0" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto no-scrollbar bg-transparent p-0 h-auto gap-2 border-b border-gray-200 pb-1 mb-6">
                    <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-all"
                    >
                        All Topics
                    </TabsTrigger>
                    {categories?.map(category => (
                        <TabsTrigger
                            key={category.id}
                            value={category.slug}
                            className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-all whitespace-nowrap"
                        >
                            {category.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Compact Articles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                        <Link
                            key={article.id}
                            to={`/help/article/${article.slug}`}
                            className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex items-start gap-4"
                        >
                            <div className="flex-shrink-0 mt-1">
                                <div className="bg-blue-50 text-blue-600 p-2 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <FileText className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex-grow min-w-0">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                                    {article.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                        {article.category?.name}
                                    </span>
                                    <span>•</span>
                                    <span>{Math.ceil(article.content.length / 500)} min read</span>
                                </div>
                            </div>
                            <div className="flex-shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200">
                                <ArrowRight className="w-4 h-4 text-blue-500" />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">No articles found in this category.</p>
                        <button
                            onClick={() => setActiveTab('all')}
                            className="mt-2 text-blue-600 text-sm font-medium hover:underline"
                        >
                            View all articles
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
