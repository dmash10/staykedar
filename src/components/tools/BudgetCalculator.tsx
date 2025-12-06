import React, { useState, useEffect } from 'react';
import { Calculator, Users, Calendar, Plane, Car, Hotel, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

// Cost Constants (Estimates for 2026 Season)
const COSTS = {
    HELICOPTER_ROUND_TRIP: 5500 + 3000, // Official + buffer/black/agent fees roughly
    FOOD_PER_DAY: 800,
    MISC_PER_DAY: 200,
    PRIORITY_DARSHAN: 2100, // Optional
};

const HOTEL_OBJ = {
    budget: { price: 1500, label: 'Budget (₹1500/night)' },
    standard: { price: 3500, label: 'Standard (₹3500/night)' },
    luxury: { price: 8000, label: 'Luxury (₹8000/night)' },
};

const TRANSPORT_OBJ = {
    bus: { price: 1000, type: 'per_person', label: 'Bus (Haridwar-Sonprayag)' },
    shared_taxi: { price: 1500, type: 'per_person', label: 'Shared Taxi' },
    private_sedan: { price: 15000, type: 'per_vehicle', label: 'Private Sedan (Round Trip)' }, // Delhi/Haridwar round trip
    private_innova: { price: 22000, type: 'per_vehicle', label: 'Private Innova (Round Trip)' },
};

export default function BudgetCalculator() {
    const [people, setPeople] = useState(2);
    const [days, setDays] = useState(4);
    const [helicopter, setHelicopter] = useState(false);
    const [hotelType, setHotelType] = useState('standard');
    const [transport, setTransport] = useState('private_sedan');
    const [pony, setPony] = useState(false); // One way or two way? Keep simple: Yes = Two way

    const [totalCost, setTotalCost] = useState(0);
    const [breakdown, setBreakdown] = useState<any>({});

    const calculate = () => {
        // 1. Accommodation
        // Assume 2-3 people per room.
        const roomsNeeded = Math.ceil(people / 2); // Conservative: 2 adults per room
        const hotelCostStr = hotelType as keyof typeof HOTEL_OBJ;
        const nightlyRate = HOTEL_OBJ[hotelCostStr].price;
        const accommodationCost = roomsNeeded * nightlyRate * (days - 1); // Nights = Days - 1

        // 2. Transport
        const transTypeStr = transport as keyof typeof TRANSPORT_OBJ;
        const transData = TRANSPORT_OBJ[transTypeStr];
        let transportCost = 0;
        if (transData.type === 'per_person') {
            transportCost = transData.price * people;
        } else {
            // Per vehicle
            const vehicleCapacity = transTypeStr.includes('innova') ? 6 : 4;
            const vehiclesNeeded = Math.ceil(people / vehicleCapacity);
            transportCost = transData.price * vehiclesNeeded;
        }

        // 3. Helicopter
        const heliCost = helicopter ? (COSTS.HELICOPTER_ROUND_TRIP * people) : 0;

        // 4. Pony (Gaurikund to Kedar & Back)
        // Approx 2500 up + 1500 down = 4000? Let's say 5000 total conservatively
        const ponyCost = pony ? (5500 * people) : 0;

        // 5. Food & Misc
        const foodAndMisc = (COSTS.FOOD_PER_DAY + COSTS.MISC_PER_DAY) * people * days;

        const total = accommodationCost + transportCost + heliCost + ponyCost + foodAndMisc;

        setTotalCost(total);
        setBreakdown({
            accommodation: accommodationCost,
            transport: transportCost,
            helicopter: heliCost,
            pony: ponyCost,
            food: foodAndMisc,
            perPerson: Math.round(total / people)
        });
    };

    useEffect(() => {
        calculate();
    }, [people, days, helicopter, hotelType, transport, pony]);

    const formatCurrency = (amt: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amt);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent"> Kedarnath Yatra Budget Calculator</h2>
                <p className="text-muted-foreground mt-2">Plan your 2026 pilgrimage costs in seconds</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* INPUTS COLUMN */}
                <div className="space-y-6">
                    <Card className="border-t-4 border-t-orange-500 shadow-lg">
                        <CardHeader pb-4>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-orange-600" /> Trip Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Persons Slider */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Label>Number of Pilgrims</Label>
                                    <span className="font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">{people} People</span>
                                </div>
                                <Slider
                                    defaultValue={[2]}
                                    max={20}
                                    min={1}
                                    step={1}
                                    value={[people]}
                                    onValueChange={(val) => setPeople(val[0])}
                                    className="py-2"
                                />
                            </div>

                            {/* Days Slider */}
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <Label>Duration (Days)</Label>
                                    <span className="font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">{days} Days</span>
                                </div>
                                <Slider
                                    defaultValue={[4]}
                                    max={10}
                                    min={3}
                                    step={1}
                                    value={[days]}
                                    onValueChange={(val) => setDays(val[0])}
                                    className="py-2"
                                />
                            </div>

                            {/* Transport Select */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Car className="w-4 h-4" /> Transport Mode</Label>
                                <Select value={transport} onValueChange={setTransport}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(TRANSPORT_OBJ).map(([key, val]) => (
                                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Hotel Select */}
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2"><Hotel className="w-4 h-4" /> Hotel Category</Label>
                                <Select value={hotelType} onValueChange={setHotelType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(HOTEL_OBJ).map(([key, val]) => (
                                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                        </CardContent>
                    </Card>

                    <Card className="border-t-4 border-t-sky-500 shadow-lg">
                        <CardHeader pb-4>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <RefreshCcw className="w-5 h-5 text-sky-600" /> Optional Add-ons
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Helicopter Toggle */}
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex flex-col">
                                    <Label className="flex items-center gap-2 font-semibold text-base">
                                        <Plane className="w-4 h-4 text-sky-500" /> Helicopter
                                    </Label>
                                    <span className="text-xs text-muted-foreground">Est. ₹5,500 - ₹8,500 round trip</span>
                                </div>
                                <Switch checked={helicopter} onCheckedChange={setHelicopter} />
                            </div>

                            {/* Pony Toggle */}
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex flex-col">
                                    <Label className="flex items-center gap-2 font-semibold text-base">
                                        🐴 Pony / Palki
                                    </Label>
                                    <span className="text-xs text-muted-foreground">Trek substitute (~₹5,500)</span>
                                </div>
                                <Switch checked={pony} onCheckedChange={setPony} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* OUTPUT COLUMN */}
                <div className="flex flex-col gap-6">

                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl border-none">
                        <CardHeader>
                            <CardTitle className="text-slate-200">Total Estimate</CardTitle>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-4xl font-bold text-green-400">{formatCurrency(totalCost)}</span>
                                <span className="text-sm text-slate-400">approx.</span>
                            </div>
                            <div className="text-sm font-medium text-orange-300 mt-1">
                                {formatCurrency(breakdown.perPerson || 0)} per person
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 pt-4 border-t border-slate-700">
                                {/* Breakdown Rows */}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2 text-slate-300"><Hotel className="w-4 h-4" /> Hotels ({days - 1} nights)</span>
                                    <span className="font-mono">{formatCurrency(breakdown.accommodation)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2 text-slate-300"><Car className="w-4 h-4" /> Transport</span>
                                    <span className="font-mono">{formatCurrency(breakdown.transport)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="flex items-center gap-2 text-slate-300">🍛 Food & Misc</span>
                                    <span className="font-mono">{formatCurrency(breakdown.food)}</span>
                                </div>

                                {helicopter && (
                                    <div className="flex justify-between items-center text-sm text-sky-300">
                                        <span className="flex items-center gap-2"><Plane className="w-4 h-4" /> Helicopter</span>
                                        <span className="font-mono">{formatCurrency(breakdown.helicopter)}</span>
                                    </div>
                                )}

                                {pony && (
                                    <div className="flex justify-between items-center text-sm text-amber-300">
                                        <span className="flex items-center gap-2">🐴 Pony</span>
                                        <span className="font-mono">{formatCurrency(breakdown.pony)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8">
                                <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold h-12 text-lg shadow-lg shadow-green-900/20 transition-all hover:scale-[1.02]">
                                    Book This Package
                                </Button>
                                <p className="text-xs text-center text-slate-400 mt-3 italic">
                                    *Note: These are estimates based on 2025-26 market rates. Real prices vary by season.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SEO Text Block (Dynamic) */}
                    <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900 p-6 rounded-lg border">
                        <h3 className="text-foreground text-lg mb-2">Cost Breakdown Analysis</h3>
                        <p>
                            For a group of <strong>{people} pilgrims</strong> traveling for <strong>{days} days</strong>, the
                            estimated cost is <strong>{formatCurrency(totalCost)}</strong>.
                        </p>
                        <p>
                            <strong>Transport:</strong> You chose <em>{TRANSPORT_OBJ[transport as keyof typeof TRANSPORT_OBJ].label}</em>.
                            {people > 4 && transport.includes('private') ? " Since you have a larger group, vehicle costs are shared efficiently." : ""}
                        </p>
                        <p>
                            <strong>Accommodation:</strong> Staying in <em>{HOTEL_OBJ[hotelType as keyof typeof HOTEL_OBJ].label}</em> hotels
                            will cost approx {formatCurrency(breakdown.accommodation)} total.
                        </p>
                        {helicopter && (
                            <p className="border-l-4 border-sky-500 pl-2">
                                <strong>Helicopter Tip:</strong> You've included helicopter tickets. Remember to book exactly
                                when IRCTC slots open (usually 2 months prior) as they sell out in minutes.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
