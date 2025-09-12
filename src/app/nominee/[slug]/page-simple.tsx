import { NextRequest } from 'next/server';

export default async function SimpleNomineeProfilePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  try {
    const { slug } = await params;
    
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Nominee Profile</h1>
            <p className="text-muted-foreground mb-6">
              Looking for nominee with ID/slug: {slug}
            </p>
            <p className="text-sm text-gray-500">
              This is a simplified version to test the routing.
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="text-muted-foreground mb-6">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </div>
      </div>
    );
  }
}