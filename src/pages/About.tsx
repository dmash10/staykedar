import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Users, Award, Heart, MapPin, Calendar, Clock } from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import Container from "../components/Container";
import { Link } from "react-router-dom";
import { CheckCircle, Shield, Compass, ChevronRight, Building, Landmark } from "lucide-react";

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | KedarnathStays</title>
        <meta name="description" content="Learn about KedarnathStays, our mission, and why we're dedicated to making your spiritual journey to Kedarnath seamless and memorable." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Nav />
        
        <main className="flex-grow">
          {/* Header Banner */}
          <section className="bg-gradient-primary py-20 px-4">
            <Container className="text-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                  About KedarnathStays
                </h1>
                <div className="flex items-center justify-center text-white/80">
                  <Link to="/" className="hover:text-white transition-colors duration-300 flex items-center">
                    Home
                  </Link>
                  <ChevronRight className="mx-2 w-4 h-4" />
                  <span>About Us</span>
                </div>
              </div>
            </Container>
          </section>

          {/* Our Mission */}
          <section className="py-20">
            <Container>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-indigo-deep text-center mb-12 flex items-center justify-center">
                <Heart className="w-8 h-8 mr-3 text-indigo-deep" />
                Our Mission: Serving Your Spiritual Journey
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Landmark className="w-6 h-6" />,  // Changed from Temple
                    title: "Authenticity & Respect",
                    description: "We honor the spiritual significance of the Kedarnath Yatra and ensure all our services reflect the sanctity of this journey."
                  },
                  {
                    icon: <Shield className="w-6 h-6" />,
                    title: "Seamless & Trustworthy Service",
                    description: "We're committed to removing obstacles from your pilgrimage with reliable, transparent services you can depend on."
                  },
                  {
                    icon: <Users className="w-6 h-6" />,
                    title: "Connecting Pilgrims & Serenity",
                    description: "We bridge the gap between modern travelers and the ancient spiritual experience of Kedarnath."
                  }
                ].map((item, index) => (
                  <div 
                    key={index} 
                    className="glass-card p-6 flex flex-col items-center text-center animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="icon-box mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-indigo-deep">
                      {item.title}
                    </h3>
                    <p className="text-mist">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </Container>
          </section>

          {/* Our Story */}
          <section className="py-20 bg-secondary/50">
            <Container>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-indigo-deep text-center mb-12 flex items-center justify-center">
                <Compass className="w-8 h-8 mr-3 text-indigo-deep" />
                Our Journey: Inspired by Devotion
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="animate-fade-in order-2 lg:order-1">
                  <p className="text-mist mb-6">
                    KedarnathStays was born from a profound personal experience during a pilgrimage to Kedarnath in 2018. Our founder, overwhelmed by the beauty of the shrine but challenged by the logistics of the journey, envisioned a service that would allow pilgrims to focus on their spiritual connection rather than travel complications.
                  </p>
                  
                  <p className="text-mist mb-6">
                    Starting as a simple guide sharing recommendations and insights, we've grown into a comprehensive platform serving thousands of pilgrims annually. Our journey has been guided by the principle that a spiritual pilgrimage deserves support that honors its sacred purpose.
                  </p>
                  
                  <p className="text-mist">
                    Today, we continue to expand our services while remaining true to our original vision: making the divine experience of Kedarnath accessible to all who seek its blessings.
                  </p>
                </div>
                
                <div className="flex justify-center order-1 lg:order-2 animate-fade-in">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-full animate-pulse-slow"></div>
                    <svg 
                      className="w-72 h-72 text-indigo-deep animate-float" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M14 9V7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8h-4" />
                      <path d="M14 7V4H6a2 2 0 0 0-2 2v3" />
                      <path d="M9 17v-4" />
                      <path d="M9 10v.01" />
                      <path d="M22 10v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2z" />
                      <path d="M6 10h4" />
                    </svg>
                  </div>
                </div>
              </div>
            </Container>
          </section>

          {/* Our Values */}
          <section className="py-20">
            <Container>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-indigo-deep text-center mb-12 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 mr-3 text-indigo-deep" />
                Our Core Values
              </h2>

              <div className="max-w-3xl mx-auto glass-card p-8 animate-fade-in">
                <ul className="space-y-6">
                  {[
                    {
                      value: "Respect for Tradition",
                      description: "We honor the ancient heritage and spiritual significance of Kedarnath in all our services."
                    },
                    {
                      value: "Integrity & Transparency",
                      description: "We believe in honest, clear communications and fair practices without hidden costs."
                    },
                    {
                      value: "Pilgrim-Centered Approach",
                      description: "Every decision we make prioritizes the comfort, safety, and spiritual experience of our users."
                    },
                    {
                      value: "Continuous Improvement",
                      description: "We constantly seek feedback and evolve our services to better serve the pilgrimage community."
                    },
                    {
                      value: "Environmental Stewardship",
                      description: "We promote responsible tourism that respects and preserves the sacred natural environment."
                    }
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="icon-box w-10 h-10 mr-4 mt-1 flex-shrink-0">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-indigo-deep mb-1">{item.value}</h3>
                        <p className="text-mist">{item.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Container>
          </section>

          {/* Call to Action */}
          <section className="py-16 bg-gradient-primary">
            <Container className="text-center">
              <h2 className="text-3xl font-display font-bold text-white mb-6 animate-fade-in">
                Ready to Plan Your Kedarnath Yatra?
              </h2>
              <Link to="/stays" className="btn-secondary bg-white inline-flex animate-fade-in animate-delay-100">
                Explore Stays <ChevronRight className="w-5 h-5 ml-1" />
              </Link>
            </Container>
          </section>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default About;
