/**
 * AIOptimizedFAQ.tsx - FAQ Component Optimized for Google AI Overviews
 * 
 * This component is designed to maximize visibility in AI-generated search results.
 * Key optimizations:
 * 1. Schema.org FAQPage markup (JSON-LD)
 * 2. Semantic HTML with itemscope/itemtype attributes
 * 3. Clear, concise Q&A format that AI can easily parse
 * 4. Collapsible design for good UX without sacrificing SEO
 */

import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface AIOptimizedFAQProps {
  title?: string;
  description?: string;
  faqs: FAQItem[];
  showSchema?: boolean;
  className?: string;
  compact?: boolean;
}

export default function AIOptimizedFAQ({
  title = "Frequently Asked Questions",
  description,
  faqs,
  showSchema = true,
  className = "",
  compact = false
}: AIOptimizedFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Generate FAQ Schema for AI Search
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <>
      {/* JSON-LD Schema for AI Search Crawlers */}
      {showSchema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        </Helmet>
      )}

      {/* FAQ Section with Semantic HTML */}
      <section 
        className={`${className}`}
        itemScope 
        itemType="https://schema.org/FAQPage"
        aria-label="Frequently Asked Questions"
      >
        {/* Section Header */}
        {title && (
          <header className={`${compact ? 'mb-4' : 'mb-8'}`}>
            <h2 className={`${compact ? 'text-xl' : 'text-2xl md:text-3xl'} font-bold text-gray-900 flex items-center gap-3`}>
              <HelpCircle className={`${compact ? 'w-5 h-5' : 'w-6 h-6'} text-[#0071c2]`} />
              {title}
            </h2>
            {description && (
              <p className="text-gray-600 mt-2">{description}</p>
            )}
          </header>
        )}

        {/* FAQ Items - Optimized for AI Parsing */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <article
              key={index}
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
              className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'shadow-lg border-[#0071c2]/30' : 'shadow-sm hover:shadow-md'
              }`}
            >
              {/* Question - Always visible to crawlers */}
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 md:p-5 text-left group"
                aria-expanded={openIndex === index}
              >
                <h3 
                  itemProp="name"
                  className={`${compact ? 'text-sm' : 'text-base md:text-lg'} font-semibold text-gray-900 pr-4 group-hover:text-[#0071c2] transition-colors`}
                >
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className={`w-5 h-5 ${openIndex === index ? 'text-[#0071c2]' : 'text-gray-400'}`} />
                </motion.div>
              </button>

              {/* Answer - Structured for AI */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    itemScope
                    itemProp="acceptedAnswer"
                    itemType="https://schema.org/Answer"
                  >
                    <div 
                      className="px-4 md:px-5 pb-4 md:pb-5 border-t border-gray-100 pt-4"
                      itemProp="text"
                    >
                      {/* Parse answer for paragraphs */}
                      {faq.answer.split('\n').map((paragraph, pIndex) => (
                        <p 
                          key={pIndex} 
                          className={`${compact ? 'text-sm' : 'text-base'} text-gray-600 leading-relaxed ${pIndex > 0 ? 'mt-3' : ''}`}
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hidden answer for crawlers when collapsed */}
              {openIndex !== index && (
                <div 
                  className="sr-only"
                  itemScope
                  itemProp="acceptedAnswer"
                  itemType="https://schema.org/Answer"
                >
                  <div itemProp="text">{faq.answer}</div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

/**
 * Pre-built FAQ sets for common pages
 * These are optimized for Google AI's Query Fan-Out search pattern
 */

export const KedarnathTravelFAQs: FAQItem[] = [
  {
    question: "What is the best time to visit Kedarnath?",
    answer: "The best time to visit Kedarnath is from May to June and September to October. The temple opens in late April/early May after winter and closes in November. May-June offers pleasant weather (10-15°C) but heavy crowds. September-October has clearer skies and fewer pilgrims, making it ideal for photography and peaceful darshan."
  },
  {
    question: "How difficult is the Kedarnath trek?",
    answer: "The Kedarnath trek is 16 km one-way from Gaurikund to Kedarnath Temple at 3,583 meters elevation. It is rated moderate to difficult. The trek takes 6-8 hours depending on fitness. The path is well-maintained with rest stops. Alternatives include helicopter (₹2,500-7,000), pony (₹2,500-4,000), or palanquin (₹6,000-12,000)."
  },
  {
    question: "How do I book a helicopter to Kedarnath?",
    answer: "Helicopter bookings to Kedarnath can be made through IRCTC, private operators, or authorized travel agencies like StayKedarnath. The helipad is in Phata/Sersi (10 km from temple). Flight time is 10-15 minutes. Book at least 2-4 weeks in advance during peak season. Prices range from ₹2,500-7,000 per person one-way."
  },
  {
    question: "Is Kedarnath safe to visit?",
    answer: "Yes, Kedarnath is generally safe for pilgrims. The government has improved infrastructure after the 2013 floods. However, visitors should check weather advisories before travel, especially during monsoon (July-August) when landslides occur. Medical facilities are available at base camp. Always carry basic medicines, warm clothes, and stay hydrated at high altitude."
  },
  {
    question: "What should I pack for Kedarnath yatra?",
    answer: "Essential items for Kedarnath trek: Warm layered clothing, waterproof jacket, trekking shoes, rain poncho, flashlight, sunscreen, first-aid kit, personal medicines, snacks (glucose, dry fruits), water bottle, walking stick, and ID proof. Do not carry heavy luggage. Porters are available at Gaurikund for ₹500-800 per bag."
  },
  {
    question: "How much does a Kedarnath trip cost?",
    answer: "A basic Kedarnath trip costs ₹5,000-15,000 per person for 3-4 days including stay, food, and transport from Haridwar. Helicopter packages cost ₹15,000-30,000. Budget stays near temple start at ₹500/night. VIP darshan and full packages with guide range from ₹20,000-50,000. Off-season (September-October) is 20-30% cheaper."
  }
];

export const BookingFAQs: FAQItem[] = [
  {
    question: "What is the cancellation policy for bookings?",
    answer: "Free cancellation is available up to 48 hours before check-in for a full refund. Cancellations 24-48 hours before check-in receive a 50% refund. No refund for cancellations within 24 hours. Helicopter bookings follow operator-specific policies. Refunds are processed within 5-7 business days to the original payment method."
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major payment methods: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards (Visa, MasterCard, RuPay), Net Banking from all Indian banks, and EMI options on select bookings. All payments are secured with 256-bit SSL encryption. GST invoices are provided."
  },
  {
    question: "Can I modify my booking after confirmation?",
    answer: "Yes, booking modifications are allowed up to 24 hours before check-in, subject to availability. Date changes may have price differences. To modify, go to My Bookings > Select Booking > Modify. Changes within 24 hours of check-in are treated as cancellation + new booking."
  },
  {
    question: "How do I get my booking confirmation?",
    answer: "Booking confirmations are sent instantly via email and SMS after successful payment. You can also view all bookings in My Bookings section after logging in. If you haven't received confirmation within 15 minutes, check spam folder or contact support with your transaction ID."
  }
];

export const StaysFAQs: FAQItem[] = [
  {
    question: "What types of accommodation are available near Kedarnath?",
    answer: "Accommodation options near Kedarnath include: Dharamshalas (budget, ₹200-500), Government guesthouses (₹500-1,500), Private hotels in Gaurikund and Sonprayag (₹800-3,000), Camps and tents near base (₹1,000-2,500), and Premium stays in Guptkashi (₹3,000-8,000). At Kedarnath town itself, only dharamshalas and basic rooms are available."
  },
  {
    question: "Is advance booking required for Kedarnath stays?",
    answer: "Advance booking is highly recommended, especially during peak season (May-June) and weekends. Rooms near the temple fill up quickly. Book at least 2-4 weeks ahead for May-June. September-October has better availability. Walk-in is possible in off-peak times but not guaranteed."
  },
  {
    question: "What amenities are available in Kedarnath hotels?",
    answer: "Basic amenities at Kedarnath include: Hot water (limited hours), blankets and bedding, attached or shared bathrooms, room heating (in premium properties), vegetarian meals, and charging points. WiFi is limited. Luxury amenities are not available at this altitude. Better facilities are in Guptkashi (45 km away)."
  }
];


