import React from "react";
import { Helmet } from "react-helmet";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "@/components/Container";
import { ArrowLeftRight, Calendar, Wallet, AlertCircle } from "lucide-react";

const CancellationPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Cancellation & Refund Policy | Staykedar</title>
        <meta name="description" content="Cancellation and refund policy for Staykedar - understand our refund process, cancellation charges, and timelines" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Nav />
        
        <main className="flex-grow">
          {/* Header Banner */}
          <section className="bg-gradient-primary py-16 px-4">
            <Container className="text-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                  Cancellation & Refund Policy
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
                      <ArrowLeftRight className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Introduction</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    We understand that travel plans may change. This policy outlines our cancellation and refund 
                    procedures for all services booked through Staykedar.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Please note that while we strive to be flexible, many of our services involve third-party providers 
                    with their own cancellation policies. Our refund policy reflects these constraints while offering 
                    the most favorable terms possible to our customers.
                  </p>
                </section>

                <section className="mb-10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-primary-light/20 rounded-full mr-4">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Cancellation Timelines & Charges</h2>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Accommodation & Package Tours</h3>
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full border border-gray-200 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2 px-4 border-b text-left">Cancellation Timeline</th>
                          <th className="py-2 px-4 border-b text-left">Cancellation Charge</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 px-4 border-b">More than 30 days before check-in</td>
                          <td className="py-2 px-4 border-b">10% of total booking amount</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">15-30 days before check-in</td>
                          <td className="py-2 px-4 border-b">25% of total booking amount</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">7-14 days before check-in</td>
                          <td className="py-2 px-4 border-b">50% of total booking amount</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">3-6 days before check-in</td>
                          <td className="py-2 px-4 border-b">75% of total booking amount</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">Less than 72 hours before check-in</td>
                          <td className="py-2 px-4 border-b">100% of total booking amount (No Refund)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Activities & Guided Tours</h3>
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full border border-gray-200 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2 px-4 border-b text-left">Cancellation Timeline</th>
                          <th className="py-2 px-4 border-b text-left">Cancellation Charge</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 px-4 border-b">More than 7 days before activity</td>
                          <td className="py-2 px-4 border-b">10% of activity price</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">3-7 days before activity</td>
                          <td className="py-2 px-4 border-b">50% of activity price</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">Less than 72 hours before activity</td>
                          <td className="py-2 px-4 border-b">100% of activity price (No Refund)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Pilgrimage Packages</h3>
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full border border-gray-200 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-2 px-4 border-b text-left">Cancellation Timeline</th>
                          <th className="py-2 px-4 border-b text-left">Cancellation Charge</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-2 px-4 border-b">More than 45 days before departure</td>
                          <td className="py-2 px-4 border-b">Registration fee (non-refundable) + 5% of package price</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">30-45 days before departure</td>
                          <td className="py-2 px-4 border-b">Registration fee + 25% of package price</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">15-29 days before departure</td>
                          <td className="py-2 px-4 border-b">Registration fee + 50% of package price</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">7-14 days before departure</td>
                          <td className="py-2 px-4 border-b">Registration fee + 75% of package price</td>
                        </tr>
                        <tr>
                          <td className="py-2 px-4 border-b">Less than 7 days before departure</td>
                          <td className="py-2 px-4 border-b">100% of package price (No Refund)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> For special event periods and peak season (May-June for Kedarnath Yatra), 
                      stricter cancellation policies may apply. These will be clearly communicated at the time of booking.
                    </p>
                  </div>
                </section>

                <section className="mb-10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-primary-light/20 rounded-full mr-4">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Refund Process</h2>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Refund Timeline</h3>
                  <p className="text-gray-600 mb-4">
                    Once a cancellation request is approved, refunds will be processed as follows:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-6 space-y-2">
                    <li>Credit/Debit Card Payments: 5-7 business days</li>
                    <li>Net Banking: 3-5 business days</li>
                    <li>UPI Payments: 2-4 business days</li>
                    <li>International Payments: 7-14 business days, depending on the payment processor and your bank</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Refund Methods</h3>
                  <p className="text-gray-600 mb-4">
                    Refunds will be processed to the original payment method used for the booking. In case the original 
                    payment method is no longer valid, we will contact you to arrange an alternative refund method.
                  </p>
                </section>

                <section className="mb-10">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-primary-light/20 rounded-full mr-4">
                      <AlertCircle className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Special Circumstances</h2>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Force Majeure</h3>
                  <p className="text-gray-600 mb-4">
                    In the event of unforeseen circumstances beyond our control (natural disasters, government restrictions, 
                    civil unrest), we will:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-6 space-y-2">
                    <li>Provide free rescheduling options where possible</li>
                    <li>Issue travel credit for future bookings if rescheduling is not feasible</li>
                    <li>Process refunds as per the situation, minimizing cancellation charges where possible</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium text-gray-700 mb-3">Medical Emergencies</h3>
                  <p className="text-gray-600 mb-4">
                    For cancellations due to documented medical emergencies, we offer more favorable terms:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-6 space-y-2">
                    <li>Valid medical documentation required</li>
                    <li>Minimum 10% service fee applies</li>
                    <li>Balance refunded as per the timeline above or travel credit issued</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Request a Cancellation</h2>
                  <p className="text-gray-600 mb-4">
                    To initiate a cancellation:
                  </p>
                  <ol className="list-decimal pl-8 text-gray-600 mb-6 space-y-2">
                    <li>Log into your Staykedar account and navigate to "My Bookings"</li>
                    <li>Select the booking you wish to cancel and click "Cancel Booking"</li>
                    <li>Alternatively, email us at support@staykedar.com with your booking reference</li>
                    <li>For urgent assistance, call our customer service: +91 98765 43210</li>
                  </ol>
                  <p className="text-gray-600 mb-4">
                    Please note that cancellation requests are only considered valid once you receive a confirmation email 
                    from our team. The date and time of this email will be used to determine applicable cancellation charges.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Us</h2>
                  <p className="text-gray-600 mb-4">
                    For any questions or clarification regarding our cancellation and refund policy:
                  </p>
                  <p className="text-gray-600">
                    Email: support@staykedar.com<br />
                    Phone: +91 98765 43210<br />
                    Hours: 9 AM - 8 PM IST, 7 days a week
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

export default CancellationPolicy; 