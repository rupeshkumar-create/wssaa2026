"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Building2, Upload, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface AdminNominationFormProps {
  onSuccess?: () => void;
}

interface Category {
  id: string;
  name: string;
  nomination_type: 'person' | 'company' | 'both';
  category_groups: {
    id: string;
    name: string;
  };
}

interface FormData {
  type: 'person' | 'company';
  subcategoryId: string;
  categoryGroupId: string;
  
  // Person fields
  firstName: string;
  lastName: string;
  jobTitle: string;
  personEmail: string;
  personLinkedIn: string;
  personPhone: string;
  personCompany: string;
  personCountry: string;
  headshotUrl: string;
  whyMe: string;
  bio: string;
  achievements: string;
  
  // Company fields
  companyName: string;
  companyWebsite: string;
  companyLinkedIn: string;
  companyEmail: string;
  companyPhone: string;
  companyCountry: string;
  companySize: string;
  companyIndustry: string;
  logoUrl: string;
  whyUs: string;
  bio: string;
  achievements: string;
  
  // Admin fields
  adminNotes: string;
}

export function AdminNominationForm({ onSuccess }: AdminNominationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    type: 'person',
    subcategoryId: '',
    categoryGroupId: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
    personEmail: '',
    personLinkedIn: '',
    personPhone: '',
    personCompany: '',
    personCountry: '',
    headshotUrl: '',
    whyMe: '',
    bio: '',
    achievements: '',
    companyName: '',
    companyWebsite: '',
    companyLinkedIn: '',
    companyEmail: '',
    companyPhone: '',
    companyCountry: '',
    companySize: '',
    companyIndustry: '',
    logoUrl: '',
    whyUs: '',
    adminNotes: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load categories from database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const result = await response.json();
        if (result.success) {
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File, type: 'headshot' | 'logo') => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/uploads/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (type === 'headshot') {
          handleInputChange('headshotUrl', result.url);
        } else {
          handleInputChange('logoUrl', result.url);
        }
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setResult({ error: 'Failed to upload image. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.subcategoryId) return 'Please select a category';
    
    if (formData.type === 'person') {
      if (!formData.firstName.trim()) return 'First name is required';
      if (!formData.lastName.trim()) return 'Last name is required';
      if (!formData.jobTitle.trim()) return 'Job title is required';
      if (!formData.personEmail.trim()) return 'Email is required';
      if (!formData.whyMe.trim()) return 'Why vote for this person is required';
    } else {
      if (!formData.companyName.trim()) return 'Company name is required';
      if (!formData.companyWebsite.trim()) return 'Company website is required';
      if (!formData.whyUs.trim()) return 'Why vote for this company is required';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setResult({ error: validationError });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const payload = {
        type: formData.type,
        subcategory_id: formData.subcategoryId,
        category_group_id: formData.categoryGroupId,
        
        // Person fields
        firstname: formData.type === 'person' ? formData.firstName : null,
        lastname: formData.type === 'person' ? formData.lastName : null,
        jobtitle: formData.type === 'person' ? formData.jobTitle : null,
        person_email: formData.type === 'person' ? formData.personEmail : null,
        person_linkedin: formData.type === 'person' ? formData.personLinkedIn : null,
        person_phone: formData.type === 'person' ? formData.personPhone : null,
        person_company: formData.type === 'person' ? formData.personCompany : null,
        person_country: formData.type === 'person' ? formData.personCountry : null,
        headshot_url: formData.type === 'person' ? formData.headshotUrl : null,
        why_me: formData.type === 'person' ? formData.whyMe : null,
        bio: formData.bio,
        achievements: formData.achievements,
        
        // Company fields
        company_name: formData.type === 'company' ? formData.companyName : null,
        company_website: formData.type === 'company' ? formData.companyWebsite : null,
        company_linkedin: formData.type === 'company' ? formData.companyLinkedIn : null,
        company_email: formData.type === 'company' ? formData.companyEmail : null,
        company_phone: formData.type === 'company' ? formData.companyPhone : null,
        company_country: formData.type === 'company' ? formData.companyCountry : null,
        company_size: formData.type === 'company' ? formData.companySize : null,
        company_industry: formData.type === 'company' ? formData.companyIndustry : null,
        logo_url: formData.type === 'company' ? formData.logoUrl : null,
        why_us: formData.type === 'company' ? formData.whyUs : null,
        
        // Admin fields
        admin_notes: formData.adminNotes,
        created_by: 'admin'
      };

      // Use the existing nomination submission API with admin bypass
      const nominationPayload = {
        type: formData.type,
        categoryGroupId: formData.categoryGroupId,
        subcategoryId: formData.subcategoryId,
        nominator: {
          firstname: 'Admin',
          lastname: 'User',
          email: 'admin@worldstaffingawards.com',
          linkedin: '',
          company: 'World Staffing Awards',
          jobTitle: 'Administrator',
          phone: '',
          country: 'Global'
        },
        nominee: formData.type === 'person' ? {
          firstname: formData.firstName,
          lastname: formData.lastName,
          email: formData.personEmail,
          linkedin: formData.personLinkedIn,
          jobtitle: formData.jobTitle,
          company: formData.personCompany,
          phone: formData.personPhone,
          country: formData.personCountry,
          headshotUrl: formData.headshotUrl,
          whyMe: formData.whyMe,
          bio: formData.bio,
          achievements: formData.achievements
        } : {
          name: formData.companyName,
          email: formData.companyEmail,
          website: formData.companyWebsite,
          linkedin: formData.companyLinkedIn,
          phone: formData.companyPhone,
          country: formData.companyCountry,
          size: formData.companySize,
          industry: formData.companyIndustry,
          logoUrl: formData.logoUrl,
          whyUs: formData.whyUs,
          bio: formData.bio,
          achievements: formData.achievements
        },
        adminNotes: formData.adminNotes,
        bypassNominationStatus: true, // Allow admin to nominate even when nominations are closed
        isAdminNomination: true // Mark as admin nomination
      };

      console.log('🚀 Submitting admin nomination:', {
        type: nominationPayload.type,
        category: nominationPayload.subcategoryId,
        nominee: nominationPayload.nominee.firstname || nominationPayload.nominee.name,
        bypassNominationStatus: nominationPayload.bypassNominationStatus
      });

      const response = await fetch('/api/admin/nominations/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nominationPayload)
      });

      console.log('📥 Admin nomination response:', response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('📥 Admin nomination result:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse response JSON:', parseError);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      if (response.ok && result.success) {
        setResult({ success: true });
        console.log('✅ Admin nomination successful:', result.nominationId);
        // Reset form
        setFormData({
          type: 'person',
          subcategoryId: '',
          categoryGroupId: '',
          firstName: '',
          lastName: '',
          jobTitle: '',
          personEmail: '',
          personLinkedIn: '',
          personPhone: '',
          personCompany: '',
          personCountry: '',
          headshotUrl: '',
          whyMe: '',
          bio: '',
          achievements: '',
          companyName: '',
          companyWebsite: '',
          companyLinkedIn: '',
          companyEmail: '',
          companyPhone: '',
          companyCountry: '',
          companySize: '',
          companyIndustry: '',
          logoUrl: '',
          whyUs: '',
          adminNotes: ''
        });
        onSuccess?.();
      } else {
        setResult({ error: result.error || 'Failed to create nomination' });
      }
    } catch (error) {
      console.error('❌ Admin nomination error:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error,
        error: error
      });
      
      let errorMessage = 'Failed to create nomination. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setResult({ error: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPersonType = formData.type === 'person';
  const selectedCategory = categories.find(c => c.id === formData.subcategoryId);
  
  // Filter categories by type
  const availableCategories = categories.filter(cat => {
    return cat.nomination_type === 'both' || cat.nomination_type === formData.type;
  });

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            {isPersonType ? (
              <UserPlus className="h-5 w-5 text-blue-600" />
            ) : (
              <Building2 className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <CardTitle>Add New Nomination</CardTitle>
            <CardDescription>
              Create a nomination directly as an administrator (appears in nominations list for approval)
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type Selection */}
          <div className="space-y-2">
            <Label>Nomination Type</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={isPersonType ? "default" : "outline"}
                onClick={() => handleInputChange('type', 'person')}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Person
              </Button>
              <Button
                type="button"
                variant={!isPersonType ? "default" : "outline"}
                onClick={() => handleInputChange('type', 'company')}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Company
              </Button>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            {loadingCategories ? (
              <div className="flex items-center gap-2 p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading categories...</span>
              </div>
            ) : (
              <Select 
                value={formData.subcategoryId} 
                onValueChange={(value) => {
                  const category = categories.find(c => c.id === value);
                  handleInputChange('subcategoryId', value);
                  if (category) {
                    handleInputChange('categoryGroupId', category.category_groups.id);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {/* Group categories by their category group */}
                  {Array.from(new Set(availableCategories.map(c => c.category_groups.name))).map((groupName) => {
                    const groupCategories = availableCategories.filter(c => c.category_groups.name === groupName);
                    return (
                      <div key={groupName}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                          {groupName}
                        </div>
                        {groupCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex items-center gap-2">
                              <span>{category.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {category.nomination_type}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
            )}
            {selectedCategory && (
              <p className="text-sm text-muted-foreground">
                Group: {selectedCategory.category_groups.name}
              </p>
            )}
          </div>

          {/* Person Fields */}
          {isPersonType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Person Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title *</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Enter job title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="personEmail">Email *</Label>
                  <Input
                    id="personEmail"
                    type="email"
                    value={formData.personEmail}
                    onChange={(e) => handleInputChange('personEmail', e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="personLinkedIn">LinkedIn URL</Label>
                  <Input
                    id="personLinkedIn"
                    value={formData.personLinkedIn}
                    onChange={(e) => handleInputChange('personLinkedIn', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="personCompany">Company</Label>
                  <Input
                    id="personCompany"
                    value={formData.personCompany}
                    onChange={(e) => handleInputChange('personCompany', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="personCountry">Country</Label>
                  <Input
                    id="personCountry"
                    value={formData.personCountry}
                    onChange={(e) => handleInputChange('personCountry', e.target.value)}
                    placeholder="Enter country"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="personPhone">Phone</Label>
                  <Input
                    id="personPhone"
                    value={formData.personPhone}
                    onChange={(e) => handleInputChange('personPhone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="headshotUpload">Professional Headshot</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="headshotUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'headshot');
                    }}
                    disabled={isUploading}
                  />
                  {formData.headshotUrl && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Uploaded</span>
                    </div>
                  )}
                </div>
                {formData.headshotUrl && (
                  <img 
                    src={formData.headshotUrl} 
                    alt="Headshot preview" 
                    className="w-20 h-20 rounded-full object-cover border"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whyMe">Why should people vote for this person? *</Label>
                <Textarea
                  id="whyMe"
                  value={formData.whyMe}
                  onChange={(e) => handleInputChange('whyMe', e.target.value)}
                  placeholder="Describe their achievements, impact, and why they deserve recognition..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Professional background and experience..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements">Key Achievements</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  placeholder="Notable accomplishments and awards..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Company Fields */}
          {!isPersonType && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website *</Label>
                  <Input
                    id="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                    placeholder="https://company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyLinkedIn">LinkedIn URL</Label>
                  <Input
                    id="companyLinkedIn"
                    value={formData.companyLinkedIn}
                    onChange={(e) => handleInputChange('companyLinkedIn', e.target.value)}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Contact Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                    placeholder="Enter contact email"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyCountry">Country</Label>
                  <Input
                    id="companyCountry"
                    value={formData.companyCountry}
                    onChange={(e) => handleInputChange('companyCountry', e.target.value)}
                    placeholder="Enter country"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone</Label>
                  <Input
                    id="companyPhone"
                    value={formData.companyPhone}
                    onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="501-1000">501-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyIndustry">Industry</Label>
                  <Input
                    id="companyIndustry"
                    value={formData.companyIndustry}
                    onChange={(e) => handleInputChange('companyIndustry', e.target.value)}
                    placeholder="e.g., Technology, Healthcare, Finance"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUpload">Company Logo</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logoUpload"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'logo');
                    }}
                    disabled={isUploading}
                  />
                  {formData.logoUrl && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Uploaded</span>
                    </div>
                  )}
                </div>
                {formData.logoUrl && (
                  <img 
                    src={formData.logoUrl} 
                    alt="Logo preview" 
                    className="w-20 h-20 rounded object-contain border"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whyUs">Why should people vote for this company? *</Label>
                <Textarea
                  id="whyUs"
                  value={formData.whyUs}
                  onChange={(e) => handleInputChange('whyUs', e.target.value)}
                  placeholder="Describe their achievements, impact, and why they deserve recognition..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyBio">Company Description</Label>
                <Textarea
                  id="companyBio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Company background, mission, and services..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAchievements">Key Achievements</Label>
                <Textarea
                  id="companyAchievements"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  placeholder="Notable accomplishments, awards, and milestones..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notes (Internal)</Label>
            <Textarea
              id="adminNotes"
              value={formData.adminNotes}
              onChange={(e) => handleInputChange('adminNotes', e.target.value)}
              placeholder="Internal notes about this nomination..."
              rows={2}
            />
          </div>

          {/* Result Messages */}
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success 
                  ? "Nomination created successfully! It appears in the nominations list as 'submitted' and is ready for approval."
                  : result.error
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Nomination'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}