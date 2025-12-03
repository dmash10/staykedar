import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowLeft, LifeBuoy, Mail, Phone, Clock, MessageSquare, MapPin } from 'lucide-react';

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
            <footer className="bg-slate-900 text-white mt-auto">
                {/* Main Footer */}
                <div className="py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {/* Brand */}
                            <div className="col-span-2 md:col-span-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="bg-[#0071c2] p-1.5 rounded-lg">
                                        <LifeBuoy className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-lg">StayKedar Help</span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Your trusted support for a seamless Kedarnath pilgrimage experience.
                                </p>
                            </div>

                            {/* Get Help */}
                            <div>
                                <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Get Help</h3>
                                <ul className="space-y-2.5 text-sm text-gray-400">
                                    <li>
                                        <Link to="/help" className="hover:text-[#0071c2] transition-colors flex items-center gap-2">
                                            <LifeBuoy className="w-3.5 h-3.5" />
                                            Help Center
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/support/raise" className="hover:text-[#0071c2] transition-colors flex items-center gap-2">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            Raise a Ticket
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/support/track" className="hover:text-[#0071c2] transition-colors flex items-center gap-2">
                                            <Search className="w-3.5 h-3.5" />
                                            Track Ticket
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/help/faq" className="hover:text-[#0071c2] transition-colors flex items-center gap-2">
                                            FAQs
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
                                <ul className="space-y-2.5 text-sm text-gray-400">
                                    <li>
                                        <a href="mailto:help@staykedarnath.in" className="hover:text-[#0071c2] transition-colors flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" />
                                            help@staykedarnath.in
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:support@staykedarnath.in" className="hover:text-[#0071c2] transition-colors flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" />
                                            support@staykedarnath.in
                                        </a>
                                    </li>
                                    <li>
                                        <a href="mailto:bookings@staykedarnath.in" className="hover:text-[#0071c2] transition-colors flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5" />
                                            bookings@staykedarnath.in
                                        </a>
                                    </li>
                                    <li>
                                        <a href="tel:+919027475942" className="hover:text-[#0071c2] transition-colors flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5" />
                                            +91 90274 75942
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Legal */}
                            <div>
                                <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Legal</h3>
                                <ul className="space-y-2.5 text-sm text-gray-400">
                                    <li>
                                        <Link to="/terms" className="hover:text-[#0071c2] transition-colors">Terms of Service</Link>
                                    </li>
                                    <li>
                                        <Link to="/privacy" className="hover:text-[#0071c2] transition-colors">Privacy Policy</Link>
                                    </li>
                                    <li>
                                        <Link to="/cancellation" className="hover:text-[#0071c2] transition-colors">Cancellation Policy</Link>
                                    </li>
                                    <li>
                                        <Link to="/shipping" className="hover:text-[#0071c2] transition-colors">Refund Policy</Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-gray-500 text-sm">
                                &copy; {new Date().getFullYear()} StayKedarnath.in. All rights reserved.
                            </p>
                            <div className="flex items-center gap-4">
                                <Link to="/" className="text-gray-400 hover:text-[#0071c2] text-sm transition-colors">
                                    Back to Main Site
                                </Link>
                                <span className="text-gray-700">|</span>
                                <a href="https://wa.me/919027475942" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-green-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                    </svg>
                                </a>
                                <a href="https://instagram.com/staykedarnath" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
