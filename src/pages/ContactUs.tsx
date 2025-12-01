import { Helmet } from "react-helmet";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "@/components/Container";
import { Mail, Phone, MapPin, MessageSquare, Search, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ContactUs = () => {
  return (
    <>
      <Helmet>
        <title>Help Center | Staykedar Support</title>
        <meta name="description" content="Get support for your Kedarnath yatra. Raise tickets, track requests, and find answers." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50/30">
        <Nav />

        <main className="flex-grow">
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-primary-deep to-primary py-20">
            <Container className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How can we help you?
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                We're here to assist you with your pilgrimage journey. Get support quickly and easily.
              </p>
            </Container>
          </section>

          {/* Main Actions */}
          <section className="py-16 -mt-12">
            <Container>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Raise Ticket Card */}
                <Card className="hover:shadow-2xl transition-all duration-300 border-t-4 border-t-primary cursor-pointer group h-full">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Submit a Request</CardTitle>
                    <CardDescription className="text-base">
                      Create a new support ticket for bookings, payments, or general inquiries.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild size="lg" className="w-full font-semibold">
                      <Link to="/support/raise">Create Ticket</Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Track Ticket Card */}
                <Card className="hover:shadow-2xl transition-all duration-300 border-t-4 border-t-secondary cursor-pointer group h-full">
                  <CardHeader className="pb-4">
                    <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Search className="w-8 h-8 text-secondary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Track Your Request</CardTitle>
                    <CardDescription className="text-base">
                      Check the status of your existing ticket using your Ticket ID.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild variant="outline" size="lg" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white font-semibold transition-all">
                      <Link to="/support/track">Track Status</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </Container>
          </section>

          {/* Contact Info Section */}
          <section className="py-16 bg-white/50">
            <Container>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Other Ways to Reach Us</h2>
                <p className="text-lg text-gray-600">We're available to help you via phone and email.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Phone Support</h3>
                  <p className="text-primary font-semibold text-lg mb-1">+91 98765 43210</p>
                  <p className="text-gray-500 text-sm">Mon-Sat, 9AM - 8PM</p>
                </div>

                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Email Us</h3>
                  <p className="text-primary font-semibold text-base mb-1">support@staykedar.com</p>
                  <p className="text-gray-500 text-sm">Response within 24 hours</p>
                </div>

                <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-primary/30 transition-all hover:shadow-lg">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Visit Us</h3>
                  <p className="text-gray-700 font-medium mb-1">Rudraprayag, Uttarakhand</p>
                  <p className="text-gray-500 text-sm">Main Office</p>
                </div>
              </div>
            </Container>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactUs;