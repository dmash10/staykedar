
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Printer, Map, Plus, Trash2, GripVertical, Clock, MapPin, Coffee, Bed, Mountain } from "lucide-react";
import { ItineraryTemplate, ItineraryData, DayPlan, Activity } from "./ItineraryTemplate";
import { Lead } from "@/components/admin/crm/LeadCard";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface ItineraryBuilderProps {
    lead: Lead | null;
}

const DEFAULT_TEMPLATES: Record<string, DayPlan[]> = {
    'kedarnath_3n4d': [
        {
            id: 'd1', dayNumber: 1, title: 'Arrival in Guptkashi', activities: [
                { id: 'a1', time: '10:00 AM', title: 'Pickup from Haridwar', description: 'Meet our driver at Haridwar Railway Station.', type: 'travel' },
                { id: 'a2', time: '05:00 PM', title: 'Check-in at Hotel', description: 'Rest and dinner at Hotel Shiva, Guptkashi.', type: 'stay' }
            ]
        },
        {
            id: 'd2', dayNumber: 2, title: 'Trek to Kedarnath', activities: [
                { id: 'a3', time: '05:00 AM', title: 'Drop at Sonprayag', description: 'Early morning drive to Sonprayag.', type: 'travel' },
                { id: 'a4', time: '08:00 AM', title: 'Start Trek', description: '16km trek to Kedarnath Temple.', type: 'activity' },
                { id: 'a5', time: '06:00 PM', title: 'Night Halt', description: 'Stay comfortably near the temple.', type: 'stay' }
            ]
        },
        {
            id: 'd3', dayNumber: 3, title: 'Darshan & Return', activities: [
                { id: 'a6', time: '06:00 AM', title: 'Morning Darshan', description: 'Visit the holy shrine.', type: 'activity' },
                { id: 'a7', time: '11:00 AM', title: 'Trek Down', description: 'Return to Gaurikund -> Sonprayag.', type: 'travel' }
            ]
        }
    ]
};

