import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
    Loader2, CheckCircle2, Copy, Ticket, ArrowLeft, 
    AlertCircle, Clock, Shield
} from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    category: z.string().min(1, "Please select a category"),
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    description: z.string().min(20, "Please provide more details (at least 20 characters)"),
    booking_reference: z.string().optional(),
});

interface Category {
    id: string;
    name: string;
    description: string;
    icon: string;
}

// Keywords for auto-detecting priority
const urgentKeywords = ["urgent", "emergency", "immediately", "asap", "critical", "stuck", "blocked", "cannot access", "payment failed", "money deducted", "wrong charge"];
const highKeywords = ["refund", "cancel", "not working", "error", "issue", "problem", "help", "failed", "missing", "wrong"];

export default function RaiseTicket() {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketData, setTicketData] = useState<{ ticket_number: string; id: string } | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            category: "",
            subject: "",
            description: "",
            booking_reference: "",
        },
    });

    useEffect(() => {
        fetchCategories();
        checkUser();
    }, []);

    const checkUser = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
            setUser(currentUser);
            form.setValue("email", currentUser.email || "");
            fetchUserProfile(currentUser.id);
        }
    };

    const defaultCategories: Category[] = [
        { id: "booking", name: "Booking Issues", description: "Problems with reservations", icon: "Calendar" },
        { id: "payment", name: "Payment & Refunds", description: "Payment failures, refunds", icon: "CreditCard" },
        { id: "property", name: "Property Concerns", description: "Issues with accommodation", icon: "Home" },
        { id: "travel", name: "Travel Assistance", description: "Help with routes", icon: "Map" },
        { id: "technical", name: "Technical Support", description: "Website or app issues", icon: "Settings" },
        { id: "general", name: "General Inquiry", description: "Other questions", icon: "HelpCircle" },
    ];

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from("support_categories")
                .select("*")
                .eq("is_active", true)
                .order("display_order");
            
            if (!error && data && data.length > 0) {
                setCategories(data);
            } else {
                // Use default categories if fetch fails
                setCategories(defaultCategories);
            }
        } catch (e) {
            console.error("Error fetching categories:", e);
            setCategories(defaultCategories);
        }
    };

    const fetchUserProfile = async (userId: string) => {
        const { data } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", userId)
            .single();
        
        if (data?.full_name) {
            form.setValue("name", data.full_name);
        }
    };

    const generateTicketNumber = () => {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `TKT-${dateStr}-${random}`;
    };

    // Auto-detect priority based on subject and description
    const detectPriority = (subject: string, description: string, categoryId: string): string => {
        const text = `${subject} ${description}`.toLowerCase();
        
        // Check for urgent keywords
        if (urgentKeywords.some(keyword => text.includes(keyword))) {
            return "urgent";
        }
        
        // Check for high priority keywords
        if (highKeywords.some(keyword => text.includes(keyword))) {
            return "high";
        }
        
        // Payment & Refund category defaults to high
        const category = categories.find(c => c.id === categoryId);
        if (category?.name.toLowerCase().includes("payment") || category?.name.toLowerCase().includes("refund")) {
            return "high";
        }
        
        return "medium";
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const ticketNumber = generateTicketNumber();
            const priority = detectPriority(values.subject, values.description, values.category);
            
            // Get category name from selected category
            const selectedCategory = categories.find(c => c.id === values.category);
            const categoryName = selectedCategory?.name || values.category;
            
            // Create the ticket
            const { data: ticket, error: ticketError } = await supabase
                .from("support_tickets")
                .insert({
                    ticket_number: ticketNumber,
                    user_id: user?.id || null,
                    guest_email: values.email,
                    guest_name: values.name,
                    category: categoryName,
                    subject: values.subject,
                    description: values.description,
                    priority: priority,
                    status: "open",
                    metadata: values.booking_reference ? { booking_reference: values.booking_reference } : {},
                })
                .select()
                .single();

            if (ticketError) throw ticketError;

            // Add initial message
            await supabase
                .from("ticket_messages")
                .insert({
                    ticket_id: ticket.id,
                    sender_id: user?.id || null,
                    sender_type: "user",
                    message: values.description,
                    is_admin: false,
                });

            // Log activity
            await supabase
                .from("ticket_activity_log")
                .insert({
                    ticket_id: ticket.id,
                    user_id: user?.id || null,
                    action: "ticket_created",
                    new_value: "open",
                });

            setTicketData({ ticket_number: ticketNumber, id: ticket.id });

            toast({
                title: "Ticket Created Successfully",
                description: "Your support request has been submitted.",
            });
        } catch (error: any) {
            console.error("Error creating ticket:", error);
            toast({
                title: "Error",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied!",
            description: "Ticket number copied to clipboard.",
        });
    };

    // Success Screen
    if (ticketData) {
        return (
            <>
                <Helmet>
                    <title>Ticket Created | StayKedarnath Support</title>
                </Helmet>
                <Nav />
                <div className="min-h-screen bg-gray-50">
                    <div className="max-w-xl mx-auto px-4 py-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                        >
                            {/* Success Header */}
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </motion.div>
                                <h1 className="text-2xl font-bold text-white mb-2">Ticket Created!</h1>
                                <p className="text-green-100">We've received your support request</p>
                            </div>

                            {/* Ticket Details */}
                            <div className="p-8">
                                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                    <p className="text-sm text-gray-500 text-center mb-2">Your Ticket Number</p>
                                    <div className="flex items-center justify-center gap-3">
                                        <span className="font-mono text-2xl font-bold text-gray-900">
                                            {ticketData.ticket_number}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(ticketData.ticket_number)}
                                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                        >
                                            <Copy className="w-5 h-5 text-gray-600" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                                    <div className="flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-amber-900 mb-1">Save this ticket number</p>
                                            <p className="text-sm text-amber-700">
                                                You'll need it to track your request status.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Expected Response */}
                                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl mb-6">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-blue-900">Expected Response Time</p>
                                        <p className="text-sm text-blue-700">Within 2-4 business hours</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="space-y-3">
                                    <Button 
                                        onClick={() => navigate(`/support/ticket/${ticketData.ticket_number}`)}
                                        className="w-full bg-[#0071c2] hover:bg-[#005999] h-12"
                                    >
                                        <Ticket className="w-4 h-4 mr-2" />
                                        View Ticket Details
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => navigate("/help")}
                                        className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Return to Help Center
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Input style without blue outline
    const inputStyle = "h-11 border-gray-300 focus:border-gray-400 focus:ring-0 outline-none";

    return (
        <>
            <Helmet>
                <title>Raise a Support Ticket | StayKedarnath</title>
                <meta name="description" content="Submit a support request and get help from our team" />
            </Helmet>
            <Nav />
            
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0A1628] via-[#0F2167] to-[#1E3A8A] py-10 md:py-14">
                    <div className="max-w-3xl mx-auto px-4">
                        <Link 
                            to="/help" 
                            className="inline-flex items-center gap-2 text-white hover:text-white/90 mb-5 transition-colors text-sm bg-white/15 px-3 py-1.5 rounded-full border border-white/20"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Help Center
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                            Raise a Support Ticket
                        </h1>
                        <p className="text-blue-200 text-sm md:text-base">
                            Tell us about your issue and we'll help you resolve it
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 md:p-6">
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        {/* Contact Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-700">Full Name *</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                placeholder="Your name" 
                                                                className={inputStyle}
                                                                {...field} 
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-700">Email Address *</FormLabel>
                                                        <FormControl>
                                                            <Input 
                                                                type="email"
                                                                placeholder="your@email.com" 
                                                                className={inputStyle}
                                                                {...field} 
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Category Dropdown */}
                                        <FormField
                                            control={form.control}
                                            name="category"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700">What do you need help with? *</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-11 border-gray-300 focus:ring-0 focus:border-gray-400 bg-white">
                                                                <SelectValue placeholder="Select a category" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                                                            {categories.map((cat) => (
                                                                <SelectItem 
                                                                    key={cat.id} 
                                                                    value={cat.id}
                                                                    className="hover:bg-gray-100 focus:bg-[#0071c2] focus:text-white cursor-pointer"
                                                                >
                                                                    {cat.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Booking Reference */}
                                        <FormField
                                            control={form.control}
                                            name="booking_reference"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700">Booking Reference (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="e.g., BK-12345" 
                                                            className={inputStyle}
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-xs text-gray-500">
                                                        If your issue is related to a booking
                                                    </FormDescription>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Subject */}
                                        <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700">Subject *</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            placeholder="e.g., Unable to complete booking" 
                                                            className={inputStyle}
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Description */}
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-gray-700">Describe your issue *</FormLabel>
                                                    <FormControl>
                                                        <Textarea 
                                                            placeholder="Please provide as much detail as possible..."
                                                            className="min-h-[120px] resize-none border-gray-300 focus:border-gray-400 focus:ring-0 outline-none"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormDescription className="text-xs text-gray-500">
                                                        Include relevant details like dates, amounts, or error messages
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-12 bg-[#0071c2] hover:bg-[#005999] text-white font-semibold rounded-lg transition-colors"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    Creating Ticket...
                                                </>
                                            ) : (
                                                <>
                                                    <Ticket className="w-5 h-5 mr-2" />
                                                    Submit Ticket
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Already have a ticket */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900 mb-2 text-sm">Already have a ticket?</h3>
                                <p className="text-xs text-gray-600 mb-3">
                                    Track the status of your existing support request
                                </p>
                                <Button 
                                    variant="outline" 
                                    className="w-full h-10 border-[#0071c2] text-[#0071c2] hover:bg-[#0071c2]/5"
                                    onClick={() => navigate("/support/track")}
                                >
                                    Track Ticket
                                </Button>
                            </div>

                            {/* Response Time */}
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">Quick Response</p>
                                        <p className="text-xs text-gray-600">2-4 hours avg.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Security Note */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-1">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <p className="font-semibold text-gray-900 text-sm">Your data is secure</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    All communications are encrypted
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
