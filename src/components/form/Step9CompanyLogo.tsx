"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Building, Loader2 } from "lucide-react";
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from "@/lib/constants";

interface Step9CompanyLogoProps {
  imageUrl: string;
  companyName: string; // For generating slug
  onNext: (imageUrl: string) => void;
  onBack: () => void;
}

export function Step9CompanyLogo({ imageUrl, companyName, onNext, onBack }: Step9CompanyLogoProps) {
  const [preview, setPreview] = useState<string>(imageUrl);
  const [uploadedUrl, setUploadedUrl] = useState<string>(imageUrl);
  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Generate slug-safe path
  const generateSlug = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'company-' + Date.now();
    }
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      || 'company-' + Date.now(); // Fallback if empty after processing
  };

  const validateAndProcessFile = useCallback(async (file: File) => {
    setError("");

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Upload JPG, PNG, or SVG only");
      return false;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError("Max 5MB");
      return false;
    }

    // Store file reference
    fileRef.current = file;

    // Create stable preview URL
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }
    previewUrlRef.current = URL.createObjectURL(file);
    setPreview(previewUrlRef.current);

    // Upload to server with optimized request
    setUploading(true);
    try {
      const slug = generateSlug(companyName);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', 'logo');
      formData.append('slug', slug);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadedUrl(result.url);
      return true;
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      if (uploadError instanceof Error && uploadError.name === 'AbortError') {
        setError('Upload timeout - please try again');
      } else {
        setError(uploadError instanceof Error ? uploadError.message : 'Upload failed');
      }
      return false;
    } finally {
      setUploading(false);
    }
  }, [companyName]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await validateAndProcessFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => ALLOWED_IMAGE_TYPES.includes(file.type));
    
    if (!imageFile) {
      setError("Please drop a valid image file (JPG, PNG, or SVG)");
      return;
    }

    await validateAndProcessFile(imageFile);
  }, [validateAndProcessFile]);

  const handleRemove = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    fileRef.current = null;
    setPreview("");
    setUploadedUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleNext = useCallback(() => {
    if (!uploadedUrl) {
      setError("Please upload a company logo");
      return;
    }
    onNext(uploadedUrl);
  }, [uploadedUrl, onNext]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Company Logo</CardTitle>
        <CardDescription>
          Upload the company's logo or brand image
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="logo">Company Logo *</Label>
          
          {preview ? (
            <div className="relative">
              <div className="w-48 h-48 mx-auto rounded-lg overflow-hidden border bg-white p-4">
                <img 
                  src={preview} 
                  alt="Logo preview" 
                  className="w-full h-full object-contain"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div 
              ref={dropZoneRef}
              className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
                isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                  isDragOver ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  {uploading ? (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  ) : (
                    <Upload className={`h-8 w-8 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                  )}
                </div>
                <div>
                  <p className={`text-sm mb-2 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isDragOver ? 'Drop your logo here' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or SVG (max {MAX_FILE_SIZE / (1024 * 1024)}MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          <Input
            ref={fileInputRef}
            id="logo"
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            onChange={handleFileSelect}
            className="cursor-pointer"
            disabled={uploading}
          />
          
          {uploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading logo...
            </div>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Logo Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use the official company logo</li>
            <li>• High resolution and clear quality</li>
            <li>• Square or horizontal orientation preferred</li>
            <li>• SVG format is ideal for crisp display</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
            className="transition-all duration-200"
          >
            Back
          </Button>
          <Button 
            onClick={handleNext} 
            disabled={!uploadedUrl || uploading}
            className="relative transition-all duration-200 min-w-[120px]"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}