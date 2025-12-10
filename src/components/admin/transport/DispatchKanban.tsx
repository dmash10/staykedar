import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    MoreHorizontal, MapPin, Calendar, Clock,
    ChevronRight, Phone, MessageCircle, FileText, CheckCircle2, AlertCircle, DollarSign
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

type TripStatus = 'Unassigned' | 'Assigned' | 'On Road' | 'Completed' | 'Settled';

interface Trip {
    id: string;
    customer_name: string;
    customer_phone: string;
    route: string;
    pickup_date: string;
    vehicle_req: string;
    amount: number;
    advance_paid: number;
    status: TripStatus;
    driver_name?: string;
    car_number?: string;
    driver_phone?: string;
}

const MOCK_TRIPS: Trip[] = [
    { id: 'TR-101', customer_name: 'Rahul Gupta', customer_phone: '+91 999...', route: 'Haridwar -> Sonprayag', pickup_date: 'Today, 09:00 AM', vehicle_req: 'Innova Crysta', amount: 7500, advance_paid: 2000, status: 'Unassigned' },
    { id: 'TR-102', customer_name: 'Sarah Jenkins', customer_phone: '+91 888...', route: 'Dehradun -> Kedarnath', pickup_date: 'Tomorrow, 06:00 AM', vehicle_req: 'Sedan', amount: 4500, advance_paid: 1000, status: 'Unassigned' },
    { id: 'TR-099', customer_name: 'Amit Patel', customer_phone: '+91 777...', route: 'Rishikesh -> Chopta', pickup_date: 'Today, 07:00 AM', vehicle_req: 'Tempo Traveller', amount: 14000, advance_paid: 5000, status: 'Assigned', driver_name: 'Vikram Singh', car_number: 'UK07-TB-1234', driver_phone: '9876543210' },
    { id: 'TR-098', customer_name: 'John Doe', customer_phone: '+91 666...', route: 'Haridwar -> Auli', pickup_date: 'Yesterday', vehicle_req: 'Innova', amount: 9000, advance_paid: 3000, status: 'On Road', driver_name: 'Rajesh Kumar', car_number: 'UK07-TA-9988', driver_phone: '9876543211' },
    { id: 'TR-097', customer_name: 'Priya Sharma', customer_phone: '+91 555...', route: 'Dehradun -> Airport', pickup_date: 'Yesterday', vehicle_req: 'Sedan', amount: 2500, advance_paid: 2500, status: 'Completed', driver_name: 'Suresh', car_number: 'UK07-DX-1122', driver_phone: '9876543212' },
];

const COLUMNS: { id: TripStatus; label: string; color: string; bg: string }[] = [
    { id: 'Unassigned', label: 'Unassigned', color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: 'Assigned', label: 'Assigned', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { id: 'On Road', label: 'On Road', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'Completed', label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10' },
    { id: 'Settled', label: 'Settled', color: 'text-gray-400', bg: 'bg-gray-500/10' },
];

export function DispatchKanban() {
    const [trips, setTrips] = useState<Trip[]>(MOCK_TRIPS);

    const moveTrip = (tripId: string, newStatus: TripStatus) => {
        setTrips(trips.map(t => t.id === tripId ? { ...t, status: newStatus } : t));
    };

    const handleShareManifest = (trip: Trip) => {
        const text = `🚖 *Trip Manifest - Staykedar*\n\nDriver: ${trip.driver_name}\nCar: ${trip.car_number}\nGuest: ${trip.customer_name}\nRoute: ${trip.route}\nTime: ${trip.pickup_date}\n\nBalance to Collect: ₹${trip.amount - trip.advance_paid}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="flex h-[calc(100vh-250px)] min-h-[600px] overflow-x-auto gap-4 pb-4">
            {COLUMNS.map(col => (
                <div key={col.id} className="min-w-[320px] max-w-[320px] flex flex-col h-full rounded-2xl bg-[#111111]/60 border border-[#2A2A2A] backdrop-blur-sm">
                    {/* Header */}
                    <div className={`p-4 border-b border-[#2A2A2A] flex justify-between items-center ${col.bg} rounded-t-2xl`}>
                        <h3 className={`font-bold ${col.color} flex items-center gap-2`}>
                            <div className={`w-2 h-2 rounded-full ${col.color.replace('text', 'bg')}`} />
                            {col.label}
                        </h3>
                        <Badge variant="outline" className={`${col.color} border-current opacity-50`}>
                            {trips.filter(t => t.status === col.id).length}
                        </Badge>
                    </div>

                    {/* Cards Container */}
                    <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
                        {trips.filter(t => t.status === col.id).map(trip => (
                            <Card key={trip.id} className="bg-[#1A1A1A] border-[#333] hover:border-[#555] transition-all group shadow-lg">
                                <CardContent className="p-4 space-y-3">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-mono text-gray-500">{trip.id}</span>
                                            <h4 className="text-white font-medium truncate">{trip.customer_name}</h4>
                                            <div className="flex items-center text-xs text-gray-400 mt-1">
                                                <MapPin className="w-3 h-3 mr-1" /> {trip.route}
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-[#252525] text-gray-300 border-[#333]">
                                            {trip.vehicle_req}
                                        </Badge>
                                    </div>

                                    <Separator className="bg-[#333]" />

                                    {/* Driver Info (If Assigned) */}
                                    {trip.driver_name && (
                                        <div className="flex items-center gap-3 bg-[#111] p-2 rounded-lg border border-[#252525]">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="bg-blue-900 text-blue-200">
                                                    {trip.driver_name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm text-white truncate">{trip.driver_name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{trip.car_number}</p>
                                            </div>
                                            <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500" onClick={() => window.open(`tel:${trip.driver_phone}`)}>
                                                <Phone className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}

                                    {/* Warnings / Alerts */}
                                    {trip.status === 'Completed' && (trip.amount - trip.advance_paid > 0) && (
                                        <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/10 p-2 rounded border border-red-900/20">
                                            <AlertCircle className="w-3 h-3" />
                                            Payment Pending: ₹{trip.amount - trip.advance_paid}
                                        </div>
                                    )}

                                    {/* Footer Actions */}
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="text-xs text-gray-500 flex items-center">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {trip.pickup_date}
                                        </div>

                                        <div className="flex gap-1">
                                            {trip.status === 'Assigned' && (
                                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-blue-400" onClick={() => handleShareManifest(trip)}>
                                                    <FileText className="w-4 h-4" />
                                                </Button>
                                            )}

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-white">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                                                    {COLUMNS.map(c => (
                                                        c.id !== trip.status && (
                                                            <DropdownMenuItem
                                                                key={c.id}
                                                                className="text-white hover:bg-[#2A2A2A] cursor-pointer"
                                                                onClick={() => moveTrip(trip.id, c.id)}
                                                            >
                                                                Move to {c.label}
                                                            </DropdownMenuItem>
                                                        )
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
