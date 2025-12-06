import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Info,
  Shield,
  Book,
  FileText,
  Truck,
  CreditCard,
  Camera,
  Users,
  HelpCircle,
  FileCheck,
  FileWarning,
  Car,
  Activity,
  Calculator,
  CloudRain,
  ArrowRightLeft,
  Instagram,
  Youtube,
  Clock,
  Home,
  Mountain
} from "lucide-react";
import Container from "./Container";
import { EditableButton, EditableText } from "./editable";
import { useEdit } from "@/contexts/EditContext";
import { socialConfig } from "@/lib/social-config";

const Footer = () => {
  const { isEditMode } = useEdit();

  return (
    <footer className="bg-primary-deep/10 pt-8 pb-6">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4">
          {/* Tools */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-indigo-deep mb-2 md:mb-3">Free Tools</h3>
            <ul className="space-y-0 md:space-y-1">
              <li>
                <Link to="/tools/kedarnath-budget-calculator" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Calculator className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="budget_calc_link"
                    defaultValue="Budget Calculator"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/tools/is-it-raining-in-kedarnath" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <CloudRain className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="weather_check_link"
                    defaultValue="Rain Check"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/compare/guptkashi-vs-sonprayag" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <ArrowRightLeft className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="compare_link"
                    defaultValue="Compare Cities"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/tools/itinerary-planner" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="itinerary_planner_link"
                    defaultValue="Itinerary Planner"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-indigo-deep mb-2 md:mb-3">Support</h3>
            <ul className="space-y-0 md:space-y-1">
              <li>
                <Link to="/help" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <HelpCircle className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="help_center_link"
                    defaultValue="Help Center"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/support/raise" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <FileText className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="raise_ticket_link"
                    defaultValue="Raise a Ticket"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/support/track" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Truck className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="track_ticket_link"
                    defaultValue="Track Status"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Truck className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="shipping_link"
                    defaultValue="Shipping Policy"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/cancellation" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <FileWarning className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="cancellation_link"
                    defaultValue="Cancellation & Refunds"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-indigo-deep mb-2 md:mb-3">Discover</h3>
            <ul className="space-y-0 md:space-y-1">
              <li>
                <Link to="/blog" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Book className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="blog_link"
                    defaultValue="Blog"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/attractions" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="attractions_link"
                    defaultValue="Attractions"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/live-status" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Activity className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0 text-red-500" />
                  <EditableButton
                    section="footer"
                    contentKey="live_status_link"
                    defaultValue="Live Status"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm font-medium"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/weather" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="weather_link"
                    defaultValue="Weather Updates"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/car-rentals" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Car className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="car_rentals_link"
                    defaultValue="Car Rentals"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Pilgrimage */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-indigo-deep mb-2 md:mb-3">Pilgrimage</h3>
            <ul className="space-y-0 md:space-y-1">
              <li>
                <Link to="/char-dham" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5">
                  <Mountain className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <span>Char Dham Yatra</span>
                </Link>
              </li>
              <li>
                <Link to="/do-dham" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5">
                  <Mountain className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <span>Do Dham (Kedar + Badri)</span>
                </Link>
              </li>
              <li>
                <Link to="/badrinath" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5">
                  <Mountain className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <span>Badrinath</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Terms and settings */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-indigo-deep mb-2 md:mb-3">Terms and settings</h3>
            <ul className="space-y-0 md:space-y-1">
              <li>
                <Link to="/terms" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <FileCheck className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="terms_link"
                    defaultValue="Terms & Conditions"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Shield className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="privacy_link"
                    defaultValue="Privacy Policy"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h3 className="text-base md:text-lg font-semibold text-indigo-deep mb-2 md:mb-3">Partners</h3>
            <ul className="space-y-0 md:space-y-1">
              <li>
                <Link to="/partner-with-us#property" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Home className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="list_property_link"
                    defaultValue="List Your Property"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/content-creator" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Camera className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="content_creator_link"
                    defaultValue="Content Creator Program"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/driver-registration" className="text-xs md:text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1 py-0.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Car className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                  <EditableButton
                    section="footer"
                    contentKey="driver_registration_link"
                    defaultValue="Become a Driver"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-xs md:text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
            </ul>
          </div>
          {/* About */}
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <h3 className="text-base md:text-lg font-semibold text-indigo-deep mb-2 md:mb-3">About</h3>
            <div className="space-y-2">
              <EditableText
                section="footer"
                contentKey="company_description"
                defaultValue="Your trusted partner for a seamless and spiritual Kedarnath journey. We provide accommodation, travel services, and complete pilgrimage packages."
                className="text-xs text-muted-foreground leading-relaxed"
              />
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                <Mail className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                <EditableButton
                  section="footer"
                  contentKey="company_email"
                  defaultValue="support@staykedarnath.in"
                  className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground text-xs md:text-sm"
                  variant="ghost"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                <Phone className="w-3 h-3 md:w-3.5 md:h-3.5 flex-shrink-0" />
                <EditableButton
                  section="footer"
                  contentKey="company_phone"
                  defaultValue="+91 9027475942"
                  className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground text-xs md:text-sm"
                  variant="ghost"
                />
              </div>
              <div className="flex space-x-3 md:space-x-4 pt-2">
                <a
                  href={socialConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 p-3 rounded-full hover:bg-pink-500 hover:scale-110 transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-white group-hover:fill-current" />
                </a>

                <a
                  href={socialConfig.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 p-3 rounded-full hover:bg-red-600 hover:scale-110 transition-all duration-300 group"
                  aria-label="YouTube"
                >
                  <Youtube className="w-5 h-5 text-white group-hover:fill-current" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-muted-foreground">
            <EditableText
              section="footer"
              contentKey="copyright"
              defaultValue="© 2025 StayKedar. All rights reserved."
              className="text-xs text-muted-foreground"
            />
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
