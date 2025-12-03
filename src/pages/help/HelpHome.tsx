import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import HelpCenterLayout from '@/components/help/HelpCenterLayout';
// Articles are now accessed via category pages, not shown on home
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Search,
    MessageSquare,
    HelpCircle,
    Phone,
    Mail,
    ChevronRight,
    ThumbsUp,
    ThumbsDown,
    BookOpen,
    ArrowRight,
    Plane,
    Mountain,
    CreditCard,
    Calendar,
    Shield,
    Clock,
    MapPin,
    Sparkles
} from 'lucide-react';

interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category_id: string;
    is_featured: boolean;
    view_count: number;
    helpful_count: number;
    not_helpful_count: number;
}

interface HelpArticle {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    category_id: string;
    views: number;
    reading_time?: number;
    featured_image?: string;
    help_categories?: {
        name: string;
        slug: string;
    };
}

// Fallback FAQs
const fallbackFAQs: FAQItem[] = [
    {
        id: '1',
        question: 'How do I cancel my booking?',
        answer: 'You can cancel your booking by going to "My Bookings" in your dashboard. Select the booking you wish to cancel and click the "Cancel Booking" button. Please review our cancellation policy first to understand any applicable fees.',
        category_id: 'bookings',
        is_featured: true,
        view_count: 0,
        helpful_count: 0,
        not_helpful_count: 0
    },
    {
        id: '2',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards (Visa, MasterCard, RuPay), UPI payments (Google Pay, PhonePe, Paytm), and Net Banking from all major Indian banks.',
        category_id: 'payments',
        is_featured: true,
        view_count: 0,
        helpful_count: 0,
        not_helpful_count: 0
    },
    {
        id: '3',
        question: 'Is it safe to travel to Kedarnath now?',
        answer: 'We monitor weather and safety conditions 24/7. You can check the "Weather Updates" section for real-time information. We always recommend checking official government advisories before your trip.',
        category_id: 'travel',
        is_featured: true,
        view_count: 0,
        helpful_count: 0,
        not_helpful_count: 0
    },
    {
        id: '4',
        question: 'How do I get my refund?',
        answer: 'Refunds are processed automatically to the original payment method within 5-7 business days after a cancellation is approved. If you haven\'t received it after 7 days, please contact support.',
        category_id: 'payments',
        is_featured: true,
        view_count: 0,
        helpful_count: 0,
        not_helpful_count: 0
    }
];

// Popular search suggestions
const popularSearches = [
    'Cancel booking',
    'Refund status',
    'Helicopter booking',
    'Weather update',
    'Trek route',
    'Payment failed',
    'Best time to visit',
    'How to reach Kedarnath'
];

