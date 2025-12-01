import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HelpCenterLayout from "@/components/help/HelpCenterLayout";
import { Helmet } from "react-helmet";
import { Search, Ticket } from "lucide-react";

export default function TrackTicket() {
    const navigate = useNavigate();
    const [ticketNumber, setTicketNumber] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ticketNumber) {
            navigate(`/support/view?ticket_number=${ticketNumber}`);
        }
    };

    return (
        <HelpCenterLayout>
            <Helmet>
                <title>Track Ticket | Staykedar Support</title>
            </Helmet>

            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-16 px-4 bg-background">
                <div className="w-full max-w-md">
                    <Card className="border-t-4 border-t-primary shadow-xl glass-card">
                        <CardHeader className="text-center pb-4">
                            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                                <Ticket className="w-10 h-10 text-primary" />
                            </div>
                            <CardTitle className="text-3xl font-bold text-foreground">Track Your Ticket</CardTitle>
                            <CardDescription className="text-base mt-2 text-muted-foreground">
                                Enter your Ticket ID to view the status and details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="ticketNumber" className="text-base font-semibold text-foreground">Ticket ID</Label>
                                    <Input
                                        id="ticketNumber"
                                        placeholder="TKT-XXXXXX"
                                        value={ticketNumber}
                                        onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                                        className="h-12 text-base font-mono bg-white border-border focus:ring-primary"
                                        required
                                    />
                                </div>

                                <Button type="submit" size="lg" className="w-full text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg h-12">
                                    <Search className="w-5 h-5 mr-2" />
                                    Track Status
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </HelpCenterLayout>
    );
}
