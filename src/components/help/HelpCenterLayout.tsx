import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft, LifeBuoy } from 'lucide-react';

interface HelpCenterLayoutProps {
    children: ReactNode;
    showSearch?: boolean;
}

export default function HelpCenterLayout({ children, showSearch = true }: HelpCenterLayoutProps) {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                                Back to StayKedar
                            </span>
                        </Link>
                        <div className="h-6 w-px bg-border hidden sm:block"></div>
                        <Link to="/help" className="flex items-center gap-2">
                            <div className="bg-primary/10 p-1.5 rounded-lg">
                                <LifeBuoy className="w-5 h-5 text-primary" />
                            </div>
                            <span className="font-bold text-xl text-foreground tracking-tight">Help Center</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {showSearch && (
                            <div className="hidden md:block relative w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search for help..."
                                    className="pl-10 bg-secondary/50 border-border focus:bg-background transition-all"
                                />
                            </div>
                        )}
                        <Button variant="outline" className="hidden sm:flex hover:bg-primary/5 hover:text-primary border-border" onClick={() => navigate('/support/raise')}>
                            Submit a Request
                        </Button>
                        <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90 text-white shadow-sm">
                            Sign In
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-secondary/30 border-t border-border py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-primary/10 p-1.5 rounded-lg">
                                    <LifeBuoy className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-bold text-xl text-foreground">StayKedar Help</span>
                            </div>
                            <p className="text-muted-foreground max-w-sm leading-relaxed">
                                We're here to help you with your bookings, account, and any other questions you might have about your stay in Kedarnath.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Support</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link to="/support/raise" className="hover:text-primary transition-colors">Submit a Request</Link></li>
                                <li><Link to="/support/track" className="hover:text-primary transition-colors">Track Ticket</Link></li>
                                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/cancellation" className="hover:text-primary transition-colors">Cancellation Policy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} StayKedar. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