export function ItineraryBuilder({ lead }: ItineraryBuilderProps) {
    const componentRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    // Itinerary State
    const [tripTitle, setTripTitle] = useState("Kedarnath Yatra 2024");
    const [days, setDays] = useState<DayPlan[]>(DEFAULT_TEMPLATES['kedarnath_3n4d']);
    const [activeDayId, setActiveDayId] = useState<string>(days[0]?.id || 'd1');

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Itinerary-${lead?.customer_name || 'Guest'}`,
    });

    const addDay = () => {
        const newDayId = `d${Date.now()}`;
        const newDay: DayPlan = {
            id: newDayId,
            dayNumber: days.length + 1,
            title: 'New Day',
            activities: []
        };
        setDays([...days, newDay]);
        setActiveDayId(newDayId);
    };

    const addActivity = (dayId: string) => {
        const newActivity: Activity = {
            id: `a${Date.now()}`,
            time: '09:00 AM',
            title: 'New Activity',
            description: '',
            type: 'activity'
        };
        setDays(days.map(d => d.id === dayId ? { ...d, activities: [...d.activities, newActivity] } : d));
    };

    const updateActivity = (dayId: string, activityId: string, updates: Partial<Activity>) => {
        setDays(days.map(d => d.id === dayId ? {
            ...d,
            activities: d.activities.map(a => a.id === activityId ? { ...a, ...updates } : a)
        } : d));
    };

    const updateDayTitle = (dayId: string, title: string) => {
        setDays(days.map(d => d.id === dayId ? { ...d, title } : d));
    };

    const deleteActivity = (dayId: string, activityId: string) => {
        setDays(days.map(d => d.id === dayId ? {
            ...d,
            activities: d.activities.filter(a => a.id !== activityId)
        } : d));
    };

    const itineraryData: ItineraryData | null = lead ? {
        customerName: lead.customer_name || "Guest",
        tripTitle,
        days
    } : null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="w-full bg-slate-800 border-white/10 hover:bg-slate-700 text-slate-300">
                    <Map className="w-4 h-4 mr-2" /> Custom Itinerary
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-full bg-[#0b1015] border-white/10 text-white h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 border-b border-white/10 bg-slate-900">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2">
                            <Map className="w-5 h-5 text-orange-500" />
                            Itinerary Builder
                        </DialogTitle>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700"
                                onClick={() => handlePrint && handlePrint()}
                            >
                                <Printer className="w-4 h-4 mr-2" /> Print PDF
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Day List & Editor */}
                    <div className="w-[450px] border-r border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/10 space-y-3 bg-slate-900/50">
                            <Label>Trip Title</Label>
                            <Input
                                value={tripTitle}
                                onChange={(e) => setTripTitle(e.target.value)}
                                className="bg-black/20 border-white/10"
                            />
                        </div>

                        <div className="flex flex-1 overflow-hidden">
                            {/* Day Tabs Vertical */}
                            <div className="w-16 bg-slate-900 border-r border-white/5 flex flex-col items-center py-4 gap-2 overflow-y-auto no-scrollbar">
                                {days.map((day) => (
                                    <button
                                        key={day.id}
                                        onClick={() => setActiveDayId(day.id)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${activeDayId === day.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        D{day.dayNumber}
                                    </button>
                                ))}
                                <Button size="icon" variant="ghost" onClick={addDay} className="rounded-full hover:bg-white/10 text-slate-400">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Active Day Editor */}
                            <div className="flex-1 overflow-y-auto bg-slate-950/50">
                                {days.map(day => day.id === activeDayId && (
                                    <div key={day.id} className="p-4 space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase text-slate-500 font-bold">Day Title</Label>
                                            <Input
                                                value={day.title}
                                                onChange={(e) => updateDayTitle(day.id, e.target.value)}
                                                className="bg-black/20 border-white/10 font-bold text-lg h-12"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            {day.activities.map((activity) => (
                                                <div key={activity.id} className="bg-slate-900 border border-white/5 rounded-lg p-3 space-y-3 group">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={activity.time}
                                                            onChange={(e) => updateActivity(day.id, activity.id, { time: e.target.value })}
                                                            className="w-24 bg-black/20 border-white/10 text-xs h-8"
                                                            placeholder="Time"
                                                        />
                                                        <Input
                                                            value={activity.title}
                                                            onChange={(e) => updateActivity(day.id, activity.id, { title: e.target.value })}
                                                            className="flex-1 bg-black/20 border-white/10 text-sm font-bold h-8"
                                                            placeholder="Activity Title"
                                                        />
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                                                            onClick={() => deleteActivity(day.id, activity.id)}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                    <textarea
                                                        value={activity.description}
                                                        onChange={(e) => updateActivity(day.id, activity.id, { description: e.target.value })}
                                                        className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-xs text-slate-300 min-h-[60px] resize-none focus:outline-none focus:border-orange-500/50"
                                                        placeholder="Description..."
                                                    />
                                                    <div className="flex gap-2">
                                                        {['travel', 'stay', 'food', 'activity'].map(type => (
                                                            <button
                                                                key={type}
                                                                onClick={() => updateActivity(day.id, activity.id, { type: type as any })}
                                                                className={`p-1.5 rounded flex items-center justify-center transition-colors ${activity.type === type ?
                                                                        (type === 'travel' ? 'bg-blue-500/20 text-blue-400' :
                                                                            type === 'stay' ? 'bg-purple-500/20 text-purple-400' :
                                                                                type === 'food' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400')
                                                                        : 'text-slate-600 hover:bg-white/5'
                                                                    }`}
                                                            >
                                                                {type === 'travel' && <MapPin className="w-3 h-3" />}
                                                                {type === 'stay' && <Bed className="w-3 h-3" />}
                                                                {type === 'food' && <Coffee className="w-3 h-3" />}
                                                                {type === 'activity' && <Mountain className="w-3 h-3" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                className="w-full border-dashed border-white/20 text-slate-400 hover:bg-white/5"
                                                onClick={() => addActivity(day.id)}
                                            >
                                                <Plus className="w-4 h-4 mr-2" /> Add Activity
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="flex-1 bg-slate-800 p-8 overflow-y-auto flex justify-center">
                        <div className="scale-[0.65] origin-top shadow-2xl">
                            <ItineraryTemplate ref={componentRef} data={itineraryData} />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
