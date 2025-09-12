"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Building2, CheckCircle, AlertCircle } from "lucide-react";

// Import the form steps from the public nomination form
import { Step3Category } from "@/components/form/Step3Category";
import { Step4PersonDetails } from "@/components/form/Step4PersonDetails";
import { Step5PersonLinkedIn } from "@/components/form/Step5PersonLinkedIn";
import { Step6PersonHeadshot } from "@/components/form/Step6PersonHeadshot";
import { Step7CompanyDetails } from "@/components/form/Step7CompanyDetails";
import { Step8CompanyLinkedIn } from "@/components/form/Step8CompanyLinkedIn";
import { Step9CompanyLogo } from "@/components/form/Step9CompanyLogo";
import { Step10ReviewSubmit } from "@/components/form/Step10ReviewSubmit";

import { Category, CATEGORIES } from "@/lib/constants";

interface AdminNominationFlowProps {
  onSuccess?: () => void;
}

interface FormData {
  // Step 3
  category: Category | null;
  
  // Step 4 (Person)
  personDetails: {
    firstName?: string;
    lastName?: string;
    name?: string;
    email: string;
    title?: string;
    country?: string;
    whyVoteForMe?: string;
  };
  
  // Step 5 (Person)
  personLinkedIn: {
    linkedin: string;
  };
  
  // Step 6 (Person)
  imageUrl: string;
  
  // Step 7 (Company)
  companyDetails: {
    name: string;
    website: string;
    country?: string;
    whyVoteForMe?: string;
  };
  
  // Step 8 (Company)
  companyLinkedIn: {
    linkedin: string;
  };
  
  // Step 9 (Company)
  companyImageUrl: string;
}

// Mock nominator data for admin submissions
const ADMIN_NOMINATOR = {
  email: 'admin@worldstaffingawards.com',
  firstname: 'Admin',
  lastname: 'User',
  linkedin: 'https://linkedin.com/company/world-staffing-awards',
  company: 'World Staffing Awards',
  jobTitle: 'Administrator',
  phone: '',
  country: 'Global'
};

