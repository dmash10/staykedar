
import { useState } from "react";
import { GlassCard } from "@/components/admin/dashboard/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, Copy, CheckCircle2, Share2, IndianRupee, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Lead } from "@/components/admin/crm/LeadCard";

interface PaymentLinkGeneratorProps {
    lead?: Lead | null;
}

export function PaymentLinkGenerator({ lead }: PaymentLinkGeneratorProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState<string>("");
    const [description, setDescription] = useState("Booking Advance");
    const [generatedLink, setGeneratedLink] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleGenerate = async () => {
        if (!amount) {
            toast({ title: "Error", description: "Please enter an amount.", variant: "destructive" });
            return;
        }

        setIsLoading(true);

        // Simulate API call to Razorpay/Backend
        setTimeout(() => {
            // Mock Link for now
            const mockId = Math.random().toString(36).substring(7);
            const link = `https://rzp.io/l/${mockId}`;

            setGeneratedLink(link);
            setIsLoading(false);
            toast({ title: "Link Created", description: "Payment link generated successfully." });
        }, 1500);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setIsCopied(true);
        toast({ title: "Copied", description: "Link copied to clipboard." });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleShare = () => {
        if (!lead) return;
        const message = `Hi ${lead.customer_name || 'there'}, please pay ₹${amount} for your booking using this link: ${generatedLink}`;
        const url = `https://wa.me/${lead.customer_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <GlassCard className="p-6 h-full flex flex-col bg-[#020617] border border-blue-500/10 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <Link className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Payment Link</h3>
                    <p className="text-xs text-slate-400">Generate Razorpay/UPI links</p>
                </div>
            </div>

            <div className="space-y-4 flex-1">
                <div className="space-y-2">
                    <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Amount (₹)</Label>
                    <div className="relative">
                        <IndianRupee className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                        <Input
                            type="number"
                            placeholder="0.00"
                            className="bg-slate-900 border-white/10 pl-9 font-mono text-lg font-bold text-emerald-400"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-xs text-slate-400 uppercase tracking-wider font-bold">Purpose</Label>
                    <Select value={description} onValueChange={setDescription}>
                        <SelectTrigger className="bg-slate-900 border-white/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Booking Advance">Booking Advance</SelectItem>
                            <SelectItem value="Full Payment">Full Payment</SelectItem>
                            <SelectItem value="Remaining Balance">Remaining Balance</SelectItem>
                            <SelectItem value="Add-on Services">Add-on Services</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {generatedLink && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                        <Label className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider mb-1 block">Active Link</Label>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-black/20 p-2 rounded text-emerald-300 font-mono truncate">
                                {generatedLink}
                            </code>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20" onClick={handleCopy}>
                                {isCopied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 space-y-3">
                {!generatedLink ? (
                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold"
                        onClick={handleGenerate}
                        disabled={isLoading || !amount}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link className="w-4 h-4 mr-2" />}
                        Generate Link
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300"
                            onClick={() => {
                                setGeneratedLink("");
                                setAmount("");
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            className="flex-[2] bg-green-600 hover:bg-green-500 text-white font-bold"
                            onClick={handleShare}
                        >
                            <Share2 className="w-4 h-4 mr-2" /> Share via WhatsApp
                        </Button>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
