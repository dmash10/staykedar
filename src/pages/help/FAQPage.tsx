import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Helmet } from 'react-helmet';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search,
    HelpCircle,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface FAQCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    faq_count?: number;
}

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category_id: string;
    is_featured: boolean;
    view_count: number;
    helpful_count: number;
    not_helpful_count: number;
    faq_categories?: FAQCategory;
}

export default function FAQPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryFromUrl = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(queryFromUrl);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'helpful' | 'not_helpful'>>({});

    // Update search query when URL param changes
    useEffect(() => {
        if (queryFromUrl) {
            setSearchQuery(queryFromUrl);
        }
    }, [queryFromUrl]);

    // Fetch FAQ categories
    const { data: categories = [] } = useQuery({
        queryKey: ['faq-categories-full'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('faq_categories')
                .select('*, faq_items(count)')
                .eq('is_active', true)
                .order('display_order', { ascending: true });
            
            if (error) {
                console.error('Error fetching FAQ categories:', error);
                return [];
            }
            return data || [];
        },
        staleTime: 60000,
    });

    // Fetch FAQ items
    const { data: faqs = [] } = useQuery({
        queryKey: ['faq-items-full', selectedCategory, searchQuery],
        queryFn: async () => {
            let query = supabase
                .from('faq_items')
                .select('*, faq_categories(*)')
                .eq('is_active', true)
                .order('is_featured', { ascending: false })
                .order('view_count', { ascending: false });
            
            if (selectedCategory) {
                query = query.eq('category_id', selectedCategory);
            }
            
            if (searchQuery) {
                query = query.or(`question.ilike.%${searchQuery}%,answer.ilike.%${searchQuery}%`);
            }
            
            const { data, error } = await query;
            
            if (error) {
                console.error('Error fetching FAQs:', error);
                return [];
            }
            
            return data || [];
        },
        staleTime: 30000,
    });

    // Track FAQ view
    const trackView = async (faqId: string) => {
        try {
            const { data: currentFaq } = await supabase
                .from('faq_items')
                .select('view_count')
                .eq('id', faqId)
                .single();
            
            if (currentFaq) {
                await supabase
                    .from('faq_items')
                    .update({ view_count: (currentFaq.view_count || 0) + 1 })
                    .eq('id', faqId);
            }
        } catch (error) {
            // Silently fail
        }
    };

    // Submit feedback
    const submitFeedback = async (faqId: string, isHelpful: boolean) => {
        if (feedbackGiven[faqId]) return;
        
        setFeedbackGiven(prev => ({ ...prev, [faqId]: isHelpful ? 'helpful' : 'not_helpful' }));
        
        try {
            const column = isHelpful ? 'helpful_count' : 'not_helpful_count';
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

    // Group FAQs by category
    const groupedFaqs = faqs.reduce((acc, faq) => {
        const catId = faq.category_id || 'uncategorized';
        if (!acc[catId]) {
            acc[catId] = {
                category: faq.faq_categories || { id: 'uncategorized', name: 'General', slug: 'general' },
                items: []
            };
        }
        acc[catId].items.push(faq);
        return acc;
    }, {} as Record<string, { category: FAQCategory; items: FAQItem[] }>);

    // Generate FAQ Schema for AI Search
    const faqSchema = faqs.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    } : null;

    return (
        <>
            <Helmet>
                <title>FAQs - Kedarnath Yatra Questions & Answers | StayKedarnath</title>
                <meta name="description" content="Find answers to frequently asked questions about Kedarnath booking, helicopter services, trek difficulty, best time to visit, cancellation policy, and pilgrimage planning." />
                <meta name="keywords" content="Kedarnath FAQ, Kedarnath questions, Kedarnath booking help, Char Dham FAQ, helicopter booking FAQ, trek questions" />
                <link rel="canonical" href="https://staykedarnath.in/help/faq" />
                
                {/* FAQ Schema for AI Overviews */}
                {faqSchema && (
                    <script type="application/ld+json">
                        {JSON.stringify(faqSchema)}
                    </script>
                )}
            </Helmet>

            <div className="min-h-screen flex flex-col bg-gray-50">
                <Nav />

                {/* Hero Section - Compact */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0F2167] to-[#1a3a8f] py-10 md:py-16">
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />

                    <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl md:text-4xl font-bold text-white mb-4"
                        >
                            Frequently Asked Questions
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-blue-100 text-sm md:text-base mb-6"
                        >
                            Find answers to common questions about your Kedarnath Yatra
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-xl mx-auto relative"
                        >
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search for answers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 pr-4 py-4 text-base rounded-xl border-0 bg-white shadow-lg"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Breadcrumb */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-[#0071c2]">Home</button>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <button onClick={() => navigate('/help')} className="text-gray-500 hover:text-[#0071c2]">Help Center</button>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900 font-medium">FAQs</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="flex-grow py-6 md:py-10">
                    <div className="max-w-7xl mx-auto px-4">
                        {/* Mobile Category Tabs - Horizontal Scroll */}
                        <div className="lg:hidden mb-6 -mx-4 px-4">
                            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        !selectedCategory 
                                            ? 'bg-[#0071c2] text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    All ({faqs.length})
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                                            selectedCategory === cat.id 
                                                ? 'bg-[#0071c2] text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {cat.name} ({cat.faq_items?.[0]?.count || 0})
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Sidebar - Categories (Desktop Only) */}
                            <aside className="hidden lg:block lg:w-64 flex-shrink-0">
                                <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
                                    <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => setSelectedCategory(null)}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                                !selectedCategory 
                                                    ? 'bg-[#0071c2] text-white' 
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            All Questions
                                        </button>
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                    selectedCategory === cat.id 
                                                        ? 'bg-[#0071c2] text-white' 
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                <span>{cat.name}</span>
                                                {cat.faq_items && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                        {cat.faq_items[0]?.count || 0}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </aside>

                            {/* FAQ List */}
                            <div className="flex-1 min-w-0">
                                {/* Results count */}
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-gray-600">
                                        {faqs.length} question{faqs.length !== 1 ? 's' : ''} found
                                        {searchQuery && <span className="text-[#0071c2]"> for "{searchQuery}"</span>}
                                    </p>
                                    {searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery('')}
                                            className="text-sm text-[#0071c2] hover:underline"
                                        >
                                            Clear search
                                        </button>
                                    )}
                                </div>

                                {faqs.length === 0 ? (
                                    <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
                                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No FAQs Found</h3>
                                        <p className="text-gray-600 text-sm mb-6">
                                            {searchQuery 
                                                ? `No results for "${searchQuery}". Try a different search term.`
                                                : 'No FAQs available in this category yet.'}
                                        </p>
                                        <Button onClick={() => navigate('/support/raise')} size="sm">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Contact Support
                                        </Button>
                                    </div>
                                ) : selectedCategory ? (
                                    // Single category view
                                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                        <Accordion type="single" collapsible className="divide-y divide-gray-100">
                                            {faqs.map((faq) => (
                                                <AccordionItem key={faq.id} value={faq.id} className="border-0">
                                                    <AccordionTrigger 
                                                        className="px-4 md:px-6 py-3 md:py-4 text-left hover:no-underline hover:bg-gray-50 text-sm md:text-base"
                                                        onClick={() => trackView(faq.id)}
                                                    >
                                                        <div className="flex items-start gap-2 pr-2">
                                                            {faq.is_featured && (
                                                                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                            )}
                                                            <span className="font-medium text-gray-900">{faq.question}</span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-4 md:px-6 pb-4">
                                                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{faq.answer}</p>
                                                        
                                                        <div className="flex flex-wrap items-center gap-2 md:gap-4 pt-3 border-t">
                                                            <span className="text-xs text-gray-500">Helpful?</span>
                                                            {feedbackGiven[faq.id] ? (
                                                                <span className="text-xs text-green-600 font-medium">Thanks!</span>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => submitFeedback(faq.id, true)}
                                                                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 text-xs"
                                                                    >
                                                                        <ThumbsUp className="w-3 h-3" /> Yes
                                                                    </button>
                                                                    <button
                                                                        onClick={() => submitFeedback(faq.id, false)}
                                                                        className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-xs"
                                                                    >
                                                                        <ThumbsDown className="w-3 h-3" /> No
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                ) : (
                                    // Grouped by category view
                                    <div className="space-y-4 md:space-y-6">
                                        {Object.values(groupedFaqs).map(({ category, items }) => (
                                            <motion.div
                                                key={category.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                className="bg-white rounded-xl shadow-sm overflow-hidden"
                                            >
                                                <div className="px-4 md:px-6 py-3 md:py-4 border-b bg-gradient-to-r from-gray-50 to-white">
                                                    <h2 className="text-base md:text-lg font-bold text-gray-900">{category.name}</h2>
                                                    <p className="text-gray-500 text-xs md:text-sm">{items.length} questions</p>
                                                </div>
                                                <Accordion type="single" collapsible className="divide-y divide-gray-100">
                                                    {items.map((faq) => (
                                                        <AccordionItem key={faq.id} value={faq.id} className="border-0">
                                                            <AccordionTrigger 
                                                                className="px-4 md:px-6 py-3 md:py-4 text-left hover:no-underline hover:bg-gray-50 text-sm md:text-base"
                                                                onClick={() => trackView(faq.id)}
                                                            >
                                                                <div className="flex items-start gap-2 pr-2">
                                                                    {faq.is_featured && (
                                                                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                                    )}
                                                                    <span className="font-medium text-gray-900">{faq.question}</span>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="px-4 md:px-6 pb-4">
                                                                <p className="text-gray-600 text-sm leading-relaxed mb-4">{faq.answer}</p>
                                                                
                                                                <div className="flex flex-wrap items-center gap-2 md:gap-4 pt-3 border-t">
                                                                    <span className="text-xs text-gray-500">Helpful?</span>
                                                                    {feedbackGiven[faq.id] ? (
                                                                        <span className="text-xs text-green-600 font-medium">Thanks!</span>
                                                                    ) : (
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => submitFeedback(faq.id, true)}
                                                                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 text-xs"
                                                                            >
                                                                                <ThumbsUp className="w-3 h-3" /> Yes
                                                                            </button>
                                                                            <button
                                                                                onClick={() => submitFeedback(faq.id, false)}
                                                                                className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 text-xs"
                                                                            >
                                                                                <ThumbsDown className="w-3 h-3" /> No
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* CTA Section - Compact */}
                <section className="py-8 md:py-12 px-4 bg-gradient-to-r from-[#0071c2] to-[#005999]">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-lg md:text-2xl font-bold text-white mb-2">
                            Couldn't find what you're looking for?
                        </h2>
                        <p className="text-blue-100 text-sm mb-6">
                            Our support team is available 24/7 to help you.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button 
                                className="bg-white text-[#0071c2] hover:bg-gray-100 font-semibold"
                                onClick={() => navigate('/support/raise')}
                            >
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Contact Support
                            </Button>
                            <Button 
                                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0071c2] font-semibold transition-colors"
                                onClick={() => navigate('/help')}
                            >
                                Back to Help Center
                            </Button>
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}

