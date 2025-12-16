import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, TrendingUp, Flame, CheckCircle } from "lucide-react";
import Container from "../Container";

interface Activity {
    id: number;
    name: string;
    location: string;
    action: string;
}

// Simulated live activity data
const generateActivity = (): Activity => {
    const names = ['Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Suresh', 'Meera', 'Rahul', 'Kavita'];
    const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad'];
    const actions = [
        'booked a stay in Sonprayag',
        'booked Kedarnath package',
        'checked helicopter availability',
        'inquired about VIP darshan',
        'booked a hotel near Gaurikund',
    ];

    return {
        id: Date.now(),
        name: names[Math.floor(Math.random() * names.length)],
        location: cities[Math.floor(Math.random() * cities.length)],
        action: actions[Math.floor(Math.random() * actions.length)]
    };
};

const LiveActivityFeed = () => {
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        // Initial activity after 2 seconds
        const initialTimer = setTimeout(() => {
            setActivities([generateActivity()]);
        }, 2000);

        // Add new activity every 6 seconds
        const interval = setInterval(() => {
            setActivities(prev => {
                const newActivity = generateActivity();
                return [newActivity, ...prev].slice(0, 3); // Keep only last 3
            });
        }, 6000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    const stats = [
        { icon: Users, value: '127+', label: 'Active visitors', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
        { icon: TrendingUp, value: '48', label: 'Booked today', color: 'text-blue-400', bg: 'bg-blue-500/20' },
        { icon: Flame, value: '89%', label: 'Filling fast', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    ];

    return (
        <section className="py-3 bg-[#003580] border-y border-[#002a66]">
            <Container>
                <div className="flex items-center justify-between gap-6">
                    {/* Stats - Left */}
                    <div className="flex items-center gap-4 md:gap-6">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-md ${stat.bg}`}>
                                        <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-white font-bold text-sm">{stat.value}</span>
                                        <span className="text-blue-200 text-xs hidden sm:inline">{stat.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Live Activity - Right (Fixed Width Container) */}
                    <div className="hidden md:flex items-center gap-3 min-w-[320px] justify-end">
                        <AnimatePresence mode="wait">
                            {activities.slice(0, 1).map((activity) => (
                                <motion.div
                                    key={activity.id}
                                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeOut"
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 will-change-transform"
                                >
                                    {/* Green dot */}
                                    <span className="relative flex h-2 w-2 flex-shrink-0">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>

                                    <span className="text-xs text-white whitespace-nowrap">
                                        <span className="font-medium">{activity.name}</span>
                                        <span className="text-blue-200"> from {activity.location} </span>
                                        <span className="text-white/80">{activity.action}</span>
                                    </span>

                                    <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default LiveActivityFeed;
