import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    Sun,
    Cloud,
    CloudRain,
    Snowflake,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    MapPin,
    Clock,
    TrendingUp,
    Mountain,
    Route,
    Loader2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
    format,
    parseISO,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isToday,
    isSameMonth,
    addMonths,
    subMonths,
    getDay
} from 'date-fns';

// Season Configuration
const SEASON_CONFIG = {
    open: {
        months: [4, 5, 6, 9, 10], // May to Jul, Oct to Nov (0-indexed: Apr=3, May=4...)
        label: 'Yatra Open',
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/30'
    },
    peak: {
        months: [4, 5, 9], // May, June, Oct
        label: 'Peak Season',
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30'
    },
    monsoon: {
        months: [6, 7, 8], // Jul, Aug, Sep
        label: 'Monsoon (Risky)',
        color: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30'
    },
    closed: {
        months: [10, 11, 0, 1, 2, 3], // Nov to Apr
        label: 'Temple Closed',
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30'
    }
};

// Key Dates for 2024/2025
const KEY_DATES = [
    { date: '2025-05-07', event: 'Kedarnath Temple Opens', type: 'opening', icon: CheckCircle2 },
    { date: '2025-05-14', event: 'Badrinath Temple Opens', type: 'opening', icon: CheckCircle2 },
    { date: '2025-06-15', event: 'Monsoon Expected Start', type: 'monsoon', icon: CloudRain },
    { date: '2025-09-15', event: 'Post-Monsoon Peak Starts', type: 'peak', icon: Sun },
    { date: '2025-11-14', event: 'Kedarnath Temple Closes', type: 'closing', icon: XCircle },
    { date: '2025-11-20', event: 'Badrinath Temple Closes', type: 'closing', icon: XCircle },
];

// Route Status
const ROUTE_STATUS = [
    { route: 'Rishikesh - Rudraprayag', status: 'open', lastUpdated: '2025-12-08' },
    { route: 'Rudraprayag - Sonprayag', status: 'open', lastUpdated: '2025-12-08' },
    { route: 'Sonprayag - Kedarnath Trek', status: 'closed', lastUpdated: '2025-12-08', reason: 'Winter closure' },
    { route: 'Badrinath Road', status: 'closed', lastUpdated: '2025-12-08', reason: 'Heavy snowfall' },
];

