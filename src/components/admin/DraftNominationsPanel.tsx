"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";

interface DraftNomination {
  id: string;
  nomination_type: 'person' | 'company';
  state: string;
  created_at: string;
  admin_notes?: string;
  
  // Person fields
  firstname?: string;
  lastname?: string;
  jobtitle?: string;
  person_email?: string;
  person_linkedin?: string;
  person_phone?: string;
  person_company?: string;
  person_country?: string;
  headshot_url?: string;
  why_me?: string;
  
  // Company fields
  company_name?: string;
  company_website?: string;
  company_linkedin?: string;
  company_email?: string;
  company_phone?: string;
  company_country?: string;
  company_size?: string;
  company_industry?: string;
  logo_url?: string;
  why_us?: string;
  
  // Shared fields
  bio?: string;
  achievements?: string;
  
  // Category info
  subcategories: {
    id: string;
    name: string;
    category_groups: {
      id: string;
      name: string;
    };
  };
}

interface DraftNominationsPanelProps {
  onRefresh?: () => void;
}

export function DraftNominationsPanel({ onRefresh }: DraftNominationsPanelProps) {
  const [drafts, setDrafts] = useState<DraftNomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/nominations/drafts');
      const data = await response.json();
      
      if (data.success) {
        setDrafts(data.data || []);
      } else {
        setResult({ error: data.error || 'Failed to load drafts' });
      }
    } catch (error) {
      console.error('Failed to load drafts:', error);
      setResult({ error: 'Failed to load draft nominations' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

  const handleApprove = async (draftId: string) => {
    setApproving(draftId);
    setResult(null);

    try {
      const response = await fetch('/api/admin/nominations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nominationId: draftId })
      });

      const data = await response.json();

      if (data.success) {
        setResult({ success: true });
        // Remove the approved draft from the list
        setDrafts(prev => prev.filter(d => d.id !== draftId));
        onRefresh?.();
      } else {
        setResult({ error: data.error || 'Failed to approve nomination' });
      }
    } catch (error) {
      console.error('Approval error:', error);
      setResult({ error: 'Failed to approve nomination' });
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (draftId: string) => {
    // TODO: Implement rejection logic
    console.log('Reject draft:', draftId);
  };

  const getDisplayName = (draft: DraftNomination) => {
    if (draft.nomination_type === 'person') {
      return `${draft.firstname || ''} ${draft.lastname || ''}`.trim();
    }
    return draft.company_name || '';
  };

  const getContactEmail = (draft: DraftNomination) => {
    return draft.nomination_type === 'person' ? draft.person_email : draft.company_email;
  };

  const getLinkedInUrl = (draft: DraftNomination) => {
    return draft.nomination_type === 'person' ? draft.person_linkedin : draft.company_linkedin;
  };

  const getPhone = (draft: DraftNomination) => {
    return draft.nomination_type === 'person' ? draft.person_phone : draft.company_phone;
  };

  const getCountry = (draft: DraftNomination) => {
    return draft.nomination_type === 'person' ? draft.person_country : draft.company_country;
  };

  const getWhyVote = (draft: DraftNomination) => {
    return draft.nomination_type === 'person' ? draft.why_me : draft.why_us;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Draft Nominations
          </CardTitle>
          <CardDescription>
            Nominations pending approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading drafts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Draft Nominations
              {drafts.length > 0 && (
                <Badge variant="secondary">{drafts.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Nominations pending approval
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadDrafts}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {result.success 
                ? "Nomination approved successfully! The nominee has been notified via email."
                : result.error
              }
            </AlertDescription>
          </Alert>
        )}

        {drafts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No draft nominations pending approval</p>
          </div>
        ) : (
          <div className="space-y-4">
            {drafts.map((draft) => (
              <Card key={draft.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        {draft.nomination_type === 'person' ? (
                          <User className="h-5 w-5 text-orange-600" />
                        ) : (
                          <Building2 className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{getDisplayName(draft)}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">
                            {draft.subcategories.category_groups.name}
                          </Badge>
                          <span>•</span>
                          <span>{draft.subcategories.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(draft.id)}
                        disabled={approving === draft.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {approving === draft.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {approving === draft.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(draft.id)}
                        disabled={approving === draft.id}
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Information */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Contact Information</h4>
                      {getContactEmail(draft) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{getContactEmail(draft)}</span>
                        </div>
                      )}
                      {getPhone(draft) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{getPhone(draft)}</span>
                        </div>
                      )}
                      {getLinkedInUrl(draft) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Linkedin className="h-4 w-4 text-muted-foreground" />
                          <a 
                            href={getLinkedInUrl(draft)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            LinkedIn Profile
                          </a>
                        </div>
                      )}
                      {getCountry(draft) && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span>{getCountry(draft)}</span>
                        </div>
                      )}
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Additional Details</h4>
                      {draft.nomination_type === 'person' && draft.jobtitle && (
                        <div className="text-sm">
                          <span className="font-medium">Job Title:</span> {draft.jobtitle}
                        </div>
                      )}
                      {draft.nomination_type === 'person' && draft.person_company && (
                        <div className="text-sm">
                          <span className="font-medium">Company:</span> {draft.person_company}
                        </div>
                      )}
                      {draft.nomination_type === 'company' && draft.company_website && (
                        <div className="text-sm">
                          <span className="font-medium">Website:</span> 
                          <a 
                            href={draft.company_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline ml-1"
                          >
                            {draft.company_website}
                          </a>
                        </div>
                      )}
                      {draft.nomination_type === 'company' && draft.company_size && (
                        <div className="text-sm">
                          <span className="font-medium">Size:</span> {draft.company_size}
                        </div>
                      )}
                      {draft.nomination_type === 'company' && draft.company_industry && (
                        <div className="text-sm">
                          <span className="font-medium">Industry:</span> {draft.company_industry}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Why Vote Section */}
                  {getWhyVote(draft) && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">
                        Why vote for this {draft.nomination_type}?
                      </h4>
                      <p className="text-sm bg-gray-50 p-3 rounded-md">
                        {getWhyVote(draft)}
                      </p>
                    </div>
                  )}

                  {/* Admin Notes */}
                  {draft.admin_notes && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Admin Notes</h4>
                      <p className="text-sm bg-blue-50 p-3 rounded-md">
                        {draft.admin_notes}
                      </p>
                    </div>
                  )}

                  {/* Submission Date */}
                  <div className="mt-4 text-xs text-muted-foreground">
                    Created: {new Date(draft.created_at).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}