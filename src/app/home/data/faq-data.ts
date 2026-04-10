export type FAQItem = {
  answer: string;
  category?: string;
  question: string;
};

export const defaultFaqItems: FAQItem[] = [
  {
    question: "What is a Cloud PC?",
    answer:
      "Sense Cloud PC is a virtual desktop computer that can be accessed from anywhere, on any device. You get the high performance of a desktop without the expense.",
  },
  {
    question: "What makes Sense PC different?",
    answer:
      "Unlike other cloud desktop solutions, Sense PC offers the best of both worlds. Features like enterprise-grade security and ultra-low latency create a user experience built for professionals. Also, we are proud to say our proprietary technology offers responsiveness and visual quality you won't find with other cloud desktop solutions.",
  },
  {
    question: "What kind of internet connection do I need?",
    answer:
      "We recommend a broadband connection with at least 15 Mbps download and 5 Mbps upload speeds. Sense PC works with most home and office connections.",
  },
  {
    question: "Can I install my own software on Sense PC?",
    answer:
      "Yes! Your Sense PC works just like a regular Windows PC. You have full administrator rights to install, configure, and run any software you need.",
  },
  {
    question: "What happens if I lose my internet connection?",
    answer:
      "Your data is always safely and securely stored with Sense PC. Your Sense PC session remains active after you disconnect.",
  },
  {
    question: "Can I use Sense PC for gaming?",
    answer:
      "Yes! Our professional and enterprise plans include GPU capabilities that can power gaming. You have to use SensePC Desktop Application",
  },
  {
    question: "How do I get started with Sense PC?",
    answer:
      "Simply sign up, redeem your one-time PROMO (if available) in the billing dashboard, and start building your cloud PC-ready in minutes. No complex setup or technical knowledge required.",
  },
];
