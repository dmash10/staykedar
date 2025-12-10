
import { GlassCard } from "@/components/admin/dashboard/GlassCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Zap, CloudRain, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function SurgeControl() {
    const { toast } = useToast();
    const [sonprayagSurge, setSonprayagSurge] = useState([0]);
    const [guptkashiSurge, setGuptkashiSurge] = useState([0]);
    const [isRainMode, setIsRainMode] = useState(false);

    const handleReset = () => {
        setSonprayagSurge([0]);
        setGuptkashiSurge([0]);
        setIsRainMode(false);
        toast({ title: "Surge Reset", description: "All pricing overrides have been cleared." });
    };

    const handleRainMode = (val: boolean) => {
        setIsRainMode(val);
        if (val) {
            toast({ title: "Rain Mode Activated", description: "Safety margins applied to all routes.", variant: "destructive" });
        } else {
            toast({ title: "Rain Mode Disabled", description: "Standard pricing restored." });
        }
    };

    return (
        <GlassCard className="p-6 space-y-6 bg-yellow-500/5 border-yellow-500/20">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                    <Zap className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Surge Control</h3>
                    <p className="text-xs text-slate-400">Global price overrides</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Sonprayag Surge</span>
                        <span className="text-yellow-400 font-bold">+{sonprayagSurge}%</span>
                    </div>
                    <Slider
                        value={sonprayagSurge}
                        onValueChange={setSonprayagSurge}
                        max={50}
                        step={5}
                        className="py-2"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Guptkashi Surge</span>
                        <span className="text-yellow-400 font-bold">+{guptkashiSurge}%</span>
                    </div>
                    <Slider
                        value={guptkashiSurge}
                        onValueChange={setGuptkashiSurge}
                        max={50}
                        step={5}
                        className="py-2"
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center gap-3">
                        <CloudRain className={`w-5 h-5 ${isRainMode ? 'text-blue-400' : 'text-slate-500'}`} />
                        <div>
                            <p className="text-sm font-bold text-white">Rainy Day Mode</p>
                            <p className="text-[10px] text-slate-400">Auto-add risk fee</p>
                        </div>
                    </div>
                    <Switch checked={isRainMode} onCheckedChange={handleRainMode} />
                </div>

                <Button variant="outline" onClick={handleReset} className="w-full border-red-500/20 hover:bg-red-500/10 text-red-400 hover:text-red-300">
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset Inventory
                </Button>
            </div>
        </GlassCard>
    );
}
