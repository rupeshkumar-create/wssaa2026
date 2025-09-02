"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { useNominationStatus } from "@/hooks/useNominationStatus";
import { useState, useEffect } from "react";
import { NominationClosedDialog } from "@/components/NominationClosedDialog";

export function Navigation() {
  const pathname = usePathname();
  const nominationStatus = useNominationStatus();
  const [mounted, setMounted] = useState(false);
  const [showClosedDialog, setShowClosedDialog] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Prevent hydration mismatch by showing default text until mounted and loaded
  const showNominate = !mounted || nominationStatus.loading ? false : nominationStatus.enabled;

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleNominateClick = (e: React.MouseEvent) => {
    if (!nominationStatus.enabled && !nominationStatus.loading) {
      e.preventDefault();
      setShowClosedDialog(true);
    }
  };

  return (
    <>
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Award className="h-6 w-6 text-primary" />
              World Staffing Awards 2026
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link 
                href="/" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Home
              </Link>
              {/* Show Nominate link when nominations are open */}
              {showNominate && (
                <Link 
                  href="/nominate" 
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive("/nominate") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Nominate
                </Link>
              )}
              {/* Show Nominate link when nominations are closed but handle click */}
              {!showNominate && !nominationStatus.loading && (
                <button
                  onClick={handleNominateClick}
                  className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                >
                  Nominate
                </button>
              )}
              <Link 
                href="/directory" 
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/directory") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Directory
              </Link>
            </div>

            {/* CTA Button - Always Vote Now */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button asChild className="hidden sm:inline-flex">
                <Link href="/directory">
                  Vote Now
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Nomination Closed Dialog */}
      <NominationClosedDialog
        isOpen={showClosedDialog}
        onClose={() => setShowClosedDialog(false)}
        message={nominationStatus.closeMessage}
      />
    </>
  );
}