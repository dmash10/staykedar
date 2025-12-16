import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// GNews.io API - Free tier: 100 requests/day
const GNEWS_API_KEY = '505518c8cdfb5b6c72ad634b7de5148d';
const GNEWS_API_URL = 'https://gnews.io/api/v4/search';

interface GNewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: {
        name: string;
        url: string;
    };
}

interface NewsItem {
    title: string;
    content: string;
    link: string;
    image?: string;
    published_at: string;
    source: string;
    category: string;
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        const limit = parseInt(url.searchParams.get('limit') || '6');

        // Search queries for relevant news
        const searchQueries = [
            { query: 'Kedarnath', category: 'general' },
            { query: 'Char Dham yatra', category: 'route' },
            { query: 'Uttarakhand weather', category: 'weather' },
        ];

        const allNews: NewsItem[] = [];

        // Fetch news for each query
        for (const search of searchQueries) {
            try {
                const apiUrl = `${GNEWS_API_URL}?q=${encodeURIComponent(search.query)}&lang=en&country=in&max=3&apikey=${GNEWS_API_KEY}`;

                const response = await fetch(apiUrl);

                if (!response.ok) {
                    console.error(`GNews API error for "${search.query}": ${response.status}`);
                    continue;
                }

                const data = await response.json();

                if (data.articles) {
                    for (const article of data.articles as GNewsArticle[]) {
                        allNews.push({
                            title: article.title,
                            content: article.description || article.content?.slice(0, 200) || '',
                            link: article.url,
                            image: article.image,
                            published_at: article.publishedAt,
                            source: article.source?.name || 'News',
                            category: search.category
                        });
                    }
                }
            } catch (error) {
                console.error(`Error fetching "${search.query}":`, error);
            }
        }

        // Sort by published date (newest first)
        allNews.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

        // Deduplicate by title
        const seen = new Set<string>();
        const uniqueNews = allNews.filter(item => {
            const key = item.title.toLowerCase().slice(0, 40);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        // Return limited results
        const finalNews = uniqueNews.slice(0, limit);

        return new Response(JSON.stringify({
            success: true,
            count: finalNews.length,
            news: finalNews,
            fetched_at: new Date().toISOString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error in fetch-news function:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            news: []
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
