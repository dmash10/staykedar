import { useState } from "react";
import { ChevronLeft, ChevronRight, BookOpen, Cloud, Landmark, ChevronRightIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Map, Calendar, Compass, Sunrise, Mountain, CloudRain } from "lucide-react";
import Container from "../Container";
import { EditableText, EditableRichText, EditableButton } from "../editable";
import { useEdit } from "@/contexts/EditContext";

// Mock data for articles
const articles = [
  {
    id: 1,
    title: "Essential Packing Guide for Kedarnath Yatra",
    excerpt: "Learn what to pack for different seasons to ensure a comfortable and safe pilgrimage.",
    icon: <Landmark className="w-5 h-5" />,  // Changed from Mountain
    category: "Preparation"
  },
  {
    id: 2,
    title: "Understanding Kedarnath Weather Patterns",
    excerpt: "A comprehensive guide to weather conditions throughout the year and how to prepare.",
    icon: <Cloud className="w-5 h-5" />,
    category: "Weather"
  },
  {
    id: 3,
    title: "Temple Etiquette: Respectful Practices",
    excerpt: "Important customs and practices to observe during your temple visit.",
    icon: <Landmark className="w-5 h-5" />,
    category: "Spiritual"
  },
  {
    id: 4,
    title: "Best Time to Visit Kedarnath",
    excerpt: "Month-by-month analysis to help you choose the ideal time for your journey.",
    icon: <Cloud className="w-5 h-5" />,
    category: "Planning"
  }
];

const YatraGuide = () => {
  const [startIndex, setStartIndex] = useState(0);
  const itemsPerPage = 3;
  const totalItems = articles.length;
  const visibleArticles = articles.slice(startIndex, startIndex + itemsPerPage);
  const { isEditMode } = useEdit();

  const handlePrev = () => {
    if (isEditMode) return;
    setStartIndex(prev => Math.max(prev - itemsPerPage, 0));
  };

  const handleNext = () => {
    if (isEditMode) return;
    setStartIndex(prev => Math.min(prev + itemsPerPage, totalItems - itemsPerPage));
  };

  return (
    <section className="py-20 bg-white">
      <Container>
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center">
            <BookOpen className="w-8 h-8 mr-3 text-indigo-deep" />
            <EditableRichText
              section="yatraGuide"
              contentKey="heading"
              defaultValue="<h2 class='text-3xl md:text-4xl font-display font-bold text-indigo-deep'>Kedarnath Yatra Guide</h2>"
              className=""
            />
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <button 
              onClick={handlePrev} 
              disabled={startIndex === 0 || isEditMode}
              className={`p-2 rounded-full ${startIndex === 0 ? 'text-mist bg-secondary' : 'text-indigo-deep bg-white hover:bg-secondary'} transition-colors duration-300 border border-border`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext} 
              disabled={startIndex >= totalItems - itemsPerPage || isEditMode}
              className={`p-2 rounded-full ${startIndex >= totalItems - itemsPerPage ? 'text-mist bg-secondary' : 'text-indigo-deep bg-white hover:bg-secondary'} transition-colors duration-300 border border-border`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {visibleArticles.map((article) => (
            <div 
              key={article.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-border hover:shadow-md hover:bg-blue-50/30 transition-all duration-300 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="icon-box">
                  {article.icon}
                </div>
                <span className="inline-block px-3 py-1 text-xs font-medium bg-secondary text-indigo-deep rounded-full">
                  {article.category}
                </span>
              </div>

              <EditableText
                section="yatraGuide"
                contentKey={`article_title_${article.id}`}
                defaultValue={article.title}
                className="text-xl font-semibold mb-2 text-indigo-deep"
              />
              
              <EditableText
                section="yatraGuide"
                contentKey={`article_excerpt_${article.id}`}
                defaultValue={article.excerpt}
                className="text-mist mb-6"
              />
              
              <div className="mt-auto">
                <Link 
                  to={`/guide/${article.id}`} 
                  className="text-indigo-light hover:text-indigo-deep flex items-center transition-colors duration-300"
                  onClick={(e) => isEditMode && e.preventDefault()}
                >
                  <EditableButton
                    section="yatraGuide"
                    contentKey={`read_more_${article.id}`}
                    defaultValue="Read More"
                    className="p-0 m-0 bg-transparent hover:bg-transparent border-none shadow-none text-indigo-light hover:text-indigo-deep"
                    variant="ghost"
                    icon={<ChevronRight className="w-4 h-4 ml-1" />}
                  />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex md:hidden justify-center items-center space-x-4">
          <button 
            onClick={handlePrev} 
            disabled={startIndex === 0 || isEditMode}
            className={`p-2 rounded-full ${startIndex === 0 ? 'text-mist bg-secondary' : 'text-indigo-deep bg-white hover:bg-secondary'} transition-colors duration-300 border border-border`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleNext} 
            disabled={startIndex >= totalItems - itemsPerPage || isEditMode}
            className={`p-2 rounded-full ${startIndex >= totalItems - itemsPerPage ? 'text-mist bg-secondary' : 'text-indigo-deep bg-white hover:bg-secondary'} transition-colors duration-300 border border-border`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/guide" 
            className="inline-block"
            onClick={(e) => isEditMode && e.preventDefault()}
          >
            <EditableButton
              section="yatraGuide"
              contentKey="read_all_articles"
              defaultValue="Read All Articles"
              className="btn-primary"
            />
          </Link>
        </div>
      </Container>
    </section>
  );
};

export default YatraGuide;
