import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Loader2, Globe, Send, Lightbulb, Bot, User } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
}

interface AIBlogChatAssistantProps {
    editor: Editor;
    onMetadataGenerated?: (metadata: { title: string; slug: string; excerpt: string }) => void;
}

export function AIBlogChatAssistant({ editor, onMetadataGenerated }: AIBlogChatAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSearchEnabled, setIsSearchEnabled] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: "Hi! I'm your AI blogging partner. I can help you brainstorm ideas, research topics, and write engaging posts. Try asking for 'blog ideas about Kedarnath' or 'write an intro about winter trekking'.",
                timestamp: Date.now()
            }]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            // Use requestAnimationFrame for smoother scroll
            requestAnimationFrame(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }, [messages]);

    const sendMessage = async (forceGen = false) => {
        if (!input.trim() && !forceGen) return;
        if (!apiKey) { toast.error('API Key missing'); return; }

        const um: Message = { role: 'user', content: forceGen ? 'Generate blog now' : input, timestamp: Date.now() };
        setMessages(p => [...p, um]);
        const ci = input;
        setInput('');
        setIsGenerating(true);

        try {
            if (forceGen || /\b(generate|create|write)\s+(blog|post)\b/i.test(ci)) {
                await genBlog(ci || 'discussion');
            } else {
                await chat(ci);
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const chat = async (ui: string) => {
        const c = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
        c.push({ role: 'user', parts: [{ text: ui }] });

        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: c,
                systemInstruction: {
                    parts: [{
                        text: `You are a helpful travel blog assistant. 
You can help brainstorm topics, share news, and generate content.

CAPABILITIES:
- Generate complete blogs (Click "Generate Blog Now")
- Suggest topics and titles
- Answer questions about travel/policies

If asked "what can you do?" or "list actions", LIST all the capabilities above.
Tell user to click "Generate Blog Now" button when ready for full generation.
Never output JSON in chat.` }]
                },
                tools: isSearchEnabled ? [{ googleSearch: {} }] : undefined,
                generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
            })
        });

        const d = await r.json();
        if (!r.ok) throw new Error(d.error?.message || 'Failed');

        const ar = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if (ar) setMessages(p => [...p, { role: 'assistant', content: ar, timestamp: Date.now() }]);
    };

    const genBlog = async (ui: string) => {
        console.log('🚀 Starting blog generation...');

        const ctx = messages.map(m => `${m.role}: ${m.content}`).join('\\n\\n');

        const pr = `CONTEXT:
You are the content writer for Staykedar.com - a premium travel platform specializing in Kedarnath Yatra and Char Dham pilgrimages in the Indian Himalayas.

AUDIENCE:
- Spiritual seekers planning Kedarnath/Char Dham pilgrimages
- Adventure enthusiasts interested in Himalayan trekking
- Families planning religious tours
- Solo travelers seeking spiritual experiences
- People researching travel logistics, costs, routes, and safety

CONVERSATION HISTORY:
${ctx}

USER REQUEST: ${ui}

---

YOUR TASK:
Generate a complete, SEO-optimized blog post. Output ONLY valid JSON in this exact format:

{
  "title": "Engaging title (60-70 characters, includes main keyword)",
  "slug": "url-friendly-slug-with-hyphens",
  "excerpt": "Compelling meta description (150-160 characters)",
  "content": "Full HTML content here"
}

CONTENT REQUIREMENTS:

1. STRUCTURE (800-1000 words):
   - Opening: Hook readers with a captivating intro
   - Body: 4-6 main sections with clear H2 headings
   - Include practical details: distances, costs, timings, heights, dates
   - Add personal/experiential elements to make it relatable
   - Closing: Call-to-action or summary

2. HTML FORMATTING:
   - <h2>Main Section Title</h2>
   - <h3>Subsection Title</h3>
   - <p>Paragraph text with <strong>bold</strong> and <em>italic</em></p>
   - <ul><li>List item</li><li>List item</li></ul>
   - <a href="https://real-url.com" target="_blank">Linked text</a>

3. IMAGES (OPTIONAL - Add IF relevant):
   ⚠️ NEVER use src="placeholder" or src="..."
   ✅ ONLY use REAL working Unsplash URLs
   
   Examples:
   <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" alt="Snow-capped Kedarnath peaks at sunrise">
   <img src="https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800" alt="Ancient Himalayan temple architecture">
   <img src="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800" alt="Pilgrims trekking mountain path">
   <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=800" alt="Serene mountain valley view">
   
   - Add 1-3 images ONLY if they enhance the content naturally
   - Every image MUST have descriptive alt text
   - Choose images relevant to the topic

4. YOUTUBE VIDEOS (OPTIONAL - Add IF highly relevant):
   Use iframe for YouTube videos when they add real value:
   <iframe width="640" height="360" src="https://www.youtube.com/embed/VIDEO_ID" frameborder="0" allowfullscreen></iframe>
   
   - Only include if there's a specific, helpful video (travel vlogs, guides, virtual tours)
   - Don't force videos into every blog

5. SPECIAL CARDS (OPTIONAL - Use 1-3 IF they add value):
   
   INFO CARD:
   <div data-type="custom-card" type="info">
     <p>Best time to visit: May-June and Sept-Oct when weather is ideal</p>
   </div>
   
   WARNING CARD:
   <div data-type="custom-card" type="warning">
     <p>Altitude sickness risk above 3,000m - acclimatize properly</p>
   </div>
   
   TIP CARD:
   <div data-type="custom-card" type="tip">
     <p>Pro tip: Book helicopter tickets 30 days in advance for best rates</p>
   </div>
   
   WEATHER CARD:
   <div data-type="custom-card" type="weather">
     <p>Temperature ranges: Summer 15-20°C, Winter -5 to 10°C. Heavy snowfall Dec-Feb</p>
   </div>
   
   ROUTE CARD:
   <div data-type="custom-card" type="route">
     <p>Route: Haridwar → Rishikesh → Rudraprayag → Gaurikund → Kedarnath (16 km trek)</p>
   </div>
   
   ⚠️ Don't force cards into every blog - use them ONLY when they genuinely add value
   Use naturally where the information type matches the card style

6. SEO OPTIMIZATION:
   - Title: Include main keyword naturally (Kedarnath, Yatra, Char Dham, etc.)
   - Slug: lowercase-with-hyphens, descriptive, includes keyword
   - Excerpt: Compelling, benefit-focused, makes reader want to click
   - Keywords to integrate naturally: pilgrimage, trekking, Himalayas, temple, spiritual, adventure, route, guide, tips
   - Use semantic variations: journey/yatra, trek/hike, temple/shrine

7. TONE & STYLE:
   - Spiritual yet practical - balance devotion with logistics
   - Inspiring but informative - motivate readers to visit
   - Accessible language - avoid overly technical jargon
   - First-person perspective acceptable for tips/experiences
   - Include specific numbers, facts, dates where relevant

7. CONTENT ELEMENTS TO INCLUDE: Optional
   - Historical/cultural context of the destination
   - Practical travel information (how to reach, accommodation)
   - Cost breakdown (approximate ranges)
   - Best times to visit
   - Safety tips and precautions
   - What to pack/bring
   - Local customs and etiquette
   - Nearby attractions or alternative routes

8. LINKS & MEDIA (OPTIONAL):
   - Add 1-3 external links ONLY if they provide real value
   - Could link to: YouTube videos, official temple sites, government tourism, weather services
   - Make links open in new tab with target="_blank"
   - Don't force links/media - add naturally where helpful

REMEMBER:
- Output ONLY the JSON object
- Start with { and end with }
- No markdown code blocks, no explanations
- Images MUST have real Unsplash URLs
- Use custom cards for important info
- Make it comprehensive, practical, and inspiring

Now generate the blog post as JSON:`;

        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: pr }] }],
                tools: isSearchEnabled ? [{ googleSearch: {} }] : undefined,
                generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
            })
        });

        const d = await r.json();
        console.log('Response:', d);

        if (!r.ok) throw new Error(d.error?.message || 'Gen failed');

        let t = d.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!t) throw new Error('No content');

        t = t.trim().replace(/^```json\\s*/i, '').replace(/^```\\s*/i, '').replace(/```\\s*$/i, '').trim();
        const s = t.indexOf('{'), e = t.lastIndexOf('}');
        if (s !== -1 && e !== -1) t = t.substring(s, e + 1);

        console.log('JSON:', t);

        try {
            const b = JSON.parse(t);
            if (!b.title || !b.slug || !b.excerpt || !b.content) throw new Error('Missing fields');

            editor.chain().focus().insertContent(b.content).run();
            if (onMetadataGenerated) onMetadataGenerated({ title: b.title, slug: b.slug, excerpt: b.excerpt });

            setMessages(p => [...p, { role: 'assistant', content: `Blog generated! Title: ${b.title}`, timestamp: Date.now() }]);
            toast.success('Blog generated!');
        } catch (err) {
            console.error('Parse error:', err);
            setMessages(p => [...p, { role: 'assistant', content: 'Failed to parse JSON. Try again.', timestamp: Date.now() }]);
            throw new Error('Invalid JSON');
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-[#111111] text-white hover:bg-[#1a1a1a] border-[#333333]">
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex flex-col gap-2">
                        <SheetTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            AI Writing Assistant
                        </SheetTitle>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Blog ideas, drafts & research</span>
                            <div className="flex items-center gap-2 bg-slate-100 rounded-full px-3 py-1">
                                <Globe className={isSearchEnabled ? 'text-green-500 h-3 w-3' : 'text-gray-400 h-3 w-3'} />
                                <Switch
                                    checked={isSearchEnabled}
                                    onCheckedChange={setIsSearchEnabled}
                                    className="scale-75"
                                />
                                <span className="text-xs font-medium text-slate-600">{isSearchEnabled ? 'Web' : 'Local'}</span>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6 py-4 bg-slate-50/50" ref={scrollRef}>
                    <div className="space-y-6">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-purple-100' : 'bg-white border shadow-sm'}`}>
                                    {m.role === 'user' ? <User className="h-4 w-4 text-purple-600" /> : <Bot className="h-4 w-4 text-purple-500" />}
                                </div>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === 'user'
                                    ? 'bg-purple-600 text-white rounded-tr-none'
                                    : 'bg-white border text-slate-700 rounded-tl-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-white border shadow-sm flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4 text-purple-500" />
                                </div>
                                <div className="bg-white border rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-white">
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                        <Button variant="outline" size="sm" onClick={() => setInput("Give me 5 blog topic ideas")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7">
                            <Lightbulb className="h-3 w-3 mr-1.5" />Topic Ideas
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setInput("Find latest news on Char Dham")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7">
                            <Globe className="h-3 w-3 mr-1.5" />Latest News
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setInput("Generate blog now")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100">
                            <Sparkles className="h-3 w-3 mr-1.5" />Generate Full Blog
                        </Button>
                    </div>

                    <div className="relative">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            placeholder="Ask AI to write, research, or brainstorm..."
                            disabled={isGenerating}
                            className="pr-12 py-6 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-purple-500"
                        />
                        <Button
                            onClick={() => sendMessage()}
                            disabled={isGenerating || !input.trim()}
                            size="icon"
                            className="absolute right-1.5 top-1.5 h-9 w-9 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all"
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-slate-400">AI can make mistakes. Review generated content.</span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
