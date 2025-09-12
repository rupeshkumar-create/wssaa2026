"use client";

import Link from "next/link";
import { Award } from "lucide-react";
import { ReduceMotionToggle } from "@/components/animations/MotionProvider";

export function Footer() {
  return (
    <footer className="border-t backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ backgroundColor: '#F2F6F7' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <img 
                src="/wss-logo.svg" 
                alt="World Staffing Awards 2026" 
                className="h-10 w-auto hover:opacity-80 transition-opacity"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <Award className="h-8 w-8 text-brand-500 hidden" />
            </Link>
            <p className="text-muted-foreground max-w-md">
              Celebrating excellence in the global staffing industry since 2021. Recognizing outstanding 
              individuals and companies making a difference in talent acquisition and workforce solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/nominate" className="text-muted-foreground hover:text-foreground transition-colors">
                  Submit Nomination
                </Link>
              </li>
              <li>
                <Link href="/nominees" className="text-muted-foreground hover:text-foreground transition-colors">
                  View Nominees
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="https://www.candidately.com/worldstaffingsummit" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  World Staffing Summit
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/nominees?category=Top%20Recruiter" className="text-muted-foreground hover:text-foreground transition-colors">
                  Top Recruiter
                </Link>
              </li>
              <li>
                <Link href="/nominees?category=Top%20Executive%20Leader" className="text-muted-foreground hover:text-foreground transition-colors">
                  Executive Leader
                </Link>
              </li>
              <li>
                <Link href="/nominees?category=Rising%20Star" className="text-muted-foreground hover:text-foreground transition-colors">
                  Rising Star
                </Link>
              </li>
              <li>
                <Link href="/nominees?category=AI-Driven%20Platform" className="text-muted-foreground hover:text-foreground transition-colors">
                  AI Platform
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © 2026 World Staffing Awards. Part of the{' '}
            <a href="https://www.candidately.com/worldstaffingsummit" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline">
              World Staffing Summit
            </a>
            . All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <ReduceMotionToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}