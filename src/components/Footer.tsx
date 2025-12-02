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
  Clock,
  Home,
  Camera,
  Users,
  HelpCircle,
  FileCheck,
  FileWarning
} from "lucide-react";
import Container from "./Container";
import { EditableButton, EditableText } from "./editable";
import { useEdit } from "@/contexts/EditContext";

const Footer = () => {
  const { isEditMode } = useEdit();

  return (
    <footer className="bg-primary-deep/10 pt-8 pb-6">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-4">
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
                  defaultValue="dmworkforash@gmail.com"
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
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-pink-500 transition-all duration-300 p-1.5 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20"
                  aria-label="Instagram"
                  onClick={(e) => isEditMode && e.preventDefault()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-red-600 transition-all duration-300 p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label="YouTube"
                  onClick={(e) => isEditMode && e.preventDefault()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-black transition-all duration-300 p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
                  aria-label="X"
                  onClick={(e) => isEditMode && e.preventDefault()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/919027475942"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-green-600 transition-all duration-300 p-1.5 rounded-full hover:bg-green-50 dark:hover:bg-green-900/20"
                  aria-label="WhatsApp"
                  onClick={(e) => isEditMode && e.preventDefault()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
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
