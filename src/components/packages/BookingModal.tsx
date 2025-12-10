import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2, Phone, Mail, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loadRazorpayScript } from "@/utils/razorpay";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    packageId: string;
    packageTitle: string;
    price: number;
}

const BookingModal = ({ isOpen, onClose, packageId, packageTitle, price }: BookingModalProps) => {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        date: undefined as Date | undefined,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.phone || !formData.date) {
            toast({
                title: "Missing Details",
                description: "Please fill in all fields to proceed.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            // 1. Load Razorpay SDK
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                throw new Error("Razorpay SDK failed to load");
            }

            // 2. Create Order via Edge Function
            const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
                body: {
                    packageId,
                    amount: price,
                    customerDetails: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        travelDate: formData.date.toISOString()
                    }
                }
            });

            if (orderError) throw orderError;

            // 3. Initialize Razorpay Checkout
            const options = {
                key: orderData.key_id, // Key ID from backend
                amount: orderData.amount,
                currency: orderData.currency,
                name: "StayKedarnath",
                description: `Booking for ${packageTitle}`,
                order_id: orderData.order_id, // Razorpay Order ID
                handler: async function (response: any) {
                    try {
                        toast({
                            title: "Verifying Payment...",
                            description: "Please wait while we confirm your booking.",
                        });

                        const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
                            body: {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            }
                        });

                        if (verifyError) throw verifyError;

                        toast({
                            title: "Booking Confirmed!",
                            description: "Your payment was successful and booking is confirmed.",
                        });

                        onClose();
                    } catch (error: any) {
                        console.error("Verification Error:", error);
                        toast({
                            title: "Verification Failed",
                            description: "Payment successful but verification failed. Please contact support.",
                            variant: "destructive"
                        });
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone,
                },
                theme: {
                    color: "#0071c2",
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error("Booking Error:", error);
            toast({
                title: "Booking Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Book {packageTitle}</DialogTitle>
                    <DialogDescription>
                        Enter your details to confirm your booking for ₹{price.toLocaleString()}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleBooking} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                className="pl-9"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                className="pl-9"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                placeholder="+91 9876543210"
                                className="pl-9"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Travel Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "justify-start text-left font-normal pl-9 relative",
                                        !formData.date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.date}
                                    onSelect={(date) => setFormData({ ...formData, date })}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="pt-4">
                        <Button type="submit" className="w-full bg-[#0071c2] hover:bg-[#005a9c]" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                `Pay ₹${price.toLocaleString()}`
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BookingModal;
