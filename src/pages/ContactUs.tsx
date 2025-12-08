import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "@/components/Container";
import { Mail, MessageCircle, MapPin, MessageSquare, Search, Clock, Send, User, Phone, FileText, AlertCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { supabase } from "@/integrations/supabase/client";

const ContactUs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bookingId: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Generate Ticket Number (TKT-YYYYMMDD-XXXX)
      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const ticketNumber = `TKT-${dateStr}-${random}`;

      // 2. Determine Priority (Simple logic)
      const priority = formData.bookingId ? 'medium' : 'low';

      // 3. Get User (if logged in)
      const { data: { user } } = await supabase.auth.getUser();

      // 4. Create Ticket
      const { error } = await supabase
        .from("support_tickets")
        .insert({
          ticket_number: ticketNumber,
          user_id: user?.id || null, // Explicitly handle user_id
          guest_name: formData.name,
          guest_email: formData.email,
          guest_phone: formData.phone || null,
          category: "General Inquiry",
          subject: "Contact Form Message",
          description: `Phone: ${formData.phone || 'N/A'}\n\nMessage:\n${formData.message}`,
          priority: priority,
          status: "open",
          metadata: formData.bookingId ? { booking_reference: formData.bookingId } : {},
        });

      if (error) throw error;

      // 4. Log Activity (Optional but good practice if table exists, skipping to be safe as user is guest)

      toast({
        title: "Message Sent Successfully!",
        description: `Your Ticket Number is ${ticketNumber}. We'll get back to you shortly.`,
      });

      setFormData({ name: "", email: "", phone: "", bookingId: "", message: "" });

    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error Sending Message",
        description: "Please try again or use WhatsApp/Email directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | StayKedarnath</title>
        <meta name="description" content="Contact StayKedarnath for booking help, property queries, or travel assistance. Email, WhatsApp, or submit a ticket." />
        <link rel="canonical" href="https://staykedarnath.in/contact" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Nav />

        {/* Compact Hero - Matching Navbar Color */}
        <div className="bg-[#003580] py-6 px-4">
          <Container>
            <div className="max-w-2xl">
              <h1 className="text-xl md:text-2xl font-bold text-white mb-1">Contact StayKedarnath</h1>
              <p className="text-blue-100 text-sm">
                Questions about bookings, properties, or travel conditions? We're locals who can help.
              </p>
            </div>
          </Container>
        </div>

        {/* Main Content */}
        <main className="flex-grow">
          <Container>
            <div className="max-w-2xl mx-auto py-6">

              {/* Intro Text */}
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                If you have a question about a booking, need clarification about a property, or want help understanding the local travel conditions, we're here to assist. Our team lives and works in this region, so you'll always get information that is practical and based on real conditions.
              </p>

              {/* Quick Actions - Compact */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => navigate('/support/raise')}
                  className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3 hover:border-[#003580] hover:shadow-sm transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#003580]/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-[#003580]" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">Raise Ticket</span>
                    <span className="text-[10px] text-gray-500">For issues & queries</span>
                  </div>
                </button>
                <button
                  onClick={() => navigate('/support/track')}
                  className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-3 hover:border-green-500 hover:shadow-sm transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Search className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900 block">Track Status</span>
                    <span className="text-[10px] text-gray-500">Check your ticket</span>
                  </div>
                </button>
              </div>

              {/* Customer Support Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Customer Support</h2>

                <div className="space-y-2">
                  {/* Emails */}
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-[#003580]" />
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">General:</span>
                      <a href="mailto:info@staykedarnath.in" className="text-sm text-[#003580] hover:underline ml-1">info@staykedarnath.in</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-[#003580]" />
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">Support:</span>
                      <a href="mailto:support@staykedarnath.in" className="text-sm text-[#003580] hover:underline ml-1">support@staykedarnath.in</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <Mail className="w-4 h-4 text-[#003580]" />
                    <div className="flex-1">
                      <span className="text-xs text-gray-500">Bookings:</span>
                      <a href="mailto:bookings@staykedarnath.in" className="text-sm text-[#003580] hover:underline ml-1">bookings@staykedarnath.in</a>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/919027475942"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Chat on WhatsApp</span>
                  </a>
                </div>

                {/* Response Info */}
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span><strong>Support Hours:</strong> 9:00 AM – 12:00 PM (Uttarakhand Time)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span><strong>Response Time:</strong> Within 2–4 business hours</span>
                  </div>
                  <p className="text-gray-600 mt-2">For check-in issues or urgent on-ground concerns, messages are prioritized.</p>
                </div>
              </div>

              {/* Business Info */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Business & Legal Information</h2>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>StayKedarnath.in</strong> is owned and operated by:
                </p>
                <p className="text-sm text-gray-900 font-medium mb-3">Ashutosh Singh (Proprietor)</p>

                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Location (Operational Base):</p>
                    <p>New Hotel Mahadev, Kedarnath Rd,<br />
                      Byung gard, Guptkashi, Semkwerala,<br />
                      Uttarakhand 246471</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                  <p className="text-xs text-amber-800">
                    <strong>Tip:</strong> If you're contacting us about a payment, cancellation, refund, or listing issue, please include your booking details so we can respond quickly.
                  </p>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Contact Form</h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Name *</label>
                      <Input
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-9 text-sm border-gray-300 focus:border-[#003580] focus:ring-0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Email *</label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-9 text-sm border-gray-300 focus:border-[#003580] focus:ring-0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Phone (optional)</label>
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-9 text-sm border-gray-300 focus:border-[#003580] focus:ring-0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Booking ID (if applicable)</label>
                      <Input
                        placeholder="e.g., BK-12345"
                        value={formData.bookingId}
                        onChange={(e) => setFormData({ ...formData, bookingId: e.target.value })}
                        className="h-9 text-sm border-gray-300 focus:border-[#003580] focus:ring-0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Your Message *</label>
                    <Textarea
                      placeholder="How can we help you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="min-h-[80px] text-sm border-gray-300 focus:border-[#003580] focus:ring-0 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#003580] hover:bg-[#002855] text-white h-10"
                  >
                    {isSubmitting ? "Sending..." : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Before You Reach Out */}
              <div className="bg-blue-50 rounded-lg border border-blue-100 p-4 mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Before You Reach Out
                </h2>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>For <strong>room availability</strong>, remember that final confirmation comes from the property.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>For <strong>last-minute bookings</strong>, response times may vary due to network issues in the hills.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>If a property is <strong>not responding at check-in</strong>, contact us immediately so we can intervene.</span>
                  </li>
                </ul>
              </div>

              {/* Where We Operate */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-2">Where We Operate</h2>
                <p className="text-xs text-gray-600 mb-3">
                  We do not maintain a walk-in office. Our team works on-ground across:
                </p>
                <div className="flex flex-wrap gap-2">
                  {["Guptkashi", "Phata", "Sitapur", "Sonprayag", "Gaurikund", "Kedarnath"].map((place) => (
                    <span key={place} className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded-md">
                      {place}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  This structure allows us to assist travelers more effectively during peak seasons.
                </p>
              </div>

              {/* Quick Links */}
              <div className="bg-gray-100 rounded-lg p-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Looking for something else?</h3>
                <div className="flex flex-wrap gap-2">
                  <Link to="/help" className="text-xs text-[#003580] hover:underline flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" /> Help Center
                  </Link>
                  <Link to="/about" className="text-xs text-[#003580] hover:underline flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" /> About Us
                  </Link>
                  <Link to="/cancellation" className="text-xs text-[#003580] hover:underline flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" /> Refund Policy
                  </Link>
                  <Link to="/terms" className="text-xs text-[#003580] hover:underline flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" /> Terms
                  </Link>
                  <Link to="/disclaimer" className="text-xs text-[#003580] hover:underline flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" /> Disclaimer
                  </Link>
                </div>
              </div>

            </div>
          </Container>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactUs;