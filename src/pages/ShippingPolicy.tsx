import React from "react";
import { Helmet } from "react-helmet";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "@/components/Container";
import { Truck, Clock, ShieldCheck } from "lucide-react";

const ShippingPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Shipping & Delivery Policy | Staykedar</title>
        <meta name="description" content="Shipping and delivery policy for Staykedar - learn about our policies for travel bookings, confirmations, and e-tickets" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Nav />

        <main className="flex-grow">
          {/* Header Banner */}
          <section className="bg-gradient-primary py-16 px-4">
            <Container className="text-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                  Shipping & Delivery Policy
                </h1>
              </div>
            </Container>
          </section>

          <div className="py-12 bg-gray-50">
            <Container>
              <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
                <p className="text-gray-600 mb-8">Last Updated: June 1, 2023</p>

                <section className="mb-10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-primary-light/20 rounded-full mr-4">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Introduction</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    As a travel service provider, Staykedar primarily delivers digital confirmations, e-tickets, and
                    booking vouchers rather than physical goods. This policy outlines how we deliver these services to you.
                  </p>
                </section>

                <section className="mb-10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-primary-light/20 rounded-full mr-4">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Delivery Timeframes</h2>
                  </div>

                  <h3 className="text-lg font-medium text-gray-700 mb-3">Booking Confirmations</h3>
                  <p className="text-gray-600 mb-4">
                    Upon successful booking and payment, you will receive an immediate email confirmation containing your
                    booking details. In some cases, depending on the service provider, confirmations may take up to 24 hours.
                  </p>

                  <h3 className="text-lg font-medium text-gray-700 mb-3">E-Tickets & Vouchers</h3>
                  <p className="text-gray-600 mb-4">
                    E-tickets and accommodation vouchers will be delivered to your registered email address:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-6 space-y-2">
                    <li>Package bookings: Within 24-48 hours after payment confirmation</li>
                    <li>Accommodation-only bookings: Within 24 hours after payment confirmation</li>
                    <li>Activity bookings: Within 12 hours after payment confirmation</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-700 mb-3">Emergency Processing</h3>
                  <p className="text-gray-600 mb-4">
                    For urgent bookings made within 48 hours of the travel date, we prioritize processing and will
                    expedite the delivery of your confirmation and relevant documents.
                  </p>
                </section>

                <section className="mb-10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-primary-light/20 rounded-full mr-4">
                      <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Delivery Methods</h2>
                  </div>

                  <h3 className="text-lg font-medium text-gray-700 mb-3">Digital Delivery</h3>
                  <p className="text-gray-600 mb-4">
                    All confirmations, e-tickets, and vouchers are delivered electronically via:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-6 space-y-2">
                    <li>Email to your registered email address</li>
                    <li>Available for download in your account dashboard (for registered users)</li>
                    <li>SMS notifications with booking confirmation details (when mobile number is provided)</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-700 mb-3">Physical Documents</h3>
                  <p className="text-gray-600 mb-4">
                    In select cases where physical documentation is required by service providers (such as certain permits
                    or special passes), these will be available for collection at the designated location specified in your
                    booking confirmation.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Issues & Resolutions</h2>

                  <h3 className="text-lg font-medium text-gray-700 mb-3">Non-Receipt of Confirmation</h3>
                  <p className="text-gray-600 mb-6">
                    If you have not received your booking confirmation within the specified timeframes:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-6 space-y-2">
                    <li>Check your spam/junk folder</li>
                    <li>Verify the email address provided during booking</li>
                    <li>Contact our customer support team at support@staykedar.com or +91 98765 43210</li>
                  </ul>

                  <h3 className="text-lg font-medium text-gray-700 mb-3">Incorrect Information</h3>
                  <p className="text-gray-600 mb-4">
                    If there are errors in your booking confirmation or e-tickets, please contact us immediately.
                    Corrections will be processed on priority and updated documents will be sent within 4-6 hours.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Special Considerations</h2>

                  <h3 className="text-lg font-medium text-gray-700 mb-3">Pilgrim Registration Documents</h3>
                  <p className="text-gray-600 mb-4">
                    For religious pilgrimages requiring special permits (such as Kedarnath Yatra), registration confirmation
                    and e-permits will be delivered as per government regulations, typically 3-5 days before the journey date.
                  </p>

                  <h3 className="text-lg font-medium text-gray-700 mb-3">Force Majeure</h3>
                  <p className="text-gray-600 mb-4">
                    In cases of circumstances beyond our control (natural disasters, government restrictions, technical
                    failures), delivery timeframes may be affected. We will communicate any delays promptly and work to
                    minimize disruption to your travel plans.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                  <p className="text-gray-600 mb-4">
                    For any questions or concerns regarding our delivery policy or to report issues with receiving your documents:
                  </p>
                  <p className="text-gray-600">
                    Email: support@staykedar.com<br />
                    Phone: +91 98765 43210<br />
                    Hours: 24/7 for urgent booking assistance
                  </p>
                </section>
              </div>
            </Container>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ShippingPolicy; 