import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
    Plus,
    Pencil,
    Trash2,
    RefreshCw,
    Sparkles,
    Eye,
    EyeOff,
    Pin,
    Clock,
    Mountain,
    Plane,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Loader2,
    HelpCircle,
    Newspaper,
    Settings,
    ExternalLink,
    Globe
} from 'lucide-react';

// Types
interface LiveStatusUpdate {
    id: string;
    title: string;
    content: string;
    category: string;
    is_pinned: boolean;
    is_active: boolean;
    published_at: string;
    created_at: string;
}

interface LiveStatusFAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
    display_order: number;
    is_active: boolean;
    last_verified_at: string;
}

const categories = [
    { value: 'general', label: 'General' },
    { value: 'temple', label: 'Temple' },
    { value: 'weather', label: 'Weather' },
    { value: 'road', label: 'Roads' },
    { value: 'trek', label: 'Trek' },
    { value: 'transport', label: 'Transport' },
    { value: 'booking', label: 'Booking' },
];

const statusOptions = ['open', 'closed', 'limited'];

const LiveStatusAdminPage = () => {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('updates');
    const [isLoading, setIsLoading] = useState(true);
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    // Data states
    const [updates, setUpdates] = useState<LiveStatusUpdate[]>([]);
    const [faqs, setFaqs] = useState<LiveStatusFAQ[]>([]);
    const [settings, setSettings] = useState<any>({});

    // Dialog states
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isFAQDialogOpen, setIsFAQDialogOpen] = useState(false);
    const [editingUpdate, setEditingUpdate] = useState<LiveStatusUpdate | null>(null);
    const [editingFAQ, setEditingFAQ] = useState<LiveStatusFAQ | null>(null);

    // Form states
    const [updateForm, setUpdateForm] = useState({ title: '', content: '', category: 'general', is_pinned: false });
    const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'general', display_order: 0 });

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    // Fetch all data
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data: updatesData } = await supabase
                .from('live_status_updates')
                .select('*')
                .order('is_pinned', { ascending: false })
                .order('published_at', { ascending: false });

            const { data: faqsData } = await supabase
                .from('live_status_faqs')
                .select('*')
                .order('display_order', { ascending: true });

            const { data: settingsData } = await supabase
                .from('live_status_settings')
                .select('*');

            if (updatesData) setUpdates(updatesData);
            if (faqsData) setFaqs(faqsData);
            if (settingsData) {
                const settingsMap: any = {};
                settingsData.forEach((s: any) => {
                    settingsMap[s.setting_key] = s.setting_value;
                });
                setSettings(settingsMap);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Update handlers
    const handleSaveUpdate = async () => {
        try {
            const now = new Date().toISOString();
            if (editingUpdate) {
                await supabase
                    .from('live_status_updates')
                    .update({ ...updateForm, updated_at: now })
                    .eq('id', editingUpdate.id);
            } else {
                await supabase.from('live_status_updates').insert({
                    ...updateForm,
                    published_at: now,
                });
            }
            toast({ title: 'Success', description: 'Update saved successfully' });
            setIsUpdateDialogOpen(false);
            setEditingUpdate(null);
            setUpdateForm({ title: '', content: '', category: 'general', is_pinned: false });
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save update', variant: 'destructive' });
        }
    };

    const handleDeleteUpdate = async (id: string) => {
        try {
            await supabase.from('live_status_updates').delete().eq('id', id);
            toast({ title: 'Success', description: 'Update deleted' });
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
        }
    };

    const handleToggleUpdateActive = async (update: LiveStatusUpdate) => {
        try {
            await supabase
                .from('live_status_updates')
                .update({ is_active: !update.is_active })
                .eq('id', update.id);
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to toggle status', variant: 'destructive' });
        }
    };

    // FAQ handlers
    const handleSaveFAQ = async () => {
        try {
            const now = new Date().toISOString();
            if (editingFAQ) {
                await supabase
                    .from('live_status_faqs')
                    .update({ ...faqForm, updated_at: now, last_verified_at: now })
                    .eq('id', editingFAQ.id);
            } else {
                await supabase.from('live_status_faqs').insert({
                    ...faqForm,
                    last_verified_at: now,
                });
            }
            toast({ title: 'Success', description: 'FAQ saved successfully' });
            setIsFAQDialogOpen(false);
            setEditingFAQ(null);
            setFaqForm({ question: '', answer: '', category: 'general', display_order: 0 });
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save FAQ', variant: 'destructive' });
        }
    };

    const handleDeleteFAQ = async (id: string) => {
        try {
            await supabase.from('live_status_faqs').delete().eq('id', id);
            toast({ title: 'Success', description: 'FAQ deleted' });
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
        }
    };

    const handleToggleFAQActive = async (faq: LiveStatusFAQ) => {
        try {
            await supabase
                .from('live_status_faqs')
                .update({ is_active: !faq.is_active })
                .eq('id', faq.id);
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to toggle status', variant: 'destructive' });
        }
    };

    // Status settings handler
    const handleUpdateStatus = async (key: string, value: any) => {
        try {
            const updatedValue = {
                ...value,
                last_updated: new Date().toISOString().split('T')[0]
            };
            await supabase
                .from('live_status_settings')
                .update({ setting_value: updatedValue, updated_at: new Date().toISOString() })
                .eq('setting_key', key);
            toast({ title: 'Success', description: 'Status updated' });
            fetchData();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
        }
    };

    // REAL AI Update Generator using Gemini 2.5 Flash with Google Search
    // Optimized for Google AI Overviews with "Answer First" structure
    const handleAIGenerateUpdate = async () => {
        if (!apiKey) {
            toast({
                title: 'API Key Missing',
                description: 'Please add VITE_GEMINI_API_KEY to your .env file',
                variant: 'destructive'
            });
            return;
        }

        setIsAIGenerating(true);
        setAiError(null);

        try {
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            const timeStr = now.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            const isoTimestamp = now.toISOString();

            // KEDARNATH STATUS PROMPT - Free-form but answer-oriented
            const prompt = `You are a news reporter for StayKedarnath.in. Today is ${dateStr}, ${timeStr} IST.

TASK: Search Google for LATEST Kedarnath news and create a status report.

SEARCH THESE:
- "Kedarnath latest news today"
- "Kedarnath weather update"  
- "Char Dham yatra 2026"
- "Uttarakhand Rudraprayag news"

FACTS YOU MUST KNOW:
- NH-107 road is ALL-WEATHER. Never blocked. Always open.
- Temple closed Nov 3 (Bhai Dooj). Idol at Ukhimath now.
- Only the TREK (16km) is closed due to snow at 3,583m altitude.

WRITE FREELY but follow these rules:
1. Lead with the LATEST news/updates you found
2. Be straight to the point. Answer-first.
3. Short paragraphs. Use line breaks.
4. Don't repeat the same info over and over.

RESPOND WITH JSON:
{
"headline": "Kedarnath Status: ${dateStr}",
"verdict": "Write 1 crisp sentence with current status",
"overall_status": "CLOSED",
"weather": "Current temp/condition",
"helicopter": "SUSPENDED",
"highway": "NH-107: OPEN",
"trek": "CLOSED",
"ground_report": "Write 150-200 words in HTML format. Use <strong> for important words. Use <br><br> between paragraphs. Example: <strong>Latest Update:</strong> Whatever news you found...<br><br><strong>Road Status:</strong> NH-107 is open...<br><br>Start with any BREAKING NEWS you found from search.",
"source_name": "Source name if from official site",
"source_url": "URL from: x.com/rudikipolice, uttarakhandtourism.gov.in, or heliyatra.irctc.co.in"
}`;

            console.log('Calling Gemini 2.5 Flash with Google Search...');

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    tools: [{ googleSearch: {} }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 4096
                    }
                })
            });

            const data = await response.json();
            console.log('Gemini response:', data);

            if (!response.ok) {
                throw new Error(data.error?.message || `API Error: ${response.status}`);
            }

            let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) {
                throw new Error('No content generated from AI');
            }

            console.log('Raw AI text:', text);

            // Clean and parse JSON from response
            let jsonText = text.trim()
                .replace(/^```json\s*/i, '')
                .replace(/^```\s*/i, '')
                .replace(/```\s*$/i, '')
                .trim();

            // Extract JSON object
            const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON object found in AI response');
            }
            jsonText = jsonMatch[0];

            // Clean problematic characters for JSON parsing
            jsonText = jsonText
                .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remove control characters
                .replace(/\n/g, '\\n')  // Escape newlines
                .replace(/\r/g, '')  // Remove carriage returns
                .replace(/\t/g, ' ')  // Replace tabs with space
                .replace(/\\n\\n/g, '\\n')  // Reduce double newlines
                .replace(/"{2,}/g, '"')  // Fix double quotes
                .replace(/,\s*}/g, '}')  // Remove trailing commas
                .replace(/,\s*]/g, ']');  // Remove trailing commas in arrays

            let aiData;
            try {
                aiData = JSON.parse(jsonText);
            } catch (parseError) {
                console.error('JSON parse error, attempting fix:', parseError);

                // Better extraction that handles escaped quotes and longer content
                const extractField = (key: string): string => {
                    // Match the key and capture everything until the next unescaped quote
                    const regex = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
                    const match = jsonText.match(regex);
                    if (match) {
                        return match[1]
                            .replace(/\\"/g, '"')
                            .replace(/\\n/g, ' ')
                            .replace(/\\\\/g, '\\');
                    }
                    return '';
                };

                // Default comprehensive ground report with CORRECT facts
                const defaultGroundReport = `Kedarnath Temple is currently closed for the winter season. The temple doors were ceremonially closed on November 3, 2025, following the Bhai Dooj rituals. The idol of Lord Kedarnath has been moved to Omkareshwar Temple in Ukhimath, where winter puja continues daily.

NH-107 from Rishikesh to Sonprayag is an all-weather road and remains FULLY FUNCTIONAL throughout winter. There is no snow on this highway. Travelers can drive to Sonprayag without any road closure issues. The road conditions are normal with no restrictions.

The 16-kilometer trek route from Gaurikund to Kedarnath Temple is CLOSED due to heavy snow accumulation at the high altitude (3,583m). This trek will remain inaccessible until the snow melts in late April. All helicopter services are SUSPENDED during winter and will resume when the yatra season begins.

The Badrinath-Kedarnath Temple Committee will announce the exact reopening date on Maha Shivratri (late February 2026). The temple is expected to reopen in late April or early May 2026, around Akshaya Tritiya.

For pilgrims planning the 2026 yatra: Complete your Char Dham registration at registrationandtouristcare.uk.gov.in. Book helicopter tickets only through the official IRCTC portal (heliyatra.irctc.co.in) once dates are announced. Early booking is strongly recommended.`;

                aiData = {
                    headline: extractField('headline') || `LIVE Kedarnath Status: ${dateStr}`,
                    verdict: extractField('verdict') || 'Kedarnath Temple is CLOSED for winter. Yatra suspended until April 2026.',
                    overall_status: extractField('overall_status') || 'CLOSED',
                    flash_update: {
                        weather: extractField('weather') || 'Sub-zero | Heavy Snow',
                        helicopter: extractField('helicopter') || 'SUSPENDED - Winter closure',
                        highway: extractField('highway') || 'NH-107: OPEN with caution',
                        trek: extractField('trek') || 'CLOSED - Snow covered'
                    },
                    ground_report: extractField('ground_report') || defaultGroundReport,
                    source_name: extractField('source_name') || null,
                    source_url: extractField('source_url') || null
                };
            }
            console.log('Parsed AI data:', aiData);
            console.log('Source info:', { source_name: aiData.source_name, source_url: aiData.source_url });

            // Build content with proper formatting and trust badge
            const statusEmoji = aiData.overall_status === 'OPEN' ? '🟢' :
                aiData.overall_status === 'CAUTION' ? '🟡' : '🔴';

            // Build source citation with trust badge (HTML)
            let sourceLine = '';
            if (aiData.source_name && aiData.source_url) {
                sourceLine = `<div class="source-verified">✅ <strong>Verified:</strong> <a href="${aiData.source_url}" target="_blank" rel="noopener">${aiData.source_name}</a></div>`;
            } else if (aiData.source_name) {
                sourceLine = `<div class="source">📋 <strong>Source:</strong> ${aiData.source_name}</div>`;
            } else {
                sourceLine = '<div class="source">📋 <strong>Source:</strong> Local Reports</div>';
            }

            // HTML content for proper rich text rendering
            // Handle both flat and nested flash_update structure
            const weather = aiData.weather || aiData.flash_update?.weather || 'Data unavailable';
            const helicopter = aiData.helicopter || aiData.flash_update?.helicopter || 'SUSPENDED';
            const highway = aiData.highway || aiData.flash_update?.highway || 'Check conditions';
            const trek = aiData.trek || aiData.flash_update?.trek || 'CLOSED';

            const htmlContent = `<div class="flash-update">
<h3>${statusEmoji} FLASH UPDATE: ${timeStr} IST</h3>

<p><strong>Status: ${aiData.overall_status}</strong></p>

<p>${aiData.verdict}</p>

<ul>
<li><strong>Weather:</strong> ${weather}</li>
<li><strong>Helicopter:</strong> ${helicopter}</li>
<li><strong>Highway:</strong> ${highway}</li>
<li><strong>Trek:</strong> ${trek}</li>
</ul>

${sourceLine}

<hr/>

<h3>GROUND REPORT</h3>

<div class="ground-report">${aiData.ground_report || ''}</div>
</div>`;

            // DELETE all previous updates first (keep only 1 AI update at a time)
            await supabase.from('live_status_updates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            console.log('Deleted all previous updates');

            // Save new update to database
            await supabase.from('live_status_updates').insert({
                title: aiData.headline,
                content: htmlContent,
                category: 'general',
                is_pinned: true,
                published_at: now.toISOString(),
            });

            // Update last AI update timestamp with more metadata
            await supabase
                .from('live_status_settings')
                .upsert({
                    setting_key: 'last_ai_update',
                    setting_value: {
                        timestamp: now.toISOString(),
                        model: 'gemini-2.5-flash',
                        overall_status: aiData.overall_status,
                        headline: aiData.headline
                    },
                    updated_at: now.toISOString()
                }, { onConflict: 'setting_key' });

            toast({
                title: 'AI Update Generated',
                description: `Status: ${aiData.overall_status} - Real-time data fetched via Google Search`
            });
            fetchData();
        } catch (error: any) {
            console.error('AI generation error:', error);
            setAiError(error.message);
            toast({
                title: 'AI Generation Failed',
                description: error.message,
                variant: 'destructive'
            });
        }
        setIsAIGenerating(false);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryBadge = (category: string) => {
        const colors: { [key: string]: string } = {
            general: 'bg-slate-600',
            temple: 'bg-orange-600',
            weather: 'bg-sky-600',
            road: 'bg-emerald-600',
            trek: 'bg-violet-600',
            transport: 'bg-indigo-600',
            booking: 'bg-rose-600',
        };
        return colors[category] || 'bg-slate-600';
    };

    if (isLoading) {
        return (
            <>
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            </>
        );
    }

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
                            <Mountain className="w-7 h-7 text-orange-500" />
                            Live Status Manager
                        </h1>
                        <p className="text-gray-400 mt-1">
                            Manage real-time Kedarnath Yatra updates with AI-powered content
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => window.open('/live-status', '_blank')}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Page
                        </Button>
                        <Button
                            onClick={handleAIGenerateUpdate}
                            disabled={isAIGenerating}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        >
                            {isAIGenerating ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Globe className="w-4 h-4 mr-2" />
                            )}
                            Generate AI Update
                        </Button>
                    </div>
                </div>

                {/* AI Info Banner */}
                <Card className="bg-gradient-to-r from-gray-800 to-gray-900 border-gray-700">
                    <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/20 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">Powered by Gemini 2.5 Flash</p>
                                    <p className="text-xs text-gray-400">
                                        {settings.last_ai_update
                                            ? `Last update: ${formatDate(settings.last_ai_update.timestamp)}`
                                            : 'Click "Generate AI Update" to fetch real-time status'}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                                Google Search Enabled
                            </Badge>
                        </div>
                        {aiError && (
                            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-sm text-red-400">
                                Error: {aiError}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="bg-gray-800 border border-gray-700">
                        <TabsTrigger value="updates" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                            <Newspaper className="w-4 h-4 mr-2" />
                            Updates ({updates.length})
                        </TabsTrigger>
                        <TabsTrigger value="faqs" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                            <HelpCircle className="w-4 h-4 mr-2" />
                            FAQs ({faqs.length})
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white">
                            <Settings className="w-4 h-4 mr-2" />
                            Status Settings
                        </TabsTrigger>
                    </TabsList>

                    {/* Updates Tab */}
                    <TabsContent value="updates" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-white">News & Updates</h2>
                            <Button onClick={() => {
                                setEditingUpdate(null);
                                setUpdateForm({ title: '', content: '', category: 'general', is_pinned: false });
                                setIsUpdateDialogOpen(true);
                            }} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Update
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {updates.map((update) => (
                                <Card key={update.id} className={`bg-gray-800 border-gray-700 ${!update.is_active ? 'opacity-50' : ''} ${update.is_pinned ? 'border-l-4 border-l-orange-500' : ''}`}>
                                    <CardContent className="py-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    {update.is_pinned && <Pin className="w-4 h-4 text-orange-400" />}
                                                    <h3 className="font-semibold text-white truncate">{update.title}</h3>
                                                    <Badge className={`${getCategoryBadge(update.category)} text-white text-xs`}>
                                                        {update.category}
                                                    </Badge>
                                                    {!update.is_active && (
                                                        <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">Hidden</Badge>
                                                    )}
                                                </div>
                                                <div
                                                    className="text-sm text-gray-300 prose prose-sm prose-invert max-w-none line-clamp-6 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mt-2 [&>ul]:my-1 [&>ul]:pl-4 [&>li]:my-0 [&>p]:my-1 [&>hr]:my-2 [&>hr]:border-gray-600 [&_a]:text-blue-400 [&_.source-verified]:bg-green-900/30 [&_.source-verified]:p-2 [&_.source-verified]:rounded [&_.source-verified]:text-green-400 [&_.source-verified]:text-xs [&_.source-verified]:mt-2 [&_.source]:bg-gray-700/50 [&_.source]:p-2 [&_.source]:rounded [&_.source]:text-gray-400 [&_.source]:text-xs [&_.source]:mt-2"
                                                    dangerouslySetInnerHTML={{ __html: update.content }}
                                                />
                                                <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(update.published_at)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleUpdateActive(update)}
                                                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                                                >
                                                    {update.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingUpdate(update);
                                                        setUpdateForm({
                                                            title: update.title,
                                                            content: update.content,
                                                            category: update.category,
                                                            is_pinned: update.is_pinned,
                                                        });
                                                        setIsUpdateDialogOpen(true);
                                                    }}
                                                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-gray-800 border-gray-700">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white">Delete Update?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-400">
                                                                This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteUpdate(update.id)} className="bg-red-600 hover:bg-red-700">
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {updates.length === 0 && (
                                <Card className="bg-gray-800 border-gray-700">
                                    <CardContent className="py-12 text-center text-gray-400">
                                        No updates yet. Click "Generate AI Update" to fetch real-time status.
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>

                    {/* FAQs Tab */}
                    <TabsContent value="faqs" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-white">Frequently Asked Questions</h2>
                            <Button onClick={() => {
                                setEditingFAQ(null);
                                setFaqForm({ question: '', answer: '', category: 'general', display_order: faqs.length });
                                setIsFAQDialogOpen(true);
                            }} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add FAQ
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <Card key={faq.id} className={`bg-gray-800 border-gray-700 ${!faq.is_active ? 'opacity-50' : ''}`}>
                                    <CardContent className="py-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xs text-gray-500 font-mono">#{idx + 1}</span>
                                                    <Badge className={`${getCategoryBadge(faq.category)} text-white text-xs`}>
                                                        {faq.category}
                                                    </Badge>
                                                    {!faq.is_active && (
                                                        <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">Hidden</Badge>
                                                    )}
                                                </div>
                                                <h3 className="font-medium text-white mb-1">Q: {faq.question}</h3>
                                                <p className="text-sm text-gray-400 line-clamp-2">A: {faq.answer}</p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    Verified: {formatDate(faq.last_verified_at)}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleFAQActive(faq)}
                                                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                                                >
                                                    {faq.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditingFAQ(faq);
                                                        setFaqForm({
                                                            question: faq.question,
                                                            answer: faq.answer,
                                                            category: faq.category,
                                                            display_order: faq.display_order,
                                                        });
                                                        setIsFAQDialogOpen(true);
                                                    }}
                                                    className="text-gray-400 hover:text-white hover:bg-gray-700"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-gray-800 border-gray-700">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-white">Delete FAQ?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-gray-400">
                                                                This will remove the FAQ from the live status page.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600">Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDeleteFAQ(faq.id)} className="bg-red-600 hover:bg-red-700">
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                        <h2 className="text-lg font-semibold text-white">Quick Status Toggles</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Temple Status */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                                        <Mountain className="w-5 h-5 text-orange-500" />
                                        Temple Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-gray-300">Status</Label>
                                        <Select
                                            value={settings.temple_status?.status || 'closed'}
                                            onValueChange={(value) => handleUpdateStatus('temple_status', {
                                                ...settings.temple_status,
                                                status: value
                                            })}
                                        >
                                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-700">
                                                {statusOptions.map(opt => (
                                                    <SelectItem key={opt} value={opt} className="text-white hover:bg-gray-700">{opt.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Note</Label>
                                        <Input
                                            value={settings.temple_status?.note || ''}
                                            onChange={(e) => handleUpdateStatus('temple_status', {
                                                ...settings.temple_status,
                                                note: e.target.value
                                            })}
                                            placeholder="E.g., Open for darshan 4 AM - 9 PM"
                                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Helicopter Status */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                                        <Plane className="w-5 h-5 text-sky-500" />
                                        Helicopter Service
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-gray-300">Status</Label>
                                        <Select
                                            value={settings.helicopter_status?.status || 'closed'}
                                            onValueChange={(value) => handleUpdateStatus('helicopter_status', {
                                                ...settings.helicopter_status,
                                                status: value
                                            })}
                                        >
                                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-700">
                                                {statusOptions.map(opt => (
                                                    <SelectItem key={opt} value={opt} className="text-white hover:bg-gray-700">{opt.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Note</Label>
                                        <Input
                                            value={settings.helicopter_status?.note || ''}
                                            onChange={(e) => handleUpdateStatus('helicopter_status', {
                                                ...settings.helicopter_status,
                                                note: e.target.value
                                            })}
                                            placeholder="E.g., All operators flying"
                                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Trek Status */}
                            <Card className="bg-gray-800 border-gray-700">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                                        <MapPin className="w-5 h-5 text-emerald-500" />
                                        Trek Route
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-gray-300">Status</Label>
                                        <Select
                                            value={settings.trek_status?.status || 'closed'}
                                            onValueChange={(value) => handleUpdateStatus('trek_status', {
                                                ...settings.trek_status,
                                                status: value
                                            })}
                                        >
                                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-gray-800 border-gray-700">
                                                {statusOptions.map(opt => (
                                                    <SelectItem key={opt} value={opt} className="text-white hover:bg-gray-700">{opt.toUpperCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label className="text-gray-300">Note</Label>
                                        <Input
                                            value={settings.trek_status?.note || ''}
                                            onChange={(e) => handleUpdateStatus('trek_status', {
                                                ...settings.trek_status,
                                                note: e.target.value
                                            })}
                                            placeholder="E.g., Path clear, no snow"
                                            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Update Dialog */}
                <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                    <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="text-white">{editingUpdate ? 'Edit Update' : 'Add New Update'}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Create a professional status update with current information.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-gray-300">Title</Label>
                                <Input
                                    value={updateForm.title}
                                    onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                                    placeholder="E.g., Kedarnath Yatra Status Update - December 2025"
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                                />
                            </div>
                            <div>
                                <Label className="text-gray-300">Content</Label>
                                <Textarea
                                    value={updateForm.content}
                                    onChange={(e) => setUpdateForm({ ...updateForm, content: e.target.value })}
                                    placeholder="Professional update with factual information..."
                                    rows={8}
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-300">Category</Label>
                                    <Select
                                        value={updateForm.category}
                                        onValueChange={(value) => setUpdateForm({ ...updateForm, category: value })}
                                    >
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {categories.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-gray-700">{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <Switch
                                        checked={updateForm.is_pinned}
                                        onCheckedChange={(checked) => setUpdateForm({ ...updateForm, is_pinned: checked })}
                                    />
                                    <Label className="text-gray-300">Pin to top</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">Cancel</Button>
                            <Button onClick={handleSaveUpdate} className="bg-blue-600 hover:bg-blue-700">Save Update</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* FAQ Dialog */}
                <Dialog open={isFAQDialogOpen} onOpenChange={setIsFAQDialogOpen}>
                    <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
                        <DialogHeader>
                            <DialogTitle className="text-white">{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Create factual Q&A for AI search optimization.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-gray-300">Question</Label>
                                <Input
                                    value={faqForm.question}
                                    onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                                    placeholder="E.g., Is Kedarnath temple open in December 2025?"
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                                />
                            </div>
                            <div>
                                <Label className="text-gray-300">Answer</Label>
                                <Textarea
                                    value={faqForm.answer}
                                    onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                                    placeholder="Direct, factual answer with specific details..."
                                    rows={5}
                                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-gray-300">Category</Label>
                                    <Select
                                        value={faqForm.category}
                                        onValueChange={(value) => setFaqForm({ ...faqForm, category: value })}
                                    >
                                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {categories.map(cat => (
                                                <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-gray-700">{cat.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label className="text-gray-300">Display Order</Label>
                                    <Input
                                        type="number"
                                        value={faqForm.display_order}
                                        onChange={(e) => setFaqForm({ ...faqForm, display_order: parseInt(e.target.value) || 0 })}
                                        className="bg-gray-700 border-gray-600 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsFAQDialogOpen(false)} className="border-gray-600 text-gray-300 hover:bg-gray-700">Cancel</Button>
                            <Button onClick={handleSaveFAQ} className="bg-blue-600 hover:bg-blue-700">Save FAQ</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default LiveStatusAdminPage;
