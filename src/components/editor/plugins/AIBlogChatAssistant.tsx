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

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

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

        const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-5-mini-2025-08-07',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful travel blog assistant. 
You can help brainstorm topics, share news, and generate content.

CAPABILITIES:
- Generate complete blogs (Click "Generate Blog Now")
- Suggest topics and titles
- Answer questions about travel/policies

If asked "what can you do?" or "list actions", LIST all the capabilities above.
Tell user to click "Generate Blog Now" button when ready for full generation.
Never output JSON in chat.`
                    },
                    ...c.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.parts[0].text }))
                ],
                temperature: 1,
                max_completion_tokens: 16384
            })
        });

        const d = await r.json();
        if (!r.ok) throw new Error(d.error?.message || 'Failed');

        const ar = d.choices?.[0]?.message?.content;
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
Generate a complete, AI-SEARCH-OPTIMIZED blog post. Output ONLY valid JSON in this exact format:

{
  "title": "Engaging title (60-70 characters, includes main keyword)",
  "slug": "url-friendly-slug-with-hyphens",
  "excerpt": "Compelling meta description (150-160 characters)",
  "content": "Full HTML content here"
}

═══════════════════════════════════════════════════════════
🎯 AI SEARCH OPTIMIZATION (Critical for Google AI Overviews)
═══════════════════════════════════════════════════════════
Google AI Mode, ChatGPT, and Perplexity select content based on:

1. DIRECT ANSWERS FIRST - Start sections with the answer
   Bad: "The weather in the region varies..."
   Good: "The best time to visit Kedarnath is May-June and September-October when skies are clear."

2. E-E-A-T SIGNALS - Experience, Expertise, Authoritativeness, Trust
   - Include specific numbers: costs, distances, timings, elevations
   - Share personal insights: "Trust me, start early - by 10 AM the clouds roll in"
   - Reference official sources when relevant

3. MANDATORY FAQ SECTION - Critical for AI citations!
   End with "Frequently Asked Questions" section using H3 questions:
   <h2>Frequently Asked Questions</h2>
   <h3>How much does a Kedarnath trip cost?</h3>
   <p>A basic Kedarnath trip costs ₹5,000-15,000 per person for 3-4 days...</p>
   <h3>Is Kedarnath trek difficult?</h3>
   <p>The 16 km trek from Gaurikund is rated moderate to difficult...</p>
   
   Include 4-6 FAQs covering: cost, timing, difficulty, safety, accommodation, transport

4. INFORMATION DENSITY - Use bullet points, bold key facts
   - Specific data that AI can quote
   - Prices in ₹ with ranges
   - Distances in km
   - Times with hour estimates

═══════════════════════════════════════════════════════════
CONTENT STRUCTURE (1,500-2,500 words)
═══════════════════════════════════════════════════════════

1. OPENING (First 100 words MUST contain direct answer to main question)
   - Hook with a compelling fact or question
   - Immediately answer the main query users are searching for
   - Preview what the article covers

2. QUICK FACTS BOX (Use tip card)
   <div data-type="custom-card" type="info">
     <p><strong>Quick Facts:</strong><br>
     • Best Time: May-June, Sep-Oct<br>
     • Cost: ₹X-₹X per person<br>
     • Duration: X days recommended<br>
     • Difficulty: Easy/Moderate/Difficult</p>
   </div>

3. MAIN CONTENT (4-6 H2 sections)
   - <h2>How to Reach [Destination]</h2>
   - <h2>Best Time to Visit [Destination]</h2>
   - <h2>What to Expect</h2>
   - <h2>Where to Stay</h2>
   - <h2>Essential Tips</h2>
   - <h2>Frequently Asked Questions</h2> (REQUIRED!)

4. FAQ SECTION (MANDATORY - 4-6 questions)
   Format: <h3>Question?</h3><p>Direct answer with specifics...</p>
   Cover: cost, timing, difficulty, safety, accommodation, transport

═══════════════════════════════════════════════════════════
HTML FORMATTING
═══════════════════════════════════════════════════════════
- <h2>Main Section Title</h2>
- <h3>Question-based headings for FAQs</h3>
- <p>Short paragraphs (2-4 sentences max)</p>
- <strong>Bold key facts</strong> that AI can cite
- <ul><li>Bullet points for lists</li></ul>
- <a href="https://real-url.com" target="_blank" rel="noopener">Authority links</a>

═══════════════════════════════════════════════════════════
SPECIAL CARDS (Use 2-4 naturally)
═══════════════════════════════════════════════════════════
<div data-type="custom-card" type="tip"><p>Pro tip content</p></div>
<div data-type="custom-card" type="warning"><p>Safety warning</p></div>
<div data-type="custom-card" type="info"><p>Key information</p></div>
<div data-type="custom-card" type="route"><p>Route details</p></div>
<div data-type="custom-card" type="weather"><p>Weather info</p></div>

═══════════════════════════════════════════════════════════
IMAGES (Use 1-3 real Unsplash URLs)
═══════════════════════════════════════════════════════════
ONLY use REAL working Unsplash URLs:
<img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800" alt="Descriptive alt text">

═══════════════════════════════════════════════════════════
WRITING TONE
═══════════════════════════════════════════════════════════
- Write like a friendly local guide, not a tourism brochure
- Use "you" and "your" - talk directly to reader
- Be specific: "₹2,500-7,000 one-way" not "affordable"
- Honest about challenges: "The last 2 km are steep"
- Short paragraphs (2-4 sentences max)

═══════════════════════════════════════════════════════════
AUTHORITY LINKING (2-3 outbound links)
═══════════════════════════════════════════════════════════
Link to trusted sources for E-E-A-T:
- uttarakhandtourism.gov.in
- Wikipedia for factual info
- Official temple/government sites
Format: <a href='URL' target='_blank' rel='noopener'>anchor text</a>

═══════════════════════════════════════════════════════════
OUTPUT RULES
═══════════════════════════════════════════════════════════
- Output ONLY valid JSON object
- Start with { and end with }
- No markdown code blocks, no explanations
- Use single quotes in HTML attributes
- MUST include FAQ section with 4-6 questions

Now generate the blog post as JSON:`;

        const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-5-mini-2025-08-07',
                messages: [{ role: 'user', content: pr }],
                temperature: 1,
                max_completion_tokens: 16384
            })
        });

        const d = await r.json();
        console.log('Response:', d);

        if (!r.ok) throw new Error(d.error?.message || 'Gen failed');

        let t = d.choices?.[0]?.message?.content;
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
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 bg-[#111111] border-[#1A1A1A] text-white">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#1A1A1A]">
                    <div className="flex flex-col gap-2">
                        <SheetTitle className="flex items-center gap-2 text-xl text-white">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            AI Writing Assistant
                        </SheetTitle>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Blog ideas, drafts & research</span>
                            <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-full px-3 py-1 border border-[#2A2A2A]">
                                <Globe className={isSearchEnabled ? 'text-green-500 h-3 w-3' : 'text-gray-500 h-3 w-3'} />
                                <Switch
                                    checked={isSearchEnabled}
                                    onCheckedChange={setIsSearchEnabled}
                                    className="scale-75 data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-[#333]"
                                />
                                <span className="text-xs font-medium text-gray-400">{isSearchEnabled ? 'Web' : 'Local'}</span>
                            </div>
                        </div>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 px-6 py-4 bg-[#0A0A0A]" ref={scrollRef}>
                    <div className="space-y-6">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-purple-500/20' : 'bg-[#1A1A1A] border border-[#2A2A2A]'}`}>
                                    {m.role === 'user' ? <User className="h-4 w-4 text-purple-400" /> : <Bot className="h-4 w-4 text-purple-400" />}
                                </div>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === 'user'
                                    ? 'bg-purple-600 text-white rounded-tr-none'
                                    : 'bg-[#1A1A1A] border border-[#2A2A2A] text-gray-200 rounded-tl-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4 text-purple-400" />
                                </div>
                                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
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

                <div className="p-4 border-t border-[#1A1A1A] bg-[#111111]">
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                        <Button variant="outline" size="sm" onClick={() => setInput("Give me 5 blog topic ideas")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-[#2A2A2A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">
                            <Lightbulb className="h-3 w-3 mr-1.5 text-amber-400" />Topic Ideas
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setInput("Find latest news on Char Dham")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-[#2A2A2A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">
                            <Globe className="h-3 w-3 mr-1.5 text-blue-400" />Latest News
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setInput("Generate blog now")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
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
                            className="pr-12 py-6 rounded-xl bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-500 focus-visible:ring-purple-500 focus-visible:ring-offset-0 focus-visible:border-purple-500"
                        />
                        <Button
                            onClick={() => sendMessage()}
                            disabled={isGenerating || !input.trim()}
                            size="icon"
                            className="absolute right-1.5 top-1.5 h-9 w-9 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="text-center mt-2">
                        <span className="text-[10px] text-gray-600">AI can make mistakes. Review generated content.</span>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
