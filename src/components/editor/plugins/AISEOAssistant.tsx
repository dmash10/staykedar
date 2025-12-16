/**
 * AISEOAssistant.tsx - Reusable AI Assistant for SEO Content Editors
 * 
 * Uses OpenAI with internet access
 * Can be used for Cities, Routes, Packages, and other SEO pages
 */

import { useState, useEffect, useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles, Send, User, Bot, Loader2, Globe,
  MapPin, FileText, Search, Lightbulb, Car, Package, RouteIcon
} from 'lucide-react';
import { toast } from 'sonner';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

// Generic content type that can be extended
export interface SEOContentData {
  name?: string;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  description?: string;
  short_description?: string;
  long_description?: string;
  faqs?: { question: string; answer: string }[];
  [key: string]: any;
}

type ContentType = 'city' | 'route' | 'package' | 'attraction' | 'itinerary';
type EditMode = 'full' | 'description' | 'seo' | 'faqs' | 'details' | 'itinerary';

interface AISEOAssistantProps {
  contentType: ContentType;
  onContentGenerated: (data: Partial<SEOContentData>, mode: 'merge' | 'replace') => void;
  currentData?: Partial<SEOContentData>;
  buttonText?: string;
  context?: {
    destination?: string;
    [key: string]: any;
  };
}

// Content type specific prompts
const getSystemPrompt = (contentType: ContentType, data?: Partial<SEOContentData>) => {
  const baseContext = `You are an AI content assistant for StayKedarnath.in - a Kedarnath pilgrimage travel platform.
You create SEO-optimized, AI-search-friendly content.

WRITING STYLE:
- Friendly and conversational, like talking to a traveler friend
- Include specific details (distances, prices, times)
- Be honest about challenges
- Use "you" and "your" to address readers directly
- Short paragraphs (2-4 sentences)

AI SEARCH OPTIMIZATION:
- Start sections with direct answers
- Include specific, quotable facts
- Use question-based headings for FAQs
- Be comprehensive - aim to be THE source for this topic`;

  const typeSpecificPrompts: Record<ContentType, string> = {
    city: `${baseContext}

You are creating content for a CITY/LOCATION page.
Current city: ${data?.name || 'Not set'}

For cities, focus on:
- How to reach this city (air, rail, road)
- Best time to visit with weather details
- Local attractions and things to do
- Where to stay (budget to premium)
- Local food and dining options
- Travel tips and safety information
- Connection to Kedarnath pilgrimage route`,

    route: `${baseContext}

You are creating content for a TRAVEL ROUTE page.
Route: ${data?.from_city || 'Start'} to ${data?.to_city || 'End'}
Distance: ${data?.distance_km || 'Not set'} km

For routes, focus on:
- Detailed route description with stops
- Road conditions and safety
- Best time to travel
- Transport options (taxi, bus, shared)
- Pricing information
- What to see along the way
- Tips for the journey`,

    package: `${baseContext}

You are creating content for a TOUR PACKAGE page.
Package: ${data?.title || data?.name || 'Not set'}

For packages, focus on:
- What's included (hotels, transport, meals)
- Day-by-day itinerary
- What makes this package special
- Who is this package best for
- Booking and cancellation policies
- Pricing breakdown`,

    attraction: `${baseContext}

You are creating content for an ATTRACTION page.
Attraction: ${data?.name || 'Not set'}

For attractions, focus on:
- What makes it special/worth visiting
- How to reach from key points
- Best time and duration needed
- What to expect (experience, facilities)
- Photography tips
- Nearby places to combine`,

    itinerary: `${baseContext}

You are creating a DAY-BY-DAY ITINERARY.
Itinerary: ${data?.title || data?.duration_days + ' Days' || 'Custom Plan'}
Destination Context: ${data?.destination_slug || 'Kedarnath'}
Duration: ${data?.duration_days || 'X'} Days
Start: ${data?.start_location || 'Start'} -> End: ${data?.end_location || 'End'}

For itineraries, focus on:
- Logical flow of travel to ${data?.destination_slug || 'the destination'}
- Specific night halts tailored to the route
- Activities for each day (Morning, Afternoon, Evening)
- Altitude acclimatization awareness (crucial for Himalayan dhams)
- Practical feasibility (don't suggest impossible travel)`
  };

  return typeSpecificPrompts[contentType];
};