// Help categories with icons - linked to actual help article categories (matching database slugs)
const helpCategories = [
    { icon: BookOpen, title: 'Getting Started', desc: 'New here?', path: '/help/categories/getting-started', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { icon: Mountain, title: 'Travel Guide', desc: 'Routes & tips', path: '/help/categories/travel-guide', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { icon: Calendar, title: 'Bookings', desc: 'Manage stays', path: '/help/categories/bookings-payments', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    { icon: CreditCard, title: 'Refunds', desc: 'Cancellations', path: '/help/categories/cancellations-refunds', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { icon: Shield, title: 'Safety', desc: 'Travel safe', path: '/help/categories/safety-security', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
    { icon: Plane, title: 'Hosting', desc: 'For hosts', path: '/help/categories/hosting', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
];

export default function HelpHome() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'helpful' | 'not_helpful'>>({});

    // Fetch FAQ items - get more for homepage
    const { data: faqs = fallbackFAQs } = useQuery({
        queryKey: ['faq-items-home'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('faq_items')
                .select('*')
                .eq('is_active', true)
                .eq('is_featured', true)
                .order('view_count', { ascending: false })
                .limit(10);
            
            if (error || !data || data.length === 0) {
                return fallbackFAQs;
            }
            return data;
        },
        staleTime: 60000,
    });

    // Fetch Help Articles - show top 6 on homepage
    const { data: articles = [] } = useQuery({
        queryKey: ['help-articles-home'],
        queryFn: async (): Promise<HelpArticle[]> => {
            const { data, error } = await supabase
                .from('help_articles')
                .select(`
                    id, title, slug, content, excerpt, category_id, views, reading_time, featured_image,
                    help_categories (name, slug)
                `)
                .eq('is_published', true)
                .order('views', { ascending: false })
                .limit(6);
            
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
        staleTime: 60000,
    });

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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/help/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleSuggestionClick = (term: string) => {
        navigate(`/help/search?q=${encodeURIComponent(term)}`);
    };

    return (
        <HelpCenterLayout showSearch={false}>
            {/* Hero Section with Texture */}
            <section className="relative overflow-visible">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0F2167] to-[#1E3A8A]" />
                
                {/* Texture Pattern */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
                
                {/* Gradient Orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -ml-36 -mb-36" />
                
                {/* Grid Lines */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />

                <div className="relative z-20 pt-10 pb-16 md:pt-14 md:pb-20 px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium mb-4 backdrop-blur-sm border border-white/10"
                        >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>24/7 Support Available</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="text-2xl md:text-4xl font-bold text-white mb-3"
                        >
                            How can we help you?
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-blue-100/80 text-sm mb-6"
                        >
                            Find answers, guides, and support for your Kedarnath journey
                        </motion.p>

                        {/* Enhanced Search Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="relative max-w-xl mx-auto z-50"
                        >
                            <form onSubmit={handleSearch}>
                                <div className="relative bg-white rounded-2xl shadow-2xl">
                                    <div className="flex items-center">
                                        <div className="pl-4">
                                            <Search className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Search for help..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onFocus={() => setSearchFocused(true)}
                                            onBlur={() => setTimeout(() => setSearchFocused(false), 300)}
                                            className="flex-1 px-3 py-4 text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none focus:outline-none focus:ring-0 text-base [&:focus]:outline-none [&:focus]:ring-0 [&:focus]:border-none"
                                            style={{ boxShadow: 'none', outline: 'none', border: 'none' }}
                                        />
                                        <div className="pr-2">
                                            <Button 
                                                type="submit"
                                                className="bg-[#0071c2] hover:bg-[#005999] text-white rounded-xl px-5 py-2"
                                            >
                                                Search
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Search Suggestions Dropdown - Portal-like positioning */}
                                {searchFocused && (
                                    <div 
                                        className="absolute top-full left-0 right-0 mt-2"
                                        style={{ zIndex: 99999, position: 'absolute' }}
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                                        >
                                        {/* Show filtered suggestions when user is typing */}
                                        {searchQuery.trim().length > 0 ? (
                                            <>
                                                {/* Filter popular searches + FAQ questions based on input */}
                                                {(() => {
                                                    const query = searchQuery.toLowerCase();
                                                    const matchingPopular = popularSearches.filter(s => 
                                                        s.toLowerCase().includes(query)
                                                    );
                                                    const matchingFaqs = faqs.filter(f => 
                                                        f.question.toLowerCase().includes(query)
                                                    ).slice(0, 3);
                                                    
                                                    const hasMatches = matchingPopular.length > 0 || matchingFaqs.length > 0;
                                                    
                                                    return hasMatches ? (
                                                        <div className="p-2">
                                                            {matchingPopular.length > 0 && (
                                                                <>
                                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide px-3 py-1">Suggestions</p>
                                                                    {matchingPopular.slice(0, 3).map((term) => (
                                                                        <button
                                                                            key={term}
                                                                            type="button"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault();
                                                                                handleSuggestionClick(term);
                                                                            }}
                                                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0071c2] rounded-lg transition-colors text-left"
                                                                        >
                                                                            <Search className="w-4 h-4 text-gray-400" />
                                                                            <span dangerouslySetInnerHTML={{
                                                                                __html: term.replace(
                                                                                    new RegExp(`(${searchQuery})`, 'gi'),
                                                                                    '<strong class="text-[#0071c2]">$1</strong>'
                                                                                )
                                                                            }} />
                                                                        </button>
                                                                    ))}
                                                                </>
                                                            )}
                                                            {matchingFaqs.length > 0 && (
                                                                <>
                                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide px-3 py-1 mt-2">From FAQs</p>
                                                                    {matchingFaqs.map((faq) => (
                                                                        <button
                                                                            key={faq.id}
                                                                            type="button"
                                                                            onMouseDown={(e) => {
                                                                                e.preventDefault();
                                                                                handleSuggestionClick(faq.question);
                                                                            }}
                                                                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0071c2] rounded-lg transition-colors text-left"
                                                                        >
                                                                            <HelpCircle className="w-4 h-4 text-amber-500" />
                                                                            <span className="truncate">{faq.question}</span>
                                                                        </button>
                                                                    ))}
                                                                </>
                                                            )}
                                                            {/* Search button */}
                                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                                <button
                                                                    type="submit"
                                                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-[#0071c2] hover:bg-blue-50 rounded-lg transition-colors text-left font-medium"
                                                                >
                                                                    <Search className="w-4 h-4" />
                                                                    <span>Search for "{searchQuery}"</span>
                                                                    <ArrowRight className="w-3 h-3 ml-auto" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center">
                                                            <p className="text-gray-500 text-sm mb-2">No suggestions for "{searchQuery}"</p>
                                                            <button
                                                                type="submit"
                                                                className="text-[#0071c2] text-sm font-medium hover:underline"
                                                            >
                                                                Search anyway →
                                                            </button>
                                                        </div>
                                                    );
                                                })()}
                                            </>
                                        ) : (
                                            /* Show popular searches when input is empty */
                                            <>
                                                <div className="p-3 bg-gray-50 border-b border-gray-100">
                                                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Popular Searches</p>
                                                </div>
                                                <div className="p-2 grid grid-cols-2 gap-1">
                                                    {popularSearches.slice(0, 6).map((term) => (
                                                        <button
                                                            key={term}
                                                            type="button"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                handleSuggestionClick(term);
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#0071c2] rounded-lg transition-colors text-left"
                                                        >
                                                            <Search className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                            <span className="truncate">{term}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        </motion.div>
                                    </div>
                                )}
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 relative z-10">
                
                {/* Help Categories Grid - Better Design with Shadows */}
                <div className="mb-6">
                    <h2 className="text-sm md:text-base font-bold text-gray-900 mb-3">
                        Browse by Topic
                    </h2>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                        {helpCategories.map((cat, idx) => (
                            <motion.button
                                key={cat.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                onClick={() => navigate(cat.path)}
                                className={`flex flex-col items-center p-3 md:p-4 bg-white rounded-xl border-2 ${cat.border} shadow-sm hover:shadow-lg transition-all group text-center`}
                            >
                                <div className={`${cat.bg} ${cat.color} p-2.5 md:p-3 rounded-xl mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                                    <cat.icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <span className="text-xs md:text-sm font-semibold text-gray-800 leading-tight">{cat.title}</span>
                                <span className="text-[9px] md:text-[10px] text-gray-500 mt-0.5 hidden md:block">{cat.desc}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* FAQ Section - Better Design with Mobile-friendly styling */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-[#0071c2]" />
                            Frequently Asked Questions
                        </h2>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate('/help/faq')}
                            className="text-[#0071c2] hover:text-[#005999] text-xs px-2"
                        >
                            View All (30+)
                            <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                    </div>

                    {/* Two Column FAQ Grid on Desktop */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Column 1 */}
                        <div className="space-y-3">
                            {faqs.slice(0, 4).map((faq) => (
                                <div
                                    key={faq.id}
                                    className="bg-white rounded-xl border-2 border-gray-100 shadow-sm overflow-hidden"
                                >
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value={faq.id} className="border-0">
                                            <AccordionTrigger className="px-4 py-3.5 text-left hover:no-underline hover:bg-blue-50/50 text-sm group">
                                                <div className="flex items-center gap-3 w-full pr-2">
                                                    {/* Question mark icon - always styled on mobile */}
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0071c2]/10 md:bg-gray-100 md:group-hover:bg-[#0071c2]/10 flex items-center justify-center transition-colors">
                                                        <HelpCircle className="w-4 h-4 text-[#0071c2] md:text-gray-400 md:group-hover:text-[#0071c2] transition-colors" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 flex-1">{faq.question}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="pl-11">
                                                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{faq.answer}</p>
                                                    <div className="flex items-center gap-3 text-xs pt-2 border-t border-gray-100">
                                                        <span className="text-gray-400">Was this helpful?</span>
                                                        {feedbackGiven[faq.id] ? (
                                                            <span className="text-green-600 font-medium">Thanks!</span>
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    onClick={() => submitFeedback(faq.id, true)} 
                                                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                                >
                                                                    <ThumbsUp className="w-3 h-3" /> Yes
                                                                </button>
                                                                <button 
                                                                    onClick={() => submitFeedback(faq.id, false)} 
                                                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                                >
                                                                    <ThumbsDown className="w-3 h-3" /> No
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            ))}
                        </div>
                        
                        {/* Column 2 - Hidden on mobile */}
                        <div className="space-y-3 hidden lg:block">
                            {faqs.slice(4, 8).map((faq) => (
                                <div
                                    key={faq.id}
                                    className="bg-white rounded-xl border-2 border-gray-100 shadow-sm overflow-hidden"
                                >
                                    <Accordion type="single" collapsible>
                                        <AccordionItem value={faq.id} className="border-0">
                                            <AccordionTrigger className="px-4 py-3.5 text-left hover:no-underline hover:bg-blue-50/50 text-sm group">
                                                <div className="flex items-center gap-3 w-full pr-2">
                                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-[#0071c2]/10 flex items-center justify-center transition-colors">
                                                        <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-[#0071c2] transition-colors" />
                                                    </div>
                                                    <span className="font-medium text-gray-900 flex-1">{faq.question}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-4 pb-4">
                                                <div className="pl-11">
                                                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{faq.answer}</p>
                                                    <div className="flex items-center gap-3 text-xs pt-2 border-t border-gray-100">
                                                        <span className="text-gray-400">Was this helpful?</span>
                                                        {feedbackGiven[faq.id] ? (
                                                            <span className="text-green-600 font-medium">Thanks!</span>
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    onClick={() => submitFeedback(faq.id, true)} 
                                                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                                                                >
                                                                    <ThumbsUp className="w-3 h-3" /> Yes
                                                                </button>
                                                                <button 
                                                                    onClick={() => submitFeedback(faq.id, false)} 
                                                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                                >
                                                                    <ThumbsDown className="w-3 h-3" /> No
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Help Articles Section - Show top 6 with better design */}
                {articles.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-[#0071c2]" />
                                Popular Articles
                            </h2>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/help/categories/getting-started')}
                                className="text-[#0071c2] hover:text-[#005999] text-sm font-medium flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {articles.map((article) => (
                                <div
                                    key={article.id}
                                    onClick={() => navigate(`/help/article/${article.slug}`)}
                                    className="bg-white rounded-xl border-2 border-gray-100 p-4 shadow-sm hover:shadow-lg hover:border-[#0071c2]/40 transition-all cursor-pointer group relative overflow-hidden"
                                >
                                    {/* Decorative accent - always visible */}
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0071c2] to-[#005999] md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex items-start gap-3">
                                        {/* Icon - styled for mobile visibility */}
                                        <div className="bg-[#0071c2]/10 md:bg-blue-50 p-2.5 rounded-xl text-[#0071c2] md:group-hover:bg-[#0071c2] md:group-hover:text-white transition-colors flex-shrink-0">
                                            <BookOpen className="w-5 h-5" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            {/* Title */}
                                            <h3 className="font-semibold text-gray-900 text-sm md:group-hover:text-[#0071c2] transition-colors line-clamp-2 mb-1.5">
                                                {article.title}
                                            </h3>
                                            
                                            {/* Excerpt or content preview */}
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                                {article.excerpt || article.content?.replace(/<[^>]*>/g, '').substring(0, 100) + '...'}
                                            </p>
                                            
                                            {/* Meta info row */}
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
                                            <ChevronRight className="w-4 h-4 text-[#0071c2] md:text-gray-300 md:group-hover:text-[#0071c2] transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mobile Support Section - Compact Design */}
                <div className="lg:hidden mb-6">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FFB700]/20 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-4 h-4 text-amber-400" />
                        </div>
                        <span className="font-medium text-white text-xs flex-1">Need More Help?</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => navigate('/support/raise')}
                                className="flex items-center gap-1 bg-[#FFB700] text-slate-900 font-semibold py-1.5 px-3 rounded-lg text-[11px]"
                            >
                                <MessageSquare className="w-3 h-3" />
                                Raise Ticket
                            </button>
                            <button 
                                onClick={() => navigate('/support/track')}
                                className="flex items-center gap-1 bg-slate-700 text-white font-medium py-1.5 px-3 rounded-lg text-[11px] border border-slate-600"
                            >
                                <Search className="w-3 h-3" />
                                Track
                            </button>
                        </div>
                    </div>
                </div>

                {/* Desktop Support Section - Just above CTA */}
                <div className="hidden lg:block mb-6">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#FFB700]/20 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-5 h-5 text-[#FFB700]" />
                        </div>
                        <div>
                            <span className="font-semibold text-white text-sm block">Need More Help?</span>
                            <span className="text-gray-400 text-xs">Our support team is here to assist you</span>
                        </div>
                        <div className="flex gap-3 ml-auto">
                            <button 
                                onClick={() => navigate('/support/raise')}
                                className="flex items-center gap-2 bg-[#FFB700] text-slate-900 font-semibold py-2 px-5 rounded-lg hover:bg-[#e5a600] transition-colors text-sm"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Raise Ticket
                            </button>
                            <button 
                                onClick={() => navigate('/support/track')}
                                className="flex items-center gap-2 bg-slate-700 text-white font-medium py-2 px-5 rounded-lg hover:bg-slate-600 transition-colors text-sm border border-slate-600"
                            >
                                <Search className="w-4 h-4" />
                                Track Ticket
                            </button>
                        </div>
                    </div>
                </div>

                {/* CTA Banner - Blue Theme */}
                <div className="bg-gradient-to-r from-[#0071c2] via-[#005999] to-[#004080] rounded-2xl p-5 md:p-6 relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-xl" />
                    <div className="absolute inset-0 opacity-10" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-white/90 text-[10px] font-medium mb-2 backdrop-blur-sm">
                                <Mountain className="w-3 h-3" />
                                <span>Plan Your Sacred Journey</span>
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                                Ready for Kedarnath Yatra?
                            </h3>
                            <p className="text-blue-100 text-sm">
                                Stays • Helicopter • VIP Darshan • Complete Packages
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                onClick={() => navigate('/stays')}
                                className="bg-[#FFB700] text-slate-900 hover:bg-[#e5a600] font-semibold shadow-lg"
                            >
                                <MapPin className="w-4 h-4 mr-1.5" />
                                Browse Stays
                            </Button>
                            <Button 
                                onClick={() => navigate('/packages')}
                                className="bg-white/20 text-white hover:bg-white/30 font-medium backdrop-blur-sm border border-white/30"
                            >
                                View Packages
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </HelpCenterLayout>
    );
}
