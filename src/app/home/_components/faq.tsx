import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, HelpCircle, ChevronDown, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

const faqItems = [
  {
    question: "What is a Cloud PC?",
    answer:
      "A smart PC is a virtual computer that runs in a secure data center and can be accessed from anywhere, on any device. It offers the power and functionality of a high-end desktop without requiring expensive hardware on your end.",
  },
  {
    question: "How is SmartPC different from other cloud computing services?",
    answer:
      "SmartPC offers industry-leading performance with ultra-low latency, enterprise-grade security, and a seamless user experience designed for professionals. Our proprietary technology delivers better responsiveness and visual quality than competitors.",
  },
  {
    question: "What kind of internet connection do I need?",
    answer:
      "For optimal performance, we recommend a broadband connection with at least 15 Mbps download and 5 Mbps upload speeds. SmartPC works with most home and office connections, and our adaptive streaming technology adjusts to your connection quality.",
  },
  {
    question: "Can I install my own software on SmartPC?",
    answer:
      "Yes! Your SmartPC works just like a regular Windows PC. You have full administrator rights to install, configure, and run any Windows-compatible software you need.",
  },
  {
    question: "Is my data secure in the cloud?",
    answer:
      "Absolutely. SmartPC employs bank-level encryption for all data in transit and at rest. Our infrastructure is compliant with major security standards including SOC 2, GDPR, and HIPAA requirements. Your data remains private and protected at all times.",
  },
  {
    question: "What happens if I lose internet connection?",
    answer:
      "Your SmartPC session remains active for a short period if you disconnect, allowing you to resume exactly where you left off once your connection is restored. Your data is always safely stored in the cloud.",
  },
  {
    question: "Can I use SmartPC for gaming?",
    answer:
      "Yes! Our Professional and Enterprise plans include GPU capabilities suitable for gaming. While we optimize for professional workloads, many games run exceptionally well on our platform.",
  },
  {
    question: "How do I get started with SmartPC?",
    answer:
      "Simply choose a subscription plan, create your account, and you can be up and running with your new smart PC in minutes. No complex setup or technical knowledge required.",
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
    <section id="faq" className="py-24 relative">
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 dark:bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary/10 dark:bg-primary/20 rounded-full mb-4 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              FAQ
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4 dark:text-white text-gray-900"
          >
            Frequently Asked <span className="gradient-text">Questions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg dark:text-gray-300 text-gray-600 max-w-2xl mx-auto"
          >
            Everything you need to know about SmartPC
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative mb-8"
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-primary/60" />
            <Input
              type="text"
              placeholder="Search for answers..."
              className={cn(
                "pl-10 transition-colors",
                "dark:bg-card/50 dark:border-border dark:focus:border-primary dark:bg-gray-800/30 dark:backdrop-blur-md",
                "bg-white/90 border-gray-200 focus:border-primary shadow-sm"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={cn(
                      "overflow-hidden group rounded-lg transition-all duration-200",
                      "dark:glass-card dark:border-white/10 dark:bg-gray-900/30 dark:backdrop-blur-sm dark:hover:border-primary/30 dark:hover:shadow-primary/5 dark:shadow-md dark:shadow-black/5",
                      "bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/20"
                    )}
                  >
                    <button
                      onClick={() =>
                        setOpenIndex(openIndex === index ? null : index)
                      }
                      className={cn(
                        "w-full px-6 py-4 flex items-center justify-between text-left transition-colors relative",
                        "hover:bg-gray-50 dark:hover:bg-white/5 dark:hover:bg-gray-800/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <HelpCircle className="h-5 w-5 text-primary dark:text-primary/90" />
                        <span className="text-lg font-medium dark:text-white text-gray-900 group-hover:text-primary dark:group-hover:text-primary transition-colors">
                          {item.question}
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 transition-transform duration-200",
                          "dark:text-gray-400 text-gray-500 group-hover:text-primary/70 dark:group-hover:text-primary/70",
                          openIndex === index ? "rotate-180" : ""
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
                          <div className="px-6 pb-4 dark:text-gray-300 text-gray-600 dark:bg-gray-800/20 rounded-b-lg">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center p-8 rounded-lg bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-white/10"
                >
                  <p className="text-gray-600 dark:text-gray-300">No matching questions found. Try a different search term or check our support page.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="dark:text-gray-300 text-gray-600 mb-4">
              Still have questions?
            </p>
            <Link href="/contact">
              <Button className="bg-primary hover:bg-primary/90 text-white dark:text-primary-foreground dark:shadow-primary/20 dark:shadow-lg">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