// Get quick action buttons based on content type
const getQuickActions = (contentType: ContentType, hasData: boolean) => {
  if (!hasData) {
    return [
      { label: 'Create Full Content', icon: Sparkles, action: 'full' },
    ];
  }

  const commonActions = [
    { label: 'Improve Description', icon: FileText, action: 'description' },
    { label: 'Generate SEO', icon: Search, action: 'seo' },
    { label: 'Create FAQs', icon: Lightbulb, action: 'faqs' },
  ];

  const typeSpecificActions: Record<ContentType, { label: string; icon: any; action: string }[]> = {
    city: [
      ...commonActions,
      { label: 'Update Details', icon: MapPin, action: 'details' },
    ],
    route: [
      ...commonActions,
      { label: 'Route Details', icon: RouteIcon, action: 'details' },
    ],
    package: [
      ...commonActions,
      { label: 'Update Inclusions', icon: Package, action: 'details' },
    ],
    attraction: [
      ...commonActions,
      { label: 'Location Details', icon: MapPin, action: 'details' },
    ],
    itinerary: [
      ...commonActions,
      { label: 'Generate Day Plan', icon: RouteIcon, action: 'full' },
      { label: 'Update Inclusions', icon: Package, action: 'details' },
    ]
  };

  return typeSpecificActions[contentType];
};

