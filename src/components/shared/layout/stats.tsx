import React from "react";
import { Users, Globe, Server, Clock } from "lucide-react";

const stats = [
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    value: "10,000+",
    label: "Active Users",
    description: "Professionals using SmartPC daily",
  },
  {
    icon: <Globe className="h-10 w-10 text-primary" />,
    value: "99.99%",
    label: "Uptime",
    description: "Industry-leading reliability",
  },
  {
    icon: <Server className="h-10 w-10 text-primary" />,
    value: "24",
    label: "Global Datacenters",
    description: "Across 6 continents",
  },
  {
    icon: <Clock className="h-10 w-10 text-primary" />,
    value: "<15ms",
    label: "Average Latency",
    description: "For seamless experience",
  },
];

const Stats = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-muted/20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass-card p-6 text-center transition-all duration-300 hover:translate-y-[-5px]"
            >
              <div className="inline-flex items-center justify-center glass-card p-4 rounded-full mb-4">
                {stat.icon}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">
                {stat.value}
              </h3>
              <p className="text-lg font-medium mb-2">{stat.label}</p>
              <p className="text-sm text-gray-400">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
