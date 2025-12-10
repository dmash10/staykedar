
import { forwardRef } from 'react';
import { MapPin, Clock, Calendar, Info } from 'lucide-react';

export interface Activity {
    id: string;
    time: string;
    title: string;
    description: string;
    type: 'travel' | 'stay' | 'food' | 'activity';
}

export interface DayPlan {
    id: string;
    dayNumber: number;
    title: string; // e.g., "Arrival at Haridwar"
    date?: string;
    activities: Activity[];
}

export interface ItineraryData {
    customerName: string;
    tripTitle: string; // e.g. "Kedarnath Yatra 3D/2N"
    startDate?: string;
    days: DayPlan[];
}

interface ItineraryTemplateProps {
    data: ItineraryData | null;
}

export const ItineraryTemplate = forwardRef<HTMLDivElement, ItineraryTemplateProps>(({ data }, ref) => {
    if (!data) return null;

    return (
        <div ref={ref} className="bg-white text-slate-900 p-8 w-[210mm] min-h-[297mm] mx-auto relative print:w-full print:h-full print:m-0 print:p-8 font-sans">
            {/* Header Image / Branding */}
            <div className="mb-8 text-center border-b-2 border-orange-100 pb-8">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-2">{data.tripTitle}</h1>
                <p className="text-orange-600 font-bold tracking-widest text-sm uppercase">Custom Travel Plan for {data.customerName}</p>
            </div>

            {/* Itinerary Timeline */}
            <div className="space-y-8 relative">
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200" />

                {data.days.map((day, index) => (
                    <div key={day.id} className="relative pl-16 page-break-inside-avoid">
                        {/* Day Marker */}
                        <div className="absolute left-0 top-0 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center text-white font-black shadow-lg z-10 border-4 border-white">
                            D{day.dayNumber}
                        </div>

                        {/* Day Content */}
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                <span className="text-orange-600">{day.title}</span>
                                {day.date && <span className="text-xs font-normal text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">{day.date}</span>}
                            </h2>

                            <div className="space-y-4">
                                {day.activities.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 group">
                                        <div className="w-16 pt-1 text-right flex-shrink-0">
                                            <span className="text-xs font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-100">{activity.time}</span>
                                        </div>
                                        <div className="relative pb-4 last:pb-0 border-l border-slate-200 pl-4 last:border-0">
                                            <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${activity.type === 'travel' ? 'bg-blue-500' :
                                                    activity.type === 'stay' ? 'bg-purple-500' :
                                                        activity.type === 'food' ? 'bg-emerald-500' : 'bg-orange-500'
                                                }`} />
                                            <h3 className="text-sm font-bold text-slate-800">{activity.title}</h3>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{activity.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                <p className="font-black text-slate-300 text-2xl tracking-widest uppercase mb-1">STAYKEDARNATH</p>
                <div className="flex justify-center gap-4 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                    <span>+91 9027475042</span>
                    <span>•</span>
                    <span>support@staykedarnath.com</span>
                    <span>•</span>
                    <span>www.staykedarnath.com</span>
                </div>
            </div>
        </div>
    );
});

ItineraryTemplate.displayName = "ItineraryTemplate";
