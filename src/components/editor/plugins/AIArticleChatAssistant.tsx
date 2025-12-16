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

interface AIArticleChatAssistantProps {
    editor: Editor;
    onMetadataGenerated?: (metadata: { title: string; slug: string; excerpt: string }) => void;
    categoryName?: string;
}

export function AIArticleChatAssistant({ editor, onMetadataGenerated, categoryName }: AIArticleChatAssistantProps) {
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
                content: "Hi! I'm your AI editor assistant. I can help you write, edit, and format your article. Try asking me to 'make the text bigger' or 'add a warning card'.",
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

        const um: Message = { role: 'user', content: forceGen ? 'Generate article now' : input, timestamp: Date.now() };
        setMessages(p => [...p, um]);
        const ci = input;
        setInput('');
        setIsGenerating(true);

        try {
            if (forceGen || /\b(generate|create|write)\s+(article|guide|help)\b/i.test(ci)) {
                await genArticle(ci || 'help article');
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
        const currentContent = editor.getHTML();
        const c = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));

        // DETECT COLOR REQUESTS
        const colorMap: Record<string, string> = {
            'pink': '#FF1493',
            'red': '#FF0000',
            'blue': '#1E90FF',
            'green': '#00FF00',
            'yellow': '#FFFF00',
            'purple': '#9B59B6',
            'orange': '#FF8C00',
            'black': '#000000',
            'white': '#FFFFFF',
            'gray': '#808080',
            'grey': '#808080'
        };

        let detectedColor = '';
        let colorHex = '';
        const lowerInput = ui.toLowerCase();
        const isHighlightRequest = lowerInput.includes('highlight') || lowerInput.includes('background');

        for (const [colorName, hex] of Object.entries(colorMap)) {
            if (lowerInput.includes(colorName)) {
                detectedColor = colorName;
                colorHex = hex;
                break;
            }
        }

        // Add context about current article state
        const contextMsg = `
CURRENT EDITOR CONTENT:
${currentContent}

CATEGORY: ${categoryName || 'Uncategorized'}
${detectedColor ? `\n⚠️ USER WANTS ${isHighlightRequest ? 'HIGHLIGHT/BACKGROUND' : 'TEXT'} COLOR: ${detectedColor.toUpperCase()} = ${colorHex}` : ''}
`;
        c.push({ role: 'user', parts: [{ text: contextMsg }] });
        c.push({ role: 'user', parts: [{ text: ui }] });

        const systemPrompt = `You are an AI assistant that edits support articles for staykedarnath.in.

**CRITICAL FORMAT RULES:**

When user requests ANY edit (color change, formatting, adding content):

1. Write a SHORT explanation on its own line
2. On the NEXT line, write ONLY the command tag: <<<REPLACE_FULL>>> or <<<APPEND>>>
3. After the command tag, write ONLY pure HTML - NO explanatory text, NO markdown

**COMMANDS:**

<<<REPLACE_FULL>>> - Replace entire article with modified HTML
<<<APPEND>>> - Add new HTML to end of article

**COLOR INSTRUCTIONS:**
${detectedColor ? `
⚠️⚠️⚠️ CRITICAL: User wants ${detectedColor.toUpperCase()} ${isHighlightRequest ? 'HIGHLIGHT' : 'TEXT'} color!
YOU MUST USE: ${colorHex}
${isHighlightRequest
                    ? `Example: <mark style="background-color: ${colorHex}">text</mark>`
                    : `Example: <p><span style="color: ${colorHex}">text</span></p>`}
DO NOT use any other color!
` : `
- Pink: #FF1493
- Red: #FF0000  
- Blue: #1E90FF
- Black: #000000
`}

**STYLING:**
- Text Color: <p><span style="color: #HEXCODE">Text</span></p>
- Link Color: <a href="URL" style="color: #HEXCODE">Link text</a> (for changing hyperlink color)
- Bold Text Color: <strong><span style="color: #HEXCODE">Bold text</span></strong> (IMPORTANT: span must be INSIDE strong)
- Highlight/Background: <mark style="background-color: #HEXCODE">Highlighted text</mark>
- Headings with color: <h2><span style="color: #HEXCODE">Heading</span></h2>
- Size: <p><span style="font-size: 18px">Larger text</span></p>
- Bold/Italic: <strong>bold</strong> <em>italic</em>
- Creating Links: <a href="https://staykedarnath.in/page">text</a> (when referencing pages, bookings, My Bookings, etc.)

**SPECIAL CARDS:**
<div data-type="custom-card" type="info"><p>Info content</p></div>
<div data-type="custom-card" type="warning"><p>Warning content</p></div>
<div data-type="custom-card" type="tip"><p>Tip content</p></div>

**SITE KNOWLEDGE & URLS:**
- Home: https://staykedarnath.in/
- My Bookings: https://www.staykedarnath.in/dashboard/bookings
- Support/Tickets: https://staykedarnath.in/support/raise
- Track Ticket: https://staykedarnath.in/support/track
- Help Center: https://staykedarnath.in/help
- Packages: https://staykedarnath.in/packages
- Stays/Hotels: https://staykedarnath.in/stays
- Contact Us: https://staykedarnath.in/contact
- Weather: https://staykedarnath.in/weather
- Cancellation Policy: https://staykedarnath.in/cancellation

**RULES:**
1. ALWAYS use <<<REPLACE_FULL>>> or <<<APPEND>>> for ANY edit request
2. Explanation goes BEFORE the tag, HTML goes AFTER
3. After the command tag = ONLY HTML, nothing else
4. For TEXT color: Use <span> with style="color:..."
5. For HIGHLIGHT color: Use <mark> with style="background-color:..."
6. Apply styles to ALL matching elements
7. **WEBSITE NAME:** staykedarnath.in
8. **HEADLINES:** ALWAYS use <h2> tags for main headings. Default color is BLACK (#000000). Do NOT use blue for headings unless requested.
9. **DEFAULT HIGHLIGHT:** If user asks to "highlight" without a color, use BLUE (#1E90FF).
10. **DOMAIN CORRECTION:** If the article contains "staykedarnath.com", automatically replace it with "staykedarnath.in"
11. **BOLD TEXT COLOR:** When user says "change bold text color" or "make bold text [color]", find ALL <strong> tags (including list item headings like "Step 1:", "Note:", etc.) and wrap their content with <span style="color: #HEXCODE">. Example: <strong>Title:</strong> becomes <strong><span style="color: #FF0000">Title:</span></strong>
12. **AUTO-LINKING:** When mentioning pages from the KNOWLEDGE list above, AUTOMATICALLY create hyperlinks using the exact URLs provided. Example: "Check your bookings" -> "Check your <a href="https://staykedarnath.in/dashboard/bookings">bookings</a>".`;

        const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-5-mini-2025-08-07',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...c.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.parts[0].text }))
                ],
                temperature: 1,
                max_completion_tokens: 16384
            })
        });

        const d = await r.json();
        if (!r.ok) throw new Error(d.error?.message || 'Failed');

        const ar = d.choices?.[0]?.message?.content;
        console.log('🤖 AI RESPONSE:', ar);
        console.log('🔍 Has REPLACE_FULL:', ar?.includes('<<<REPLACE_FULL>>>'));
        console.log('🔍 Has APPEND:', ar?.includes('<<<APPEND>>>'));

        if (ar) {
            // Check for commands
            if (ar.includes('<<<REPLACE_FULL>>>')) {
                console.log('✅ REPLACE_FULL command detected');
                const parts = ar.split('<<<REPLACE_FULL>>>');
                const explanation = parts[0].trim();
                const content = parts[1].trim();

                const cleanContent = content.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
                console.log('📝 Cleaned HTML:', cleanContent);

                editor.commands.setContent(cleanContent);
                toast.success('Article updated by AI');

                const displayMessage = explanation || 'I have updated the article content.';
                setMessages(p => [...p, { role: 'assistant', content: displayMessage, timestamp: Date.now() }]);
            } else if (ar.includes('<<<APPEND>>>')) {
                console.log('✅ APPEND command detected');
                const parts = ar.split('<<<APPEND>>>');
                const explanation = parts[0].trim();
                const content = parts[1].trim();

                const cleanContent = content.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
                console.log('📝 Cleaned HTML:', cleanContent);

                editor.commands.insertContent(cleanContent);
                toast.success('Content added by AI');

                const displayMessage = explanation || 'I have added new content to the article.';
                setMessages(p => [...p, { role: 'assistant', content: displayMessage, timestamp: Date.now() }]);
            } else {
                // FALLBACK: Check if response contains HTML with styling (AI didn't use command tags)
                const hasHTMLTags = /<[^>]+>/i.test(ar);
                const hasStyleAttribute = /style\s*=\s*["']/i.test(ar);

                if (hasHTMLTags && hasStyleAttribute) {
                    console.log('⚠️ FALLBACK: Detected styled HTML without command tag - attempting to extract');
                    // Split by lines to separate explanation from HTML
                    const lines = ar.split('\n');
                    let htmlStartIndex = -1;
                    let explanation = '';

                    // Find where HTML starts
                    for (let i = 0; i < lines.length; i++) {
                        if (/<[^>]+>/.test(lines[i])) {
                            htmlStartIndex = i;
                            break;
                        }
                        explanation += lines[i] + '\n';
                    }

                    if (htmlStartIndex >= 0) {
                        const htmlContent = lines.slice(htmlStartIndex).join('\n').trim();
                        const cleanContent = htmlContent.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '');
                        console.log('📝 Extracted HTML (fallback):', cleanContent);
                        console.log('💬 Explanation (fallback):', explanation.trim());

                        editor.commands.setContent(cleanContent);
                        toast.success('Article updated by AI');
                        setMessages(p => [...p, { role: 'assistant', content: explanation.trim() || 'I have updated the article.', timestamp: Date.now() }]);
                    } else {
                        console.log('💬 Normal chat response (no command tags, couldn\'t extract HTML)');
                        setMessages(p => [...p, { role: 'assistant', content: ar, timestamp: Date.now() }]);
                    }
                } else {
                    console.log('💬 Normal chat response (no command tags)');
                    // Normal chat
                    setMessages(p => [...p, { role: 'assistant', content: ar, timestamp: Date.now() }]);
                }
            }
        }
    };

    const genArticle = async (ui: string) => {
        console.log('🚀 Starting article generation...');

        const currentContent = editor.getHTML();
        const ctx = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

        const pr = `CONTEXT:
You are the technical writer for Staykedar.com - a premium travel platform. You are writing a Help Center article.

CATEGORY: ${categoryName || 'General'}

CURRENT ARTICLE CONTENT (Use this to modify/improve if it exists, otherwise write new):
${currentContent}

AUDIENCE:
- Customers seeking answers to specific questions
- Users needing help with bookings, refunds, or account issues
- Travelers looking for specific policy information

CONVERSATION HISTORY:
${ctx}

USER REQUEST: ${ui}

---

YOUR TASK:
Generate a clear, helpful, and AI-SEARCH-OPTIMIZED support article. Output ONLY valid JSON in this exact format:

{
  "title": "Clear, action-oriented title (e.g., 'How to Cancel Your Booking')",
  "slug": "url-friendly-slug-with-hyphens",
  "excerpt": "Brief summary of the solution (150-160 characters)",
  "content": "Full HTML content here"
}

═══════════════════════════════════════════════════════════
🎯 AI SEARCH OPTIMIZATION (Critical for Google AI Overviews)
═══════════════════════════════════════════════════════════

1. DIRECT ANSWER FIRST
   - Start with the solution in the first 1-2 sentences
   - Put the answer before the explanation
   Good: "To cancel your booking, go to My Bookings > Select booking > Cancel."
   Bad: "StayKedarnath offers flexible cancellation policies..."

2. QUESTION-BASED HEADINGS
   - Use H3s that match what users search for:
   <h3>How do I cancel my booking?</h3>
   <h3>When will I get my refund?</h3>
   <h3>Can I modify my booking dates?</h3>

3. INCLUDE SPECIFIC DETAILS
   - Timeframes: "5-7 business days"
   - Costs: "₹500 cancellation fee"
   - Requirements: "Booking ID required"

═══════════════════════════════════════════════════════════
CONTENT STRUCTURE (400-800 words)
═══════════════════════════════════════════════════════════

1. QUICK ANSWER (First 2-3 sentences)
   - Directly answer the main question
   - Include key action or link

2. STEP-BY-STEP GUIDE
   <h2>How to [Action]</h2>
   <ol>
     <li><strong>Step 1:</strong> Go to <a href="https://staykedarnath.in/dashboard/bookings">My Bookings</a></li>
     <li><strong>Step 2:</strong> Click on the booking you want to modify</li>
     <li><strong>Step 3:</strong> Select "Cancel" or "Modify"</li>
   </ol>

3. IMPORTANT NOTES (Use cards)
   <div data-type="custom-card" type="info">
     <p><strong>Note:</strong> Refunds are processed within 5-7 business days.</p>
   </div>

4. RELATED QUESTIONS (Use H3 question format)
   <h3>What if I need to change my dates instead?</h3>
   <p>You can modify your booking dates up to 24 hours before check-in...</p>
   
   <h3>When will I receive my refund?</h3>
   <p>Refunds are processed within 5-7 business days to your original payment method.</p>

5. STILL NEED HELP?
   <p>If you need further assistance, <a href="https://staykedarnath.in/support/raise">contact our support team</a>.</p>

═══════════════════════════════════════════════════════════
HTML FORMATTING
═══════════════════════════════════════════════════════════
- <h2>Main Section Title</h2>
- <h3>Question-based subsection?</h3> (for AI citations)
- <p>Short paragraphs (2-3 sentences)</p>
- <ol><li><strong>Step 1:</strong> Action</li></ol>
- <a href="https://staykedarnath.in/..." target="_blank">Link text</a>
- <strong>Bold</strong> for UI elements and key terms

═══════════════════════════════════════════════════════════
SPECIAL CARDS
═══════════════════════════════════════════════════════════
<div data-type="custom-card" type="info"><p><strong>Note:</strong> Content</p></div>
<div data-type="custom-card" type="warning"><p><strong>Important:</strong> Content</p></div>
<div data-type="custom-card" type="tip"><p><strong>Tip:</strong> Content</p></div>

═══════════════════════════════════════════════════════════
SITE URLS (Always use these exact links)
═══════════════════════════════════════════════════════════
- My Bookings: https://staykedarnath.in/dashboard/bookings
- Support: https://staykedarnath.in/support/raise
- Track Ticket: https://staykedarnath.in/support/track
- Help Center: https://staykedarnath.in/help
- Cancellation Policy: https://staykedarnath.in/cancellation-policy

═══════════════════════════════════════════════════════════
TONE & STYLE
═══════════════════════════════════════════════════════════
- Direct and helpful - solve the problem fast
- Use "you" and "your" - talk to the user
- Include specific numbers, timeframes, requirements
- No marketing language - just solutions
- Short paragraphs (2-3 sentences max)

═══════════════════════════════════════════════════════════
OUTPUT RULES
═══════════════════════════════════════════════════════════
- Output ONLY valid JSON object
- Start with { and end with }
- No markdown code blocks
- Title should be action-oriented (How to..., What is..., Why...)
- Excerpt should directly answer the question

Now generate the article as JSON:`;

        const r = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini-search-preview-2025-03-11',
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

        t = t.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
        const s = t.indexOf('{'), e = t.lastIndexOf('}');
        if (s !== -1 && e !== -1) t = t.substring(s, e + 1);

        console.log('JSON:', t);

        try {
            const b = JSON.parse(t);
            if (!b.title || !b.slug || !b.excerpt || !b.content) throw new Error('Missing fields');

            editor.chain().focus().setContent(b.content).run(); // Use setContent to replace/update
            if (onMetadataGenerated) onMetadataGenerated({ title: b.title, slug: b.slug, excerpt: b.excerpt });

            setMessages(p => [...p, { role: 'assistant', content: `Article generated! Title: ${b.title}`, timestamp: Date.now() }]);
            toast.success('Article generated!');
        } catch (err) {
            console.error('Parse error:', err);
            setMessages(p => [...p, { role: 'assistant', content: 'Failed to parse JSON. Try again.', timestamp: Date.now() }]);
            throw new Error('Invalid JSON');
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 border-none">
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 bg-[#111111] border-[#1A1A1A] text-white">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#1A1A1A]">
                    <div className="flex flex-col gap-2">
                        <SheetTitle className="flex items-center gap-2 text-xl text-white">
                            <Sparkles className="h-5 w-5 text-blue-500" />
                            AI Editor Assistant
                        </SheetTitle>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Smart editing & writing helper</span>
                            <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-full px-3 py-1 border border-[#2A2A2A]">
                                <Globe className={isSearchEnabled ? 'text-green-500 h-3 w-3' : 'text-gray-500 h-3 w-3'} />
                                <Switch
                                    checked={isSearchEnabled}
                                    onCheckedChange={setIsSearchEnabled}
                                    className="scale-75 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-[#333]"
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
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-500/20' : 'bg-[#1A1A1A] border border-[#2A2A2A]'}`}>
                                    {m.role === 'user' ? <User className="h-4 w-4 text-blue-400" /> : <Bot className="h-4 w-4 text-blue-400" />}
                                </div>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-tr-none'
                                    : 'bg-[#1A1A1A] border border-[#2A2A2A] text-gray-200 rounded-tl-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                                </div>
                            </div>
                        ))}
                        {isGenerating && (
                            <div className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                                    <Bot className="h-4 w-4 text-blue-400" />
                                </div>
                                <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-[#1A1A1A] bg-[#111111]">
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                        <Button variant="outline" size="sm" onClick={() => setInput("Fix grammar & spelling")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-[#2A2A2A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">
                            <Sparkles className="h-3 w-3 mr-1.5 text-amber-400" />Fix Grammar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setInput("Make it more professional")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-[#2A2A2A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">
                            <Bot className="h-3 w-3 mr-1.5 text-blue-400" />Professional Tone
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setInput("Generate article now")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20">
                            <Lightbulb className="h-3 w-3 mr-1.5" />Generate Full Article
                        </Button>
                    </div>

                    <div className="relative">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            placeholder="Ask AI to edit, write, or format..."
                            disabled={isGenerating}
                            className="pr-12 py-6 rounded-xl bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder:text-gray-500 focus-visible:ring-blue-500 focus-visible:ring-offset-0 focus-visible:border-blue-500"
                        />
                        <Button
                            onClick={() => sendMessage()}
                            disabled={isGenerating || !input.trim()}
                            size="icon"
                            className="absolute right-1.5 top-1.5 h-9 w-9 bg-blue-600 hover:bg-blue-700 rounded-lg transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
