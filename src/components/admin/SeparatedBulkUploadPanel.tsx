"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  Eye,
  User,
  Building,
  Clock,
  CheckSquare
} from "lucide-react";

interface SeparatedBulkUploadPanelProps {
  onUploadComplete?: () => void;
}

interface UploadBatch {
  id: string;
  filename: string;
  upload_type: 'person' | 'company';
  total_rows: number;
  processed_rows: number;
  successful_rows: number;
  failed_rows: number;
  draft_rows: number;
  approved_rows: number;
  status: 'processing' | 'completed' | 'failed';
  uploaded_at: string;
  error_summary?: string;
}

interface UploadError {
  row_number: number;
  field_name?: string;
  error_message: string;
  raw_data?: any;
}

export function SeparatedBulkUploadPanel({ onUploadComplete }: SeparatedBulkUploadPanelProps) {
  const [activeTab, setActiveTab] = useState<'person' | 'company'>('person');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [recentBatches, setRecentBatches] = useState<UploadBatch[]>([]);
  const [selectedBatchErrors, setSelectedBatchErrors] = useState<UploadError[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const personFileInputRef = useRef<HTMLInputElement>(null);
  const companyFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch recent upload batches
  const fetchRecentBatches = async () => {
    try {
      const response = await fetch('/api/admin/separated-bulk-upload/batches');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setRecentBatches(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  // Fetch errors for a specific batch
  const fetchBatchErrors = async (batchId: string) => {
    try {
      const response = await fetch(`/api/admin/separated-bulk-upload/batches/${batchId}/errors`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSelectedBatchErrors(result.data);
          setShowErrors(true);
        }
      }
    } catch (error) {
      console.error('Error fetching batch errors:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'person' | 'company') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/admin/separated-bulk-upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadResult(result.data);
        setSuccess(`Upload completed! ${result.data.successful_rows} ${type} nominees uploaded to draft status.`);
        
        // Refresh batches list
        await fetchRecentBatches();
        
        // Notify parent component
        if (onUploadComplete) {
          onUploadComplete();
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      
      // Clear file input
      const inputRef = type === 'person' ? personFileInputRef : companyFileInputRef;
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  // Download CSV templates
  const downloadPersonTemplate = () => {
    const csvContent = `first_name,last_name,job_title,company_name,email,phone,country,linkedin,bio,achievements,why_vote_for_me,headshot_url,category,nominator_name,nominator_email,nominator_company,nominator_job_title,nominator_phone,nominator_country
John,Smith,Senior Recruitment Consultant,TechTalent Solutions,john.smith@techtalent.com,+1-555-123-4567,United States,https://linkedin.com/in/johnsmith,"Experienced recruiter with 10+ years in technology recruitment, specializing in AI and machine learning roles.","Placed 500+ candidates in 2024, 95% retention rate, $50M+ in placements","Outstanding performance in tech recruitment with exceptional client satisfaction and candidate experience",https://example.com/headshots/john-smith.jpg,top-recruiter,Sarah Johnson,sarah.j@client.com,Innovation Corp,Talent Director,+1-555-987-6543,United States
Maria,Garcia,VP of Talent Acquisition,Global Staffing Inc,maria.garcia@globalstaffing.com,+44-20-1234-5678,United Kingdom,https://linkedin.com/in/mariagarcia,"Talent acquisition leader with expertise in building diverse teams across Europe and North America.","Built talent acquisition teams for 3 unicorn startups, 40% improvement in time-to-hire","Innovative approach to talent acquisition with focus on diversity and inclusion",https://example.com/headshots/maria-garcia.jpg,top-recruiting-leader-europe,David Wilson,david.w@startup.com,TechStart Ltd,CEO,+44-20-9876-5432,United Kingdom
Alex,Chen,Chief Recruitment Officer,AI Staffing Pro,alex.chen@aistaffing.com,+1-555-234-5678,United States,https://linkedin.com/in/alexchen,"Executive leader driving AI-powered recruitment strategies and building world-class teams.","Led $100M+ recruitment initiatives, 50% faster hiring cycles using AI","Pioneering AI-driven recruitment methodologies with proven ROI",https://example.com/headshots/alex-chen.jpg,top-executive-leader,Jennifer Lee,jennifer.l@enterprise.com,Enterprise Solutions,CHRO,+1-555-345-6789,United States
Emma,Thompson,Senior Recruiter,European Talent Hub,emma.thompson@europetalent.com,+33-1-23-45-67-89,France,https://linkedin.com/in/emmathompson,"Rising star in European recruitment with specialization in fintech and blockchain roles.","Top performer under 30, 200+ successful placements in 18 months","Exceptional talent identification skills and strong candidate relationships",https://example.com/headshots/emma-thompson.jpg,rising-star-under-30,Michael Brown,michael.b@fintech.com,FinTech Innovations,Head of Talent,+33-1-98-76-54-32,France
Robert,Johnson,Staffing Influencer,Recruitment Insights,robert.johnson@recinsights.com,+1-555-456-7890,United States,https://linkedin.com/in/robertjohnson,"Thought leader in staffing industry with 100K+ LinkedIn followers and popular recruitment blog.","Published 50+ articles, 500K+ blog views, keynote speaker at 20+ conferences","Leading voice in recruitment trends and best practices",https://example.com/headshots/robert-johnson.jpg,top-staffing-influencer,Lisa Davis,lisa.d@media.com,Staffing Media,Editor,+1-555-567-8901,United States
Sophie,Martin,Recruitment Coach,Talent Development Pro,sophie.martin@talentdev.com,+49-30-12345678,Germany,https://linkedin.com/in/sophiemartin,"Certified recruitment coach helping recruiters and hiring managers improve their skills.","Trained 1000+ recruiters, 90% improvement in performance metrics","Exceptional coaching abilities with proven track record in talent development",https://example.com/headshots/sophie-martin.jpg,top-staffing-educator,Thomas Mueller,thomas.m@consulting.com,HR Consulting Group,Managing Director,+49-30-87654321,Germany
James,Wilson,Global Recruitment Director,WorldWide Staffing,james.wilson@worldwide.com,+61-2-1234-5678,Australia,https://linkedin.com/in/jameswilson,"Global recruitment leader managing teams across 15 countries with focus on executive search.","Managed $200M+ in global placements, built teams in 15 countries","Exceptional global leadership and cross-cultural recruitment expertise",https://example.com/headshots/james-wilson.jpg,top-global-recruiter,Anna Schmidt,anna.s@multinational.com,Global Enterprises,VP HR,+61-2-8765-4321,Australia
Rachel,Anderson,Thought Leader,Staffing Strategy Consulting,rachel.anderson@staffstrategy.com,+1-555-678-9012,United States,https://linkedin.com/in/rachelanderson,"Strategic consultant helping staffing firms optimize their operations and growth strategies.","Consulted for 100+ staffing firms, average 30% revenue increase","Deep expertise in staffing industry strategy and operational excellence",https://example.com/headshots/rachel-anderson.jpg,top-thought-leader,Mark Taylor,mark.t@staffingfirm.com,Premier Staffing,President,+1-555-789-0123,United States`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'person_nominations_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const downloadCompanyTemplate = () => {
    const csvContent = `company_name,website,email,phone,country,industry,company_size,bio,achievements,why_vote_for_me,logo_url,category,nominator_name,nominator_email,nominator_company,nominator_job_title,nominator_phone,nominator_country
TechTalent Solutions,https://www.techtalent.com,info@techtalent.com,+1-555-123-4567,United States,Technology Recruitment,100-200 employees,"Leading technology recruitment agency specializing in AI, machine learning, and software engineering roles.","Placed 2000+ tech professionals in 2024, 95% client satisfaction, $100M+ in placements","Consistently delivers top-tier technology talent with exceptional speed and quality",https://techtalent.com/logo.png,top-staffing-company-usa,Sarah Johnson,sarah.j@client.com,Innovation Corp,Talent Director,+1-555-987-6543,United States
European Talent Hub,https://www.europetalent.com,contact@europetalent.com,+33-1-23-45-67-89,France,Executive Search,50-100 employees,"Premier executive search firm serving European markets with focus on C-level and senior management roles.","Completed 500+ executive searches, 98% success rate, average 45 days time-to-fill","Exceptional executive search capabilities with deep European market knowledge",https://europetalent.com/logo.png,top-staffing-company-europe,Michael Brown,michael.b@enterprise.com,Enterprise Solutions,CEO,+33-1-98-76-54-32,France
AI Staffing Pro,https://www.aistaffing.com,hello@aistaffing.com,+1-555-234-5678,United States,AI-Powered Recruitment,20-50 employees,"Revolutionary AI-driven staffing platform using machine learning to match candidates with perfect roles.","50% faster placements, 90% candidate satisfaction, 200% ROI for clients","Pioneering AI technology that transforms the recruitment experience",https://aistaffing.com/logo.png,top-ai-driven-staffing-platform,Jennifer Lee,jennifer.l@techcorp.com,TechCorp Industries,CTO,+1-555-345-6789,United States
Women Leaders Staffing,https://www.womenleaders.com,info@womenleaders.com,+1-555-345-6789,United States,Diversity Recruitment,30-50 employees,"Women-led staffing firm focused on promoting diversity and inclusion in the workplace.","Increased diversity hiring by 60% for clients, 100% women leadership team","Leading the charge in diversity and inclusion with measurable impact",https://womenleaders.com/logo.png,top-women-led-staffing-firm,Lisa Davis,lisa.d@diversity.com,Diversity First,Chief Diversity Officer,+1-555-456-7890,United States
RapidGrow Staffing,https://www.rapidgrow.com,growth@rapidgrow.com,+1-555-456-7890,United States,General Staffing,200-500 employees,"Fastest growing staffing firm with 300% revenue growth in the past 2 years.","300% revenue growth, expanded to 15 new markets, 5000+ placements","Exceptional growth trajectory with scalable business model",https://rapidgrow.com/logo.png,fastest-growing-staffing-firm,Robert Johnson,robert.j@investor.com,Growth Capital,Managing Partner,+1-555-567-8901,United States
Digital Experience Staffing,https://www.digitalexp.com,contact@digitalexp.com,+49-30-12345678,Germany,Digital Recruitment,75-100 employees,"Innovative staffing firm providing exceptional digital experience for both clients and candidates.","Award-winning digital platform, 99% user satisfaction, 40% faster hiring","Revolutionary digital experience that sets new industry standards",https://digitalexp.com/logo.png,top-digital-experience-for-clients,Thomas Mueller,thomas.m@digital.com,Digital Innovations,Head of Digital,+49-30-87654321,Germany
Staffing Podcast Network,https://www.staffingpodcast.com,podcast@staffingpodcast.com,+1-555-567-8901,United States,Media & Education,10-20 employees,"Leading staffing industry podcast network with 500K+ monthly listeners and top industry guests.","500K+ monthly listeners, 200+ episodes, top industry thought leaders","Most influential staffing podcast driving industry conversations",https://staffingpodcast.com/logo.png,best-staffing-podcast-or-show,Emma Thompson,emma.t@media.com,Staffing Media Group,Content Director,+1-555-678-9012,United States
Global Staffing Solutions,https://www.globalstaffing.com,global@globalstaffing.com,+44-20-1234-5678,United Kingdom,International Staffing,500+ employees,"Premier global staffing company operating in 25+ countries with comprehensive talent solutions.","Operating in 25+ countries, 50000+ placements annually, $500M+ revenue","Unmatched global reach and comprehensive talent solutions",https://globalstaffing.com/logo.png,top-global-staffing-company,Sophie Martin,sophie.m@multinational.com,Global Enterprises,Global HR Director,+44-20-8765-4321,United Kingdom
AI Platform Europe,https://www.aiplatform.eu,info@aiplatform.eu,+31-20-1234567,Netherlands,AI Technology,25-50 employees,"Leading European AI-driven staffing platform revolutionizing recruitment across European markets.","Serving 15 European countries, 80% faster matching, 95% accuracy rate","Most advanced AI recruitment technology in European market",https://aiplatform.eu/logo.png,top-ai-driven-platform-europe,James Wilson,james.w@eurotech.com,EuroTech Solutions,Innovation Director,+31-20-7654321,Netherlands`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'company_nominations_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Approve draft nominations
  const approveDraftNominations = async (batchId: string) => {
    try {
      const response = await fetch('/api/admin/separated-bulk-upload/approve-drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ batchId })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(`Successfully approved ${result.data.approved_count} nominations and synced to Loops!`);
        await fetchRecentBatches();
      } else {
        throw new Error(result.error || 'Approval failed');
      }
    } catch (error) {
      console.error('Approval error:', error);
      setError(error instanceof Error ? error.message : 'Approval failed');
    }
  };

  // Load recent batches on component mount
  React.useEffect(() => {
    fetchRecentBatches();
  }, []);

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Separated Bulk Upload System
          </CardTitle>
          <CardDescription>
            Upload person and company nominations separately with comprehensive category examples. All uploads go to draft status for approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'person' | 'company')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="person" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Person Nominations
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company Nominations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="person" className="space-y-4">
              {/* Error/Success Alerts */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Person Template Download */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                <div>
                  <h4 className="font-medium">Person Nominations CSV Template</h4>
                  <p className="text-sm text-muted-foreground">
                    Includes examples for all person categories: Top Recruiter, Executive Leader, Rising Star, etc.
                  </p>
                </div>
                <Button variant="outline" onClick={downloadPersonTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Person Template
                </Button>
              </div>

              {/* Person File Upload */}
              <div className="space-y-2">
                <Label htmlFor="person-csv-file">Select Person Nominations CSV File</Label>
                <Input
                  id="person-csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, 'person')}
                  disabled={uploading}
                  ref={personFileInputRef}
                />
                <p className="text-xs text-muted-foreground">
                  Upload person nominations (recruiters, leaders, influencers, etc.)
                </p>
              </div>
            </TabsContent>

            <TabsContent value="company" className="space-y-4">
              {/* Error/Success Alerts */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Company Template Download */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-purple-50">
                <div>
                  <h4 className="font-medium">Company Nominations CSV Template</h4>
                  <p className="text-sm text-muted-foreground">
                    Includes examples for all company categories: Staffing Firms, AI Platforms, Podcasts, etc.
                  </p>
                </div>
                <Button variant="outline" onClick={downloadCompanyTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Company Template
                </Button>
              </div>

              {/* Company File Upload */}
              <div className="space-y-2">
                <Label htmlFor="company-csv-file">Select Company Nominations CSV File</Label>
                <Input
                  id="company-csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileUpload(e, 'company')}
                  disabled={uploading}
                  ref={companyFileInputRef}
                />
                <p className="text-xs text-muted-foreground">
                  Upload company nominations (staffing firms, platforms, agencies, etc.)
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Processing {activeTab} nominations upload...</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium mb-2">Upload Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-600">{uploadResult.total_rows}</div>
                  <div className="text-muted-foreground">Total Rows</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">{uploadResult.successful_rows}</div>
                  <div className="text-muted-foreground">Successful</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">{uploadResult.failed_rows}</div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
                <div>
                  <div className="font-medium text-orange-600">{uploadResult.draft_rows}</div>
                  <div className="text-muted-foreground">Draft Status</div>
                </div>
                <div>
                  <div className="font-medium text-purple-600">{uploadResult.upload_type}</div>
                  <div className="text-muted-foreground">Type</div>
                </div>
              </div>
              {uploadResult.failed_rows > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => fetchBatchErrors(uploadResult.batch_id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Errors
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Uploads with Draft Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Uploads & Draft Management
          </CardTitle>
          <CardDescription>
            View recent uploads and approve draft nominations for Loops sync
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentBatches.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent uploads found
            </p>
          ) : (
            <div className="space-y-3">
              {recentBatches.map((batch) => (
                <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{batch.filename}</span>
                      <Badge 
                        variant={
                          batch.status === 'completed' ? 'default' :
                          batch.status === 'failed' ? 'destructive' : 'secondary'
                        }
                      >
                        {batch.status}
                      </Badge>
                      <Badge variant="outline">
                        {batch.upload_type === 'person' ? (
                          <><User className="h-3 w-3 mr-1" /> Person</>
                        ) : (
                          <><Building className="h-3 w-3 mr-1" /> Company</>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{batch.total_rows} total</span>
                      <span className="text-green-600">{batch.successful_rows} success</span>
                      {batch.failed_rows > 0 && (
                        <span className="text-red-600">{batch.failed_rows} failed</span>
                      )}
                      <span className="text-orange-600">{batch.draft_rows} draft</span>
                      <span className="text-blue-600">{batch.approved_rows} approved</span>
                      <span>{new Date(batch.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {batch.draft_rows > 0 && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => approveDraftNominations(batch.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Approve {batch.draft_rows} Drafts
                      </Button>
                    )}
                    {batch.failed_rows > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchBatchErrors(batch.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Details Modal */}
      {showErrors && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Upload Errors
              </span>
              <Button variant="ghost" size="sm" onClick={() => setShowErrors(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedBatchErrors.length === 0 ? (
              <p className="text-muted-foreground">No errors found</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedBatchErrors.map((error, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-red-50">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="destructive">Row {error.row_number}</Badge>
                      {error.field_name && (
                        <Badge variant="outline">{error.field_name}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-red-800">{error.error_message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Separated Upload System Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Person Nominations
              </h4>
              <div className="text-sm space-y-2">
                <p><strong>Categories included:</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Top Recruiter</li>
                  <li>Top Executive Leader</li>
                  <li>Rising Star Under 30</li>
                  <li>Top Staffing Influencer</li>
                  <li>Top Staffing Educator</li>
                  <li>Top Thought Leader</li>
                  <li>Regional categories (USA, Europe, Global)</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Company Nominations
              </h4>
              <div className="text-sm space-y-2">
                <p><strong>Categories included:</strong></p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Top Staffing Company</li>
                  <li>Top AI-Driven Platform</li>
                  <li>Top Women-Led Staffing Firm</li>
                  <li>Fastest Growing Staffing Firm</li>
                  <li>Best Staffing Podcast</li>
                  <li>Top Digital Experience</li>
                  <li>Regional categories (USA, Europe, Global)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Workflow Process</h4>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-medium">1</div>
                <div>
                  <strong>Download Template:</strong> Choose person or company template with comprehensive examples
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-medium">2</div>
                <div>
                  <strong>Upload to Draft:</strong> All nominations are saved as drafts for review
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-medium">3</div>
                <div>
                  <strong>Manual Approval:</strong> Review and approve draft nominations in batches
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-medium">4</div>
                <div>
                  <strong>Loops Sync:</strong> Approved nominations automatically sync to correct Loops user groups
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Nominator fields can be left empty - admin can approve without nominator details</li>
              <li>• Each template includes realistic examples for all available categories</li>
              <li>• Draft status allows for quality control before public visibility</li>
              <li>• Loops integration assigns nominees to appropriate user groups based on type and category</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}