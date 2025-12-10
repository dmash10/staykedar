import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { AISEOAssistant, SEOContentData } from '@/components/editor/plugins/AISEOAssistant';
import { SEOItinerary, defaultItinerary, DayPlan } from '@/types/seoItinerary';
import {
    Plus,
    Pencil,
    Trash2,
    Search,
    MapPin,
    Clock,
    Calendar,
    IndianRupee,
    Eye,
    CheckCircle,
    Loader2,
    ExternalLink,
    Car,
} from 'lucide-react';

export default function SEOItinerariesPage() {
    const [itineraries, setItineraries] = useState<SEOItinerary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItinerary, setEditingItinerary] = useState<Partial<SEOItinerary>>(defaultItinerary);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedDestination, setSelectedDestination] = useState<string>('kedarnath');
    const { toast } = useToast();

    // Check query params for destination
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const dest = params.get('destination');
        if (dest) setSelectedDestination(dest);
    }, []);

    useEffect(() => {
        fetchItineraries();
    }, [selectedDestination]);

    const fetchItineraries = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('seo_itineraries')
                .select('*')
                .eq('destination_slug', selectedDestination)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItineraries(data || []);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingItinerary({
            ...defaultItinerary,
            destination_slug: selectedDestination
        });
        setIsDialogOpen(true);
    };

    // ... existing handleEdit ...

    // ... existing handleDelete ...

    // ... existing handleSave ...

    // ... existing handleAIGenerated ...

    // ... existing filteredItineraries ...

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Itinerary Planner</h1>
                        <p className="text-muted-foreground">
                            Create AI-generated day-by-day itineraries for programmatic SEO.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Select
                            value={selectedDestination}
                            onValueChange={(value) => setSelectedDestination(value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Destination" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="kedarnath">Kedarnath</SelectItem>
                                <SelectItem value="badrinath">Badrinath</SelectItem>
                                <SelectItem value="gangotri">Gangotri</SelectItem>
                                <SelectItem value="yamunotri">Yamunotri</SelectItem>
                                <SelectItem value="char-dham">Char Dham Beta</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleCreateNew} className="gap-2">
                            <Plus className="h-4 w-4" /> Create Itinerary
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle>All Itineraries</CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search itineraries..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Route</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredItineraries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No itineraries found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItineraries.map((itinerary) => (
                                        <TableRow key={itinerary.id}>
                                            <TableCell className="font-medium">
                                                {itinerary.title}
                                                <div className="text-xs text-muted-foreground">/{itinerary.slug}</div>
                                            </TableCell>
                                            <TableCell>
                                                {itinerary.start_location} → {itinerary.end_location}
                                                <Badge variant="secondary" className="ml-2 text-[10px] h-5">
                                                    {itinerary.destination_slug}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {itinerary.duration_days} Days
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={itinerary.is_active ? 'default' : 'secondary'}>
                                                    {itinerary.is_active ? 'Active' : 'Draft'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(itinerary)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => setDeleteId(itinerary.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingItinerary.id ? 'Edit Itinerary' : 'Create New Itinerary'}</DialogTitle>
                            <DialogDescription>
                                Use AI to generate a detailed day-by-day plan.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-lg font-semibold text-primary">Core Details</Label>
                                    <AISEOAssistant
                                        contentType="itinerary"
                                        currentData={editingItinerary}
                                        onContentGenerated={handleAIGenerated}
                                        buttonText="Auto-Generate Plan"
                                        context={{
                                            destination: selectedDestination
                                        }}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Plan Title</Label>
                                    <Input
                                        value={editingItinerary.title}
                                        onChange={(e) => setEditingItinerary(p => ({ ...p, title: e.target.value }))}
                                        placeholder="e.g. 5 Days Spiritual Trip from Delhi"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Slug (URL)</Label>
                                        <Input
                                            value={editingItinerary.slug}
                                            onChange={(e) => setEditingItinerary(p => ({ ...p, slug: e.target.value }))}
                                            placeholder="5-days-delhi-kedarnath"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duration (Days)</Label>
                                        <Input
                                            type="number"
                                            value={editingItinerary.duration_days}
                                            onChange={(e) => setEditingItinerary(p => ({ ...p, duration_days: parseInt(e.target.value) }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Start Location</Label>
                                        <Input
                                            value={editingItinerary.start_location}
                                            onChange={(e) => setEditingItinerary(p => ({ ...p, start_location: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>End Location</Label>
                                        <Input
                                            value={editingItinerary.end_location}
                                            onChange={(e) => setEditingItinerary(p => ({ ...p, end_location: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Overview</Label>
                                    <Textarea
                                        value={editingItinerary.overview}
                                        onChange={(e) => setEditingItinerary(p => ({ ...p, overview: e.target.value }))}
                                        className="h-32"
                                        placeholder="Brief summary of the trip..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Estimated Price (₹)</Label>
                                    <Input
                                        type="number"
                                        value={editingItinerary.price_estimate}
                                        onChange={(e) => setEditingItinerary(p => ({ ...p, price_estimate: parseInt(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-lg font-semibold text-primary">Day-wise Plan (JSON)</Label>
                                <div className="bg-slate-50 p-4 rounded-lg border text-xs font-mono h-[400px] overflow-auto">
                                    {editingItinerary.day_wise_plan && editingItinerary.day_wise_plan.length > 0 ? (
                                        <div className="space-y-4">
                                            {editingItinerary.day_wise_plan.map((day, idx) => (
                                                <div key={idx} className="bg-white p-3 border rounded shadow-sm">
                                                    <div className="font-bold text-purple-700">Day {day.day}: {day.title}</div>
                                                    <div className="text-slate-600 mt-1">{day.description}</div>
                                                    <div className="mt-2 flex gap-2 text-xs text-slate-500">
                                                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Stay: {day.stay_location}</span>
                                                        <span className="flex items-center gap-1"><Car className="h-3 w-3" /> {day.distance_km}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-400 italic text-center">
                                            No plan generated yet.<br />Use the AI Assistant to generate a daily itinerary.
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    * To edit details, ask the AI to "Update Day 2" or "Change stay to Sitapur".
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Itinerary
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Alert */}
                <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete this itinerary. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </>
    );
}
