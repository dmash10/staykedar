
import { GlassCard } from "@/components/admin/dashboard/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { IndianRupee, Send, Calculator, Wallet, Share2 } from "lucide-react";
import { useState, useEffect } from "react";

export function QuoteGenerator() {
    const [hotelCost, setHotelCost] = useState(3000);
    const [taxiCost, setTaxiCost] = useState(5000);
    const [margin, setMargin] = useState(20);
    const [discount, setDiscount] = useState(0);
    const [surcharge, setSurcharge] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [profit, setProfit] = useState(0);

    useEffect(() => {
        const cost = hotelCost + taxiCost;
        const baseProfit = Math.round(cost * (margin / 100));
        // Net Profit = Base Margin Profit + Extra Markup - Discount
        const netProfit = baseProfit + surcharge - discount;

        setProfit(netProfit);
        setTotalPrice(cost + baseProfit + surcharge - discount);
    }, [hotelCost, taxiCost, margin, discount, surcharge]);

    return (
        <GlassCard className="p-0 h-full flex flex-col bg-[#020617] border border-blue-500/10 shadow-2xl relative overflow-hidden group/card text-white">

            {/* Subtle Glow Background - Drastically reduced opacity */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="p-6 pb-2 relative z-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                        {/* Removed animate-pulse, reduced opacity */}
                        <div className="absolute inset-0 bg-blue-500 blur-md opacity-10"></div>
                        <div className="w-12 h-12 relative rounded-2xl bg-[#0F172A] border border-white/10 flex items-center justify-center text-blue-400 shadow-xl">
                            <Calculator className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                            Quote Engine
                        </h3>
                        <p className="text-xs text-slate-400 font-medium tracking-wide">Smart Pricing & Margin Calculator</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Hotel Cost Slider */}
                    <div className="group">
                        <div className="flex justify-between mb-4 items-end">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">Hotel Base Cost</Label>
                            <div className="flex items-center gap-1 bg-cyan-950/20 border border-cyan-500/20 rounded-lg px-2 py-1">
                                <span className="text-xs text-cyan-500/70">₹</span>
                                <input
                                    type="number"
                                    value={hotelCost}
                                    onChange={(e) => setHotelCost(Number(e.target.value))}
                                    className="w-16 bg-transparent border-none text-right text-lg text-cyan-300 font-mono font-bold focus:ring-0 p-0"
                                />
                            </div>
                        </div>
                        <Slider
                            value={[hotelCost]}
                            onValueChange={(v) => setHotelCost(v[0])}
                            max={10000}
                            step={100}
                            className="cursor-pointer py-2"
                            rangeClassName="bg-gradient-to-r from-cyan-900 via-cyan-600 to-cyan-500"
                            thumbClassName="border-cyan-400 bg-[#020617] ring-2 ring-cyan-500/20 h-4 w-4 shadow-none hover:scale-110 transition-transform"
                        />
                    </div>

                    {/* Taxi Cost Slider */}
                    <div className="group">
                        <div className="flex justify-between mb-4 items-end">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-400 font-bold">Taxi & Add-ons</Label>
                            <div className="flex items-center gap-1 bg-fuchsia-950/20 border border-fuchsia-500/20 rounded-lg px-2 py-1">
                                <span className="text-xs text-fuchsia-500/70">₹</span>
                                <input
                                    type="number"
                                    value={taxiCost}
                                    onChange={(e) => setTaxiCost(Number(e.target.value))}
                                    className="w-16 bg-transparent border-none text-right text-lg text-fuchsia-300 font-mono font-bold focus:ring-0 p-0"
                                />
                            </div>
                        </div>
                        <Slider
                            value={[taxiCost]}
                            onValueChange={(v) => setTaxiCost(v[0])}
                            max={20000}
                            step={100}
                            className="cursor-pointer py-2"
                            rangeClassName="bg-gradient-to-r from-fuchsia-900 via-fuchsia-600 to-pink-500"
                            thumbClassName="border-fuchsia-400 bg-[#020617] ring-2 ring-fuchsia-500/20 h-4 w-4 shadow-none hover:scale-110 transition-transform"
                        />
                    </div>

                    {/* Margin Slider */}
                    <div>
                        <div className="flex justify-between mb-4 items-center bg-emerald-950/10 border border-emerald-500/10 p-2 rounded-lg">
                            <Label className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold pl-1">Profit Margin</Label>
                            <span className="text-sm font-bold text-emerald-300">{margin}%</span>
                        </div>
                        <Slider
                            value={[margin]}
                            onValueChange={(v) => setMargin(v[0])}
                            max={50}
                            step={1}
                            className="cursor-pointer py-2"
                            rangeClassName="bg-gradient-to-r from-emerald-900 via-emerald-600 to-green-500"
                            thumbClassName="border-emerald-400 bg-[#020617] ring-2 ring-emerald-500/20 h-4 w-4 shadow-none hover:scale-110 transition-transform"
                        />
                    </div>
                </div>

                {/* Additional Adjustments */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-bold">Extra Markup (₹)</Label>
                        <Input
                            type="number"
                            value={surcharge}
                            onChange={(e) => setSurcharge(Number(e.target.value))}
                            className="bg-orange-950/10 border-orange-500/20 text-orange-300 font-mono font-bold"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-bold">Discount (₹)</Label>
                        <Input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            className="bg-red-950/10 border-red-500/20 text-red-300 font-mono font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Results Footer - Darker Background */}
            <div className="mt-auto bg-[#020617] p-6 border-t border-white/5 relative z-10">
                <div className="flex justify-between items-end mb-6">
                    <div className="space-y-1">
                        <p className="text-[9px] uppercase text-slate-500 font-bold tracking-[0.2em]">Total Quote</p>
                        <h2 className="text-3xl font-black text-white flex items-center tracking-tight">
                            <span className="text-slate-600 text-lg mr-1 font-sans">₹</span> {totalPrice.toLocaleString()}
                        </h2>
                    </div>
                    <div className="text-right space-y-1">
                        <p className="text-[9px] uppercase text-emerald-500/80 font-bold tracking-[0.2em]">Net Profit</p>
                        <h3 className={`text-xl font-bold flex justify-end items-center ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            <span className="text-[10px] mr-1 opacity-50">{profit >= 0 ? '+' : ''}</span> ₹{profit.toLocaleString()}
                        </h3>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 shadow-lg shadow-emerald-900/20 border-t border-white/10 transition-all duration-300">
                        <Share2 className="w-5 h-5 mr-2" /> Share on WhatsApp
                    </Button>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 bg-[#0F172A] border-white/5 hover:bg-white/5 text-slate-300 hover:text-white transition-all duration-300">
                            Copy Link
                        </Button>
                        <Button variant="outline" className="flex-1 bg-[#0F172A] border-white/5 hover:bg-white/5 text-slate-300 hover:text-white transition-all duration-300">
                            Save Draft
                        </Button>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