export default function YatraCalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // Fetch booking demand data
    const { data: bookingData, isLoading } = useQuery({
        queryKey: ['yatra-calendar-bookings', format(currentMonth, 'yyyy-MM')],
        queryFn: async () => {
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);

            const { data: bookings, error } = await supabase
                .from('package_bookings')
                .select('created_at, amount, status')
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString());

            if (error) throw error;

            // Group bookings by date
            const bookingsByDate: Record<string, { count: number; revenue: number }> = {};
            (bookings || []).forEach(b => {
                const dateKey = format(parseISO(b.created_at), 'yyyy-MM-dd');
                if (!bookingsByDate[dateKey]) {
                    bookingsByDate[dateKey] = { count: 0, revenue: 0 };
                }
                bookingsByDate[dateKey].count++;
                if (b.status === 'paid' || b.status === 'confirmed') {
                    bookingsByDate[dateKey].revenue += (b.amount || 0);
                }
            });

            return bookingsByDate;
        },
        staleTime: 60000,
    });

    // Generate calendar days
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = getDay(monthStart);

    // Get season for a month
    const getSeasonForMonth = (month: number) => {
        if (SEASON_CONFIG.peak.months.includes(month)) return 'peak';
        if (SEASON_CONFIG.monsoon.months.includes(month)) return 'monsoon';
        if (SEASON_CONFIG.open.months.includes(month)) return 'open';
        return 'closed';
    };

    const currentSeason = getSeasonForMonth(currentMonth.getMonth());
    const seasonConfig = SEASON_CONFIG[currentSeason];

    // Get demand level for a date
    const getDemandLevel = (date: Date) => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const data = bookingData?.[dateKey];
        if (!data) return 'none';
        if (data.count >= 5) return 'high';
        if (data.count >= 2) return 'medium';
        return 'low';
    };

    // Navigate months
    const goToPrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    return (
        <>
            <div className="space-y-6">

                {/* Season Status Banner */}
                <Card className={`${seasonConfig.bg} ${seasonConfig.border}`}>
                    <CardContent className="p-5">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-xl">
                                    {currentSeason === 'peak' ? <Sun className="w-8 h-8 text-amber-400" /> :
                                        currentSeason === 'monsoon' ? <CloudRain className="w-8 h-8 text-orange-400" /> :
                                            currentSeason === 'open' ? <Mountain className="w-8 h-8 text-green-400" /> :
                                                <Snowflake className="w-8 h-8 text-blue-400" />}
                                </div>
                                <div>
                                    <h2 className="text-white text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
                                    <Badge className={`${seasonConfig.bg} ${seasonConfig.color} ${seasonConfig.border} mt-1`}>
                                        {seasonConfig.label}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={goToPrevMonth} className="border-white/20 text-white hover:bg-white/10">
                                    ← Prev
                                </Button>
                                <Button variant="outline" size="sm" onClick={goToToday} className="border-white/20 text-white hover:bg-white/10">
                                    Today
                                </Button>
                                <Button variant="outline" size="sm" onClick={goToNextMonth} className="border-white/20 text-white hover:bg-white/10">
                                    Next →
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Calendar */}
                    <Card className="lg:col-span-2 bg-[#111111] border-[#2A2A2A]">
                        <CardHeader className="border-b border-[#2A2A2A]">
                            <CardTitle className="text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-400" />
                                Booking Demand Heatmap
                            </CardTitle>
                            <CardDescription className="text-gray-500">Click a date to see booking details</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            ) : (
                                <>
                                    {/* Day Headers */}
                                    <div className="grid grid-cols-7 gap-1 mb-2">
                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                            <div key={day} className="text-center text-gray-500 text-xs font-medium py-2">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-1">
                                        {/* Empty cells for alignment */}
                                        {Array.from({ length: startDayOfWeek }).map((_, i) => (
                                            <div key={`empty-${i}`} className="aspect-square" />
                                        ))}

                                        {/* Calendar days */}
                                        {calendarDays.map(day => {
                                            const demandLevel = getDemandLevel(day);
                                            const dateKey = format(day, 'yyyy-MM-dd');
                                            const bookings = bookingData?.[dateKey];
                                            const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateKey;

                                            return (
                                                <button
                                                    key={dateKey}
                                                    onClick={() => setSelectedDate(day)}
                                                    className={`aspect-square rounded-lg border transition-all flex flex-col items-center justify-center p-1
                            ${isToday(day) ? 'ring-2 ring-blue-500' : ''}
                            ${isSelected ? 'border-blue-500 bg-blue-500/20' : 'border-[#2A2A2A] hover:border-[#3A3A3A]'}
                            ${demandLevel === 'high' ? 'bg-green-500/20' :
                                                            demandLevel === 'medium' ? 'bg-yellow-500/20' :
                                                                demandLevel === 'low' ? 'bg-blue-500/10' :
                                                                    'bg-[#0A0A0A]'}
                          `}
                                                >
                                                    <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-400' : 'text-white'}`}>
                                                        {format(day, 'd')}
                                                    </span>
                                                    {bookings && bookings.count > 0 && (
                                                        <span className="text-xs text-gray-400">{bookings.count}</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Legend */}
                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#2A2A2A]">
                                        <span className="text-gray-500 text-xs">Demand:</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
                                            <span className="text-gray-400 text-xs">High</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/30" />
                                            <span className="text-gray-400 text-xs">Medium</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-4 rounded bg-blue-500/10 border border-blue-500/30" />
                                            <span className="text-gray-400 text-xs">Low</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right Sidebar */}
                    <div className="space-y-4">
                        {/* Key Dates */}
                        <Card className="bg-[#111111] border-[#2A2A2A]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-white text-base flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                    Key Dates 2025
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {KEY_DATES.map((item, index) => {
                                    const Icon = item.icon;
                                    const isPast = new Date(item.date) < new Date();
                                    return (
                                        <div key={index} className={`flex items-start gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A] ${isPast ? 'opacity-50' : ''}`}>
                                            <Icon className={`w-4 h-4 mt-0.5 ${item.type === 'opening' ? 'text-green-400' :
                                                    item.type === 'closing' ? 'text-red-400' :
                                                        item.type === 'peak' ? 'text-amber-400' :
                                                            'text-blue-400'
                                                }`} />
                                            <div>
                                                <p className="text-white text-sm font-medium">{item.event}</p>
                                                <p className="text-gray-500 text-xs">{format(parseISO(item.date), 'MMMM d, yyyy')}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </Card>

                        {/* Route Status */}
                        <Card className="bg-[#111111] border-[#2A2A2A]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-white text-base flex items-center gap-2">
                                    <Route className="w-4 h-4 text-blue-400" />
                                    Route Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {ROUTE_STATUS.map((route, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${route.status === 'open' ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className="text-gray-300 text-sm">{route.route}</span>
                                        </div>
                                        <Badge className={`${route.status === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'} text-xs`}>
                                            {route.status === 'open' ? 'Open' : 'Closed'}
                                        </Badge>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Selected Date Info */}
                        {selectedDate && (
                            <Card className="bg-blue-500/10 border-blue-500/30">
                                <CardContent className="p-4">
                                    <h3 className="text-blue-400 font-semibold mb-2">{format(selectedDate, 'MMMM d, yyyy')}</h3>
                                    {bookingData?.[format(selectedDate, 'yyyy-MM-dd')] ? (
                                        <div className="space-y-2">
                                            <p className="text-white text-lg font-bold">
                                                {bookingData[format(selectedDate, 'yyyy-MM-dd')].count} bookings
                                            </p>
                                            <p className="text-gray-400 text-sm">
                                                ₹{bookingData[format(selectedDate, 'yyyy-MM-dd')].revenue.toLocaleString()} revenue
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-gray-400 text-sm">No bookings on this date</p>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

            </div>
        </>
    );
}
