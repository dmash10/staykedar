
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, User, Key, CheckCircle2, Circle, Users, Save } from "lucide-react";
import { Lead } from "@/components/admin/crm/LeadCard";
import { useToast } from "@/hooks/use-toast";

interface Guest {
    id: string;
    name: string;
    age: string;
    gender: string;
    id_proof?: string;
    room_number?: string;
    is_checked_in: boolean;
}

interface GuestManifestProps {
    lead: Lead | null;
}

export function GuestManifest({ lead }: GuestManifestProps) {
    const { toast } = useToast();
    const [roomCount, setRoomCount] = useState(1);

    // Mock initial data - In real app, fetch from Supabase 'bookings_guests' table
    const [guests, setGuests] = useState<Guest[]>([
        { id: '1', name: lead?.customer_name || 'Primary Guest', age: '', gender: 'Male', is_checked_in: false, room_number: '101' }
    ]);

    const addGuest = () => {
        const newGuest: Guest = {
            id: Date.now().toString(),
            name: '',
            age: '',
            gender: 'Male',
            is_checked_in: false,
            room_number: ''
        };
        setGuests([...guests, newGuest]);
    };

    const removeGuest = (id: string) => {
        setGuests(guests.filter(g => g.id !== id));
    };

    const updateGuest = (id: string, field: keyof Guest, value: any) => {
        setGuests(guests.map(g => g.id === id ? { ...g, [field]: value } : g));
    };

    const toggleCheckIn = (id: string) => {
        setGuests(guests.map(g => g.id === id ? { ...g, is_checked_in: !g.is_checked_in } : g));
        const guest = guests.find(g => g.id === id);
        if (guest && !guest.is_checked_in) {
            toast({ title: "Check-in Successful", description: `${guest.name || 'Guest'} marked as checked in.` });
        }
    };

    const handleSave = () => {
        // Here we would save to Supabase
        toast({ title: "Manifest Saved", description: "Guest list and room allocations updated." });
    };

    const stats = {
        total: guests.length,
        checkedIn: guests.filter(g => g.is_checked_in).length,
        rooms: new Set(guests.map(g => g.room_number).filter(Boolean)).size
    };

    return (
        <div className="h-full flex flex-col bg-[#0b1015]">
            {/* Header Stats */}
            <div className="p-4 bg-slate-900 border-b border-white/5 grid grid-cols-3 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Pax</span>
                    <div className="flex items-center gap-2 mt-1">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-xl font-bold text-white">{stats.total}</span>
                    </div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Checked In</span>
                    <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xl font-bold text-white">{stats.checkedIn}/{stats.total}</span>
                    </div>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Rooms</span>
                    <div className="flex items-center gap-2 mt-1">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span className="text-xl font-bold text-white">{stats.rooms}</span>
                    </div>
                </div>
            </div>

            {/* Guest List */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {guests.map((guest, index) => (
                        <div
                            key={guest.id}
                            className={`p-3 rounded-lg border transition-all ${guest.is_checked_in
                                ? 'bg-emerald-950/10 border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]'
                                : 'bg-slate-900 border-white/5'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <button
                                        onClick={() => toggleCheckIn(guest.id)}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${guest.is_checked_in
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-slate-600 text-transparent hover:border-slate-400'
                                            }`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Guest Name"
                                            value={guest.name}
                                            onChange={(e) => updateGuest(guest.id, 'name', e.target.value)}
                                            className="flex-1 bg-black/20 border-white/10 h-9 font-medium min-w-[200px]"
                                        />
                                        <div className="w-24">
                                            <Select
                                                value={guest.gender}
                                                onValueChange={(val) => updateGuest(guest.id, 'gender', val)}
                                            >
                                                <SelectTrigger className="bg-black/20 border-white/10 h-9">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Age"
                                            value={guest.age}
                                            onChange={(e) => updateGuest(guest.id, 'age', e.target.value)}
                                            className="w-20 bg-black/20 border-white/10 h-8 text-xs shrink-0"
                                        />
                                        <Input
                                            placeholder="ID Proof Number"
                                            value={guest.id_proof || ''}
                                            onChange={(e) => updateGuest(guest.id, 'id_proof', e.target.value)}
                                            className="flex-1 bg-black/20 border-white/10 h-8 text-xs font-mono"
                                        />
                                        <div className="flex items-center gap-1 bg-amber-950/20 border border-amber-500/20 rounded px-2 h-8">
                                            <Key className="w-3 h-3 text-amber-500" />
                                            <Input
                                                placeholder="Room"
                                                value={guest.room_number || ''}
                                                onChange={(e) => updateGuest(guest.id, 'room_number', e.target.value)}
                                                className="w-full bg-transparent border-none h-full p-0 text-amber-300 font-bold text-center focus-visible:ring-0 text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                                    onClick={() => removeGuest(guest.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        className="w-full border-dashed border-white/20 text-slate-400 hover:bg-white/5 h-12"
                        onClick={addGuest}
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Guest
                    </Button>
                </div>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-slate-900">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 font-bold" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" /> Save Manifest
                </Button>
            </div>
        </div>
    );
}