export function AISEOAssistant({
  contentType,
  onContentGenerated,
  currentData,
  buttonText = 'AI Assistant'
}: AISEOAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSearchEnabled, setIsSearchEnabled] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Detect edit mode from user input
  const detectEditMode = (userInput: string): EditMode => {
    const lower = userInput.toLowerCase();

    if (/\b(seo|meta|title|meta.?title|meta.?desc|search engine|google)\b/.test(lower)) {
      return 'seo';
    }
    if (/\b(faq|question|answer|common.?question)\b/.test(lower)) {
      return 'faqs';
    }
    if (/\b(description|content|text|rewrite|improve|enhance|story)\b/.test(lower) &&
      !/\b(short.?desc|meta.?desc)\b/.test(lower)) {
      return 'description';
    }
    if (/\b(detail|info|location|distance|time|price|inclusion|feature)\b/.test(lower)) {
      return 'details';
    }
    return 'full';
  };

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const contentName = currentData?.name || currentData?.title || '';
      const welcomeMessage = contentName
        ? `👋 Editing **${contentName}**

I can help you improve specific parts:

• **"Improve description"** - Rewrite main content
• **"Generate SEO metadata"** - Create meta title & description  
• **"Create FAQs"** - Generate AI-optimized FAQ section
• **"Update details"** - Refresh specific information

What would you like to improve?`
        : `👋 Hi! I'm your AI content assistant.

Tell me what you want to create and I'll generate SEO-optimized content with:
- Compelling descriptions
- Meta title & description
- AI-search-optimized FAQs
- Specific details and facts

What would you like to create?`;

      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: Date.now()
      }]);
    }
  }, [isOpen, currentData?.name, currentData?.title]);

  // Auto-scroll to bottom
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

  const sendMessage = async (quickAction?: string) => {
    const userInput = quickAction || input;
    if (!userInput.trim()) return;
    if (!apiKey) {
      toast.error('OpenAI API Key missing. Add VITE_OPENAI_API_KEY to your .env file.');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: userInput,
      timestamp: Date.now()
    };
    setMessages(p => [...p, userMessage]);
    setInput('');
    setIsGenerating(true);

    try {
      const editMode = detectEditMode(userInput);
      await generateContent(userInput, editMode);
    } catch (e: any) {
      console.error('Generation error:', e);
      setMessages(p => [...p, {
        role: 'assistant',
        content: `❌ Error: ${e.message}\n\nPlease try again with a different request.`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContent = async (userInput: string, editMode: EditMode) => {
    const systemPrompt = getSystemPrompt(contentType, currentData);
    const context = messages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n');

    // Build the generation prompt
    const prompt = buildPrompt(systemPrompt, userInput, editMode, context);

    // Use OpenAI model
    const modelName = 'gpt-4o-mini-search-preview-2025-03-11';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `API Error: ${response.status}`);
    }

    let text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No content generated');
    }

    // Parse JSON response
    const parsedData = parseJsonResponse(text);

    if (!parsedData || Object.keys(parsedData).length === 0) {
      throw new Error('Could not parse AI response');
    }

    // Send to parent
    const updateMode = editMode === 'full' ? 'replace' : 'merge';
    onContentGenerated(parsedData, updateMode);

    // Success message
    const modeMessages: Record<EditMode, string> = {
      full: `✨ Content generated! All fields updated.`,
      description: `✅ Description updated! Review the new content.`,
      seo: `✅ SEO metadata generated! Check meta title & description.`,
      faqs: `✅ FAQs generated! Review the questions & answers.`,
      details: `✅ Details updated! Review the changes.`,
      itinerary: `✨ Itinerary generated! Review the day-by-day plan.`
    };

    setMessages(p => [...p, {
      role: 'assistant',
      content: modeMessages[editMode],
      timestamp: Date.now()
    }]);

    toast.success(editMode === 'full' ? 'Content generated!' : 'Content updated!');
  };

  function buildPrompt(systemPrompt: string, userInput: string, editMode: EditMode, context: string): string {
    const currentInfo = `
CURRENT DATA:
${JSON.stringify(currentData || {}, null, 2)}
`;

    const jsonFormats: Record<EditMode, string> = {
      seo: `{
  "meta_title": "SEO title - max 60 chars, include key terms",
  "meta_description": "Compelling description - max 160 chars, include CTA"
}`,
      description: `{
  "short_description": "Hook in 1-2 sentences (max 180 chars)",
  "long_description": "Detailed content (500-1000 words) - can include HTML formatting"
}`,
      faqs: `{
  "faqs": [
    {"question": "Specific question travelers ask?", "answer": "Direct answer with specifics"},
    {"question": "Another common question?", "answer": "Helpful, detailed answer"}
  ]
}`,
      details: contentType === 'city' ? `{
  "how_to_reach": "Transportation options",
  "best_time_to_visit": "Specific months with reasons",
  "weather_info": "Climate details",
  "local_food": "Food options and recommendations",
  "travel_tips": ["Tip 1", "Tip 2"]
}` : contentType === 'route' ? `{
  "road_conditions": "Current road status",
  "best_time_to_travel": "Optimal months",
  "stops_along_way": [{"name": "Stop", "description": "Details", "distance_from_start": 50, "time_needed": "30 mins"}],
  "safety_tips": "Safety information"
}` : `{
  "features": ["Feature 1", "Feature 2"],
  "inclusions": ["Inclusion 1", "Inclusion 2"]
}`,
      itinerary: `{
  "overview": "Rich HTML summary of the trip",
  "inclusions": ["Transport", "Meals"],
  "exclusions": ["Airfare", "Personal Expenses"],
  "price_estimate": 15000,
  "day_wise_plan": [
    {
      "day": 1,
      "title": "Haridwar to Guptkashi",
      "description": "Drive 210km via Devprayag...",
      "activity": "Evening Aarti at Vishwanath Temple",
      "stay_location": "Guptkashi",
      "distance_km": "210",
      "travel_time": "7-8 hours"
    }
  ]
}`,
      full: contentType === 'itinerary' ? `{
  "title": "SEO Title for Itinerary",
  "meta_title": "Meta Title",
  "meta_description": "Meta Description",
  "overview": "Overview text...",
  "price_estimate": 12000,
  "day_wise_plan": [
    {
      "day": 1, 
      "title": "Day Title", 
      "description": "Details...", 
      "stay_location": "City",
      "activity": "Main activity"
    }
  ],
  "inclusions": ["Item 1", "Item 2"],
  "exclusions": ["Item 1", "Item 2"]
}` : `{
  "name": "Name of the content",
  "meta_title": "SEO optimized title (max 60 chars)",
  "meta_description": "Compelling meta description (max 160 chars)",
  "short_description": "Brief hook (max 180 chars)",
  "long_description": "Comprehensive content (500-1500 words)",
  "faqs": [
    {"question": "Question 1?", "answer": "Answer 1"},
    {"question": "Question 2?", "answer": "Answer 2"}
  ]
}`
    };

    return `${systemPrompt}

${currentInfo}

CONVERSATION CONTEXT:
${context}

USER REQUEST: ${userInput}

OUTPUT FORMAT: Valid JSON only, no markdown or explanations.
${jsonFormats[editMode]}

IMPORTANT:
- Use SINGLE quotes for HTML attributes
- NO citation numbers [1], [2]
- NO line breaks inside string values
- Include specific facts and numbers
- Write for both humans AND AI search engines

OUTPUT ONLY JSON:`;
  };

  function parseJsonResponse(text: string): Partial<SEOContentData> | null {
    // Clean up the response
    let jsonText = text.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    // Extract JSON object
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonText = jsonMatch[0];

    try {
      const parsed = JSON.parse(jsonText);
      // Remove citation numbers from text fields
      Object.keys(parsed).forEach(key => {
        if (typeof parsed[key] === 'string') {
          parsed[key] = parsed[key]
            .replace(/\s*\[\d+(?:\s*,\s*\d+)*\]\s*/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      });
      return parsed;
    } catch (e) {
      console.error('JSON parse failed:', e);
      // Try manual extraction for simple fields
      const result: Partial<SEOContentData> = {};

      const extractStr = (field: string): string => {
        const match = text.match(new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 's'));
        return match ? match[1].replace(/\\n/g, '\n') : '';
      };

      const fields = ['meta_title', 'meta_description', 'short_description', 'long_description'];
      fields.forEach(field => {
        const value = extractStr(field);
        if (value) result[field] = value;
      });

      return Object.keys(result).length > 0 ? result : null;
    }
  };

  const quickActions = getQuickActions(contentType, !!(currentData?.name || currentData?.title));

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 border-0 shadow-sm border-[#1A1A1A]"
        >
          <Sparkles className="h-4 w-4" />
          {buttonText}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0 bg-[#111111] border-[#1A1A1A] text-white">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#1A1A1A]">
          <div className="flex flex-col gap-2">
            <SheetTitle className="flex items-center gap-2 text-xl text-white">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Content Assistant
            </SheetTitle>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {currentData?.name || currentData?.title || `Create new ${contentType}`}
              </span>
              <div className="flex items-center gap-2 bg-[#1A1A1A] rounded-full px-3 py-1 border border-[#2A2A2A]">
                <Globe className={isSearchEnabled ? 'text-green-500 h-3 w-3' : 'text-gray-500 h-3 w-3'} />
                <Switch
                  checked={isSearchEnabled}
                  onCheckedChange={setIsSearchEnabled}
                  className="scale-75 data-[state=checked]:bg-purple-600 data-[state=unchecked]:bg-[#333]"
                />
                <span className="text-xs font-medium text-gray-400">
                  {isSearchEnabled ? 'Web Search' : 'Local'}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4 bg-[#0A0A0A]" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-purple-500/20' : 'bg-[#1A1A1A] border border-[#2A2A2A]'
                  }`}>
                  {m.role === 'user'
                    ? <User className="h-4 w-4 text-purple-400" />
                    : <Bot className="h-4 w-4 text-purple-400" />
                  }
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
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.action}
                  variant="outline"
                  size="sm"
                  onClick={() => sendMessage(action.action === 'full' ? 'Generate complete content' : action.label)}
                  disabled={isGenerating}
                  className={`shrink-0 text-xs rounded-full h-7 ${action.action === 'full'
                    ? 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                    : 'border-[#2A2A2A] bg-[#1A1A1A] text-gray-300 hover:bg-[#2A2A2A] hover:text-white'
                    }`}
                >
                  <Icon className="h-3 w-3 mr-1.5" />
                  {action.label}
                </Button>
              );
            })}
          </div>

          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
              placeholder="Ask me anything about this content..."
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
            <span className="text-[10px] text-gray-600">
              Powered by OpenAI {isSearchEnabled ? '+ Search' : ''}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

