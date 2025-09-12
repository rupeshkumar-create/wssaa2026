"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WSAButton } from "@/components/ui/wsa-button";
import { Award } from "lucide-react";
import { useVotingStatus } from "@/hooks/useVotingStatus";
import { useState, useEffect } from "react";

export function Navigation() {
  const pathname = usePathname();
  const votingStatus = useVotingStatus();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Show "Nominate Now" before voting opens, "Vote Now" after
  const showNominate = !mounted || votingStatus.loading ? false : !votingStatus.isVotingOpen;

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };



  return (
    <>
      <nav className="border-b backdrop-blur supports-[backdrop-filter]:bg-background/60" style={{ backgroundColor: '#EBF1F5' }}>
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
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
              <Award className="h-8 w-8 text-primary hidden" />
            </Link>

            {/* Navigation Links - Centered */}
            <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              {/* Show Nominate link only when nominations are open and voting is closed */}
              {showNominate && (
                <Link 
                  href="/nominate" 
                  className={`text-sm font-medium transition-colors theme-nav-menu-item hover:theme-nav-menu-item ${
                    isActive("/nominate") ? "theme-nav-menu-item active" : "theme-nav-menu-item"
                  }`}
                >
                  Nominate
                </Link>
              )}
              <Link 
                href="/nominees" 
                className={`text-sm font-medium transition-colors theme-nav-menu-item hover:theme-nav-menu-item ${
                  isActive("/nominees") ? "theme-nav-menu-item active" : "theme-nav-menu-item"
                }`}
              >
                Nominees
              </Link>
              <Link 
                href="/about" 
                className={`text-sm font-medium transition-colors theme-nav-menu-item hover:theme-nav-menu-item ${
                  isActive("/about") ? "theme-nav-menu-item active" : "theme-nav-menu-item"
                }`}
              >
                About
              </Link>
            </div>

            {/* CTA Button - Dynamic based on voting status */}
            <div className="flex items-center gap-2 sm:gap-4">
              <WSAButton asChild variant="primary" className="hidden sm:inline-flex">
                <Link href={showNominate ? "/nominate" : "/nominees"}>
                  {showNominate ? "Nominate Now" : "Vote Now"}
                </Link>
              </WSAButton>
            </div>
          </div>
        </div>
      </nav>


    </>
  );
}