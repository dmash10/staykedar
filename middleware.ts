/**
 * Vercel Edge Middleware for Prerender.io
 * 
 * This middleware intercepts requests from search engine bots and AI crawlers,
 * fetches pre-rendered HTML from Prerender.io, and returns it.
 * 
 * Normal users bypass this and get the regular SPA.
 */

import { next } from '@vercel/edge';

// Bot user agent patterns (including AI search bots)
const BOT_USER_AGENTS = [
    // Search engines
    'googlebot',
    'bingbot',
    'yandexbot',
    'baiduspider',
    'duckduckbot',
    // Social media
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'pinterest',
    'slackbot',
    'whatsapp',
    'discordbot',
    'telegrambot',
    // AI bots
    'gptbot',
    'chatgpt-user',
    'anthropic-ai',
    'claudebot',
    'perplexitybot',
    'google-extended',
    'bytespider',
    // Other crawlers
    'applebot',
    'semrushbot',
    'ahrefsbot',
    'mj12bot',
];

// File extensions to skip
const SKIP_EXTENSIONS = /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|webp|mp4|webm|json|xml|txt|map)$/i;

export const config = {
    matcher: [
        /*
         * Match all paths except:
         * - api routes
         * - _next (Next.js internals if any)
         * - Static files with extensions
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

export default async function middleware(request: Request) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

    // Skip static files
    if (SKIP_EXTENSIONS.test(url.pathname)) {
        return next();
    }

    // Check if it's a bot
    const isBot = BOT_USER_AGENTS.some(bot => userAgent.includes(bot));

    if (!isBot) {
        // Not a bot - continue normally
        return next();
    }

    // Get Prerender token from environment
    const prerenderToken = process.env.PRERENDER_TOKEN;

    if (!prerenderToken) {
        console.log('[Prerender] Token not configured, skipping prerender');
        return next();
    }

    // Build the Prerender.io URL
    // Format: https://service.prerender.io/https://yoursite.com/path
    const targetUrl = `https://service.prerender.io/${request.url}`;

    try {
        console.log(`[Prerender] Fetching: ${targetUrl}`);

        // Fetch pre-rendered HTML from Prerender.io
        const response = await fetch(targetUrl, {
            headers: {
                'X-Prerender-Token': prerenderToken,
                'User-Agent': request.headers.get('user-agent') || '',
                'Accept': 'text/html',
            },
        });

        if (!response.ok) {
            console.error(`[Prerender] Error: ${response.status} ${response.statusText}`);
            return next();
        }

        const html = await response.text();

        // Return pre-rendered HTML
        return new Response(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Prerendered': 'true',
                'Cache-Control': 'public, max-age=300, s-maxage=3600',
            },
        });
    } catch (error) {
        console.error('[Prerender] Fetch error:', error);
        return next();
    }
}
