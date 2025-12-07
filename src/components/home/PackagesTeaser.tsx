import { motion } from "framer-motion";
import { Package, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TransitionLink } from "../TransitionLink";
import Container from "../Container";
import { EditableRichText, EditableButton } from "../editable";
import { useEdit } from "@/contexts/EditContext";

const PackagesTeaser = () => {
  const { isEditMode } = useEdit();

  return (
    <section className="py-20 bg-primary-deep/5">
      <Container>
        <div className="bg-gradient-primary rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="p-8 md:p-12 animate-fade-in">
              <div className="icon-box w-16 h-16 bg-white text-indigo-deep mb-6">
                <Package className="w-8 h-8" />
              </div>

              <EditableRichText
                section="packagesTeaser"
                contentKey="heading"
                defaultValue="<h2 class='text-3xl md:text-4xl font-display font-bold text-white mb-4'>Simplify Your Yatra with Pre-Planned Packages</h2>"
                className="text-white"
              />

              <EditableRichText
                section="packagesTeaser"
                contentKey="description"
                defaultValue="<p class='text-white/90 mb-8 max-w-lg'>Our carefully curated packages include transportation, accommodation, and guided experiences, allowing you to focus on your spiritual journey without the hassle of planning every detail.</p>"
                className="text-white"
              />

              <TransitionLink
                to="/packages"
                className="inline-block"
                onClick={(e) => isEditMode && e.preventDefault()}
              >
                <EditableButton
                  section="packagesTeaser"
                  contentKey="explore_button"
                  defaultValue="Explore Packages"
                  className="btn-secondary bg-white/10 hover:bg-white/20 text-white border-white/20"
                  icon={<ChevronRight className="w-5 h-5 ml-2" />}
                />
              </TransitionLink>
            </div>

            <div className="hidden md:flex justify-center p-12 relative animate-fade-in">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-full animate-pulse-slow"></div>
              <div className="relative">
                <svg
                  className="w-64 h-64 text-white animate-float"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  <path d="M12 12 L8 9"></path>
                  <path d="M12 12 L16 9"></path>
                  <path d="M8 9 L8 13"></path>
                  <path d="M16 9 L16 13"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PackagesTeaser;