export function AdminNominationFlow({ onSuccess }: AdminNominationFlowProps) {
  const [currentStep, setCurrentStep] = useState(3); // Start from Step 3 (Category Selection)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any>(null);
  
  const [formData, setFormData] = useState<FormData>({
    category: null,
    personDetails: { name: "", email: "" },
    personLinkedIn: { linkedin: "" },
    imageUrl: "",
    companyDetails: { name: "", website: "" },
    companyLinkedIn: { linkedin: "" },
    companyImageUrl: "",
  });

  const categoryConfig = formData.category ? CATEGORIES.find(c => c.id === formData.category) : null;
  const isPersonFlow = categoryConfig?.type === "person";
  const totalSteps = isPersonFlow ? 10 : 10; // Both flows have 10 steps

  // Get subcategory ID (category is already the ID from constants)
  const getSubcategoryId = (category: Category | null): string => {
    if (!category) return '';
    return category;
  };

  const getCategoryGroupId = (category: Category | null): string => {
    if (!category) return 'general';
    
    // Find the category config from constants
    const categoryConfig = CATEGORIES.find(c => c.id === category);
    if (!categoryConfig) return 'general';
    
    // Map group names to group IDs - updated to match the new category system
    const groupMap: Record<string, string> = {
      'role-specific-excellence': 'role-specific-excellence',
      'innovation-technology': 'innovation-technology', 
      'culture-impact': 'culture-impact',
      'growth-performance': 'growth-performance',
      'geographic-excellence': 'geographic-excellence',
      'special-recognition': 'special-recognition'
    };
    
    return groupMap[categoryConfig.group] || categoryConfig.group || 'general';
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      // Client-side validation
      if (!formData.category) {
        setSubmitResult({ error: "Please select a category." });
        setIsSubmitting(false);
        return;
      }

      if (isPersonFlow) {
        const hasFirstName = formData.personDetails.firstName || formData.personDetails.name?.split(' ')[0];
        const hasLastName = formData.personDetails.lastName || formData.personDetails.name?.split(' ').slice(1).join(' ');
        const hasEmail = formData.personDetails.email;
        const hasTitle = formData.personDetails.title;
        const hasWhy = formData.personDetails.whyVoteForMe;
        const hasHeadshot = formData.imageUrl;
        
        if (!hasFirstName || !hasLastName || !hasEmail || !hasTitle || !hasWhy) {
          setSubmitResult({ error: "Please fill out all nominee information." });
          setIsSubmitting(false);
          return;
        }

        if (!hasHeadshot) {
          setSubmitResult({ error: "Professional headshot is required for person nominations." });
          setIsSubmitting(false);
          return;
        }
      } else {
        const hasName = formData.companyDetails.name;
        const hasWebsite = formData.companyDetails.website;
        const hasWhy = formData.companyDetails.whyVoteForMe;
        const hasLogo = formData.companyImageUrl;

        if (!hasName || !hasWebsite || !hasWhy) {
          setSubmitResult({ error: "Please fill out all company information." });
          setIsSubmitting(false);
          return;
        }

        if (!hasLogo) {
          setSubmitResult({ error: "Company logo is required for company nominations." });
          setIsSubmitting(false);
          return;
        }
      }

      const subcategoryId = getSubcategoryId(formData.category);
      const categoryGroupId = getCategoryGroupId(formData.category);

      console.log('🔍 Admin nomination debug:', {
        category: formData.category,
        subcategoryId,
        categoryGroupId,
        isPersonFlow,
        personDetails: formData.personDetails,
        companyDetails: formData.companyDetails
      });

      // Validate required fields
      if (!subcategoryId) {
        setSubmitResult({ error: "Invalid category selection. Please try again." });
        setIsSubmitting(false);
        return;
      }

      if (!categoryGroupId) {
        setSubmitResult({ error: "Invalid category group. Please try again." });
        setIsSubmitting(false);
        return;
      }

      const payload = isPersonFlow ? {
        type: 'person' as const,
        categoryGroupId,
        subcategoryId,
        nominator: ADMIN_NOMINATOR,
        nominee: {
          firstname: formData.personDetails.firstName || formData.personDetails.name?.split(' ')[0] || '',
          lastname: formData.personDetails.lastName || formData.personDetails.name?.split(' ').slice(1).join(' ') || '',
          jobtitle: formData.personDetails.title || '',
          email: formData.personDetails.email || '',
          linkedin: formData.personLinkedIn.linkedin || '',
          headshotUrl: formData.imageUrl || '',
          whyMe: formData.personDetails.whyVoteForMe || ''
        },
        bypassNominationStatus: true, // Allow admin to nominate even when nominations are closed
        isAdminNomination: true // Mark as admin nomination
      } : {
        type: 'company' as const,
        categoryGroupId,
        subcategoryId,
        nominator: ADMIN_NOMINATOR,
        nominee: {
          name: formData.companyDetails.name || '',
          website: formData.companyDetails.website || '',
          linkedin: formData.companyLinkedIn.linkedin || '',
          logoUrl: formData.companyImageUrl || '',
          whyUs: formData.companyDetails.whyVoteForMe || ''
        },
        bypassNominationStatus: true, // Allow admin to nominate even when nominations are closed
        isAdminNomination: true // Mark as admin nomination
      };

      console.log('🚀 Admin nomination payload:', JSON.stringify(payload, null, 2));

      const response = await fetch("/api/nomination/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log('📥 Admin nomination response status:', response.status);
      
      let result;
      try {
        result = await response.json();
        console.log('📥 Admin nomination response body:', result);
      } catch (parseError) {
        console.error('❌ Failed to parse response JSON:', parseError);
        setSubmitResult({ error: "Server returned invalid response. Please try again." });
        setIsSubmitting(false);
        return;
      }
      
      if (response.ok) {
        console.log('✅ Admin nomination successful!');
        setSubmitResult({ success: true, ...result });
        
        // Reset form for next nomination
        setTimeout(() => {
          setFormData({
            category: null,
            personDetails: { name: "", email: "" },
            personLinkedIn: { linkedin: "" },
            imageUrl: "",
            companyDetails: { name: "", website: "" },
            companyLinkedIn: { linkedin: "" },
            companyImageUrl: "",
          });
          setCurrentStep(3);
          setSubmitResult(null);
          onSuccess?.();
        }, 3000);
      } else {
        console.error("❌ Admin nomination error:", result);
        
        // Handle validation errors specifically
        let errorMessage = result.error || "Failed to submit nomination. Please try again.";
        
        if (result.details && Array.isArray(result.details)) {
          const fieldErrors = result.details.map((detail: any) => {
            const field = detail.path ? detail.path.join('.') : 'unknown';
            return `${field}: ${detail.message}`;
          }).join(', ');
          errorMessage = `Validation errors: ${fieldErrors}`;
        }
        
        setSubmitResult({ 
          error: errorMessage,
          details: result.details 
        });
      }

    } catch (error) {
      console.error("Admin nomination submission error:", error);
      setSubmitResult({ error: "Failed to submit nomination. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 3:
        return (
          <Step3Category
            selectedCategory={formData.category}
            onNext={(category) => {
              setFormData(prev => ({ ...prev, category }));
              const config = CATEGORIES.find(c => c.id === category);
              setCurrentStep(config?.type === "person" ? 4 : 7);
            }}
            onBack={() => setCurrentStep(3)} // Stay on step 3 for admin
          />
        );
      
      // Person Flow
      case 4:
        return (
          <Step4PersonDetails
            data={formData.personDetails}
            onNext={(data) => {
              const updatedData = {
                ...data,
                name: `${data.firstName} ${data.lastName}`.trim()
              };
              setFormData(prev => ({ ...prev, personDetails: updatedData }));
              setCurrentStep(5);
            }}
            onBack={() => setCurrentStep(3)}
          />
        );
      
      case 5:
        return (
          <Step5PersonLinkedIn
            data={formData.personLinkedIn}
            onNext={(data) => {
              setFormData(prev => ({ ...prev, personLinkedIn: data }));
              setCurrentStep(6);
            }}
            onBack={() => setCurrentStep(4)}
          />
        );
      
      case 6:
        return (
          <Step6PersonHeadshot
            imageUrl={formData.imageUrl}
            personName={formData.personDetails.name || `${formData.personDetails.firstName || ''} ${formData.personDetails.lastName || ''}`.trim()}
            onNext={(imageUrl) => {
              setFormData(prev => ({ ...prev, imageUrl }));
              setCurrentStep(10);
            }}
            onBack={() => setCurrentStep(5)}
          />
        );
      
      // Company Flow
      case 7:
        return (
          <Step7CompanyDetails
            data={formData.companyDetails}
            onNext={(data) => {
              setFormData(prev => ({ ...prev, companyDetails: data }));
              setCurrentStep(8);
            }}
            onBack={() => setCurrentStep(3)}
          />
        );
      
      case 8:
        return (
          <Step8CompanyLinkedIn
            data={formData.companyLinkedIn}
            onNext={(data) => {
              setFormData(prev => ({ ...prev, companyLinkedIn: data }));
              setCurrentStep(9);
            }}
            onBack={() => setCurrentStep(7)}
          />
        );
      
      case 9:
        return (
          <Step9CompanyLogo
            imageUrl={formData.companyImageUrl}
            companyName={formData.companyDetails.name}
            onNext={(imageUrl) => {
              setFormData(prev => ({ ...prev, companyImageUrl: imageUrl }));
              setCurrentStep(10);
            }}
            onBack={() => setCurrentStep(8)}
          />
        );
      
      // Review & Submit
      case 10:
        const nominee = isPersonFlow ? {
          name: formData.personDetails.name,
          email: formData.personDetails.email,
          title: formData.personDetails.title,
          country: formData.personDetails.country,
          linkedin: formData.personLinkedIn.linkedin,
          imageUrl: formData.imageUrl,
        } : {
          name: formData.companyDetails.name,
          email: '', // Companies don't have email, but interface requires it
          website: formData.companyDetails.website,
          country: formData.companyDetails.country,
          linkedin: formData.companyLinkedIn.linkedin,
          imageUrl: formData.companyImageUrl,
        };

        return (
          <Step10ReviewSubmit
            category={formData.category!}
            nominator={ADMIN_NOMINATOR}
            nominee={nominee}
            onSubmit={handleSubmit}
            onBack={() => setCurrentStep(isPersonFlow ? 6 : 9)}
            isSubmitting={isSubmitting}
            submitResult={submitResult}
          />
        );
      
      default:
        return (
          <Step3Category
            selectedCategory={formData.category}
            onNext={(category) => {
              setFormData(prev => ({ ...prev, category }));
              const config = CATEGORIES.find(c => c.id === category);
              setCurrentStep(config?.type === "person" ? 4 : 7);
            }}
            onBack={() => setCurrentStep(3)}
          />
        );
    }
  };

  // Show success message
  if (submitResult?.success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-800">Nomination Added Successfully!</CardTitle>
              <CardDescription>
                The nomination has been added to the admin panel and is ready for approval.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Next Steps:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• The nomination appears in the "Nominations" tab</li>
                  <li>• It's marked as "Added by Admin"</li>
                  <li>• Once approved, the nominee will receive a transactional email with their live page link</li>
                  <li>• The form will reset automatically in a few seconds</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-center">
              <Button 
                onClick={() => {
                  setFormData({
                    category: null,
                    personDetails: { name: "", email: "" },
                    personLinkedIn: { linkedin: "" },
                    imageUrl: "",
                    companyDetails: { name: "", website: "" },
                    companyLinkedIn: { linkedin: "" },
                    companyImageUrl: "",
                  });
                  setCurrentStep(3);
                  setSubmitResult(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Another Nomination
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Admin Nomination</span>
          <span>Step {currentStep - 2} of {totalSteps - 2}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep - 2) / (totalSteps - 2)) * 100}%` }}
          />
        </div>
      </div>

      {/* Admin notice */}
      <Alert className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
        <UserPlus className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Admin Mode:</strong> You can add nominations even when public nominations are closed. 
          Nominations will be marked as "Added by Admin" and appear in the nominations list for approval.
        </AlertDescription>
      </Alert>

      {/* Form Steps */}
      {renderStep()}
    </div>
  );
}