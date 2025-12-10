import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
    CloudRain, Sun, Wind, AlertTriangle, Users,
    Ticket, Plane, Scale, CheckCircle2, XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock Helipad Data
const HELIPADS = [
    { id: 'phata', name: 'Phata', altitude: '1500m', status: 'Flying', weather: 'Clear', flights_today: 45 },
    { id: 'sersi', name: 'Sersi', altitude: '1600m', status: 'Flying', weather: 'Clear', flights_today: 32 },
    { id: 'guptkashi', name: 'Guptkashi', altitude: '1300m', status: 'Grounded', weather: 'Heavy Rain', flights_today: 12 },
];

const OPERATORS = [
    { name: 'Pawan Hans', slots: 5, price: 7500 },
    { name: 'Himalayan Heli', slots: 0, price: 7800 },
    { name: 'Arrow Aircraft', slots: 2, price: 8000 },
];

export function HeliOperations() {
    const { toast } = useToast();

    // Weight Calculator State
    const [passengers, setPassengers] = useState([{ weight: 70 }]);
    const MAX_WEIGHT = 450; // kg limit for 6 pax typically or dynamic

    const totalWeight = passengers.reduce((sum, p) => sum + (Number(p.weight) || 0), 0);
    const weightStatus = totalWeight > MAX_WEIGHT ? 'Overload' : 'Safe';
    const weightPercent = (totalWeight / MAX_WEIGHT) * 100;

    const addPassenger = () => setPassengers([...passengers, { weight: 0 }]);
    const updateWeight = (idx: number, val: string) => {
        const newPax = [...passengers];
        newPax[idx].weight = Number(val);
        setPassengers(newPax);
    };

    const handleStatusToggle = (id: string) => {
        toast({ title: "Status Updated", description: "Notifications sent to pending guests." });
    };

    return (
        <div className="space-y-6">
            {/* 1. HELIPAD COMMAND CENTER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HELIPADS.map(pad => (
                    <Card key={pad.id} className={`border border-[#2A2A2A] ${pad.status === 'Flying' ? 'bg-[#111111]/80' : 'bg-red-900/10 border-red-900/30'}`}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-white font-bold text-lg">{pad.name}</h3>
                                    <p className="text-xs text-gray-500">{pad.altitude}</p>
                                </div>
                                <Badge variant="outline" className={pad.status === 'Flying' ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}>
                                    {pad.status.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm mb-4">
                                <div className="flex items-center gap-2 text-gray-300">
                                    {pad.weather === 'Clear' ? <Sun className="text-yellow-400 w-4 h-4" /> : <CloudRain className="text-blue-400 w-4 h-4" />}
                                    {pad.weather}
                                </div>
                                <div className="flex items-center gap-2 text-gray-300">
                                    <Plane className="text-white w-4 h-4" />
                                    {pad.flights_today} Sorties
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#333]">
                                <span className="text-xs text-gray-500">Force Ground?</span>
                                <Switch
                                    checked={pad.status === 'Grounded'}
                                    onCheckedChange={() => handleStatusToggle(pad.id)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. OPERATOR INVENTORY */}
                <Card className="lg:col-span-2 bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Ticket className="text-blue-400" />
                            Operator Inventory (Live Slots)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {OPERATORS.map((op, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-900/20 flex items-center justify-center text-blue-400">
                                            <Plane className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white">{op.name}</h4>
                                            <p className="text-xs text-gray-400">Rate: ₹{op.price}/pax</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <span className={`block font-bold text-lg ${op.slots > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {op.slots} Slots
                                            </span>
                                        </div>
                                        <Button size="sm" variant="outline" className="border-[#333] hover:bg-[#222] text-white">
                                            Request
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 3. WEIGHT CALCULATOR */}
                <Card className="bg-[#111111] border-[#2A2A2A]">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Scale className="text-amber-400" />
                            Manifest Weight Check
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center p-4 bg-[#1A1A1A] rounded-lg border border-[#333]">
                            <span className="text-gray-500 text-xs">TOTAL PAYLOAD</span>
                            <div className={`text-4xl font-bold font-mono my-2 ${totalWeight > MAX_WEIGHT ? 'text-red-500' : 'text-emerald-500'}`}>
                                {totalWeight} <span className="text-lg text-gray-500">kg</span>
                            </div>
                            <Progress value={weightPercent} className={`h-2 ${totalWeight > MAX_WEIGHT ? 'bg-red-900' : 'bg-gray-800'}`} />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0 kg</span>
                                <span>Max {MAX_WEIGHT} kg</span>
                            </div>
                        </div>

                        <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {passengers.map((p, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-gray-500" />
                                    <label className="text-xs text-gray-400 w-12">Pax {idx + 1}</label>
                                    <Input
                                        type="number"
                                        value={p.weight || ''}
                                        onChange={(e) => updateWeight(idx, e.target.value)}
                                        className="h-8 bg-[#0A0A0A] border-[#333] text-white"
                                        placeholder="kg"
                                    />
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" size="sm" onClick={addPassenger} className="w-full text-blue-400 hover:text-blue-300">
                            + Add Passenger
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
