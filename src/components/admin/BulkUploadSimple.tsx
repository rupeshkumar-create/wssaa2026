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

interface BulkUploadSimpleProps {
  onUploadComplete?: () => void;
}

export function BulkUploadSimple({ onUploadComplete }: BulkUploadSimpleProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

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

      const response = await fetch('/api/admin/bulk-upload-simple', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUploadResult(result.data);
        setSuccess(`Upload completed! ${result.data.successful} nominees uploaded successfully.`);
        
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
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent = `type,category,name,email,company,country,nominator_name,nominator_email
person,top-recruiter,John Smith,john.smith@example.com,TechTalent Solutions,United States,Sarah Johnson,sarah.j@client.com
person,rising-star-under-30,Emma Wilson,emma.wilson@example.com,NextGen Talent,Australia,Lisa Manager,lisa.manager@firm.com
company,top-staffing-company-usa,TechTalent AI Solutions,info@techtalentai.com,,United States,Sarah Johnson,sarah.j@client.com
company,top-ai-driven-staffing-platform,AI Staffing Pro,hello@aistaffing.com,,United States,Jennifer Lee,jennifer.l@techcorp.com`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simple_bulk_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Simple Bulk Upload
          </CardTitle>
          <CardDescription>
            Upload multiple nominees at once using a simple CSV file format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
            <div>
              <h4 className="font-medium">CSV Template</h4>
              <p className="text-sm text-muted-foreground">
                Download the template with sample data and required format
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

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

          {uploading && (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processing upload...</span>
            </div>
          )}

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

      <Card>
        <CardHeader>
          <CardTitle>Required CSV Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-mono text-xs">
              type,category,name,email,company,country,nominator_name,nominator_email
            </p>
          </div>
          <div className="space-y-2">
            <div><strong>type:</strong> "person" or "company"</div>
            <div><strong>category:</strong> Valid category ID (e.g., "top-recruiter", "top-staffing-company-usa")</div>
            <div><strong>name:</strong> Full name for person or company name</div>
            <div><strong>email:</strong> Valid email address</div>
            <div><strong>company:</strong> Company name (optional for person, leave empty for company)</div>
            <div><strong>country:</strong> Country name (optional)</div>
            <div><strong>nominator_name:</strong> Full name of the person making the nomination</div>
            <div><strong>nominator_email:</strong> Valid email of the nominator</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}