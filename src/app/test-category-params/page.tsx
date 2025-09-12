"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TestContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">URL Parameters Test</h1>
        
        <div className="bg-gray-100 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Current URL Parameters:</h2>
          <div className="space-y-2">
            <p><strong>category:</strong> {category || 'null'}</p>
            <p><strong>q:</strong> {q || 'null'}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Links:</h2>
          <div className="space-y-2">
            <a 
              href="/test-category-params?category=top-recruiter" 
              className="block p-3 bg-blue-100 hover:bg-blue-200 rounded"
            >
              Test: category=top-recruiter
            </a>
            <a 
              href="/test-category-params?category=top-executive-leader" 
              className="block p-3 bg-blue-100 hover:bg-blue-200 rounded"
            >
              Test: category=top-executive-leader
            </a>
            <a 
              href="/nominees?category=top-recruiter" 
              className="block p-3 bg-green-100 hover:bg-green-200 rounded"
            >
              Go to nominees with category=top-recruiter
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestCategoryParams() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestContent />
    </Suspense>
  );
}