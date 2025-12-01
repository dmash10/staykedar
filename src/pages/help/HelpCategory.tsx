import { useParams, useNavigate, Link } from 'react-router-dom';
import HelpCenterLayout from '@/components/help/HelpCenterLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HelpCategory() {
    const { categorySlug } = useParams();
    const navigate = useNavigate();

    const { data: category, isLoading: isLoadingCategory } = useQuery({
        queryKey: ['help-category', categorySlug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('help_categories')
                .select('*')
                .eq('slug', categorySlug)
                .single();
            if (error) throw error;
            return data;
        }
    });

    const { data: articles, isLoading: isLoadingArticles } = useQuery({
        queryKey: ['help-articles', category?.id],
        enabled: !!category?.id,
        queryFn: async () => {
            const { data, error } = await supabase
                .from('help_articles')
                .select('*')
                .eq('category_id', category.id)
                .eq('is_published', true);
            if (error) throw error;
            return data;
        }
    });

    if (isLoadingCategory) {
        return (
            <HelpCenterLayout>
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-8"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </HelpCenterLayout>
        );
    }

    if (!category) {
        return (
            <HelpCenterLayout>
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
                    <Button onClick={() => navigate('/help')}>Return to Help Center</Button>
                </div>
            </HelpCenterLayout>
        );
    }

    return (
        <HelpCenterLayout>
            <div className="bg-secondary/30 border-b border-border">
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <Link to="/help" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Categories
                    </Link>
                    <h1 className="text-4xl font-display font-bold text-foreground mb-4">{category.name}</h1>
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{category.description}</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="grid gap-4">
                    {isLoadingArticles ? (
                        <div className="text-center py-12 text-muted-foreground">Loading articles...</div>
                    ) : articles?.length === 0 ? (
                        <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-dashed border-border">
                            <p className="text-muted-foreground">No articles found in this category yet.</p>
                        </div>
                    ) : (
                        articles?.map((article) => (
                            <Link
                                key={article.id}
                                to={`/help/article/${article.slug}`}
                                className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex items-center justify-between"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="bg-primary/5 p-3 rounded-xl text-primary mt-1 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-2">
                                            {article.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                            {article.content.substring(0, 120)}...
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-secondary/50 p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </HelpCenterLayout>
    );
}
