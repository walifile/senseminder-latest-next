import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, HelpCircle, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const faqItems = [
  {
    question: "What is a Cloud PC?",
    answer:
      "A Sense PC is a virtual computer that runs in a secure data center and can be accessed from anywhere, on any device. It offers the power and functionality of a high-end desktop without requiring expensive hardware on your end.",
  },
  {
    question: "How is Sense PC different from other cloud computing services?",
    answer:
      "Sense PC offers industry-leading performance with ultra-low latency, enterprise-grade security, and a seamless user experience designed for professionals. Our proprietary technology delivers better responsiveness and visual quality than competitors.",
  },
  {
    question: "What kind of internet connection do I need?",
    answer:
      "For optimal performance, we recommend a broadband connection with at least 15 Mbps download and 5 Mbps upload speeds. Sense PC works with most home and office connections, and our adaptive streaming technology adjusts to your connection quality.",
  },
  {
    question: "Can I install my own software on Sense PC?",
    answer:
      "Yes! Your Sense PC works just like a regular Windows PC. You have full administrator rights to install, configure, and run any Windows-compatible software you need.",
  },
  {
    question: "Is my data secure in the cloud?",
    answer:
      "Absolutely. Sense PC employs bank-level encryption for all data in transit and at rest. Our infrastructure is compliant with major security standards including SOC 2, GDPR, and HIPAA requirements. Your data remains private and protected at all times.",
  },
  {
    question: "What happens if I lose internet connection?",
    answer:
      "Your Sense PC session remains active for a short period if you disconnect, allowing you to resume exactly where you left off once your connection is restored. Your data is always safely stored in the cloud.",
  },
  {
    question: "Can I use Sense PC for gaming?",
    answer:
      "Yes! Our Professional and Enterprise plans include GPU capabilities suitable for gaming. While we optimize for professional workloads, many games run exceptionally well on our platform.",
  },
  {
    question: "How do I get started with Sense PC?",
    answer:
      "Simply choose a subscription plan, create your account, and you can be up and running with your new Sense PC in minutes. No complex setup or technical knowledge required.",
  },
];

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredItems = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="faq" className="py-6 relative"> {/* Much smaller top/bottom padding */}
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-4"> {/* Reduced spacing */}
          <div className="inline-flex items-center bg-primary/10 dark:bg-primary/20 rounded-full mb-1 px-3 py-0.5">
            <span className="text-xs font-medium text-primary">FAQ</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="text-xl font-semibold mb-1 dark:text-white text-gray-900"
          >
            Frequently Asked <span className="gradient-text">Questions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="text-sm text-gray-600 dark:text-gray-400 max-w-xl mx-auto"
          >
            Everything you need to know about Sense PC
          </motion.p>
        </div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="relative mb-3"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-primary/60" />
            <Input
              type="text"
              placeholder="Search..."
              className={cn(
                "pl-9 py-1.5 text-xs rounded-md",
                "dark:bg-card/50 dark:border-border dark:focus:border-primary dark:bg-gray-800/30 dark:backdrop-blur-md",
                "bg-white/90 border-gray-200 focus:border-primary shadow-sm"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>

          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    className={cn(
                      "overflow-hidden group rounded-md transition-all duration-200",
                      "dark:glass-card dark:border-white/10 dark:bg-gray-900/30 dark:hover:border-primary/30 dark:shadow-sm",
                      "bg-white border border-gray-200 shadow hover:border-primary/20"
                    )}
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className={cn(
                        "w-full px-3 py-2 flex items-center justify-between text-left text-sm",
                        "hover:bg-gray-50 dark:hover:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        <span className="font-medium dark:text-white text-gray-900 group-hover:text-primary">
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          openIndex === index ? "rotate-180" : "",
                          "text-gray-500 dark:text-gray-400"
                        )}
                      />
                    </button>
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-2 text-xs text-gray-600 dark:text-gray-300">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-4 text-sm rounded-md bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-white/10"
                >
                  <p className="text-gray-600 dark:text-gray-300">
                    No matching questions found.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
