import { useState } from "react";
import { ChevronLeft, ChevronRight, Hotel, Home, Building, Wifi, Coffee, Snowflake, Car } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Container from "../Container";
import { EditableRichText, EditableText, EditableButton } from "../editable";
import { useEdit } from "@/contexts/EditContext";

// Mock data for stays
const stays = [
  {
    id: 1,
    name: "Himalayan Retreat",
    type: "hotel",
    icon: <Hotel className="w-5 h-5" />,
    priceRange: "₹3,000 - ₹5,000",
    amenities: [<Wifi key="wifi" className="w-4 h-4" />, <Coffee key="coffee" className="w-4 h-4" />, <Snowflake key="ac" className="w-4 h-4" />]
  },
  {
    id: 2,
    name: "Kedarnath Guesthouse",
    type: "guesthouse",
    icon: <Home className="w-5 h-5" />,
    priceRange: "₹1,500 - ₹3,000",
    amenities: [<Wifi key="wifi" className="w-4 h-4" />, <Car key="parking" className="w-4 h-4" />]
  },
  {
    id: 3,
    name: "Divine Dharamshala",
    type: "dharamshala",
    icon: <Building className="w-5 h-5" />,
    priceRange: "₹800 - ₹1,500",
    amenities: [<Coffee key="coffee" className="w-4 h-4" />]
  },
  {
    id: 4,
    name: "Mountain View Hotel",
    type: "hotel",
    icon: <Hotel className="w-5 h-5" />,
    priceRange: "₹2,500 - ₹4,500",
    amenities: [<Wifi key="wifi" className="w-4 h-4" />, <Coffee key="coffee" className="w-4 h-4" />, <Car key="parking" className="w-4 h-4" />]
  },
  {
    id: 5,
    name: "Pilgrim's Rest",
    type: "guesthouse",
    icon: <Home className="w-5 h-5" />,
    priceRange: "₹1,200 - ₹2,500",
    amenities: [<Wifi key="wifi" className="w-4 h-4" />]
  },
  {
    id: 6,
    name: "Shiva Dharamshala",
    type: "dharamshala",
    icon: <Building className="w-5 h-5" />,
    priceRange: "₹600 - ₹1,200",
    amenities: [<Coffee key="coffee" className="w-4 h-4" />]
  }
];

const ExploreStays = () => {
  const { isEditMode } = useEdit();
  const [startIndex, setStartIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const itemsPerPage = 3;
  const totalItems = stays.length;
  const visibleStays = stays.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => {
    if (isEditMode) return;
    setStartIndex(prev => Math.max(prev - itemsPerPage, 0));
  };

  const handleNext = () => {
    if (isEditMode) return;
    setStartIndex(prev => Math.min(prev + itemsPerPage, totalItems - itemsPerPage));
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Prevent navigation when in edit mode
  const handleLinkClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
    }
  };

  return (
    <section className="py-20 bg-white">
      <Container size="xl">
        <motion.div
          className="flex justify-between items-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center">
            <Hotel className="w-8 h-8 mr-3 text-primary" />
            <EditableRichText
              section="exploreStays"
              contentKey="heading"
              defaultValue="<h2 class='text-3xl md:text-4xl font-display font-bold text-foreground'>Discover Serene Stays in Kedarnath</h2>"
              className=""
            />
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={startIndex === 0 || isEditMode}
              className={`p-2 rounded-full ${startIndex === 0 ? 'text-muted-foreground bg-secondary/50' : 'text-white bg-primary hover:bg-primary/90'} transition-colors duration-300 border border-border`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              disabled={startIndex >= totalItems - itemsPerPage || isEditMode}
              className={`p-2 rounded-full ${startIndex >= totalItems - itemsPerPage ? 'text-muted-foreground bg-secondary/50' : 'text-white bg-primary hover:bg-primary/90'} transition-colors duration-300 border border-border`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <motion.div
          className="flex overflow-x-auto snap-x md:grid md:grid-cols-3 gap-4 md:gap-8 pb-4 md:pb-0 px-4 md:px-0 -mx-4 md:mx-0 scrollbar-hide"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {(typeof window !== 'undefined' && window.innerWidth < 768 ? stays : visibleStays).map((stay) => (
            <motion.div
              key={stay.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md hover:bg-blue-50/70 transition-all duration-300 flex flex-col h-full min-w-[280px] snap-center md:min-w-0"
              variants={item}
              onHoverStart={() => setHoveredId(stay.id)}
              onHoverEnd={() => setHoveredId(null)}
              whileHover={{ y: -10 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="icon-box">
                  {stay.icon}
                </div>
                <span className="inline-block px-3 py-1 text-xs font-medium bg-secondary text-primary rounded-full">
                  {stay.type}
                </span>
              </div>

              <EditableText
                section="exploreStays"
                contentKey={`stay_name_${stay.id}`}
                defaultValue={stay.name}
                className="text-xl font-semibold mb-2 text-foreground"
              />

              <div className="flex items-center mb-4">
                <EditableText
                  section="exploreStays"
                  contentKey={`stay_price_${stay.id}`}
                  defaultValue={stay.priceRange}
                  className="text-sm text-muted-foreground"
                />
                <span className="text-xs text-muted-foreground ml-1">per night</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {stay.amenities.map((amenity, index) => (
                  <div key={index} className="text-muted-foreground">
                    {amenity}
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <Link
                  to={`/stays/${stay.id}`}
                  className="w-full block"
                  onClick={handleLinkClick}
                >
                  <EditableButton
                    section="exploreStays"
                    contentKey={`view_details_${stay.id}`}
                    defaultValue="View Details"
                    className="btn-primary w-full justify-center"
                  />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="hidden mt-10 md:hidden justify-center items-center space-x-4">
          <button
            onClick={handlePrev}
            disabled={startIndex === 0 || isEditMode}
            className={`p-2 rounded-full ${startIndex === 0 ? 'text-muted-foreground bg-secondary/50' : 'text-white bg-primary hover:bg-primary/90'} transition-colors duration-300 border border-border`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={startIndex >= totalItems - itemsPerPage || isEditMode}
            className={`p-2 rounded-full ${startIndex >= totalItems - itemsPerPage ? 'text-muted-foreground bg-secondary/50' : 'text-white bg-primary hover:bg-primary/90'} transition-colors duration-300 border border-border`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/stays"
            className="inline-block"
            onClick={handleLinkClick}
          >
            <EditableButton
              section="exploreStays"
              contentKey="view_all_stays"
              defaultValue="View All Stays"
              className="btn-primary"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default ExploreStays;
