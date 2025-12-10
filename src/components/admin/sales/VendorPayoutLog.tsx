import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Building2, Car, TrendingUp, Calendar, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function VendorPayoutLog() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    const [newPayout, setNewPayout] = useState({
        vendor_name: "",
        payout_type: "hotel",
        amount: "",
        status: "completed",
        reference_id: "",
        notes: ""
    });

    // Fetch Payouts
    const { data: payouts = [], isLoading } = useQuery({
        queryKey: ["vendor-payouts"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("vendor_payouts")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data;
        },
    });

    // Add Payout Mutation
    const addMutation = useMutation({
        mutationFn: async (payoutData: any) => {
            const { error } = await supabase
                .from("vendor_payouts")
                .insert([{
                    ...payoutData,
                    amount: Number(payoutData.amount)
                }]);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-payouts"] });
            setIsOpen(false);
            setNewPayout({
                vendor_name: "",
                payout_type: "hotel",
                amount: "",
                status: "completed",
                reference_id: "",
                notes: ""
            });
            toast({ title: "Payout Added", description: "The vendor payout has been logged." });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to add payout",
                variant: "destructive"
            });
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("vendor_payouts").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vendor-payouts"] });
            toast({ title: "Deleted", description: "Payout log removed." });
        }
    });

    const handleAddPayout = () => {
        if (!newPayout.vendor_name || !newPayout.amount) {
            toast({ title: "Missing Fields", description: "Please enter vendor name and amount.", variant: "destructive" });
            return;
        }
        addMutation.mutate(newPayout);
    };

    const totalPaid = payouts.reduce((sum: number, p: any) => p.status === 'completed' ? sum + Number(p.amount) : sum, 0);
    const totalPending = payouts.reduce((sum: number, p: any) => p.status !== 'completed' ? sum + Number(p.amount) : sum, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-900/50 to-slate-900 border-blue-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-200">Total Paid Out</p>
                                <h3 className="text-2xl font-bold text-white mt-1">₹{totalPaid.toLocaleString()}</h3>
                            </div>
                            <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-900/50 to-slate-900 border-amber-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-amber-200">Pending Processing</p>
                                <h3 className="text-2xl font-bold text-white mt-1">₹{totalPending.toLocaleString()}</h3>
                            </div>
                            <Calendar className="w-8 h-8 text-amber-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                        <CardTitle className="text-white text-lg">Detailed Payout Log</CardTitle>
                        <CardDescription>Track every rupee leaving the system</CardDescription>
                    </div>
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Record Payout
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-950 border-slate-800 text-white">
                            <DialogHeader>
                                <DialogTitle>Record New Payout</DialogTitle>
                                <DialogDescription>Enter details of the payment made to vendor</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">Vendor Name</label>
                                    <Input
                                        placeholder="e.g. Hotel Paradise"
                                        className="bg-slate-900 border-slate-800"
                                        value={newPayout.vendor_name}
                                        onChange={e => setNewPayout({ ...newPayout, vendor_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400">Amount (₹)</label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="bg-slate-900 border-slate-800"
                                            value={newPayout.amount}
                                            onChange={e => setNewPayout({ ...newPayout, amount: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-slate-400">Type</label>
                                        <Select
                                            value={newPayout.payout_type}
                                            onValueChange={v => setNewPayout({ ...newPayout, payout_type: v })}
                                        >
                                            <SelectTrigger className="bg-slate-900 border-slate-800">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                                <SelectItem value="hotel">Hotel Partner</SelectItem>
                                                <SelectItem value="transport">Transport/Cab</SelectItem>
                                                <SelectItem value="other">Other Expense</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">Status</label>
                                    <Select
                                        value={newPayout.status}
                                        onValueChange={v => setNewPayout({ ...newPayout, status: v })}
                                    >
                                        <SelectTrigger className="bg-slate-900 border-slate-800">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                            <SelectItem value="completed">Completed (Paid)</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-400">Reference ID (Optional)</label>
                                    <Input
                                        placeholder="UPI Ref / Bank Txn ID"
                                        className="bg-slate-900 border-slate-800"
                                        value={newPayout.reference_id}
                                        onChange={e => setNewPayout({ ...newPayout, reference_id: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleAddPayout}
                                    disabled={addMutation.isPending}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {addMutation.isPending ? "Saving..." : "Save Payout"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading payouts...</div>
                    ) : payouts.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No payouts recorded yet.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-800 hover:bg-transparent">
                                    <TableHead className="text-slate-400">Vendor</TableHead>
                                    <TableHead className="text-slate-400">Type</TableHead>
                                    <TableHead className="text-slate-400">Date</TableHead>
                                    <TableHead className="text-slate-400">Status</TableHead>
                                    <TableHead className="text-slate-400 text-right">Amount</TableHead>
                                    <TableHead className="text-slate-400 w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payouts.map((payout: any) => (
                                    <TableRow key={payout.id} className="border-slate-800 hover:bg-slate-800/50">
                                        <TableCell>
                                            <div className="font-medium text-slate-200">{payout.vendor_name}</div>
                                            {payout.reference_id && (
                                                <div className="text-xs text-slate-500">Ref: {payout.reference_id}</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                {payout.payout_type === 'hotel' ? <Building2 className="w-3 h-3" /> :
                                                    payout.payout_type === 'transport' ? <Car className="w-3 h-3" /> :
                                                        <TrendingUp className="w-3 h-3" />}
                                                <span className="capitalize">{payout.payout_type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-400">
                                            {format(new Date(payout.created_at), 'MMM dd, yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                                ${payout.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                    payout.status === 'processing' ? 'bg-amber-500/10 text-amber-400' :
                                                        'bg-slate-700 text-slate-400'}`}>
                                                {payout.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-200">
                                            ₹{payout.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                                                onClick={() => deleteMutation.mutate(payout.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
