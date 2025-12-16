import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Loader2 } from 'lucide-react';
import { Editor } from '@tiptap/react';
import { toast } from 'sonner';

interface AIBlogGeneratorProps {
    editor: Editor;
    onMetadataGenerated?: (metadata: { title: string; slug: string; excerpt: string }) => void;
}

export function AIBlogGenerator({ editor, onMetadataGenerated }: AIBlogGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Use API key from environment variables
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    const generateBlog = async () => {
        if (!topic) {
            toast.error('Please enter a topic');
            return;
        }
        if (!apiKey) {
            toast.error('API Key is missing in environment variables');
            return;
        }

        setIsLoading(true);

        try {
            const systemPrompt = `
You are an expert travel writer for Staykedar, specializing in Kedarnath Yatra and Char Dham pilgrimages.

**Task**: Create a complete, SEO-optimized blog post about: "${topic}"

**CRITICAL - Use Google Search**: You have access to real-time web search. Use it to find:
- Current weather conditions and forecasts
- Latest booking prices and availability
- Recent travel advisories or route changes
- Up-to-date statistics and facts
- Current events affecting pilgrimages

**CRITICAL**: You must respond with valid JSON in this exact format:
\`\`\`json
{
  "title": "Engaging, SEO-friendly title (60-70 characters)",
  "slug": "url-friendly-slug-here",
  "excerpt": "Compelling meta description for SEO (150-160 characters)",
  "content": "Full HTML blog content here"
}
\`\`\`

**Content HTML Formatting Rules:**
1. Use <h2> for main sections, <h3> for subsections
2. Use <p> for paragraphs, <ul>/<li> for lists
3. Add relevant <a href="..."> links to Kedarnath/travel resources (use current URLs from search)
4. Include <img src="placeholder" alt="descriptive text"> tags where images would enhance content
5. **Use these special card blocks** (CRITICAL - use exact HTML):
   - Info: <div data-type="custom-card" type="info"><p>Helpful information...</p></div>
   - Warning: <div data-type="custom-card" type="warning"><p>Important warning...</p></div>
   - Tip: <div data-type="custom-card" type="tip"><p>Pro tip...</p></div>
   - Weather: <div data-type="custom-card" type="weather"><p>Current weather info from search...</p></div>
   - Route: <div data-type="custom-card" type="route"><p>Route details...</p></div>

**SEO & Content Guidelines:**
- Title: Catchy, includes main keyword, 60-70 chars
- Slug: lowercase, hyphen-separated, includes keyword
- Excerpt: Compelling summary, 150-160 chars
- Content Structure:
  * Opening paragraph (hook the reader)
  * 3-5 main sections with <h2> headers
  * Include current, up-to-date details from web search (weather, prices, timings, dates)
  * At least 2-3 special cards with CURRENT information
  * Add 2-3 relevant links from recent search results
  * Suggest 2-3 image placements with descriptive alt text
  * Closing paragraph with call-to-action
- Tone: Spiritual yet practical, adventurous, helpful
- Length: 800-1000 words
- Keywords: Naturally integrate Kedarnath, Yatra, Char Dham, trekking, pilgrimage

Remember: Output ONLY the JSON. No other text before or after.
            `;

            // Use OpenAI model
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
                        { role: 'user', content: `Generate a blog post about: ${topic}.` }
                    ],
                    response_format: { type: "json_object" },
                    temperature: 1,
                    max_completion_tokens: 16384
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Failed to generate content');
            }

            const generatedText = data.choices?.[0]?.message?.content;

            if (generatedText) {
                // Extract JSON from the response (handle code blocks)
                let jsonText = generatedText.trim();

                // Remove markdown code block if present
                jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

                try {
                    const blogData = JSON.parse(jsonText);

                    // Validate required fields
                    if (!blogData.title || !blogData.slug || !blogData.excerpt || !blogData.content) {
                        throw new Error('Missing required fields in AI response');
                    }

                    // Insert the HTML content into the editor
                    editor.chain().focus().insertContent(blogData.content).run();

                    // Call the metadata callback if provided
                    if (onMetadataGenerated) {
                        onMetadataGenerated({
                            title: blogData.title,
                            slug: blogData.slug,
                            excerpt: blogData.excerpt
                        });
                    }

                    setIsOpen(false);
                    toast.success('Blog generated! Check the title, slug, and excerpt fields above.');
                    setTopic('');

                } catch (parseError) {
                    console.error('JSON Parse Error:', parseError);
                    console.log('Raw AI Response:', generatedText);
                    throw new Error('Failed to parse AI response as JSON. Please try again.');
                }
            } else {
                throw new Error('No content generated');
            }

        } catch (error: any) {
            console.error('Generation Error:', error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 border-none">
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        AI Blog Generator (OpenAI)
                    </DialogTitle>
                    <DialogDescription>
                        Enter a topic and our AI will search the web for current data and write a complete blog with title, slug, excerpt, and content.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="topic">Blog Topic</Label>
                        <Textarea
                            id="topic"
                            placeholder="e.g., Best time to visit Kedarnath for snow trekking..."
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="h-24"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={generateBlog} disabled={isLoading || !topic} className="bg-purple-600 hover:bg-purple-700 text-white">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Writing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
