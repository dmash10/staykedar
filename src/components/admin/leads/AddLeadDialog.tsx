
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface AddLeadDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddLeadDialog({ open, onOpenChange }: AddLeadDialogProps) {
    const [date, setDate] = useState<Date>()

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle>Add New Lead</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Enter the details of the new inquiry manually.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-slate-300">Customer Name</Label>
                            <Input id="name" placeholder="Rahul Sharma" className="bg-slate-900 border-slate-700 text-white" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="contact" className="text-slate-300">Contact Number</Label>
                            <Input id="contact" placeholder="+91 98765 00000" className="bg-slate-900 border-slate-700 text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="source" className="text-slate-300">Source</Label>
                            <Select>
                                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                                    <SelectItem value="manual">Manual Entry</SelectItem>
                                    <SelectItem value="phone">Phone Call</SelectItem>
                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                    <SelectItem value="referral">Referral</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="pax" className="text-slate-300">Pax (People)</Label>
                            <Input id="pax" type="number" placeholder="2" className="bg-slate-900 border-slate-700 text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label className="text-slate-300">Travel Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                        className="text-white"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="budget" className="text-slate-300">Est. Budget (₹)</Label>
                            <Input id="budget" type="number" placeholder="50000" className="bg-slate-900 border-slate-700 text-white" />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="notes" className="text-slate-300">Requirements / Notes</Label>
                        <Textarea id="notes" placeholder="Needs a deluxe room with view..." className="bg-slate-900 border-slate-700 text-white resize-none h-20" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-700 text-slate-300 hover:bg-white/5 hover:text-white">Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Create Lead</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
