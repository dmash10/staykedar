import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, User, Bot, Loader2, Globe, Lightbulb, Mountain, FileText, Image, Search } from 'lucide-react';
import { toast } from 'sonner';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
};

interface FAQ {
    question: string;
    answer: string;
}

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
    faqs: FAQ[];
}

type EditMode = 'full' | 'description' | 'seo' | 'images' | 'details' | 'faqs';

interface AIAttractionAssistantProps {
    onAttractionGenerated: (data: Partial<AttractionData>, mode: 'merge' | 'replace') => void;
    currentData?: Partial<AttractionData>;
}

export function AIAttractionAssistant({ onAttractionGenerated, currentData }: AIAttractionAssistantProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // GPT-5 Nano Feature Toggles
    const [webSearchEnabled, setWebSearchEnabled] = useState(true);
    const [imageGenEnabled, setImageGenEnabled] = useState(true);
    const [codeInterpreterEnabled, setCodeInterpreterEnabled] = useState(false);

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    // Check API key on mount
    useEffect(() => {
        if (!apiKey) {
            console.error('❌ VITE_OPENAI_API_KEY is not set in environment variables!');
        } else {
            console.log('✅ OpenAI API key found');
        }
    }, [apiKey]);

    // Detect what the user wants to edit
    const detectEditMode = (userInput: string): EditMode => {
        const lower = userInput.toLowerCase();

        if (/\b(seo|meta|title|meta.?title|meta.?desc|search engine|google)\b/.test(lower)) {
            return 'seo';
        }
        if (/\b(description|content|text|rewrite|improve|enhance|story|narrative)\b/.test(lower) &&
            !/\b(short.?desc|meta.?desc)\b/.test(lower)) {
            return 'description';
        }
        if (/\b(image|photo|picture|gallery|unsplash)\b/.test(lower)) {
            return 'images';
        }
        if (/\b(detail|info|location|elevation|distance|time|difficulty|best.?time|rating|tags)\b/.test(lower)) {
            return 'details';
        }
        return 'full';
    };

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage = currentData?.name
                ? `👋 Editing **${currentData.name}**

I can make **precise edits** to specific parts:

• **"Improve the description"** - Rewrites only the main content
• **"Generate SEO metadata"** - Creates meta title & description  
• **"Find better images"** - Searches for new Unsplash images
• **"Update details"** - Refreshes location, elevation, etc.
• **"Regenerate everything"** - Full rewrite of all fields

What would you like to improve?`
                : `👋 Hi! I'm your AI attraction assistant.

Tell me the name of a place near Kedarnath and I'll create a complete listing:

• "Create Deoria Tal"
• "Generate Vasuki Tal attraction"
• "Bhairavnath Temple listing"

Or click **Generate Attraction** after describing what you need!`;

            setMessages([{
                role: 'assistant',
                content: welcomeMessage,
                timestamp: Date.now()
            }]);
        }
    }, [isOpen, currentData?.name]);

    useEffect(() => {
        if (scrollRef.current) {
            requestAnimationFrame(() => {
                scrollRef.current?.scrollTo({
                    top: scrollRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            });
        }
    }, [messages]);

    const sendMessage = async (forceGen = false) => {
        if (!input.trim() && !forceGen) return;
        if (!apiKey) { toast.error('API Key missing'); return; }

        const userMessage: Message = {
            role: 'user',
            content: forceGen ? 'Generate full attraction details' : input,
            timestamp: Date.now()
        };
        setMessages(p => [...p, userMessage]);
        const currentInput = forceGen ? 'Generate complete attraction details' : input;
        setInput('');
        setIsGenerating(true);

        try {
            const editMode = forceGen ? 'full' : detectEditMode(currentInput);
            console.log(`📝 Edit mode detected: ${editMode}`);

            await genAttraction(currentInput, editMode);
        } catch (e: any) {
            console.error('Generation error:', e);
            setMessages(p => [...p, {
                role: 'assistant',
                content: `❌ Error: ${e.message}\n\nPlease try again with a simpler request.`,
                timestamp: Date.now()
            }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const genAttraction = async (userInput: string, editMode: EditMode) => {
        console.log(`🚀 Starting ${editMode} generation...`);

        // Validate API key
        if (!apiKey) {
            throw new Error('OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
        }

        const context = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');

        // Build prompt based on edit mode
        const systemPrompt = buildPrompt(userInput, editMode, context);
        console.log('📝 Prompt length:', systemPrompt.length);

        // GPT-5 Nano with 400k context, 128k output
        const modelName = 'gpt-5-nano-2025-08-07';
        console.log(`🤖 Using model: ${modelName}`);

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...messages.slice(-4).map(m => ({
                            role: m.role,
                            content: m.content
                        })),
                        { role: 'user', content: userInput }
                    ],
                    max_completion_tokens: 16384,
                    response_format: { type: "json_object" }
                })
            });

            const data = await response.json();
            console.log('📥 API Response status:', response.status);

            if (!response.ok) {
                console.error('❌ API Error:', data);
                throw new Error(data.error?.message || `API Error: ${response.status}`);
            }

            let text = data.choices?.[0]?.message?.content;
            if (!text) {
                console.error('❌ No text in response. Full response:', JSON.stringify(data, null, 2));
                throw new Error('No content generated - API returned empty response');
            }

            console.log('📥 AI Response received, length:', text.length);
            console.log('📥 First 300 chars:', text.substring(0, 300));

            // Parse JSON
            const parsedData = parseJsonResponse(text);

            if (!parsedData || Object.keys(parsedData).length === 0) {
                console.error('❌ Parsing returned empty data. Full response:', text);
                throw new Error('Could not parse AI response - check console for details');
            }

            console.log('✅ Parsed data fields:', Object.keys(parsedData));

            // Merge with current data based on edit mode
            const finalData = mergeData(parsedData, editMode);

            // Send to parent - MERGE mode for partial edits, REPLACE for full
            const updateMode = editMode === 'full' ? 'replace' : 'merge';
            onAttractionGenerated(finalData, updateMode);

            // Success message
            const modeMessages: Record<EditMode, string> = {
                full: `✨ **${finalData.name || 'Attraction'}** generated! All fields updated.`,
                description: `✅ Description updated! Review the new content.`,
                seo: `✅ SEO metadata generated! Check meta title & description.`,
                images: `✅ New images found! Review the gallery.`,
                details: `✅ Details updated! Check location, elevation, etc.`,
                faqs: `✅ FAQs generated! Review the questions & answers.`
            };

            setMessages(p => [...p, {
                role: 'assistant',
                content: modeMessages[editMode],
                timestamp: Date.now()
            }]);

            toast.success(editMode === 'full' ? 'Attraction generated!' : 'Content updated!');

            if (editMode === 'full') {
                setIsOpen(false);
            }
        } catch (error: any) {
            console.error('Generation error:', error);
            setMessages(p => [...p, {
                role: 'assistant',
                content: `❌ Error: ${error.message}\n\nPlease try again.`,
                timestamp: Date.now()
            }]);
        }
    };

    function buildPrompt(userInput: string, editMode: EditMode, context: string): string {
        const currentInfo = currentData?.name ? `
CURRENT ATTRACTION DATA:
- Name: ${currentData.name}
- Type: ${currentData.type || 'Not set'}
- Location: ${currentData.location || 'Not set'}
- Elevation: ${currentData.elevation || 'Not set'}
- Short Description: ${currentData.short_description?.substring(0, 100) || 'Not set'}...
- Has Description: ${currentData.description ? 'Yes' : 'No'}
- Meta Title: ${currentData.meta_title || 'Not set'}
- Meta Description: ${currentData.meta_description || 'Not set'}
` : '';

        if (editMode === 'seo') {
            return `You are an SEO expert for Staykedar.com (Kedarnath travel platform).

${currentInfo}

USER REQUEST: ${userInput}

Generate ONLY SEO metadata for this attraction. Output valid JSON:

{
  "meta_title": "SEO title - include location, max 60 chars, compelling for clicks",
  "meta_description": "Action-oriented description, include key details, max 160 chars",
  "tags": ["relevant", "seo", "keywords", "5-8 tags"]
}

Make it compelling for Google search results. OUTPUT ONLY JSON.`;
        }

        if (editMode === 'description') {
            return `You are a friendly, experienced travel blogger writing for Staykedar.com. Write like you're sharing tips with a friend - warm, helpful, real. Not a tourism brochure!

${currentInfo}

CONVERSATION: ${context}

USER REQUEST: ${userInput}

OUTPUT ONLY JSON:
{
  "description": "Full HTML content following structure below",
  "short_description": "Hook + key detail (max 180 chars). Click-worthy!"
}

═══════════════════════════════════════════════════════════
CONTENT STRUCTURE (350-400 words total)
═══════════════════════════════════════════════════════════

<h2>About [Attraction Name]</h2> (80-100 words)
What makes it special. Share the vibe. Why visit?
IMPORTANT: Replace [Attraction Name] with the actual attraction name!

<h2>History & Significance</h2> (60-80 words)
Brief legends or cultural importance. Refrain from long stories.

<h2>How to Reach & Best Time</h2> (80-100 words)
Concise route info from Rishikesh/Delhi/Haridwar. Best months to visit.

<h2>Experience & Tips</h2> (80-100 words)
What to expect, essential items to carry, and one pro tip.

<h2>Things to Do</h2> (Bullet points)
<ul>
<li>Main highlight 1</li>
<li>Main highlight 2</li>
<li>Main highlight 3</li>
</ul>

═══════════════════════════════════════════════════════════
WRITING STYLE
═══════════════════════════════════════════════════════════
✓ Conversational - like talking to a friend
✓ Use "you" and "your" directly
✓ Share insider tips: "Trust me, start early..."
✓ Be specific: "2L water minimum" not "carry water"
✓ Short paragraphs (2-4 sentences)
✓ Honest about challenges

✗ DON'T sound like Wikipedia or a travel brochure
✗ DON'T use passive voice
✗ DON'T be salesy or overly formal

═══════════════════════════════════════════════════════════
AI SEARCH OPTIMIZATION
═══════════════════════════════════════════════════════════
- Start sections with DIRECT answers
- Use question-based H3 headings in FAQs
- Include specific quotable facts
- Be the most helpful, comprehensive source

CARDS: Use 1-3 max, only if helpful.
Syntax: <div data-type='custom-card' data-card-type='tip'><p>Content</p></div>
Types: tip, warning, route, info, weather

⚠️ NO citation numbers [1], [2]. Write naturally.
Use SINGLE quotes in HTML. OUTPUT ONLY JSON.`;
        }

        if (editMode === 'images') {
            return `You are a travel photo curator for Staykedar.com.

${currentInfo}

USER REQUEST: ${userInput}

Find REAL Unsplash images for this Himalayan/Kedarnath attraction. Output JSON:

{
  "main_image": "https://images.unsplash.com/photo-REAL_ID?w=1200",
  "images": [
    "https://images.unsplash.com/photo-ID1?w=800",
    "https://images.unsplash.com/photo-ID2?w=800",
    "https://images.unsplash.com/photo-ID3?w=800"
  ]
}

Use ONLY real Unsplash photo IDs. Search for: Himalayan mountains, glacial lakes, temples, trekking paths.
OUTPUT ONLY JSON.`;
        }

        if (editMode === 'details') {
            return `You are a Kedarnath travel expert for Staykedar.com.

${currentInfo}

USER REQUEST: ${userInput}

Update the practical details. Output JSON with ONLY fields that need updating:

{
  "location": "Precise location (e.g., '6 km northeast of Kedarnath Temple')",
  "elevation": "Altitude (e.g., '4,135 meters')",
  "distance": "Distance from Kedarnath (e.g., '6 km trek')",
  "time_required": "Realistic duration (e.g., '4-5 hours round trip')",
  "best_time": "Optimal months (e.g., 'May to June, September to October')",
  "difficulty": "Easy | Moderate | Moderate to Difficult | Difficult",
  "type": "Religious | Natural | Historical | Adventure",
  "rating": 4.5
}

Be accurate. OUTPUT ONLY JSON.`;
        }

        if (editMode === 'faqs') {
            return `You are an AI Search Optimization expert for Staykedar.com.

${currentInfo}

USER REQUEST: ${userInput}

Generate 5-6 FAQs that travelers commonly search for. These FAQs will be used for:
- Google AI Overviews (answer boxes)
- ChatGPT/Perplexity citations
- Featured snippets
- Schema markup (FAQPage)

Output JSON:
{
  "faqs": [
    {
      "question": "Is [attraction] safe for beginners?",
      "answer": "Direct yes/no + 2-3 sentences with specifics. Include practical tips."
    },
    {
      "question": "What is the best time to visit [attraction]?",
      "answer": "Specific months with weather details. Mention crowd levels."
    },
    {
      "question": "How to reach [attraction] from Rishikesh?",
      "answer": "Route with distances, transport options, and time estimates."
    },
    {
      "question": "Do I need a permit to visit [attraction]?",
      "answer": "Clear answer with details about where to get permits if needed."
    },
    {
      "question": "Where can I stay near [attraction]?",
      "answer": "Accommodation options with approximate price ranges."
    },
    {
      "question": "What should I carry for [attraction]?",
      "answer": "Essential items list with specific recommendations."
    }
  ]
}

FAQ GUIDELINES:
✓ Start each answer with a DIRECT answer (yes/no or specific fact)
✓ Keep answers 2-3 sentences maximum
✓ Include specific details (prices, distances, times)
✓ Use natural language that sounds helpful, not robotic
✓ Cover: safety, timing, transportation, permits, accommodation, packing

OUTPUT ONLY JSON.`;
        }

        // FULL mode - Comprehensive SEO + AI Search Optimized Content
        return `ROLE: You are a friendly, experienced travel blogger who has personally explored the Kedarnath region extensively. You write like you're sharing insider tips with a friend over chai - warm, helpful, and real.

YOU ARE WRITING FOR: Staykedar.com - India's premier Kedarnath pilgrimage & trekking platform.

${currentInfo}

CONVERSATION: ${context}

USER REQUEST: ${userInput}

═══════════════════════════════════════════════════════════
🎯 YOUR WRITING PERSONALITY
═══════════════════════════════════════════════════════════
✓ Write like a FRIENDLY LOCAL GUIDE, not a travel brochure
✓ Share personal insights: "Trust me, start early - by 10 AM the clouds roll in"
✓ Use "you" and "your" - talk directly to the reader
✓ Be conversational but informative - like explaining to a friend
✓ Include specific details only a local would know
✓ Be honest about challenges: "The last 2 km are steep - take it slow"

DON'T:
✗ Sound like a tourism board or Wikipedia
✗ Use passive voice or bureaucratic language
✗ Be overly formal or salesy
✗ Use vague phrases like "beautiful scenery" - be specific!
✗ Write walls of text - keep paragraphs 2-4 sentences

═══════════════════════════════════════════════════════════
📝 CONTENT STRUCTURE (Target: 350-400 words TOTAL)
═══════════════════════════════════════════════════════════

<h2>About [Attraction Name]</h2> (80-100 words)
- Hook the reader with what makes this place special
- Share the vibe: Is it peaceful? Adventurous? Spiritual?
- Why should someone make the effort to visit?

<h2>History & Significance</h2> (50-70 words)
- Brief legends or cultural importance
- Keep it concise and interesting

<h2>Journey & Planning</h2> (100-120 words)
- How to Reach (Briefly from Rishikesh/Delhi)
- Trek details if applicable (Distance, difficulty)
- Best Time to Visit (Months & Weather)

<h2>Essential Tips & Experience</h2> (80-100 words)
- What to expect (facilities/views)
- Pro Tips (What to carry, safety)
- Where to Stay (Brief mention)

<h2>Highlights</h2>
<ul>
<li>Highlight 1</li>
<li>Highlight 2</li>
<li>Highlight 3</li>
</ul>

⚠️ IMPORTANT: DO NOT include an FAQ section in this HTML. 
FAQs must be generated ONLY in the separate "faqs" JSON array.

═══════════════════════════════════════════════════════════
🔍 AI SEARCH OPTIMIZATION (Critical for Google AI Overviews)
═══════════════════════════════════════════════════════════
To get featured in AI search results:

1. START SECTIONS WITH DIRECT ANSWERS
   Bad: "The weather in the region varies..."
   Good: "The best time to visit is May-June and September-October when skies are clear."

2. INCLUDE AUTHORITATIVE HYPERLINKS (REQUIRED)
   You MUST include 2-5 outbound links to official sources (Govt sites, Wikipedia, Weather depts).
   Syntax: <a href='URL' target='_blank' rel='noopener'>Anchor Text</a>

3. INCLUDE SPECIFIC, QUOTABLE FACTS
   "Located at 2,438 meters elevation..."
   "The 6 km trek takes approximately 3-4 hours..."
   "Entry fee is ₹50 for Indians, ₹200 for foreigners..."

4. BE THE AUTHORITATIVE SOURCE
   Include details competitors don't have

═══════════════════════════════════════════════════════════
⛪ TONE BY ATTRACTION TYPE
═══════════════════════════════════════════════════════════

FOR RELIGIOUS/PILGRIMAGE SITES:
- Respectful of spiritual significance
- Include darshan timings, registration requirements
- Mention dress code, photography rules
- Religious customs and etiquette
- Balance practical info with spiritual context

FOR TREKS/NATURE:
- Adventure-friendly but safety-first
- Detailed route with landmarks
- Terrain description (rocky, steep, flat)
- Weather-specific warnings
- Photography tips and best viewpoints
- Acclimatization advice

FOR HISTORICAL SITES:
- Stories that bring history alive
- Architectural highlights
- Best spots to explore
- Guide availability

═══════════════════════════════════════════════════════════
📍 DISTANCE REFERENCES (Always include these!)
═══════════════════════════════════════════════════════════
- Distance from RISHIKESH (primary hub)
- Distance from HARIDWAR
- Distance from DELHI
- Travel time by road/trek

═══════════════════════════════════════════════════════════
🎨 CARDS (Use 1-3 maximum, only when genuinely helpful)
═══════════════════════════════════════════════════════════
Syntax: <div data-type='custom-card' data-card-type='TYPE'><p>Content</p></div>

Use ONLY these types:
- 'tip' → Insider tips, money/time savers
- 'warning' → Safety alerts, important cautions
- 'route' → Specific directions
- 'info' → Key facts that stand out
- 'weather' → Seasonal/weather info

DON'T force cards. Great conversational writing > forced cards.

═══════════════════════════════════════════════════════════
🔗 AUTHORITATIVE LINKING (Critical for AI Search & E-E-A-T)
═══════════════════════════════════════════════════════════
✅ IDEAL: 2-5 outbound authority links per article (1 link per 300-500 words)

WHY THIS MATTERS:
- Signals to Google/AI that your content is well-researched
- Helps AI systems understand context & topic relationships
- Improves E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
- Increases chances of being cited in AI Overviews/ChatGPT/Perplexity

🎯 LINK TO THESE TYPES OF SITES:

1. Official Government/Tourism (HIGHEST PRIORITY)
   - uttarakhandtourism.gov.in
   - GMVN official website
   - Kedarnath Temple official site
   - India Meteorological Department (for weather)
   - District official websites

2. Top Travel Authorities
   - Wikipedia (for factual/historical info)
   - Lonely Planet
   - National Geographic Travel
   - Incredible India

3. Local High-Trust Sites
   - Rudraprayag district official pages
   - Char Dham Yatra updates
   - Weather/disaster management sites

LINKING STRATEGY FOR THIS ARTICLE:
- 1 official government source (weather, permits, or tourism info)
- 1-2 top authority sites (Wikipedia, Lonely Planet)
- 1 local relevant source (district info, route details)

FORMAT: <a href='URL' target='_blank' rel='noopener'>anchor text</a>

EXAMPLE: 
"According to <a href='https://uttarakhandtourism.gov.in' target='_blank' rel='noopener'>Uttarakhand Tourism</a>, the best time..."

❌ DON'T:
- Add 10+ links (looks spammy)
- Link to low-quality blogs
- Use affiliate links as authority links
- Link to irrelevant sites

═══════════════════════════════════════════════════════════
📊 JSON OUTPUT FORMAT
═══════════════════════════════════════════════════════════
CRITICAL RULES:
1. OUTPUT ONLY VALID JSON - No markdown, no explanations
2. Use SINGLE quotes for ALL HTML attributes
3. NO line breaks inside string values - one continuous line
4. ⚠️ NEVER include citation numbers [1], [2] etc.

{
  "name": "Attraction Name",
  "short_description": "Hook + key detail in 2 sentences (max 180 chars). Make it click-worthy!",
  "description": "Full HTML content following the structure above",
  "type": "Religious | Natural | Historical | Adventure",
  "difficulty": "Easy | Moderate | Moderate to Difficult | Difficult",
  "location": "Precise location with district (e.g., 'Chopta, Rudraprayag District, Uttarakhand')",
  "elevation": "Altitude (e.g., '2,438 m / 7,999 ft')",
  "distance": "From nearest major point (e.g., '28 km from Ukhimath, 190 km from Rishikesh')",
  "time_required": "Honest time estimate (e.g., '4-5 hours including stops')",
  "best_time": "Specific months (e.g., 'May-June & Sep-Oct for clear views')",
  "tags": ["primary keyword", "location", "activity type", "difficulty", "season", "nearby places"],
  "main_image": "https://images.unsplash.com/photo-REAL_HIMALAYAN_ID?w=1200",
  "images": ["url1", "url2", "url3"],
  "rating": 4.5,
  "meta_title": "Keyword-rich title (max 60 chars) e.g., 'Deoria Tal Trek 2024 - Route, Best Time & Complete Guide'",
  "meta_description": "Compelling description with CTA (max 155 chars) e.g., 'Trek to Deoria Tal for stunning Chaukhamba reflections. Get route details, camping info & insider tips. Plan your trip now!'",
  "faqs": [
    {
      "question": "Is [attraction] safe for beginners?",
      "answer": "Direct answer with specifics. 2-3 sentences max. Include practical advice."
    },
    {
      "question": "What is the best time to visit [attraction]?",
      "answer": "Specific months with reasoning. Mention weather and crowd conditions."
    },
    {
      "question": "How to reach [attraction] from Rishikesh?",
      "answer": "Route details with distances and time. Mention transport options."
    },
    {
      "question": "Do I need a permit to visit [attraction]?",
      "answer": "Clear yes/no with details about where to get permits if needed."
    },
    {
      "question": "Where can I stay near [attraction]?",
      "answer": "Accommodation options with approximate price ranges."
    }
  ]
}

Generate 5-6 FAQs that travelers commonly ask. Each answer should:
- Start with a DIRECT answer (yes/no or specific fact)
- Be 2-3 sentences maximum
- Include specific, actionable details

Write like you're helping a friend plan their trip. Be helpful, specific, and real.
OUTPUT ONLY JSON.`;
    };

    // Remove citation numbers like [1], [2, 4], [10, 12, 14] from text
    function removeCitations(text: string): string {
        return text
            // Remove citation numbers in brackets [1], [2, 4, 6], etc.
            .replace(/\s*\[\d+(?:\s*,\s*\d+)*\]\s*/g, ' ')
            // Remove multiple spaces
            .replace(/\s+/g, ' ')
            // Clean up space before punctuation
            .replace(/\s+([.,;:!?])/g, '$1')
            .trim();
    };

    function parseJsonResponse(text: string): Partial<AttractionData> | null {
        let jsonText = text.trim()
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();

        const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonMatch) jsonText = jsonMatch[0];

        // Sanitize
        const sanitize = (str: string): string => {
            try {
                JSON.parse(str);
                return str;
            } catch {
                let result = str;
                result = result.replace(/"([^"]*?)"/g, (match, content) => {
                    const fixed = content
                        .replace(/\r\n/g, '\\n')
                        .replace(/\n/g, '\\n')
                        .replace(/\r/g, '\\n')
                        .replace(/\t/g, '\\t');
                    return `"${fixed}"`;
                });
                result = result.replace(/[\u201C\u201D]/g, '\\"');
                result = result.replace(/[\u2018\u2019]/g, "'");
                return result;
            }
        };

        // Normalize type and difficulty values
        const normalizeType = (val: string): string => {
            if (!val) return 'Religious';
            const lower = val.toLowerCase();
            if (lower.includes('natural') || lower.includes('lake') || lower.includes('trek')) return 'Natural';
            if (lower.includes('histor')) return 'Historical';
            if (lower.includes('adventure')) return 'Adventure';
            if (lower.includes('religious') || lower.includes('temple') || lower.includes('spiritual')) return 'Religious';
            return val;
        };

        const normalizeDifficulty = (val: string): string => {
            if (!val) return 'Easy';
            const lower = val.toLowerCase();
            if (lower.includes('difficult') && lower.includes('moderate')) return 'Moderate to Difficult';
            if (lower.includes('difficult')) return 'Difficult';
            if (lower.includes('moderate')) return 'Moderate';
            if (lower.includes('easy')) return 'Easy';
            return val;
        };

        try {
            const sanitized = sanitize(jsonText);
            console.log('🔄 Attempting JSON.parse...');
            const parsed = JSON.parse(sanitized);
            console.log('✅ JSON parsed successfully! Fields found:', Object.keys(parsed));
            // Clean citation numbers from text fields
            if (parsed.description) parsed.description = removeCitations(parsed.description);
            if (parsed.short_description) parsed.short_description = removeCitations(parsed.short_description);
            if (parsed.meta_description) parsed.meta_description = removeCitations(parsed.meta_description);
            if (parsed.location) parsed.location = removeCitations(parsed.location);
            // Normalize type and difficulty
            if (parsed.type) parsed.type = normalizeType(parsed.type);
            if (parsed.difficulty) parsed.difficulty = normalizeDifficulty(parsed.difficulty);
            return parsed;
        } catch (e) {
            console.error('❌ JSON parse failed:', e);
            console.log('📝 Raw text preview (first 500 chars):', jsonText.substring(0, 500));
            console.log('🔄 Trying manual extraction...');
            const extracted = extractFieldsManually(jsonText);
            // Clean citation numbers from extracted fields too
            if (extracted) {
                console.log('✅ Manual extraction found fields:', Object.keys(extracted));
                if (extracted.description) {
                    console.log('📄 Description length:', extracted.description.length);
                    extracted.description = removeCitations(extracted.description);
                }
                if (extracted.short_description) extracted.short_description = removeCitations(extracted.short_description);
                if (extracted.meta_description) extracted.meta_description = removeCitations(extracted.meta_description);
                if (extracted.location) extracted.location = removeCitations(extracted.location);
                // Normalize type and difficulty
                if (extracted.type) extracted.type = normalizeType(extracted.type);
                if (extracted.difficulty) extracted.difficulty = normalizeDifficulty(extracted.difficulty);
            } else {
                console.error('❌ Manual extraction also failed!');
            }
            return extracted;
        }
    };

    function extractFieldsManually(text: string): Partial<AttractionData> | null {
        console.log('📝 Manual extraction starting, text length:', text.length);

        // More robust string extraction that handles multiline content
        const extractStr = (field: string): string => {
            // Method 1: Standard JSON format with escaped content
            let match = text.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
            if (match) {
                console.log(`✓ Found ${field} via method 1`);
                return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
            }

            // Method 2: Find the field and extract until next field or closing brace
            // This handles cases where the content has unescaped quotes
            const fieldStart = text.indexOf(`"${field}"`);
            if (fieldStart !== -1) {
                const colonPos = text.indexOf(':', fieldStart);
                if (colonPos !== -1) {
                    const valueStart = text.indexOf('"', colonPos);
                    if (valueStart !== -1) {
                        // Find the end - look for next field pattern or end of object
                        let depth = 0;
                        let inString = true;
                        let i = valueStart + 1;
                        let escaped = false;

                        while (i < text.length) {
                            const char = text[i];
                            if (escaped) {
                                escaped = false;
                                i++;
                                continue;
                            }
                            if (char === '\\') {
                                escaped = true;
                                i++;
                                continue;
                            }
                            if (char === '"' && inString) {
                                // Check if this is the end
                                const remaining = text.substring(i + 1).trim();
                                if (remaining.startsWith(',') || remaining.startsWith('}')) {
                                    const value = text.substring(valueStart + 1, i);
                                    console.log(`✓ Found ${field} via method 2`);
                                    return value.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
                                }
                            }
                            i++;
                        }
                    }
                }
            }

            // Method 3: Try with single quotes
            match = text.match(new RegExp(`"${field}"\\s*:\\s*'([^']*)'`));
            if (match) {
                console.log(`✓ Found ${field} via method 3`);
                return match[1];
            }

            // Method 4: Unquoted value (for enums)
            match = text.match(new RegExp(`"${field}"\\s*:\\s*([A-Za-z][A-Za-z\\s]+?)(?=[,}\\n])`));
            if (match) {
                console.log(`✓ Found ${field} via method 4`);
                return match[1].trim();
            }

            console.log(`✗ Could not find ${field}`);
            return '';
        };

        // Extract long content like description that might span many lines
        const extractLongContent = (field: string): string => {
            const startPattern = `"${field}"\\s*:\\s*"`;
            const startMatch = text.match(new RegExp(startPattern));
            if (!startMatch) return '';

            const startIndex = text.indexOf(startMatch[0]) + startMatch[0].length;
            let endIndex = startIndex;
            let escaped = false;

            for (let i = startIndex; i < text.length; i++) {
                if (escaped) {
                    escaped = false;
                    continue;
                }
                if (text[i] === '\\') {
                    escaped = true;
                    continue;
                }
                if (text[i] === '"') {
                    // Check if followed by comma or closing brace
                    const after = text.substring(i + 1, i + 20).trim();
                    if (after.startsWith(',') || after.startsWith('}') || after.startsWith('\n')) {
                        endIndex = i;
                        break;
                    }
                }
            }

            if (endIndex > startIndex) {
                const content = text.substring(startIndex, endIndex);
                console.log(`✓ Found ${field} via long content extraction, length: ${content.length}`);
                return content.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t');
            }

            return '';
        };

        const extractArr = (field: string): string[] => {
            const match = text.match(new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]*?)\\]`, 's'));
            if (match) {
                const items = match[1].match(/"([^"]+)"/g);
                return items ? items.map(i => i.replace(/"/g, '')) : [];
            }
            return [];
        };

        const extractNum = (field: string): number => {
            const match = text.match(new RegExp(`"${field}"\\s*:\\s*([\\d.]+)`));
            return match ? parseFloat(match[1]) : 0;
        };

        // Special extractors for type and difficulty with validation
        const extractType = (): string => {
            const val = extractStr('type');
            if (val) return val;

            // Try to find type patterns in the raw text
            const typeMatch = text.match(/"type"\s*:\s*"?(Religious|Natural|Historical|Adventure)"?/i);
            return typeMatch ? typeMatch[1] : '';
        };

        const extractDifficulty = (): string => {
            const val = extractStr('difficulty');
            if (val) return val;

            // Try to find difficulty patterns
            const diffMatch = text.match(/"difficulty"\s*:\s*"?(Easy|Moderate|Moderate to Difficult|Difficult)"?/i);
            return diffMatch ? diffMatch[1] : '';
        };

        const result: Partial<AttractionData> = {};

        const name = extractStr('name');
        if (name) result.name = name;

        const shortDesc = extractStr('short_description');
        if (shortDesc) result.short_description = shortDesc;

        // Use long content extraction for description
        let desc = extractLongContent('description');
        if (!desc) desc = extractStr('description');
        if (desc) result.description = desc;

        const type = extractType();
        if (type) result.type = type;

        const difficulty = extractDifficulty();
        if (difficulty) result.difficulty = difficulty;

        const location = extractStr('location');
        if (location) result.location = location;

        const elevation = extractStr('elevation');
        if (elevation) result.elevation = elevation;

        const distance = extractStr('distance');
        if (distance) result.distance = distance;

        const timeReq = extractStr('time_required');
        if (timeReq) result.time_required = timeReq;

        const bestTime = extractStr('best_time');
        if (bestTime) result.best_time = bestTime;

        const tags = extractArr('tags');
        if (tags.length) result.tags = tags;

        const mainImg = extractStr('main_image');
        if (mainImg) result.main_image = mainImg;

        const images = extractArr('images');
        if (images.length) result.images = images;

        const rating = extractNum('rating');
        if (rating) result.rating = rating;

        const metaTitle = extractStr('meta_title');
        if (metaTitle) result.meta_title = metaTitle;

        const metaDesc = extractStr('meta_description');
        if (metaDesc) result.meta_description = metaDesc;

        // Extract FAQs - they have a special nested structure
        const extractFaqs = (): FAQ[] => {
            const faqs: FAQ[] = [];
            // Match the faqs array
            const faqsMatch = text.match(/"faqs"\s*:\s*\[([\s\S]*?)\]/);
            if (faqsMatch) {
                // Match individual FAQ objects
                const faqPattern = /\{\s*"question"\s*:\s*"([^"]+)"\s*,\s*"answer"\s*:\s*"([^"]+)"\s*\}/g;
                let match;
                while ((match = faqPattern.exec(faqsMatch[1])) !== null) {
                    faqs.push({
                        question: match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
                        answer: match[2].replace(/\\n/g, '\n').replace(/\\"/g, '"')
                    });
                }
            }
            return faqs;
        };

        const faqs = extractFaqs();
        if (faqs.length) result.faqs = faqs;

        return Object.keys(result).length > 0 ? result : null;
    };

    function mergeData(newData: Partial<AttractionData>, editMode: EditMode): Partial<AttractionData> {
        // Validate type and difficulty values
        const validTypes = ['Religious', 'Natural', 'Historical', 'Adventure'];
        const validDifficulties = ['Easy', 'Moderate', 'Moderate to Difficult', 'Difficult'];

        const getValidType = (val?: string): string => {
            if (val && validTypes.includes(val)) return val;
            return currentData?.type && validTypes.includes(currentData.type) ? currentData.type : 'Religious';
        };

        const getValidDifficulty = (val?: string): string => {
            if (val && validDifficulties.includes(val)) return val;
            return currentData?.difficulty && validDifficulties.includes(currentData.difficulty) ? currentData.difficulty : 'Easy';
        };

        // For full mode, return all new data
        if (editMode === 'full') {
            return {
                name: newData.name || currentData?.name || 'Untitled',
                short_description: newData.short_description || currentData?.short_description || '',
                description: newData.description || currentData?.description || '',
                type: getValidType(newData.type),
                difficulty: getValidDifficulty(newData.difficulty),
                location: newData.location || currentData?.location || '',
                elevation: newData.elevation || currentData?.elevation || '',
                distance: newData.distance || currentData?.distance || '',
                time_required: newData.time_required || currentData?.time_required || '',
                best_time: newData.best_time || currentData?.best_time || '',
                tags: newData.tags?.length ? newData.tags : (currentData?.tags || []),
                main_image: newData.main_image || currentData?.main_image || '',
                images: newData.images?.length ? newData.images : (currentData?.images || []),
                rating: newData.rating || currentData?.rating || 4.5,
                meta_title: newData.meta_title || currentData?.meta_title || '',
                meta_description: newData.meta_description || currentData?.meta_description || '',
                faqs: newData.faqs?.length ? newData.faqs : (currentData?.faqs || []),
            };
        }

        // For partial modes, only return fields that were generated
        // Parent will merge these with existing data
        const result: Partial<AttractionData> = {};

        if (editMode === 'seo') {
            if (newData.meta_title) result.meta_title = newData.meta_title;
            if (newData.meta_description) result.meta_description = newData.meta_description;
            if (newData.tags?.length) result.tags = newData.tags;
        } else if (editMode === 'description') {
            if (newData.description) result.description = newData.description;
            if (newData.short_description) result.short_description = newData.short_description;
            if (newData.faqs?.length) result.faqs = newData.faqs; // Include FAQs in description mode
        } else if (editMode === 'images') {
            if (newData.main_image) result.main_image = newData.main_image;
            if (newData.images?.length) result.images = newData.images;
        } else if (editMode === 'details') {
            if (newData.location) result.location = newData.location;
            if (newData.elevation) result.elevation = newData.elevation;
            if (newData.distance) result.distance = newData.distance;
            if (newData.time_required) result.time_required = newData.time_required;
            if (newData.best_time) result.best_time = newData.best_time;
            if (newData.difficulty && validDifficulties.includes(newData.difficulty)) result.difficulty = newData.difficulty;
            if (newData.type && validTypes.includes(newData.type)) result.type = newData.type;
            if (newData.rating) result.rating = newData.rating;
        } else if (editMode === 'faqs') {
            if (newData.faqs?.length) result.faqs = newData.faqs;
        }

        return result;
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 border-0 shadow-sm border-[#1A1A1A]">
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 bg-[#111111] border-[#1A1A1A] text-white">
                <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#1A1A1A]">
                    <div className="flex flex-col gap-2">
                        <SheetTitle className="flex items-center gap-2 text-xl text-white">
                            <Sparkles className="h-5 w-5 text-purple-500" />
                            AI Assistant
                            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-normal">GPT-5 Nano</span>
                        </SheetTitle>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">
                                {currentData?.name ? `Editing: ${currentData.name}` : 'Create new attraction'}
                            </span>
                        </div>
                        {/* GPT-5 Nano Feature Toggles */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            <button
                                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${webSearchEnabled
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-[#1A1A1A] text-gray-500 border border-[#2A2A2A]'
                                    }`}
                            >
                                <Globe className="h-3 w-3" />
                                Web Search
                            </button>
                            <button
                                onClick={() => setImageGenEnabled(!imageGenEnabled)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${imageGenEnabled
                                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                    : 'bg-[#1A1A1A] text-gray-500 border border-[#2A2A2A]'
                                    }`}
                            >
                                <Image className="h-3 w-3" />
                                Image Gen
                            </button>
                            <button
                                onClick={() => setCodeInterpreterEnabled(!codeInterpreterEnabled)}
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${codeInterpreterEnabled
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-[#1A1A1A] text-gray-500 border border-[#2A2A2A]'
                                    }`}
                            >
                                <FileText className="h-3 w-3" />
                                Code
                            </button>
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
                    {/* Quick action buttons */}
                    <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                        {currentData?.name ? (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setInput("Improve the description")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-[#2A2A2A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">
                                    <FileText className="h-3 w-3 mr-1.5 text-purple-400" />Description
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setInput("Generate SEO metadata")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-[#2A2A2A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">
                                    <Search className="h-3 w-3 mr-1.5 text-blue-400" />SEO
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setInput("Find better images")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-[#2A2A2A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">
                                    <Image className="h-3 w-3 mr-1.5 text-green-400" />Images
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="outline" size="sm" onClick={() => setInput("Create Deoria Tal")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-[#2A2A2A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">
                                    <Mountain className="h-3 w-3 mr-1.5 text-amber-400" />Deoria Tal
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setInput("Create Vasuki Tal")} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-[#2A2A2A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white">
                                    <Mountain className="h-3 w-3 mr-1.5 text-amber-400" />Vasuki Tal
                                </Button>
                            </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => sendMessage(true)} disabled={isGenerating} className="shrink-0 text-xs rounded-full h-7 border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
                            <Sparkles className="h-3 w-3 mr-1.5" />Generate All
                        </Button>
                    </div>

                    <div className="relative">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                            placeholder={currentData?.name ? "What would you like to improve?" : "Name an attraction to create..."}
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
