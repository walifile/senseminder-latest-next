import React from "react";
import { Star, User, Building, Quote } from "lucide-react";

const testimonials = [
  {
    content:
      "SmartPC has revolutionized our remote work setup. The performance is incredible, and we've seen a 40% increase in productivity across our design team.",
    author: "Sarah Johnson",
    position: "Creative Director",
    company: "DesignWorks Studio",
    rating: 5,
  },
  {
    content:
      "I've tried several smart PC solutions, but SmartPC stands out with its reliability and performance. It's like having my workstation with me wherever I go.",
    author: "Michael Chen",
    position: "Software Engineer",
    company: "TechSolutions Inc.",
    rating: 5,
  },
  {
    content:
      "The seamless experience across devices has been a game-changer for our consultants who are constantly on the move. Customer support is also exceptional.",
    author: "Jessica Rodriguez",
    position: "IT Director",
    company: "Global Consulting Group",
    rating: 5,
  },
  {
    content:
      "SmartPC has allowed our small studio to access computing power we could never afford as hardware. We're now competing with much larger studios on equal footing.",
    author: "David Kim",
    position: "Founder",
    company: "Apex Animations",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-background to-transparent"></div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-flex items-center bg-primary/10 border border-primary/20 dark:bg-primary/20 dark:border-primary/30 rounded-full mb-4 px-4 py-1.5">
            <span className="text-sm font-medium text-primary">
              Success Stories
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by <span className="gradient-text">Professionals</span>{" "}
            Worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            See why thousands of professionals and companies rely on SmartPC for
            their cloud computing needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-card p-8 relative overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-primary/10 hover:-translate-y-1 dark:bg-gray-900/30 dark:border-gray-800/30"
            >
              <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/10 dark:text-primary/10" />

              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-500 fill-yellow-500"
                  />
                ))}
              </div>

              <p className="text-foreground mb-6 relative z-10">
                {testimonial.content}
              </p>

              <div className="flex items-center">
                <div className="glass-card p-2 rounded-full mr-4 bg-primary/5 dark:bg-white/5">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.author}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>{testimonial.position}</span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      {testimonial.company}
                    </span>
                  </div>
                </div>
              </div>

              {/* Decorative gradient border */}
              <div className="absolute inset-0 rounded-xl border border-primary/20 dark:border-white/10"></div>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="glass-card py-6 px-8 inline-block dark:bg-gray-900/30 dark:border-gray-800/30">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="glass-card p-1 w-12 h-12 rounded-full border-2 border-background bg-primary/5 dark:bg-white/5"
                  >
                    <User className="h-full w-full text-primary" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">
                  Join 10,000+ professionals
                </p>
                <p className="text-sm text-muted-foreground">
                  Who trust SmartPC for their cloud computing
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
