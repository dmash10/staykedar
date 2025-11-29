import { useState } from "react";
import { 
  Home, 
  Map, 
  HandHeart,
  Shield,
  Star,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import Container from "../Container";
import { EditableRichText, EditableButton } from "../editable";
import { useEdit } from "@/contexts/EditContext";

const features = [
  {
    icon: <Home className="w-6 h-6" />,
    title: "Curated Premium Stays",
    description: "Handpicked accommodations ensuring comfort and authenticity during your spiritual journey.",
    contentKey: "feature1"
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: "Seamless Yatra Planning",
    description: "Comprehensive guides and resources to plan every aspect of your pilgrimage with ease.",
    contentKey: "feature2"
  },
  {
    icon: <HandHeart className="w-6 h-6" />,
    title: "Trusted Partner in Spirituality",
    description: "Committed to enhancing your spiritual experience with respect and authenticity.",
    contentKey: "feature3"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Safety & Security",
    description: "Your safety is our priority with verified stays and 24/7 emergency assistance.",
    contentKey: "feature4"
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Exceptional Experiences",
    description: "Create memories beyond accommodation with unique spiritual activities and local insights.",
    contentKey: "feature5"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Community Connection",
    description: "Connect with like-minded pilgrims and share your spiritual journey experiences.",
    contentKey: "feature6"
  }
];

const WhyChooseUs = () => {
  const { isEditMode } = useEdit();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-20 bg-primary-deep/5">
      <Container size="xl">
        <div className="text-center mb-16">
          <motion.div 
            className="inline-block mb-3"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="premium-icon w-16 h-16 mx-auto">
              <Shield className="w-8 h-8" />
            </div>
          </motion.div>
          
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <EditableRichText
              section="whyChooseUs"
              contentKey="heading"
              defaultValue="<h2 class='text-4xl md:text-5xl font-display font-bold text-foreground'>Why Choose <span class='premium-heading'>Us</span></h2>"
              className=""
            />
          </motion.div>
          
          <motion.div 
            className=""
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <EditableRichText
              section="whyChooseUs"
              contentKey="subheading"
              defaultValue="<p class='text-muted-foreground max-w-3xl mx-auto text-lg'>We offer unparalleled services designed to make your spiritual journey seamless and meaningful.</p>"
              className=""
            />
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white shadow-sm hover:shadow-md border border-border rounded-2xl p-8 flex flex-col items-center text-center h-full transition-all duration-300 hover:bg-blue-50/70"
              variants={item}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              whileHover={{ y: -10 }}
            >
              <motion.div 
                className="premium-icon mb-6"
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
              >
                {feature.icon}
              </motion.div>
              <EditableRichText
                section="whyChooseUs"
                contentKey={`title_${feature.contentKey}`}
                defaultValue={`<h3 class='text-xl font-semibold mb-3 text-primary'>${feature.title}</h3>`}
                className=""
              />
              <EditableRichText
                section="whyChooseUs"
                contentKey={feature.contentKey}
                defaultValue={`<p class='text-muted-foreground'>${feature.description}</p>`}
                className=""
              />
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <a 
              href="#explore" 
              className="inline-block"
              onClick={(e) => isEditMode && e.preventDefault()}
            >
              <EditableButton
                section="whyChooseUs"
                contentKey="explore_services_button"
                defaultValue="Explore Our Services"
                className="btn-primary"
              />
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default WhyChooseUs;
