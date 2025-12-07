import React from "react";
import { Helmet } from "react-helmet";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "@/components/Container";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Staykedar</title>
        <meta name="description" content="Privacy policy for Staykedar services - learn how we collect, use, and protect your data" />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Nav />

        <main className="flex-grow">
          {/* Header Banner */}
          <section className="bg-gradient-primary py-16 px-4">
            <Container className="text-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                  Privacy Policy
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
                    Staykedar ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains
                    how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy,
                    please do not access the site.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
                  <p className="text-gray-600 mb-4">
                    We collect information that you provide directly to us when you:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-4 space-y-2">
                    <li>Register for an account</li>
                    <li>Book accommodations or travel services</li>
                    <li>Subscribe to our newsletter</li>
                    <li>Contact our customer service</li>
                    <li>Participate in surveys or promotions</li>
                  </ul>
                  <p className="text-gray-600 mb-4">
                    This information may include:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-4 space-y-2">
                    <li>Personal identifiers (name, email address, phone number)</li>
                    <li>Payment information</li>
                    <li>Travel preferences and requirements</li>
                    <li>Demographic information</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
                  <p className="text-gray-600 mb-4">
                    We may use the information we collect for various purposes, including to:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-4 space-y-2">
                    <li>Process and manage your bookings</li>
                    <li>Provide customer support</li>
                    <li>Send administrative information</li>
                    <li>Send marketing communications (with your consent)</li>
                    <li>Improve our services and website</li>
                    <li>Conduct research and analysis</li>
                    <li>Prevent fraudulent transactions</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Cookies and Tracking Technologies</h2>
                  <p className="text-gray-600 mb-4">
                    We use cookies and similar tracking technologies to track activity on our website and
                    store certain information. These technologies help us deliver a better and more personalized service.
                  </p>
                  <p className="text-gray-600 mb-4">
                    You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                    However, if you do not accept cookies, you may not be able to use some portions of our website.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Third-Party Disclosure</h2>
                  <p className="text-gray-600 mb-4">
                    We may share your information with:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-4 space-y-2">
                    <li>Accommodation providers and travel service providers to fulfill your bookings</li>
                    <li>Payment processors to process transactions</li>
                    <li>Service providers who assist in our operations</li>
                    <li>Legal authorities when required by law</li>
                  </ul>
                  <p className="text-gray-600 mb-4">
                    We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties
                    except as described in this policy.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Data Security</h2>
                  <p className="text-gray-600 mb-4">
                    We implement appropriate technical and organizational measures to maintain the security of your personal data.
                    However, please note that no method of transmission over the internet or electronic storage is 100% secure.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Your Data Protection Rights</h2>
                  <p className="text-gray-600 mb-4">
                    Depending on your location, you may have the following rights:
                  </p>
                  <ul className="list-disc pl-8 text-gray-600 mb-4 space-y-2">
                    <li>Access to your personal data</li>
                    <li>Correction of inaccurate personal data</li>
                    <li>Deletion of your personal data</li>
                    <li>Restriction of processing of your personal data</li>
                    <li>Objection to processing of your personal data</li>
                    <li>Data portability</li>
                  </ul>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Children's Privacy</h2>
                  <p className="text-gray-600 mb-4">
                    Our services are not intended for individuals under the age of 18. We do not knowingly collect
                    personal information from children under 18. If we learn we have collected personal information
                    from a child under 18, we will delete that information.
                  </p>
                </section>

                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Changes to This Privacy Policy</h2>
                  <p className="text-gray-600 mb-4">
                    We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                    the new Privacy Policy on this page and updating the "Last Updated" date at the top.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">10. Contact Us</h2>
                  <p className="text-gray-600 mb-4">
                    If you have any questions about this Privacy Policy, please contact us at:
                  </p>
                  <p className="text-gray-600">
                    Email: privacy@staykedar.com<br />
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

export default PrivacyPolicy; 