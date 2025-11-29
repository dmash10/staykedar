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
    <footer className="bg-primary-deep/10 pt-10 pb-6">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-deep mb-3">Support</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <HelpCircle className="w-3.5 h-3.5" />
                  <EditableButton
                    section="footer"
                    contentKey="contact_link"
                    defaultValue="Contact Us"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Truck className="w-3.5 h-3.5" />
                  <EditableButton
                    section="footer"
                    contentKey="shipping_link"
                    defaultValue="Shipping Policy"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/cancellation" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <FileWarning className="w-3.5 h-3.5" />
                  <EditableButton
                    section="footer"
                    contentKey="cancellation_link"
                    defaultValue="Cancellation & Refunds"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Discover */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-deep mb-3">Discover</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Book className="w-3.5 h-3.5" />
                  <EditableButton
                    section="footer"
                    contentKey="blog_link"
                    defaultValue="Blog"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/attractions" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <MapPin className="w-3.5 h-3.5" />
                  <EditableButton
                    section="footer"
                    contentKey="attractions_link"
                    defaultValue="Attractions"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/weather" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Clock className="w-3.5 h-3.5" />
                  <EditableButton
                    section="footer"
                    contentKey="weather_link"
                    defaultValue="Weather Updates"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Terms and settings */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-deep mb-3">Terms and settings</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <FileCheck className="w-3.5 h-3.5" />
                  <EditableButton
                    section="footer"
                    contentKey="terms_link"
                    defaultValue="Terms & Conditions"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Shield className="w-3.5 h-3.5" />
                  <EditableButton
                    section="footer"
                    contentKey="privacy_link"
                    defaultValue="Privacy Policy"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Partners */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-deep mb-3">Partners</h3>
            <ul className="space-y-1">
              <li>
                <Link to="/partner-with-us#property" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Home className="w-3.5 h-3.5" />
                  <EditableButton
                    section="footer"
                    contentKey="list_property_link"
                    defaultValue="List Your Property"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
              <li>
                <Link to="/content-creator" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 flex items-center gap-1.5" onClick={(e) => isEditMode && e.preventDefault()}>
                  <Camera className="w-3.5 h-3.5" />
                  <EditableButton
                    section="footer"
                    contentKey="content_creator_link"
                    defaultValue="Content Creator Program"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground hover:text-primary text-sm"
                    variant="ghost"
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-indigo-deep mb-3">About</h3>
            <div className="space-y-2">
              <EditableText
                section="footer"
                contentKey="company_description"
                defaultValue="Your trusted partner for a seamless and spiritual Kedarnath journey. We provide accommodation, travel services, and complete pilgrimage packages."
                className="text-xs text-muted-foreground"
              />
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="w-3.5 h-3.5" />
                <EditableButton
                  section="footer"
                  contentKey="company_email"
                  defaultValue="info@staykedar.com"
                  className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground text-sm"
                  variant="ghost"
                />
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <EditableButton
                  section="footer"
                  contentKey="company_phone"
                  defaultValue="+91 98765 43210"
                  className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-muted-foreground text-sm"
                  variant="ghost"
                />
              </div>
              <div className="flex space-x-4 pt-2">
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-500 hover:text-pink-500 transition-all duration-300 p-1.5 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20"
                  aria-label="Instagram"
                  onClick={(e) => isEditMode && e.preventDefault()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
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
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
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
                    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
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
