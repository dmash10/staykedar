import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "@/components/Container";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Here you would typically make an API call to your backend
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitStatus({
        type: "success",
        message: "Thank you for your message. We'll get back to you soon!"
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "There was an error sending your message. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Staykedar</title>
        <meta name="description" content="Get in touch with Staykedar - we're here to help with your travel plans and queries" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Nav />
        
        <main className="flex-grow">
          {/* Header Banner */}
          <section className="bg-gradient-primary py-16 px-4">
            <Container className="text-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                  Contact Us
                </h1>
                <p className="text-white/90 text-lg max-w-2xl mx-auto">
                  Have questions about your upcoming trip? We're here to help you plan the perfect spiritual journey.
                </p>
              </div>
            </Container>
          </section>

          <div className="py-12 bg-gray-50">
            <Container>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Information */}
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Get in Touch</h2>
                    
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="p-2 bg-primary-light/20 rounded-full mr-4">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Phone</h3>
                          <p className="text-gray-600">+91 98765 43210</p>
                          <p className="text-gray-600">+91 98765 43211</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="p-2 bg-primary-light/20 rounded-full mr-4">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Email</h3>
                          <p className="text-gray-600">support@staykedar.com</p>
                          <p className="text-gray-600">info@staykedar.com</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="p-2 bg-primary-light/20 rounded-full mr-4">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Office Address</h3>
                          <p className="text-gray-600">
                            123 Pilgrimage Plaza<br />
                            Near Kedarnath Temple Road<br />
                            Rudraprayag, Uttarakhand 246445
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="p-2 bg-primary-light/20 rounded-full mr-4">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Business Hours</h3>
                          <p className="text-gray-600">
                            Monday - Saturday: 9:00 AM - 8:00 PM<br />
                            Sunday: 10:00 AM - 6:00 PM<br />
                            Emergency Support: 24/7
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send Us a Message</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            placeholder="+91 98765 43210"
                          />
                        </div>

                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                            Subject *
                          </label>
                          <select
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          >
                            <option value="">Select a subject</option>
                            <option value="booking">Booking Inquiry</option>
                            <option value="support">Customer Support</option>
                            <option value="feedback">Feedback</option>
                            <option value="partnership">Business Partnership</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Message *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                          placeholder="How can we help you?"
                        ></textarea>
                      </div>

                      {submitStatus.type && (
                        <div
                          className={`p-4 rounded-md ${
                            submitStatus.type === "success"
                              ? "bg-green-50 text-green-800"
                              : "bg-red-50 text-red-800"
                          }`}
                        >
                          {submitStatus.message}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full md:w-auto px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors duration-300 flex items-center justify-center ${
                          isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                        }`}
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            Send Message
                            <Send className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </Container>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ContactUs; 