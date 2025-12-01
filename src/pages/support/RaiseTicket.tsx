import { useState } from "react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Copy, Ticket } from "lucide-react";
import HelpCenterLayout from "@/components/help/HelpCenterLayout";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const formSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters"),
    category: z.string().min(1, "Please select a category"),
    message: z.string().min(10, "Description must be at least 10 characters"),
});

export default function RaiseTicket() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ticketNumber, setTicketNumber] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            subject: "",
            category: "",
            message: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const { data, error } = await supabase.rpc("create_support_ticket", {
                p_subject: values.subject,
                p_category: values.category,
                p_message: values.message,
            });

            if (error) throw error;

            if (data) {
                const result = data as { ticket_number: string };
                setTicketNumber(result.ticket_number);

                toast({
                    title: "Ticket Created Successfully",
                    description: "Your support request has been submitted.",
                });
            }
        } catch (error: any) {
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
            description: "Ticket ID copied to clipboard.",
        });
    };

    if (ticketNumber) {
        return (
            <HelpCenterLayout>
                <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 bg-background">
                    <Card className="w-full max-w-lg border-t-4 border-t-primary shadow-xl glass-card">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto bg-green-100 p-4 rounded-full w-fit mb-4">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-foreground">Ticket Created!</CardTitle>
                            <CardDescription className="text-base mt-2 text-muted-foreground">
                                Your support request has been successfully submitted.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-primary/5 border-2 border-primary/10 rounded-xl p-6">
                                <div className="text-center space-y-3">
                                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary uppercase tracking-wide">
                                        <Ticket className="w-4 h-4" />
                                        <span>Your Ticket ID</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-3 bg-white p-4 rounded-lg border border-primary/10 shadow-sm">
                                        <span className="font-mono font-bold text-2xl text-foreground">{ticketNumber}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(ticketNumber)}
                                            className="hover:bg-primary/10 text-primary"
                                        >
                                            <Copy className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-md p-4 text-sm text-amber-900">
                                <p className="font-semibold mb-1">📌 Important</p>
                                <p>Save this Ticket ID to track the status of your request.</p>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <Button asChild size="lg" className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg">
                                    <Link to={`/support/view?ticket_number=${ticketNumber}`}>
                                        View Ticket Status
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="lg" className="w-full border-border hover:bg-secondary">
                                    <Link to="/help">Return to Help Center</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </HelpCenterLayout>
        );
    }

    return (
        <HelpCenterLayout>
            <Helmet>
                <title>Submit a Ticket | Staykedar Support</title>
            </Helmet>

            <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 min-h-[calc(100vh-4rem)]">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Submit a Support Request
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Tell us what you need help with and we'll get back to you as soon as possible.
                        </p>
                    </div>

                    <Card className="border-t-4 border-t-primary shadow-xl glass-card">
                        <CardContent className="p-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold text-foreground">Category</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 text-base bg-white border-border focus:ring-primary">
                                                            <SelectValue placeholder="Select a category" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="booking">Booking Issue</SelectItem>
                                                        <SelectItem value="payment">Payment Inquiry</SelectItem>
                                                        <SelectItem value="cancellation">Cancellation & Refund</SelectItem>
                                                        <SelectItem value="account">Account Support</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold text-foreground">Subject</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Brief summary of your issue"
                                                        className="h-12 text-base bg-white border-border focus:ring-primary"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-base font-semibold text-foreground">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Please provide detailed information about your issue..."
                                                        className="min-h-[160px] text-base bg-white border-border focus:ring-primary"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg transition-all duration-300 h-12"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Ticket"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </HelpCenterLayout>
    );
}
