"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CategoryCard } from "@/components/animations/CategoryCard";
import { CATEGORIES } from "@/lib/constants";

// Create category groups with PNG images
const categories = [
  {
    title: "Top 100 Staffing Leaders to Watch in 2026",
    description: "Recognizing the most influential leaders shaping the future of staffing",
    iconImage: "/Role Specific.png",
    gradient: "bg-orange-500",
    badges: [{ id: "top-100-staffing-leaders-2026", label: "Top 100 Staffing Leaders to Watch in 2026" }]
  },
  {
    title: "Top 100 Staffing Companies to Work for in 2026", 
    description: "The best companies creating exceptional workplace experiences",
    iconImage: "/Culture & Impact.png",
    gradient: "bg-slate-700",
    badges: [{ id: "top-100-staffing-companies-2026", label: "Top 100 Staffing Companies to Work for in 2026" }]
  },
  {
    title: "Top 100 Recruiters to work with in 2026",
    description: "Outstanding recruiters delivering exceptional results", 
    iconImage: "/Growth & Performance.png",
    gradient: "bg-slate-700",
    badges: [{ id: "top-100-recruiters-2026", label: "Top 100 Recruiters to work with in 2026" }]
  }
];

export function CategoriesSection() {
  return (
    <ScrollReveal>
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Award Categories</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Recognizing excellence across multiple dimensions of the staffing industry
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.title}
                title={category.title}
                description={category.description}
                iconImage={category.iconImage}
                gradient={category.gradient}
                badges={category.badges}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}