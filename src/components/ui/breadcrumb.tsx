"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center"
      >
        <Link 
          href="/" 
          className="flex items-center text-gray-500 hover:text-orange-500 transition-colors"
        >
          <Home className="h-4 w-4" />
        </Link>
      </motion.div>
      
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center"
        >
          <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
          {item.href ? (
            <Link 
              href={item.href}
              className="text-gray-500 hover:text-orange-500 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </motion.div>
      ))}
    </nav>
  );
}