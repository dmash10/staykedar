import { TransitionLink } from "@/components/TransitionLink";
import { Mail, Phone, Instagram, Youtube } from "lucide-react";
import Container from "./Container";
import { useEdit } from "@/contexts/EditContext";
import { socialConfig } from "@/lib/social-config";

const Footer = () => {
  const { isEditMode } = useEdit();

  // Link style - clean, normal weight, underline on hover
  const linkClass = "text-xs text-gray-700 hover:underline py-0.5 block";

  return (
    <footer className="bg-[#e7e7e7] pt-10 pb-8">
      <Container>
        {/* Main Footer Grid - Reordered for better flow */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-6">

          {/* 1. Discover - Primary content */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Discover</h3>
            <ul className="space-y-1.5">
              <li>
                <TransitionLink to="/blog" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Blog
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/attractions" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Attractions
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/live-status" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Live Status
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/weather" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Weather Updates
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/car-rentals" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Car Rentals
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/work-from-pahad" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Work from Pahad
                </TransitionLink>
              </li>
            </ul>
          </div>

          {/* 2. Pilgrimage - Core offering */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Pilgrimage</h3>
            <ul className="space-y-1.5">
              <li>
                <TransitionLink to="/char-dham" className={linkClass}>
                  Char Dham Yatra
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/do-dham" className={linkClass}>
                  Do Dham (Kedar + Badri)
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/badrinath" className={linkClass}>
                  Badrinath
                </TransitionLink>
              </li>
            </ul>
          </div>

          {/* 3. Free Tools - Value-add */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Free Tools</h3>
            <ul className="space-y-1.5">
              <li>
                <TransitionLink to="/tools/kedarnath-budget-calculator" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Budget Calculator
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/tools/is-it-raining-in-kedarnath" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Rain Check
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/compare/guptkashi-vs-sonprayag" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Compare Cities
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/tools/itinerary-planner" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Itinerary Planner
                </TransitionLink>
              </li>
            </ul>
          </div>

          {/* 4. Support */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-1.5">
              <li>
                <TransitionLink to="/help" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Help Center
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/support/raise" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Raise a Ticket
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/support/track" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Track Status
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/shipping" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Shipping Policy
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/cancellation" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Cancellation & Refunds
                </TransitionLink>
              </li>
            </ul>
          </div>

          {/* 5. Partners */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Partners</h3>
            <ul className="space-y-1.5">
              <li>
                <TransitionLink to="/partner-with-us#property" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  List Your Property
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/content-creator" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Content Creator Program
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/driver-registration" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Become a Driver
                </TransitionLink>
              </li>
            </ul>
          </div>

          {/* 6. Terms & Settings - Legal (last) */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">Terms & Settings</h3>
            <ul className="space-y-1.5">
              <li>
                <TransitionLink to="/terms" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Terms & Conditions
                </TransitionLink>
              </li>
              <li>
                <TransitionLink to="/privacy" className={linkClass} onClick={(e) => isEditMode && e.preventDefault()}>
                  Privacy Policy
                </TransitionLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section: About + Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-300">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
            {/* About Section */}
            <div className="max-w-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2">About</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-3">
                Your trusted partner for a seamless and spiritual Kedarnath journey. We provide accommodation, travel services, and complete pilgrimage packages.
              </p>
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>support@staykedarnath.in</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>+91 9027475942</span>
                </div>
              </div>
              {/* Social Icons */}
              <div className="flex gap-3 mt-3">
                <a
                  href={socialConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-pink-600 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href={socialConfig.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-xs text-gray-500">
              © 2025 StayKedar. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
