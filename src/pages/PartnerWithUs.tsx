import { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { TrendingUp, HeartHandshake, UsersRound, ChevronRight, BarChart3, Headphones, Megaphone, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

// Custom icon since HandshakeIcon doesn't exist in lucide-react
const CustomHandshakeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 11l3.293-3.293a1 1 0 0 0 0-1.414L18 4a1 1 0 0 0-1.414 0L13 7.586" />
    <path d="M11 13l-8 8h3" />
    <path d="M19.5 5.5L22 8" />
    <path d="M9 11H5a1 1 0 0 0-.707 1.707l3 3C7.895 16.309 9 16 9 16" />
    <path d="M13 13l6 6h-3" />
    <path d="M9.1 7.1L11 5l-3-3h3l6 6" />
  </svg>
);

const PartnerWithUs = () => {
  return (
    <>
      <Helmet>
        <title>Partner With Us | StayKedarnath</title>
        <meta name="description" content="Join our partner network for Kedarnath accommodations and services. List your property, offer transportation, or provide guide services." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Nav />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="py-16 bg-primary-deep/5 mt-16">
            <Container>
              <div className="max-w-3xl mx-auto text-center">
                <div className="icon-box w-20 h-20 mx-auto mb-6">
                  <CustomHandshakeIcon />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-6 animate-fade-in">
                  Partner With KedarnathStays
                </h1>
                
                <p className="text-lg mb-8 text-white/80 animate-fade-in animate-delay-100">
                  Grow your reach and connect with pilgrims planning their Kedarnath journey
                </p>
                
                <Link to="#contact-form" className="btn-secondary animate-fade-in animate-delay-200">
                  Join Our Network
                </Link>
              </div>
            </Container>
          </section>
          
          {/* Why Partner Section */}
          <section className="py-16 bg-white">
            <Container>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-indigo-deep mb-4">
                  Why Partner With KedarnathStays?
                </h2>
                <p className="text-mist max-w-2xl mx-auto">
                  Join our growing network of partners and elevate your business in the spiritual tourism sector
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="icon-box w-14 h-14">
                      <UsersRound className="w-7 h-7" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-indigo-deep mb-2">Reach a Targeted Audience</h3>
                    <p className="text-mist">Connect with thousands of pilgrims planning their Kedarnath Yatra, with focused targeting for your specific services.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="icon-box w-14 h-14">
                      <TrendingUp className="w-7 h-7" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-indigo-deep mb-2">Boost Your Bookings</h3>
                    <p className="text-mist">Experience increased bookings through our streamlined platform, designed to convert visitors into customers efficiently.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="icon-box w-14 h-14">
                      <HeartHandshake className="w-7 h-7" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-indigo-deep mb-2">Trusted Platform</h3>
                    <p className="text-mist">Associate with our respected brand that pilgrims trust for reliable information and quality services.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="icon-box w-14 h-14">
                      <BarChart3 className="w-7 h-7" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-indigo-deep mb-2">Growth Analytics</h3>
                    <p className="text-mist">Gain insights from our detailed analytics dashboard to understand your performance and optimize your offerings.</p>
                  </div>
                </div>
              </div>
            </Container>
          </section>
          
          {/* Partner Benefits Section */}
          <section className="py-16 bg-secondary/50">
            <Container>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-indigo-deep mb-4">
                  Key Benefits of Partnering With Us
                </h2>
                <p className="text-mist max-w-2xl mx-auto">
                  We provide comprehensive support to ensure mutual success in our partnership
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 text-center card-hover">
                  <div className="icon-box mx-auto mb-4">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-deep mb-2">Dedicated Partner Support</h3>
                  <p className="text-mist">Personalized assistance from our partner relationship team to address your needs</p>
                </div>
                
                <div className="glass-card p-6 text-center card-hover">
                  <div className="icon-box mx-auto mb-4">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-deep mb-2">Advanced Marketing</h3>
                  <p className="text-mist">Digital marketing support including featured placements and social media promotion</p>
                </div>
                
                <div className="glass-card p-6 text-center card-hover">
                  <div className="icon-box mx-auto mb-4">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-deep mb-2">Easy Onboarding</h3>
                  <p className="text-mist">Simple integration process with step-by-step guidance from our technical team</p>
                </div>
                
                <div className="glass-card p-6 text-center card-hover">
                  <div className="icon-box mx-auto mb-4">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-deep mb-2">Performance Analytics</h3>
                  <p className="text-mist">Detailed insights and reports to track your performance and growth</p>
                </div>
              </div>
            </Container>
          </section>
          
          {/* Partnership Types Section */}
          <section className="py-16 bg-primary-deep/5">
            <Container>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-indigo-deep mb-4">
                  Partnership Opportunities
                </h2>
                <p className="text-mist max-w-2xl mx-auto">
                  Explore different ways to partner with KedarnathStays based on your business needs
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="glass-card p-8 flex flex-col h-full card-hover">
                  <div className="icon-box mb-6">
                    <svg 
                      className="w-8 h-8" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M19 9V6a2 2 0 00-2-2H7a2 2 0 00-2 2v3" />
                      <path d="M12 2v7" />
                      <path d="M11 9h2" />
                      <path d="M5 9h14v11a2 2 0 01-2 2H7a2 2 0 01-2-2V9z" />
                      <path d="M8 16v2" />
                      <path d="M16 16v2" />
                      <path d="M12 12v6" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-indigo-deep mb-3">Accommodation Owners</h3>
                  
                  <ul className="text-mist space-y-3 mb-6 flex-grow">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-indigo-deep flex-shrink-0 mt-0.5" />
                      <span>List your hotels, guesthouses, or dharamshalas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-indigo-deep flex-shrink-0 mt-0.5" />
                      <span>Manage bookings through our dashboard</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-indigo-deep flex-shrink-0 mt-0.5" />
                      <span>Set your own pricing and availability</span>
                    </li>
                  </ul>
                  
                  <Link to="#contact-form" className="btn-secondary w-full mt-auto">
                    List Your Property
                  </Link>
                </div>
                
                <div className="glass-card p-8 flex flex-col h-full card-hover">
                  <div className="icon-box mb-6">
                    <svg 
                      className="w-8 h-8" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M10.5 14.5c3.5-1 5-2.5 8.5-2.5a9 9 0 0 1 1 0" />
                      <path d="M10.5 9.5c3.5-1 5-2.5 8.5-2.5a9 9 0 0 1 1 0" />
                      <path d="M3.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
                      <path d="M3.5 19a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
                      <path d="M21 13V4" />
                      <path d="M12 20l-8-8 8-8" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-indigo-deep mb-3">Affiliate Program</h3>
                  
                  <ul className="text-mist space-y-3 mb-6 flex-grow">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-indigo-deep flex-shrink-0 mt-0.5" />
                      <span>Earn commission on referral bookings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-indigo-deep flex-shrink-0 mt-0.5" />
                      <span>Use our marketing materials and widgets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-indigo-deep flex-shrink-0 mt-0.5" />
                      <span>Transparent tracking and reporting</span>
                    </li>
                  </ul>
                  
                  <Link to="#contact-form" className="btn-secondary w-full mt-auto">
                    Become an Affiliate
                  </Link>
                </div>
                
                <div className="glass-card p-8 flex flex-col h-full card-hover">
                  <div className="icon-box mb-6">
                    <svg 
                      className="w-8 h-8" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M2 3h20" />
                      <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
                      <path d="m7 21 5-5 5 5" />
                    </svg>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-indigo-deep mb-3">Service Providers</h3>
                  
                  <ul className="text-mist space-y-3 mb-6 flex-grow">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-indigo-deep flex-shrink-0 mt-0.5" />
                      <span>List your helicopter, guide, or pooja services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-indigo-deep flex-shrink-0 mt-0.5" />
                      <span>Integrate with our booking platform</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-5 h-5 text-indigo-deep flex-shrink-0 mt-0.5" />
                      <span>Reach pilgrims planning their yatra</span>
                    </li>
                  </ul>
                  
                  <Link to="#contact-form" className="btn-secondary w-full mt-auto">
                    Register Your Service
                  </Link>
                </div>
              </div>
            </Container>
          </section>
          
          {/* Contact Form Section */}
          <section className="py-16 bg-secondary/50" id="contact-form">
            <Container>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-indigo-deep mb-4">
                  Ready to Partner? Get in Touch
                </h2>
                <p className="text-mist max-w-2xl mx-auto">
                  Fill out the form below and our partnership team will contact you within 48 hours
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <form className="glass-card p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-mist mb-1" htmlFor="business-name">Business Name</label>
                      <input
                        type="text"
                        id="business-name"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-indigo-light focus:border-indigo-light transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-mist mb-1" htmlFor="contact-person">Contact Person</label>
                      <input
                        type="text"
                        id="contact-person"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-indigo-light focus:border-indigo-light transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-mist mb-1" htmlFor="email">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-indigo-light focus:border-indigo-light transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-mist mb-1" htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-indigo-light focus:border-indigo-light transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-mist mb-1" htmlFor="partnership-type">Partnership Type</label>
                    <select
                      id="partnership-type"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-indigo-light focus:border-indigo-light transition-all duration-200"
                      required
                    >
                      <option value="">Select partnership type</option>
                      <option value="accommodation">Accommodation Owner</option>
                      <option value="affiliate">Affiliate Program</option>
                      <option value="service-provider">Service Provider</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-mist mb-1" htmlFor="message">Tell us about your business</label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-indigo-light focus:border-indigo-light transition-all duration-200"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-center">
                    <button type="submit" className="btn-primary">
                      Submit Partner Request
                    </button>
                  </div>
                </form>
              </div>
            </Container>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default PartnerWithUs;
