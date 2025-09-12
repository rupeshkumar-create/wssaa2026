"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { CategoryCard } from "@/components/animations/CategoryCard";
import { CATEGORIES } from "@/lib/constants";

// Create category groups with PNG images
const categories = [
  {
    title: "Role-Specific Excellence",
    description: "Recognizing outstanding individual contributors",
    iconImage: "/Role Specific.png",
    gradient: "bg-slate-700",
    badges: CATEGORIES.filter(c => c.group === 'role-specific-excellence').map(c => ({ id: c.id, label: c.label }))
  },
  {
    title: "Innovation & Technology", 
    description: "Leading the future of staffing technology",
    iconImage: "/Innovation & Technology.png",
    gradient: "bg-slate-700",
    badges: CATEGORIES.filter(c => c.group === 'innovation-technology').map(c => ({ id: c.id, label: c.label }))
  },
  {
    title: "Culture & Impact",
    description: "Making a positive difference in the industry", 
    iconImage: "/Culture & Impact.png",
    gradient: "bg-slate-700",
    badges: CATEGORIES.filter(c => c.group === 'culture-impact').map(c => ({ id: c.id, label: c.label }))
  },
  {
    title: "Growth & Performance",
    description: "Excellence in operations and thought leadership",
    iconImage: "/Growth & Performance.png", 
    gradient: "bg-slate-700",
    badges: CATEGORIES.filter(c => c.group === 'growth-performance').map(c => ({ id: c.id, label: c.label }))
  },
  {
    title: "Geographic Excellence",
    description: "Regional and global recognition",
    iconImage: "/Geographic Excellence.png",
    gradient: "bg-orange-500", 
    badges: CATEGORIES.filter(c => c.group === 'geographic-excellence').map(c => ({ id: c.id, label: c.label }))
  },
  {
    title: "Special Recognition",
    description: "Unique contributions to the industry",
    iconImage: "/Special Recognition.png",
    gradient: "bg-slate-700",
    badges: CATEGORIES.filter(c => c.group === 'special-recognition').map(c => ({ id: c.id, label: c.label }))
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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