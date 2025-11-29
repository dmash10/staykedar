import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Loader2, Globe, Send, Lightbulb } from 'lucide-react';
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
                content: "Hi! I am your AI writing assistant. I can help you brainstorm topics, get latest news, and generate complete blogs. Just chat with me or click Generate Blog Now when ready!",
                timestamp: Date.now()
            }]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
                systemInstruction: { parts: [{ text: 'You are a helpful travel blog assistant. Suggest topics, share news. Be concise. Tell user to click Generate Blog Now button when ready. Never output JSON in chat.' }] },
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 border-none">
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] h-[650px] flex flex-col p-0 pr-12">
                <DialogHeader className="px-6 pt-4 pb-4 border-b">
                    <div className="flex flex-col gap-3">
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            AI Writing Assistant
                        </DialogTitle>
                        <div className="flex items-center gap-3">
                            <Globe className={isSearchEnabled ? 'text-green-500 h-4 w-4' : 'text-gray-400 h-4 w-4'} />
                            <Switch checked={isSearchEnabled} onCheckedChange={setIsSearchEnabled} />
                            <span className="text-sm font-medium">{isSearchEnabled ? 'Web Search: ON' : 'Web Search: OFF'}</span>
                        </div>
                    </div>
                </DialogHeader>

                <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
                    <div className="space-y-4">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 rounded-lg px-4 py-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t">
                    <Button
                        onClick={() => sendMessage(true)}
                        disabled={isGenerating || messages.length < 3}
                        className="w-full mb-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold"
                        size="lg"
                    >
                        {isGenerating ? (<><Loader2 className="mr-2 animate-spin" />Generating...</>) : (<><Sparkles className="mr-2" />Generate Blog Now</>)}
                    </Button>

                    <div className="flex gap-2">
                        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder="Type message..." disabled={isGenerating} className="flex-1" />
                        <Button onClick={() => sendMessage()} disabled={isGenerating || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="mt-2 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setInput("Topic ideas")} disabled={isGenerating} className="flex-1 text-xs">
                            <Lightbulb className="h-3 w-3 mr-1" />Topics
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setInput("Latest news")} disabled={isGenerating} className="flex-1 text-xs">
                            <Globe className="h-3 w-3 mr-1" />News
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
