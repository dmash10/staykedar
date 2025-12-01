import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import Fuse from 'fuse.js';

// Simple debounce hook implementation if not available
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
}

export default function HelpSearch() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [allArticles, setAllArticles] = useState<any[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounceValue(query, 100); // Faster debounce for local search

    // Fetch all articles on mount for client-side fuzzy search
    useEffect(() => {
        const fetchAllArticles = async () => {
            try {
                const { data, error } = await supabase
                    .from('help_articles')
                    .select('id, title, slug, content, category:help_categories(name)')
                    .eq('is_published', true);

                if (error) throw error;
                setAllArticles(data || []);
            } catch (error) {
                console.error('Error fetching articles for search:', error);
            }
        };

        fetchAllArticles();
    }, []);

    // Initialize Fuse instance
    const fuse = new Fuse(allArticles, {
        keys: ['title', 'content', 'category.name'],
        threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything. 0.4 is good for fuzziness
        distance: 100,
        includeScore: true,
        minMatchCharLength: 2
    });

    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        // Simulate a tiny delay for UI feel or just run immediately
        const searchResults = fuse.search(debouncedQuery)
            .map(result => result.item)
            .slice(0, 5); // Limit to top 5

        setResults(searchResults);
        setIsOpen(true);
        setIsLoading(false);
    }, [debouncedQuery, allArticles]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSelect = (slug: string) => {
        navigate(`/help/article/${slug}`);
        setIsOpen(false);
        setQuery('');
    };

    return (
        <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto z-50">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <Input
                    type="text"
                    placeholder="Search for help articles..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen && e.target.value.trim()) setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (query.trim().length > 0) setIsOpen(true);
                    }}
                    className="w-full pl-12 pr-10 py-6 text-lg rounded-xl shadow-lg border-0 bg-white focus-visible:ring-2 focus-visible:ring-blue-500 placeholder:text-gray-400"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setIsOpen(false);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (query.trim().length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Searching...
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Suggested Articles
                            </div>
                            {results.map((article) => (
                                <button
                                    key={article.id}
                                    onClick={() => handleSelect(article.slug)}
                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3 group"
                                >
                                    <div className="mt-1 bg-gray-100 p-1.5 rounded-md group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <FileText className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
                                            {article.title}
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            {article.category?.name}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            <p>No articles found matching "{query}"</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
