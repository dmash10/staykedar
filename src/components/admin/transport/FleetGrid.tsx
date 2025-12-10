import { useState } from 'react';
import {
    Car, MapPin, Phone, Star, MoreVertical, Edit, Trash2,
    MessageSquare, FileText, CheckCircle, XCircle, Send, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { CarDriver } from '@/types/carRentals';

// Extended interface for Dispatch View (Mocking missing DB fields)
export interface DispatchDriver extends CarDriver {
    status_text?: 'Available' | 'On Trip' | 'Offline';
    on_time_rate?: number;
    cancellation_rate?: number;
    base_location?: string;
    vehicle_details?: string; // e.g. "Innova Crysta - UK07..."
}

interface FleetGridProps {
    drivers: CarDriver[];
    loading: boolean;
    onEdit: (driver: CarDriver) => void;
    onDelete: (driver: CarDriver) => void;
}

export function FleetGrid({ drivers, loading, onEdit, onDelete }: FleetGridProps) {
    const { toast } = useToast();
    const [filter, setFilter] = useState('all');

    // Transform data with mocks
    const dispatchDrivers: DispatchDriver[] = drivers.map(d => ({
        ...d,
        status_text: d.available ? 'Available' : 'On Trip', // Simple mapping for now
        on_time_rate: Math.floor(Math.random() * (100 - 80) + 80), // Mock 80-100%
        cancellation_rate: Math.floor(Math.random() * 5), // Mock 0-5%
        base_location: 'Haridwar', // Mock
        vehicle_details: `${d.car_model || 'Unknown Car'} - ${d.car_number || 'UK-XX-0000'}`
    }));

    const filteredDrivers = dispatchDrivers.filter(d => {
        if (filter === 'available') return d.available;
        if (filter === 'busy') return !d.available;
        return true;
    });

    const handleBroadcast = () => {
        toast({
            title: "Broadcast Sent!",
            description: `Job alert sent to ${filteredDrivers.length} active drivers via WhatsApp API.`,
            variant: "default",
        });
    };

    const handleWhatsApp = (phone: string) => {
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 p-4 rounded-xl bg-[#1A1A1A]/50 border border-[#2A2A2A] backdrop-blur-md">
                <div className="flex gap-2">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className={`border-[#333] ${filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-300'}`}
                    >
                        All Fleet
                    </Button>
                    <Button
                        variant={filter === 'available' ? 'default' : 'outline'}
                        onClick={() => setFilter('available')}
                        className={`border-[#333] ${filter === 'available' ? 'bg-emerald-600 text-white' : 'text-gray-300'}`}
                    >
                        Available
                    </Button>
                    <Button
                        variant={filter === 'busy' ? 'default' : 'outline'}
                        onClick={() => setFilter('busy')}
                        className={`border-[#333] ${filter === 'busy' ? 'bg-red-600 text-white' : 'text-gray-300'}`}
                    >
                        On Trip
                    </Button>
                </div>

                <Button
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold glow-effect"
                    onClick={handleBroadcast}
                >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Broadcast Job (WhatsApp)
                </Button>
            </div>

            {/* Glass Table */}
            <div className="rounded-xl border border-[#2A2A2A] bg-[#111111]/80 backdrop-blur-md overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-[#1A1A1A] border-b border-[#2A2A2A]">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="text-gray-400 font-medium">Driver / Location</TableHead>
                            <TableHead className="text-gray-400 font-medium">Vehicle Info</TableHead>
                            <TableHead className="text-gray-400 font-medium">Status</TableHead>
                            <TableHead className="text-gray-400 font-medium">Performance</TableHead>
                            <TableHead className="text-gray-400 font-medium text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                    Loading fleet data...
                                </TableCell>
                            </TableRow>
                        ) : filteredDrivers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                                    No drivers found.
                                </TableCell>
                            </TableRow>
                        ) : filteredDrivers.map((driver) => (
                            <TableRow key={driver.id} className="border-b border-[#2A2A2A] hover:bg-[#1A1A1A]/50 transition-colors group">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                            {driver.photo_url ? (
                                                <img src={driver.photo_url} alt={driver.driver_name} className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-bold text-gray-300">{(driver.driver_name || '?').charAt(0)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white group-hover:text-blue-400 transition-colors">{driver.driver_name}</div>
                                            <div className="flex items-center text-xs text-gray-500 mt-1">
                                                <MapPin className="w-3 h-3 mr-1" />
                                                {driver.base_location}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-gray-300 font-mono bg-black/30 px-2 py-1 rounded inline-block border border-[#333]">
                                        {driver.vehicle_details}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {driver.available ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                                            <CheckCircle className="w-3 h-3 mr-1" /> Available
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20">
                                            <XCircle className="w-3 h-3 mr-1" /> On Trip
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center text-xs text-gray-400">
                                            <span className="w-20">On-Time:</span>
                                            <span className="text-emerald-400 font-bold">{driver.on_time_rate}%</span>
                                        </div>
                                        <div className="flex items-center text-xs text-gray-400">
                                            <span className="w-20">Cancel Rate:</span>
                                            <span className="text-red-400 font-bold">{driver.cancellation_rate}%</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-400 hover:bg-green-500/10 hover:text-green-300" onClick={() => handleWhatsApp(driver.whatsapp)}>
                                            <Phone className="w-4 h-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 data-[state=open]:text-white">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                                                <DropdownMenuItem className="text-white hover:bg-[#2A2A2A] cursor-pointer" onClick={() => onEdit(driver)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-white hover:bg-[#2A2A2A] cursor-pointer">
                                                    <FileText className="mr-2 h-4 w-4" /> View Documents
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-white hover:bg-[#2A2A2A] cursor-pointer" onClick={() => toast({ title: "Assign Trip", description: "Opening assignment modal..." })}>
                                                    <Send className="mr-2 h-4 w-4" /> Assign Trip
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
                                                    onClick={() => onDelete(driver)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Driver
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
