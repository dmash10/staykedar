import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import HelpCenterLayout from '@/components/help/HelpCenterLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '@/components/editor/TiptapEditor.css';

export default function HelpArticle() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const { data: article, isLoading } = useQuery({
        queryKey: ['help-article', slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('help_articles')
                .select(`
          *,
          category:help_categories(name, slug)
        `)
                .eq('slug', slug)
                .single();
            if (error) throw error;
            return data;
        }
    });

    // Fetch related articles
    const { data: relatedArticles } = useQuery({
        queryKey: ['related-articles', article?.category?.slug, article?.id],
        enabled: !!article,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('help_articles')
                .select('title, slug, helpful_count')
                .eq('category_id', article.category_id)
                .neq('id', article.id)
                .limit(3);

            if (error) throw error;
            return data;
        }
    });

    // Extract headings from content (works for both HTML and Markdown)
    const headings = article ? (() => {
        const content = article.content;

        // Check if content is HTML
        if (content.trim().startsWith('<') || content.includes('</')) {
            // Parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const h2Elements = Array.from(tempDiv.querySelectorAll('h2'));
            const h3Elements = Array.from(tempDiv.querySelectorAll('h3'));

            return [...h2Elements, ...h3Elements]
                .map(el => ({
                    level: el.tagName === 'H2' ? 2 : 3,
                    text: el.textContent || '',
                    id: (el.textContent || '').toLowerCase().replace(/[^\w]+/g, '-')
                }))
                .sort((a, b) => {
                    const aPos = content.indexOf(a.text);
                    const bPos = content.indexOf(b.text);
                    return aPos - bPos;
                });
        } else {
            // Parse Markdown
            const lines = content.split('\n');
            return lines
                .filter(line => line.match(/^##\s+/))
                .map(line => {
                    const text = line.replace(/^##\s*/, '');
                    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                    const level = line.startsWith('###') ? 3 : 2;
                    return { text, id, level };
                });
        }
    })() : [];

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    // Hide sidebar when scrolled past article end
    useEffect(() => {
        const handleScroll = () => {
            const articleColumn = document.querySelector('.lg\\:col-span-8');
            const sidebar = document.querySelector('.fixed.top-24');

            if (articleColumn && sidebar) {
                const articleRect = articleColumn.getBoundingClientRect();
                const articleBottom = articleRect.bottom;

                // Hide sidebar when article bottom is above bottom of viewport
                if (articleBottom < window.innerHeight - 100) {
                    (sidebar as HTMLElement).style.opacity = '0';
                    (sidebar as HTMLElement).style.pointerEvents = 'none';
                } else {
                    (sidebar as HTMLElement).style.opacity = '1';
                    (sidebar as HTMLElement).style.pointerEvents = 'auto';
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on mount

        return () => window.removeEventListener('scroll', handleScroll);
    }, [article]);

    if (isLoading) {
        return (
            <HelpCenterLayout>
                <div className="max-w-3xl mx-auto px-4 py-12">
                    <div className="h-8 w-3/4 bg-gray-100 rounded animate-pulse mb-8"></div>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-4 bg-gray-100 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </HelpCenterLayout>
        );
    }

    if (!article) {
        return (
            <HelpCenterLayout>
                <div className="max-w-3xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
                    <Button onClick={() => navigate('/help')}>Return to Help Center</Button>
                </div>
            </HelpCenterLayout>
        );
    }

    return (
        <HelpCenterLayout>
            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-muted-foreground mb-8 bg-secondary/30 py-2 px-4 rounded-lg w-fit">
                    <Link to="/help" className="hover:text-primary transition-colors font-medium">Help Center</Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <Link to={`/help/categories/${article.category?.slug}`} className="hover:text-primary transition-colors font-medium">
                        {article.category?.name}
                    </Link>
                    <span className="mx-2 text-gray-300">/</span>
                    <span className="text-foreground font-medium truncate max-w-[200px]">{article.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        {/* Article Title - Blue Box Design */}
                        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 leading-tight font-display">
                                {article.title}
                            </h1>
                        </div>

                        <Separator className="my-8 border-gray-200" />

                        <article className="prose prose-lg prose-slate max-w-none">
                            <div className="article-content">
                                {/* Detect if content is HTML or Markdown */}
                                {article.content.trim().startsWith('<') || article.content.includes('</') ? (
                                    // Content is HTML (from Tiptap editor) - NO hardcoded styles, respect editor
                                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                                ) : (
                                    // Content is Markdown - NO hardcoded heading colors
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                                            h2: ({ node, ...props }) => {
                                                const text = props.children?.toString() || '';
                                                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                                                return <h2 id={id} className="text-2xl font-bold mt-8 mb-4 scroll-mt-24" {...props} />;
                                            },
                                            h3: ({ node, ...props }) => {
                                                const text = props.children?.toString() || '';
                                                const id = text.toLowerCase().replace(/[^\w]+/g, '-');
                                                return <h3 id={id} className="text-xl font-semibold mt-6 mb-3 scroll-mt-24" {...props} />;
                                            },
                                            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                                            li: ({ node, ...props }) => <li {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-blue-600 underline hover:text-blue-800" target="_blank" rel="noopener noreferrer" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-400 pl-4 py-2 my-4 bg-blue-50 rounded-r italic" {...props} />,
                                            code: ({ node, inline, ...props }: any) =>
                                                inline
                                                    ? <code className="bg-gray-100 text-blue-600 px-1 py-0.5 rounded text-sm" {...props} />
                                                    : <code className="block bg-gray-900 text-gray-100 p-4 rounded my-4 overflow-x-auto" {...props} />,
                                            hr: () => <hr className="my-8 border-t-2 border-gray-200" />,
                                        }}
                                    >
                                        {article.content}
                                    </ReactMarkdown>
                                )}
                            </div>
                        </article>

                        <Separator className="my-12" />

                        {/* Feedback */}
                        <div className="bg-secondary/30 rounded-2xl p-10 text-center border border-border mb-12">
                            <h3 className="font-semibold text-foreground text-lg mb-6">Was this article helpful?</h3>
                            <div className="flex justify-center gap-4">
                                <Button variant="outline" className="gap-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200 h-12 px-6 text-base transition-all duration-300">
                                    <ThumbsUp className="w-5 h-5" />
                                    Yes, thanks!
                                </Button>
                                <Button variant="outline" className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 h-12 px-6 text-base transition-all duration-300">
                                    <ThumbsDown className="w-5 h-5" />
                                    Not really
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-6">
                                {article.helpful_count} people found this helpful
                            </p>
                        </div>

                        {/* Related Articles */}
                        {relatedArticles && relatedArticles.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {relatedArticles.map((related: any) => (
                                        <Link
                                            key={related.slug}
                                            to={`/help/article/${related.slug}`}
                                            className="block group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 hover:border-blue-200"
                                        >
                                            <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {related.title}
                                            </h4>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <ThumbsUp className="w-3 h-3" />
                                                    {related.helpful_count} found helpful
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Table of Contents Sidebar - FIXED (Floating, always visible) */}
                    <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
                        <div className="fixed top-24 right-[max(0px,calc((100vw-1280px)/2))] w-64 border-l border-gray-200 pl-6 pr-3 space-y-4 transition-opacity duration-300">

                            {/* Table of Contents */}
                            {headings.length > 0 && (
                                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                    <h4 className="font-semibold text-gray-900 mb-3 text-xs uppercase tracking-wider pb-2 border-b">On this page</h4>
                                    <nav className="space-y-0.5">
                                        {headings.map((heading, index) => (
                                            <a
                                                key={`${heading.id}-${index}`}
                                                href={`#${heading.id}`}
                                                onClick={(e) => scrollToSection(e, heading.id)}
                                                className="block text-xs py-1 transition-colors border-l-2 pl-3 border-transparent text-gray-600 hover:border-blue-300 hover:text-blue-600"
                                            >
                                                {heading.text}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Help Card */}
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <h4 className="font-semibold text-blue-900 mb-1.5 text-sm">Still need help?</h4>
                                <p className="text-xs text-blue-700 mb-3">Our support team is available 24/7 to assist you.</p>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9" onClick={() => navigate('/support/raise')}>
                                    Contact Support
                                </Button>
                            </div>

                        </div>
                    </aside>
                </div>
            </div>
        </HelpCenterLayout>
    );
}
