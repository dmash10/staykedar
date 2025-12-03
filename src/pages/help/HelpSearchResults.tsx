import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, HelpCircle, FileText, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Sparkles, ArrowRight, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import HelpCenterLayout from '@/components/help/HelpCenterLayout';

interface FAQ {
    id: string;
    question: string;
    answer: string;
    category_id: string;
    is_featured: boolean;
    view_count: number;
    helpful_count: number;
    not_helpful_count: number;
    faq_categories?: {
        name: string;
        slug: string;
    };
}

interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    category_id: string;
    views: number;
    reading_time?: number;
    help_categories?: {
        name: string;
        slug: string;
    };
}

export default function HelpSearchResults() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get('q') || '';
    const [searchInput, setSearchInput] = useState(query);
    const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

    // Fetch FAQs matching the query
    const { data: faqs = [], isLoading: faqsLoading } = useQuery({
        queryKey: ['search-faqs', query],
        queryFn: async () => {
            if (!query.trim()) return [];
            
            const { data, error } = await supabase
                .from('faq_items')
                .select(`
                    *,
                    faq_categories (name, slug)
                `)
                .eq('is_active', true)
                .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
                .order('is_featured', { ascending: false })
                .order('view_count', { ascending: false })
                .limit(10);
            
            if (error) {
                console.error('Error fetching FAQs:', error);
                return [];
            }
            return data || [];
        },
        enabled: !!query.trim(),
    });

    // Fetch Articles matching the query
    const { data: articles = [], isLoading: articlesLoading } = useQuery({
        queryKey: ['search-articles', query],
        queryFn: async (): Promise<Article[]> => {
            if (!query.trim()) return [];
            
            const { data, error } = await supabase
                .from('help_articles')
                .select(`
                    id, title, slug, content, excerpt, category_id, views, reading_time,
                    help_categories (name, slug)
                `)
                .eq('is_published', true)
                .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
                .order('views', { ascending: false })
                .limit(10);
            
            if (error) {
                console.error('Error fetching articles:', error);
                return [];
            }
            // Transform the data to match the interface
            return (data || []).map((item: any) => ({
                ...item,
                help_categories: item.help_categories?.[0] || item.help_categories || undefined
            }));
        },
        enabled: !!query.trim(),
    });

    const isLoading = faqsLoading || articlesLoading;
    const totalResults = faqs.length + articles.length;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            navigate(`/help/search?q=${encodeURIComponent(searchInput.trim())}`);
        }
    };

    const handleFaqFeedback = async (faqId: string, isHelpful: boolean) => {
        const column = isHelpful ? 'helpful_count' : 'not_helpful_count';
        try {
            const { data: currentFaq } = await supabase
                .from('faq_items')
                .select(column)
                .eq('id', faqId)
                .single();
            
            if (currentFaq) {
                await supabase
                    .from('faq_items')
                    .update({ [column]: (currentFaq[column] || 0) + 1 })
                    .eq('id', faqId);
            }
        } catch (error) {
            // Silently fail
        }
    };

    // Highlight matching text
    const highlightMatch = (text: string, query: string) => {
        if (!query.trim()) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900 px-0.5 rounded">$1</mark>');
    };

    return (
        <HelpCenterLayout showSearch={false}>
            {/* Search Header */}
            <section className="bg-gradient-to-br from-[#0A1628] via-[#0F2167] to-[#1E3A8A] py-8 md:py-12">
                <div className="max-w-3xl mx-auto px-4">
                    {/* Back Button */}
                    <Link 
                        to="/help" 
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Help Center
                    </Link>

                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Search Results
                    </h1>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="relative">
                        <div className="flex items-center bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="pl-4">
                                <Search className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search for help..."
                                className="flex-1 px-3 py-4 text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none text-base"
                            />
                            <div className="pr-2">
                                <Button 
                                    type="submit"
                                    className="bg-[#0071c2] hover:bg-[#005999] text-white rounded-lg px-5 py-2"
                                >
                                    Search
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>

            {/* Results Section */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                {!query.trim() ? (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Enter a search term</h2>
                        <p className="text-gray-500">Type something in the search box above to find help articles and FAQs</p>
                    </div>
                ) : isLoading ? (
                    <div className="text-center py-12">
                        <div className="w-8 h-8 border-2 border-[#0071c2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Searching...</p>
                    </div>
                ) : totalResults === 0 ? (
                    <div className="text-center py-12">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">No results found</h2>
                        <p className="text-gray-500 mb-6">
                            We couldn't find anything matching "{query}"
                        </p>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-500">Try:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Using different keywords</li>
                                <li>• Checking your spelling</li>
                                <li>• Using more general terms</li>
                            </ul>
                        </div>
                        <div className="mt-8">
                            <Link to="/help/contact">
                                <Button className="bg-[#0071c2] hover:bg-[#005999]">
                                    Contact Support
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Results Summary */}
                        <div className="mb-6">
                            <p className="text-gray-600">
                                Found <span className="font-semibold text-gray-900">{totalResults}</span> results for "{query}"
                            </p>
                        </div>

                        {/* FAQ Results */}
                        {faqs.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <HelpCircle className="w-5 h-5 text-[#0071c2]" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Frequently Asked Questions ({faqs.length})
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {faqs.map((faq) => (
                                        <div
                                            key={faq.id}
                                            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <button
                                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                                className="w-full flex items-center justify-between p-4 text-left"
                                            >
                                                <div className="flex items-start gap-3 flex-1">
                                                    {faq.is_featured && (
                                                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <span 
                                                        className="font-medium text-gray-900"
                                                        dangerouslySetInnerHTML={{ __html: highlightMatch(faq.question, query) }}
                                                    />
                                                </div>
                                                {expandedFaq === faq.id ? (
                                                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                )}
                                            </button>

                                            {expandedFaq === faq.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="border-t border-gray-100"
                                                >
                                                    <div className="p-4 bg-gray-50">
                                                        <p 
                                                            className="text-gray-600 leading-relaxed"
                                                            dangerouslySetInnerHTML={{ __html: highlightMatch(faq.answer, query) }}
                                                        />
                                                        
                                                        {/* Category Tag */}
                                                        {faq.faq_categories && (
                                                            <div className="mt-4">
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                                                    {faq.faq_categories.name}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Feedback */}
                                                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                                                            <span className="text-sm text-gray-500">Was this helpful?</span>
                                                            <button
                                                                onClick={() => handleFaqFeedback(faq.id, true)}
                                                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors"
                                                            >
                                                                <ThumbsUp className="w-4 h-4" />
                                                                <span>{faq.helpful_count || 0}</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleFaqFeedback(faq.id, false)}
                                                                className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors"
                                                            >
                                                                <ThumbsDown className="w-4 h-4" />
                                                                <span>{faq.not_helpful_count || 0}</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Article Results */}
                        {articles.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="w-5 h-5 text-[#0071c2]" />
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Help Articles ({articles.length})
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {articles.map((article) => (
                                        <Link
                                            key={article.id}
                                            to={`/help/articles/${article.slug}`}
                                            className="block bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm hover:shadow-lg hover:border-[#0071c2]/40 transition-all group relative overflow-hidden"
                                        >
                                            {/* Decorative accent - always visible on mobile */}
                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0071c2] to-[#005999] md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                                            
                                            <div className="flex items-start gap-4">
                                                {/* Icon */}
                                                <div className="bg-[#0071c2]/10 md:bg-blue-50 p-2.5 rounded-xl text-[#0071c2] md:group-hover:bg-[#0071c2] md:group-hover:text-white transition-colors flex-shrink-0">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <h3 
                                                        className="font-semibold text-gray-900 md:group-hover:text-[#0071c2] transition-colors mb-1.5"
                                                        dangerouslySetInnerHTML={{ __html: highlightMatch(article.title, query) }}
                                                    />
                                                    {(article.excerpt || article.content) && (
                                                        <p 
                                                            className="text-sm text-gray-500 line-clamp-2 mb-2"
                                                            dangerouslySetInnerHTML={{ __html: highlightMatch(
                                                                article.excerpt || article.content.replace(/<[^>]*>/g, '').substring(0, 150), 
                                                                query
                                                            ) }}
                                                        />
                                                    )}
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        {article.help_categories && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#0071c2]/10 text-[#0071c2] border border-[#0071c2]/20">
                                                                {article.help_categories.name}
                                                            </span>
                                                        )}
                                                        {article.reading_time && (
                                                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                                                                <Clock className="w-3 h-3" />
                                                                {article.reading_time} min read
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Arrow - always visible on mobile */}
                                                <div className="flex-shrink-0 bg-gray-100 md:bg-transparent p-1.5 rounded-full md:group-hover:bg-[#0071c2]/10 transition-colors">
                                                    <ArrowRight className="w-4 h-4 text-[#0071c2] md:text-gray-300 md:group-hover:text-[#0071c2] transition-colors" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Still Need Help */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mt-10 p-6 bg-gradient-to-br from-[#0071c2] to-[#005999] rounded-2xl text-white text-center"
                        >
                            <h3 className="text-lg font-semibold mb-2">Still need help?</h3>
                            <p className="text-white/80 text-sm mb-4">
                                Can't find what you're looking for? Our support team is here to help.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link to="/help/contact">
                                    <Button variant="secondary" className="bg-white text-[#0071c2] hover:bg-gray-100 w-full sm:w-auto">
                                        Contact Support
                                    </Button>
                                </Link>
                                <Link to="/help/faq">
                                    <Button variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                                        Browse All FAQs
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>
        </HelpCenterLayout>
    );
}

