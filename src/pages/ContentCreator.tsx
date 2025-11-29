import { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { Upload, Instagram, Youtube, Award, Users, CheckCircle, FileCheck, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const ContentCreator = () => {
  return (
    <>
      <Helmet>
        <title>Content Creator Program | StayKedarnath</title>
        <meta name="description" content="Join our content creator program and share your Kedarnath journey. Collaborate with us to create authentic travel content and earn rewards." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Nav />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="py-16 bg-primary-deep/5 mt-16">
            <Container>
              <div className="max-w-3xl mx-auto text-center">
                <div className="icon-box w-20 h-20 mx-auto mb-6">
                  <Upload className="w-10 h-10" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Content Creator Program</h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Share your Kedarnath journey with the world and earn rewards. Join our network of travel content creators and help pilgrims plan their spiritual journey.
                </p>
                <Link to="#apply" className="btn-premium">
                  Apply Now
                </Link>
              </div>
            </Container>
          </section>
            
          {/* Benefits Section */}
          <section className="py-16 bg-white">
            <Container>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Why Join Our Program?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Collaborate with us to create authentic travel content and enjoy these exclusive benefits.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="glass-card p-8 flex flex-col items-center text-center card-hover">
                  <div className="icon-box mb-4">
                    <Instagram className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-deep mb-2">Instagram Reels</h3>
                  <p className="text-mist mb-4">Share your Kedarnath moments in short-form videos</p>
                  <div className="mt-auto">
                    <span className="text-2xl font-bold text-indigo-deep">₹20</span>
                    <span className="text-mist"> per approved reel</span>
                  </div>
                </div>
                
                <div className="glass-card p-8 flex flex-col items-center text-center card-hover">
                  <div className="icon-box mb-4">
                    <Youtube className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-deep mb-2">YouTube Vlogs</h3>
                  <p className="text-mist mb-4">Create detailed vlogs about your Kedarnath journey</p>
                  <div className="mt-auto">
                    <span className="text-2xl font-bold text-indigo-deep">₹100</span>
                    <span className="text-mist"> per approved vlog</span>
                  </div>
                </div>
              </div>
            </Container>
          </section>
          
          {/* How It Works Section */}
          <section className="py-16 bg-primary-deep/5">
            <Container>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Follow these simple steps to join our content creator program and start earning rewards.
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <div className="glass-card p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="icon-box-alt w-12 h-12">
                          <Upload className="w-6 h-6" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-deep mb-2">Submission Process</h3>
                        <p className="text-mist">Upload your reels/vlogs to Google Drive and submit the links through our portal</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="icon-box-alt w-12 h-12">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-deep mb-2">Quality Standards</h3>
                        <p className="text-mist">Content must be original, high-quality, and showcase authentic Kedarnath experiences</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="icon-box-alt w-12 h-12">
                          <FileCheck className="w-6 h-6" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-deep mb-2">Approval Process</h3>
                        <p className="text-mist">Our team reviews all submissions within 7 working days and notifies creators of approval</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="icon-box-alt w-12 h-12">
                          <Share2 className="w-6 h-6" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-deep mb-2">Content Usage</h3>
                        <p className="text-mist">Approved content may be featured on our platforms with proper creator attribution</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>
          
          {/* Apply Section */}
          <section className="py-16 bg-white" id="apply">
            <Container>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Apply to Join</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Fill out the form below to apply for our content creator program. We'll review your application and get back to you within 48 hours.
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto">
                <form className="glass-card p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-mist mb-1" htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
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
                    
                    <div>
                      <label className="block text-sm font-medium text-mist mb-1" htmlFor="content-type">Content Type</label>
                      <select
                        id="content-type"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-indigo-light focus:border-indigo-light transition-all duration-200"
                        required
                      >
                        <option value="">Select content type</option>
                        <option value="reels">Instagram Reels</option>
                        <option value="vlogs">YouTube Vlogs</option>
                        <option value="both">Both Reels & Vlogs</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-mist mb-1" htmlFor="social-links">Social Media Profiles</label>
                    <input
                      type="text"
                      id="social-links"
                      placeholder="Instagram, YouTube, or other relevant links"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-indigo-light focus:border-indigo-light transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-mist mb-1" htmlFor="message">Why do you want to join our program?</label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-1 focus:ring-indigo-light focus:border-indigo-light transition-all duration-200"
                      required
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-center">
                    <button type="submit" className="btn-primary">
                      Submit Application
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

export default ContentCreator;
