import React from "react";
import { Helmet } from "react-helmet";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "@/components/Container";

const TermsAndConditions = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | Staykedar</title>
        <meta name="description" content="Terms and conditions for using Staykedar's services" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Nav />

        <main className="flex-grow">
          {/* Header Banner */}
          <section className="bg-gradient-primary py-16 px-4">
            <Container className="text-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                  Terms and Conditions
                </h1>
              </div>
            </Container>
          </section>

          <div className="py-12 bg-gray-50">
            <Container>
              <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
                <p className="text-gray-600 mb-8">Last Updated: June 1, 2023</p>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
                  <p className="text-gray-600 mb-4">
                    Welcome to Staykedar. These Terms and Conditions govern your use of our website,
                    services, and products. By accessing or using our services, you agree to be bound
                    by these Terms.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Definitions</h2>
                  <p className="text-gray-600 mb-4">
                    "Company", "We", "Us", or "Our" refers to Staykedar.
                  </p>
                  <p className="text-gray-600 mb-4">
                    "Services" refers to the booking, travel arrangements, and other services provided by Staykedar.
                  </p>
                  <p className="text-gray-600 mb-4">
                    "User", "You", or "Your" refers to individuals accessing or using our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">3. Account Registration</h2>
                  <p className="text-gray-600 mb-4">
                    To use certain features of our Service, you may be required to register for an account.
                    You agree to provide accurate information during the registration process and to keep
                    your account details updated.
                  </p>
                  <p className="text-gray-600 mb-4">
                    You are responsible for maintaining the confidentiality of your account credentials
                    and for all activities that occur under your account.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Booking and Payments</h2>
                  <p className="text-gray-600 mb-4">
                    All bookings are subject to availability and confirmation. Payment terms vary
                    depending on the type of service booked.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Prices displayed on our website are subject to change without notice. We reserve
                    the right to modify or discontinue services without liability.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Cancellations and Refunds</h2>
                  <p className="text-gray-600 mb-4">
                    Cancellation and refund policies vary based on the type of service booked. Please
                    refer to our Cancellation and Refunds Policy for detailed information.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">6. User Conduct</h2>
                  <p className="text-gray-600 mb-4">
                    You agree not to use our services for any unlawful purpose or in any way that could
                    damage, disable, or impair our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Intellectual Property</h2>
                  <p className="text-gray-600 mb-4">
                    All content on our website, including text, graphics, logos, and software, is the
                    property of Staykedar and is protected by copyright and other intellectual property laws.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Limitation of Liability</h2>
                  <p className="text-gray-600 mb-4">
                    To the maximum extent permitted by law, Staykedar shall not be liable for any indirect,
                    incidental, special, consequential, or punitive damages arising from or related to your use of our services.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Governing Law</h2>
                  <p className="text-gray-600 mb-4">
                    These Terms shall be governed by and construed in accordance with the laws of India,
                    without regard to its conflict of law provisions.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">10. Changes to Terms</h2>
                  <p className="text-gray-600 mb-4">
                    We reserve the right to modify these Terms at any time. Changes will be effective
                    immediately upon posting on our website. Your continued use of our services following
                    any changes indicates your acceptance of the modified Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">11. Contact Us</h2>
                  <p className="text-gray-600 mb-4">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <p className="text-gray-600">
                    Email: support@staykedar.com<br />
                    Phone: +91 98765 43210
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

export default TermsAndConditions; 