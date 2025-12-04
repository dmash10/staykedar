import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, User, Bot, Loader2, Globe, Lightbulb, Mountain } from 'lucide-react';
import { toast } from 'sonner';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
};

export interface AttractionData {
    name: string;
    short_description: string;
    description: string;
    type: string;
    difficulty: string;
    location: string;
    elevation: string;
    distance: string;
    time_required: string;
    best_time: string;
    tags: string[];
    main_image: string;
    images: string[];
    rating: number;
    meta_title: string;
    meta_description: string;
}

interface AIAttractionAssistantProps {
    onAttractionGenerated: (data: AttractionData) => void;
    currentData?: Partial<AttractionData>;
}

export function AIAttractionAssistant({ onAttractionGenerated, currentData }: AIAttractionAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isSearchEnabled, setIsSearchEnabled] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage = currentData?.name
                ? `Hi! I can see you're editing **${currentData.name}**. I can help you improve the description, add better images, optimize SEO, or regenerate the entire listing. Just tell me what you'd like to improve!

Examples:
- "Make the description better"
- "Add more engaging content"
- "Improve SEO metadata"
- "Generate better images"`
                : "Hi! I'm your AI travel assistant. I can help you create detailed attraction listings for Kedarnath. Just tell me the name of the place (e.g., 'Vasuki Tal' or 'Bhairavnath Temple') and I'll generate everything for you!";

            setMessages([{
                role: 'assistant',
                content: welcomeMessage,
                timestamp: Date.now()
            }]);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
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

        const userMessage: Message = { role: 'user', content: forceGen ? 'Generate full attraction details now' : input, timestamp: Date.now() };
        setMessages(p => [...p, userMessage]);
        const currentInput = input;
        setInput('');
        setIsGenerating(true);

        try {
            // ALWAYS GENERATE - Don't chat, just generate the JSON
            const shouldChat = /\b(what|how|why|when|tell|explain|suggest|list|show)\b/i.test(currentInput) &&
                !currentData?.name; // Only chat if NOT editing and asking questions

            if (!shouldChat || forceGen) {
                // Generate for everything else
                await genAttraction(currentInput || 'Generate complete details based on our conversation');
            } else {
                await chat(currentInput);
            }
        } catch (e: any) {
            toast.error(e.message);
            setMessages(p => [...p, { role: 'assistant', content: `Error: ${e.message}. Please try again.`, timestamp: Date.now() }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const chat = async (userInput: string) => {
        const history = messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
        history.push({ role: 'user', parts: [{ text: userInput }] });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: history,
                systemInstruction: {
                    parts: [{
                        text: `You are a helpful travel content assistant for Staykedar.com.
You specialize in Kedarnath and Char Dham Yatra attractions.
${currentData?.name ? `\n**CURRENT CONTEXT**: The user is editing the attraction "${currentData.name}".
Current data:
- Type: ${currentData.type}
- Location: ${currentData.location}
- Description: ${currentData.description?.substring(0, 200)}...
- Tags: ${currentData.tags?.join(', ')}

When they ask to "make it better" or "improve" something, you should understand they want to enhance THIS specific attraction's details.` : ''}

CAPABILITIES:
- Generate complete attraction listings (Click "Generate Attraction" button)
- Improve existing descriptions and content
- Suggest better SEO metadata
- Find better Unsplash images for locations
- Enhance tags and categorization

If the user asks to "generate" or "create" a new attraction, guide them to click the "Generate Attraction" button.
If they're editing an existing attraction and ask to improve it, provide specific suggestions or confirm they want full regeneration.
Never output JSON in the chat unless explicitly generating the full listing.` }]
                },
                tools: isSearchEnabled ? [{ googleSearch: {} }] : undefined,
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Failed to get response');

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) setMessages(p => [...p, { role: 'assistant', content: reply, timestamp: Date.now() }]);
    };

    const genAttraction = async (userInput: string) => {
        console.log('🚀 Starting attraction generation...');

        const context = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

        const prompt = `CONTEXT:
You are an expert travel content writer for Staykedar.com - a premium platform showcasing Kedarnath attractions.

${currentData?.name ? `**EDITING MODE**: The user is currently editing the attraction "${currentData.name}".
Current data:
- Name: ${currentData.name}
- Type: ${currentData.type}
- Difficulty: ${currentData.difficulty}
- Location: ${currentData.location}

The user wants to improve or regenerate this attraction. Create a significantly enhanced version.` : ''}

YOUR TASK:
Generate a complete, professional attraction listing in JSON format.

CONVERSATION HISTORY:
${context}

USER REQUEST: ${userInput}

OUTPUT REQUIREMENTS:
1. **ONLY OUTPUT VALID JSON** - No markdown, no code blocks, no extra text
2. **description field**: Use rich, engaging HTML with natural formatting
3. **CRITICAL**: In HTML, use SINGLE quotes for attributes to avoid breaking JSON

OPTIONAL ENHANCEMENT - Cards:
You MAY use special highlight cards IF they genuinely add value. Don't force them.
Only use when you have something truly important to highlight.

Available card types (use single quotes):
- data-card-type='tip' → For helpful visitor tips (e.g., "Visit early morning for best views")
- data-card-type='warning' → For safety alerts (e.g., "Steep terrain, wear proper shoes")
-  data-card-type='route' → For travel directions (e.g., "5km trek from Kedarnath")
- data-card-type='info' → For quick facts (e.g., "Elevation: 3,800m")

Card syntax example: <div data-type='custom-card' data-card-type='tip'><p>Visit during sunrise for breathtaking views</p></div>

RECOMMENDED HTML STRUCTURE:
Write naturally! Cards are optional. Use them ONLY if helpful. Here's a suggested flow:

<h2>Overview</h2>
<p>Engaging opening paragraph describing the attraction...</p>

<h2>History & Significance</h2>
<p>Tell the story, mythology, or historical importance...</p>

<h2>What to Experience</h2>
<p>Describe what visitors will see and do...</p>
<ul>
<li>Key highlight 1</li>
<li>Key highlight 2</li>
</ul>

<!-- ONLY add a card if genuinely helpful, like: -->
<div data-type='custom-card' data-card-type='tip'><p><strong>Pro Tip:</strong> Visit during early morning hours to avoid crowds and enjoy serene atmosphere</p></div>

<h2>How to Reach</h2>
<p>Directions and access information...</p>

<!-- cards are OPTIONAL - use judgment -->

JSON FORMAT (output ONLY this):
{
  "name": "Attraction Name",
  "short_description": "Compelling 1-2 sentence summary",
  "description": "NATURAL HTML - Use cards SPARINGLY if helpful",
  "type": "Religious" or "Natural" or "Historical",
  "difficulty": "Easy" or "Moderate" or "Moderate to Difficult" or "Difficult",
  "location": "Specific location",
  "elevation": "X meters",
  "distance": "X km from Kedarnath",
  "time_required": "X hours",
  "best_time": "Month range",
  "tags": ["keyword1", "keyword2", "keyword3"],
  "main_image": "https://images.unsplash.com/photo-REAL_ID?w=1200",
  "images": [
    "https://images.unsplash.com/photo-REAL_ID1?w=800",
    "https://images.unsplash.com/photo-REAL_ID2?w=800",
    "https://images.unsplash.com/photo-REAL_ID3?w=800"
  ],
  "rating": 4.5,
  "meta_title": "SEO-optimized title (max 60 chars)",
  "meta_description": "Compelling SEO description (max 160 chars)"
}

QUALITY STANDARDS:
✓ Description: 300-500 words, natural narrative style
✓ Cards: 0-2 cards maximum, ONLY when truly adding value
✓ Use proper headings (h2, h3) to organize content
✓ Use bold (<strong>) for emphasis
✓ Add lists for features when appropriate
✓ Write engagingly - like a travel guide, not a form
✓ Images: ONLY real Unsplash URLs
✓ All fields complete

REMEMBER: Cards are OPTIONAL tools, not requirements. Focus on great writing!`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                tools: isSearchEnabled ? [{ googleSearch: {} }] : undefined,
                generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
            })
        });

        const data = await response.json();
        console.log('Raw API Response:', data);

        if (!response.ok) throw new Error(data.error?.message || 'Generation failed');

        let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('No content generated');

        console.log('Raw AI Text:', text);

        // ROBUST JSON EXTRACTION
        let jsonText = text.trim();

        // Remove markdown code blocks
        jsonText = jsonText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();

        // Find JSON object using regex
        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
        } else {
            // Fallback: find using indexOf
            const startIdx = jsonText.indexOf('{');
            const endIdx = jsonText.lastIndexOf('}');
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                jsonText = jsonText.substring(startIdx, endIdx + 1);
            }
        }

        console.log('Extracted JSON:', jsonText);

        if (!jsonText.startsWith('{')) {
            throw new Error('Could not find valid JSON in AI response');
        }

        try {
            const attractionData = JSON.parse(jsonText);

            // Validate required fields
            if (!attractionData.name) {
                throw new Error('Generated data missing "name" field');
            }

            // Create complete data with defaults
            const completeData: AttractionData = {
                name: attractionData.name || 'Untitled Attraction',
                short_description: attractionData.short_description || '',
                description: attractionData.description || '',
                type: attractionData.type || 'Religious',
                difficulty: attractionData.difficulty || 'Easy',
                location: attractionData.location || '',
                elevation: attractionData.elevation || '',
                distance: attractionData.distance || '',
                time_required: attractionData.time_required || '',
                best_time: attractionData.best_time || '',
                tags: Array.isArray(attractionData.tags) ? attractionData.tags : [],
                main_image: attractionData.main_image || '',
                images: Array.isArray(attractionData.images) ? attractionData.images : [],
                rating: typeof attractionData.rating === 'number' ? attractionData.rating : 4.5,
                meta_title: attractionData.meta_title || attractionData.name || '',
                meta_description: attractionData.meta_description || attractionData.short_description || '',
            };

            onAttractionGenerated(completeData);

            setMessages(p => [...p, { role: 'assistant', content: `✨ Attraction "${completeData.name}" generated successfully! All fields have been auto-filled. You can review and adjust them before saving.`, timestamp: Date.now() }]);
            toast.success('Attraction generated successfully!');
            setIsOpen(false); // Close on success
        } catch (parseErr: any) {
            console.error('JSON Parse Error:', parseErr);
            console.error('Failed JSON text:', jsonText);

            setMessages(p => [...p, {
                role: 'assistant',
                content: `I generated content but there was an error parsing it. The AI response started with:\n\n${text.substring(0, 300)}...\n\nPlease try again with a more specific prompt, or click "Generate Attraction" for a fresh start.`,
                timestamp: Date.now()
            }]);

            throw new Error(`Failed to parse JSON: ${parseErr.message}`);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 border-0 shadow-sm">
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                    <div className="flex flex-col gap-2">
                        <SheetTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            Attraction Generator
                        </SheetTitle>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Auto-fill attraction details</span>
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
                        <Button variant="outline" size="sm" onClick={() => setInput("Suggest 5 popular attractions near Kedarnath")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7">
                            <Lightbulb className="h-3 w-3 mr-1.5" />Ideas
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setInput("Create attraction for Vasuki Tal")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7">
                            <Mountain className="h-3 w-3 mr-1.5" />Vasuki Tal
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => sendMessage(true)} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100">
                            <Sparkles className="h-3 w-3 mr-1.5" />Generate Attraction
                        </Button>
                    </div>

                    <div className="relative">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            placeholder="Ask AI to create an attraction..."
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
