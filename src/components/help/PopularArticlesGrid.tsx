import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';

export default function PopularArticlesGrid() {
    const { data: articles, isLoading } = useQuery({
        queryKey: ['popular-help-articles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('help_articles')
                .select('id, title, slug, category:help_categories(name, slug)')
                .eq('is_published', true)
                .order('helpful_count', { ascending: false })
                .limit(6);

            if (error) throw error;
            // Cast the data to match the expected structure since Supabase returns nested objects
            return data as unknown as { id: string; title: string; slug: string; category: { name: string; slug: string } }[];
        }
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles?.map((article) => (
                <Link
                    key={article.id}
                    to={`/help/article/${article.slug}`}
                    className="group bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col justify-between h-full"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-3 text-xs font-medium text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded-md">
                            <FileText className="w-3 h-3" />
                            {article.category?.name}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {article.title}
                        </h3>
                    </div>
                    <div className="mt-4 flex items-center text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">
                        Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Link>
            ))}
        </div>
    );
}
