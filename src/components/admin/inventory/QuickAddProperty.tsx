
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Hotel } from "lucide-react";
import { useState } from "react";

export function QuickAddProperty() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/20">
                    <Plus className="w-4 h-4 mr-2" /> Quick Add Hotel
                </Button>
            </SheetTrigger>
            <SheetContent className="bg-slate-950 border-white/10 text-white">
                <SheetHeader>
                    <SheetTitle className="text-white flex items-center gap-2">
                        <Hotel className="w-5 h-5 text-red-500" />
                        Concierge Quick Add
                    </SheetTitle>
                    <SheetDescription className="text-slate-400">
                        Rapidly onboard a partner while on the phone. Photos can be added later.
                    </SheetDescription>
                </SheetHeader>
                <div className="grid gap-6 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-300">Owner Phone (Required)</Label>
                        <Input id="phone" placeholder="+91 98765 43210" className="bg-black/20 border-white/10 focus:border-red-500/50" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-300">Property Name</Label>
                        <Input id="name" placeholder="Hotel Shiva Palace" className="bg-black/20 border-white/10 focus:border-red-500/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-slate-300">City</Label>
                            <Select>
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue placeholder="City" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="sonprayag">Sonprayag</SelectItem>
                                    <SelectItem value="guptkashi">Guptkashi</SelectItem>
                                    <SelectItem value="phata">Phata</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-slate-300">Category</Label>
                            <Select>
                                <SelectTrigger className="bg-black/20 border-white/10">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                    <SelectItem value="budget">Budget</SelectItem>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="luxury">Luxury</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="base-rate" className="text-slate-300">Base Rate (₹)</Label>
                        <Input id="base-rate" type="number" placeholder="2500" className="bg-black/20 border-white/10 focus:border-red-500/50" />
                    </div>
                </div>
                <SheetFooter>
                    <Button onClick={() => setIsOpen(false)} variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">
                        Cancel
                    </Button>
                    <Button onClick={() => setIsOpen(false)} className="bg-red-600 hover:bg-red-700 text-white">
                        Create Blind Listing
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
