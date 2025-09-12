"use client";

import { NominationWithVotes } from "@/lib/types";
import { CardNominee } from "./CardNominee";

interface GridProps {
  nominations: NominationWithVotes[];
}

export function Grid({ nominations }: GridProps) {
  // Safety check for nominations array
  if (!nominations || !Array.isArray(nominations) || nominations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No nominees found matching your criteria.</p>
      </div>
    );
  }

  // Show all nominees in a flat grid without grouping
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {nominations.map((nomination) => (
        <CardNominee
          key={nomination.id}
          nomination={nomination}
        />
      ))}
    </div>
  );
}