"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  Loader2
} from "lucide-react";

interface SimpleBulkUploadProps {
  onUploadComplete?: () => void;
}

export function SimpleBulkUpload({ onUploadComplete }: SimpleBulkUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    // Validate file size (max 5MB for simplicity)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/simple-bulk-upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadResult(result.data);
        setSuccess(`Upload completed! ${result.data.successful} nominees uploaded successfully.`);
        
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
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Download person CSV template
  const downloadPersonTemplate = () => {
    const csvContent = `firstname,lastname,email,phone,linkedin,jobtitle,company,country,bio,achievements,why_me,headshot_url,category,nominator_firstname,nominator_lastname,nominator_email,nominator_phone,nominator_company,nominator_country
John,Smith,john.smith@example.com,+44 20 1234 5678,https://linkedin.com/in/johnsmith,Senior Recruitment Consultant,ABC Recruitment Ltd,United Kingdom,Experienced recruiter with 10+ years in tech recruitment,Placed 500+ candidates in 2024,Outstanding performance and client satisfaction,https://example.com/headshot.jpg,top-recruiter,Jane,Doe,jane.doe@company.com,+44 20 9876 5432,XYZ Corp,United Kingdom
Sarah,Johnson,sarah.johnson@example.com,+1 555 123 4567,https://linkedin.com/in/sarahjohnson,Executive Search Director,Elite Executive Search,United States,Leading executive search professional with Fortune 500 experience,Successfully placed 200+ C-level executives,Exceptional leadership and strategic vision,https://example.com/sarah.jpg,top-executive-leader,Mike,Director,mike.director@client.com,+1 555 987 6543,Client Corp,United States
Emma,Wilson,emma.wilson@example.com,+61 2 9876 5432,https://linkedin.com/in/emmawilson,Talent Acquisition Specialist,NextGen Talent,Australia,Rising star in recruitment with innovative approaches,Achieved 150% of targets in first year,Fresh perspective and digital-native approach,https://example.com/emma.jpg,rising-star-under-30,Lisa,Manager,lisa.manager@firm.com,+61 2 1234 5678,Talent Firm,Australia
David,Brown,david.brown@example.com,+1 416 123 4567,https://linkedin.com/in/davidbrown,Staffing Influencer,Recruitment Insights,Canada,Thought leader in staffing industry with 50K+ followers,Published 100+ articles on recruitment trends,Influential voice shaping industry conversations,https://example.com/david.jpg,top-staffing-influencer,Anna,CEO,anna.ceo@company.com,+1 416 987 6543,Insight Corp,Canada
Michael,Davis,michael.davis@example.com,+49 30 1234 5678,https://linkedin.com/in/michaeldavis,Senior Sourcer,Global Talent Solutions,Germany,Expert sourcer specializing in hard-to-fill technical roles,Sourced 300+ candidates for FAANG companies,Exceptional sourcing skills and candidate engagement,https://example.com/michael.jpg,best-sourcer,,,,,`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'person_nominees_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Download company CSV template
  const downloadCompanyTemplate = () => {
    const csvContent = `company_name,company_email,company_phone,company_website,company_linkedin,company_country,company_size,company_industry,bio,achievements,why_us,logo_url,category,nominator_firstname,nominator_lastname,nominator_email,nominator_phone,nominator_company,nominator_country
TechTalent AI Solutions,info@techtalentai.com,+1 555 123 4567,https://techtalentai.com,https://linkedin.com/company/techtalentai,United States,100-200 employees,Technology Recruitment,Leading AI-driven staffing platform revolutionizing recruitment,Placed 10000+ candidates using AI matching technology,Cutting-edge AI technology with 95% match accuracy,https://techtalentai.com/logo.png,top-ai-driven-staffing-platform,Sarah,Johnson,sarah.j@client.com,+1 555 987 6543,Client Corp,United States
NextGen Digital Experience,contact@nextgendigital.com,+44 20 1234 5678,https://nextgendigital.com,https://linkedin.com/company/nextgendigital,United Kingdom,50-100 employees,Digital Recruitment,Premier digital experience platform for recruitment clients,Award-winning client portal with 98% satisfaction rate,Seamless digital experience that delights clients,https://nextgendigital.com/logo.png,top-digital-experience-for-clients,Mike,Director,mike.director@business.com,+44 20 9876 5432,Business Ltd,United Kingdom
Women Leaders Staffing,info@womenleadersstaffing.com,+1 647 123 4567,https://womenleadersstaffing.com,https://linkedin.com/company/womenleadersstaffing,Canada,25-50 employees,Executive Search,Top women-led staffing firm promoting diversity in leadership,90% of placements are diverse candidates in leadership roles,Committed to advancing women and minorities in executive positions,https://womenleadersstaffing.com/logo.png,top-women-led-staffing-firm,Lisa,CEO,lisa.ceo@enterprise.com,+1 647 987 6543,Enterprise Inc,Canada
RapidGrowth Staffing,contact@rapidgrowthstaffing.com,+61 2 9876 5432,https://rapidgrowthstaffing.com,https://linkedin.com/company/rapidgrowthstaffing,Australia,200-500 employees,Staffing Services,Fastest growing staffing firm with 300% YoY growth,Expanded from 10 to 200 employees in 18 months,Explosive growth while maintaining quality and culture,https://rapidgrowthstaffing.com/logo.png,fastest-growing-staffing-firm,John,Founder,john.founder@startup.com,+61 2 1234 5678,Startup Ventures,Australia
ScaleStaffing Solutions,info@scalestaffing.com,+49 30 1234 5678,https://scalestaffing.com,https://linkedin.com/company/scalestaffing,Germany,500+ employees,Staffing Technology,Best staffing process at scale serving Fortune 500 companies,Processes 50000+ applications monthly with 99.9% accuracy,Unmatched scale and efficiency in staffing operations,https://scalestaffing.com/logo.png,best-staffing-process-at-scale,,,,,`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'company_nominees_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Simple Bulk Upload
          </CardTitle>
          <CardDescription>
            Upload multiple nominees at once using a simple CSV file. Perfect for local testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* Template Downloads */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div>
                <h4 className="font-medium">Person Nominees Template</h4>
                <p className="text-sm text-muted-foreground">
                  Template for individual nominees with examples for all person categories
                </p>
              </div>
              <Button variant="outline" onClick={downloadPersonTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Person Template
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
              <div>
                <h4 className="font-medium">Company Nominees Template</h4>
                <p className="text-sm text-muted-foreground">
                  Template for company nominees with examples for all company categories
                </p>
              </div>
              <Button variant="outline" onClick={downloadCompanyTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Company Template
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              ref={fileInputRef}
            />
            <p className="text-xs text-muted-foreground">
              Maximum file size: 5MB. Only CSV files are accepted.
            </p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing upload...</span>
            </div>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-medium mb-2">Upload Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-medium text-blue-600">{uploadResult.total}</div>
                  <div className="text-muted-foreground">Total Rows</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">{uploadResult.successful}</div>
                  <div className="text-muted-foreground">Successful</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">{uploadResult.failed}</div>
                  <div className="text-muted-foreground">Failed</div>
                </div>
              </div>
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-3">
                  <h5 className="font-medium text-red-600 mb-2">Errors:</h5>
                  <div className="space-y-1">
                    {uploadResult.errors.slice(0, 5).map((error: string, index: number) => (
                      <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                        {error}
                      </div>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <div className="text-sm text-muted-foreground">
                        ... and {uploadResult.errors.length - 5} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Simple Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Simple Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <Badge variant="outline">1</Badge>
            <div>
              <strong>Download Template:</strong> Get the simple CSV template with essential fields only
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline">2</Badge>
            <div>
              <strong>Fill Required Fields:</strong> type, category, name, email, nominator_name, nominator_email
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Badge variant="outline">3</Badge>
            <div>
              <strong>Upload & Test:</strong> Upload the CSV file and see the results immediately
            </div>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Local Testing:</strong> This simplified version is perfect for testing the bulk upload functionality locally without complex validation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}