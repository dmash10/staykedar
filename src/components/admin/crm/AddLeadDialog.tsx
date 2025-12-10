
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface AddLeadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddLeadDialog({ open, onOpenChange }: AddLeadDialogProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        customer_name: "",
        customer_phone: "",
        customer_email: "",
        guests: 2,
        budget_category: "standard",
        notes: "",
        is_urgent: false,
        source: "walk_in"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { error } = await supabase
                .from('stay_leads' as any)
                .insert([{
                    ...formData,
                    status: 'new', // Default status
                }]);

            if (error) throw error;

            toast({ title: "Lead Created", description: "Added to the 'New Leads' column." });
            queryClient.invalidateQueries({ queryKey: ['stay_leads'] });
            onOpenChange(false);

            // Reset form
            setFormData({
                customer_name: "",
                customer_phone: "",
                customer_email: "",
                guests: 2,
                budget_category: "standard",
                notes: "",
                is_urgent: false,
                source: "walk_in"
            });

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const [duplicateWarning, setDuplicateWarning] = useState<{ name: string; status: string } | null>(null);

    const checkDuplicate = async (phone: string) => {
        if (!phone || phone.length < 10) return;

        try {
            const { data } = await supabase
                .from('stay_leads' as any)
                .select('customer_name, status')
                .eq('customer_phone', phone)
                .single();

            if (data) {
                setDuplicateWarning({ name: data.customer_name, status: data.status });
            } else {
                setDuplicateWarning(null);
            }
        } catch (err) {
            // Ignore no rows found error
            setDuplicateWarning(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-slate-900 border-white/10 text-white sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Manually enter a walk-in or phone inquiry.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="source">Source</Label>
                            <Select
                                value={formData.source}
                                onValueChange={(v) => setFormData({ ...formData, source: v })}
                            >
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    <SelectItem value="walk_in">Walk-In</SelectItem>
                                    <SelectItem value="phone">Phone Inquiry</SelectItem>
                                    <SelectItem value="website">Website</SelectItem>
                                    <SelectItem value="referral">Referral</SelectItem>
                                    <SelectItem value="ota">OTA (Booking/Agoda)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Input
                                    id="phone"
                                    required
                                    value={formData.customer_phone}
                                    onChange={(e) => {
                                        setFormData({ ...formData, customer_phone: e.target.value });
                                        if (duplicateWarning) setDuplicateWarning(null); // Clear on edit
                                    }}
                                    onBlur={(e) => checkDuplicate(e.target.value)}
                                    placeholder="+91..."
                                    className={`bg-black/20 border-white/10 ${duplicateWarning ? 'border-amber-500/50' : ''}`}
                                />
                                {duplicateWarning && (
                                    <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-amber-900/20 border border-amber-500/20 rounded text-xs text-amber-200 z-10">
                                        ⚠️ Exists: <strong>{duplicateWarning.name}</strong> ({duplicateWarning.status})
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address (Optional)</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.customer_email || ''}
                            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                            placeholder="guest@example.com"
                            className="bg-black/20 border-white/10"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="guests">Guest Count</Label>
                            <Input
                                id="guests"
                                type="number"
                                min={1}
                                required
                                value={formData.guests}
                                onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                                className="bg-black/20 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Budget Tier</Label>
                            <Select
                                value={formData.budget_category}
                                onValueChange={(v) => setFormData({ ...formData, budget_category: v })}
                            >
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-white/10 text-white">
                                    <SelectItem value="budget">Budget (Economy)</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Requirement Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Specific needs (e.g., Ground floor, Near temple...)"
                            className="bg-black/20 border-white/10 h-20"
                        />
                    </div>
                </form>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="hover:bg-white/10">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Lead
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
