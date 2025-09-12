'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Nominee {
  id: number;
  nominee_name: string;
  nominee_image?: string;
  category: string;
  company_name?: string;
}

export default function NomineeBackgroundCards() {
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNominees = async () => {
      try {
        const response = await fetch('/api/nominees?limit=50&random=true');
        if (response.ok) {
          const data = await response.json();
          setNominees(data.nominees || []);
        }
      } catch (error) {
        console.error('Failed to fetch nominees for background:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNominees();
  }, []);

  if (loading || nominees.length === 0) {
    return null;
  }

  // Split nominees into two rows
  const topRowNominees = nominees.slice(0, 25);
  const bottomRowNominees = nominees.slice(25, 50);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Top row - moving left to right */}
      <div className="absolute top-20 left-0 w-full">
        <div className="flex animate-scroll-right">
          {[...topRowNominees, ...topRowNominees].map((nominee, index) => (
            <NomineeCard key={`top-${nominee.id}-${index}`} nominee={nominee} />
          ))}
        </div>
      </div>

      {/* Bottom row - moving right to left */}
      <div className="absolute bottom-20 left-0 w-full">
        <div className="flex animate-scroll-left">
          {[...bottomRowNominees, ...bottomRowNominees].map((nominee, index) => (
            <NomineeCard key={`bottom-${nominee.id}-${index}`} nominee={nominee} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NomineeCard({ nominee }: { nominee: Nominee }) {
  return (
    <div className="flex-shrink-0 mx-4 opacity-10 hover:opacity-20 transition-opacity duration-300">
      <div className="w-32 h-40 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-3 shadow-lg">
        <div className="w-full h-20 relative mb-2 rounded-md overflow-hidden bg-gray-200/20">
          {nominee.nominee_image ? (
            <Image
              src={nominee.nominee_image}
              alt={nominee.nominee_name}
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400/20 to-orange-600/20 flex items-center justify-center">
              <span className="text-white/60 text-xs font-medium">
                {nominee.nominee_name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div className="text-white/70 text-xs font-medium truncate mb-1">
          {nominee.nominee_name}
        </div>
        <div className="text-white/50 text-xs truncate mb-1">
          {nominee.company_name}
        </div>
        <div className="text-orange-400/60 text-xs truncate">
          {nominee.category}
        </div>
      </div>
    </div>
  );
}