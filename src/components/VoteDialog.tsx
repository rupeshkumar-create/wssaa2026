"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WSAButton } from "@/components/ui/wsa-button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Loader2, Vote, AlertTriangle } from "lucide-react";
import { VoterSchema, VoterData } from "@/lib/validation";
import { Nomination } from "@/lib/types";
import { getCategoryLabel } from "@/lib/utils/category-utils";
import { useVotingStatus } from "@/hooks/useVotingStatus";
import { VotingClosedDialog } from "./VotingClosedDialog";

interface VoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nomination: Nomination;
  onVoteSuccess: (newTotal: number) => void;
}

export function VoteDialog({ open, onOpenChange, nomination, onVoteSuccess }: VoteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVotingClosed, setShowVotingClosed] = useState(false);
  const [result, setResult] = useState<{ 
    success?: boolean; 
    blocked?: boolean; 
    reason?: string;
    message?: string; 
    total?: number;
    category?: string;
    nomineeId?: string;
  } | null>(null);

  const votingStatus = useVotingStatus();

  const form = useForm<VoterData>({
    resolver: zodResolver(VoterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      linkedin: "",
    },
  });

  // Check voting status when dialog opens
  useEffect(() => {
    if (open && !votingStatus.loading) {
      if (!votingStatus.isVotingOpen) {
        // Close the vote dialog and show voting closed dialog
        onOpenChange(false);
        setShowVotingClosed(true);
      }
    }
  }, [open, votingStatus.loading, votingStatus.isVotingOpen, onOpenChange]);

  const onSubmit = async (data: VoterData) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subcategoryId: nomination.category,
          votedForDisplayName: nomination.nominee.name,
          firstname: data.firstName,
          lastname: data.lastName,
          email: data.email,
          linkedin: data.linkedin,
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setResult({ success: true, total: result.newVoteCount });
        onVoteSuccess(result.newVoteCount);
        // Reset form
        form.reset();
        // Close dialog after a delay
        setTimeout(() => {
          onOpenChange(false);
          setResult(null);
        }, 3000);
      } else if (result.error === "ALREADY_VOTED") {
        // Handle duplicate vote
        setResult({ blocked: true, message: result.message });
      } else if (result.error === "Invalid vote data") {
        // Handle validation errors
        if (result.details && Array.isArray(result.details)) {
          let errorMessage = "Please check your information:";
          
          result.details.forEach((err: any) => {
            if (err.path && err.path.includes("email")) {
              errorMessage += "\n• " + err.message;
            } else if (err.path && err.path.includes("linkedin")) {
              errorMessage += "\n• " + err.message;
            } else {
              errorMessage += "\n• " + err.message;
            }
          });
          
          setResult({ message: errorMessage });
        } else {
          setResult({ message: "Please check your information and try again." });
        }
      } else {
        // Handle other errors
        setResult({ message: result.error || "Failed to submit vote. Please try again." });
      }

    } catch (error) {
      console.error("Vote submission error:", error);
      setResult({ message: "Failed to submit vote. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      setResult(null);
      form.reset();
    }
  };

  if (result?.success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Thanks—your vote has been counted</h3>
            <p className="text-muted-foreground mb-4">
              Your vote for {nomination.nominee.name} has been recorded.
            </p>
            <p className="text-sm text-muted-foreground">
              Total votes: {result.total}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (result?.blocked) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Already Voted</h3>
            <p className="text-muted-foreground mb-4">
              {result.message}
            </p>
            <WSAButton 
              onClick={handleClose} 
              variant="primary"
              style={{
                width: '180.66px',
              }}
            >
              Back to Directory
            </WSAButton>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Cast Your Vote
          </DialogTitle>
          <DialogDescription>
            Vote for {nomination.nominee.name} in the {getCategoryLabel(nomination.category)} category
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="john.doe@company.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Please use your business email. Personal domains are not allowed.
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile URL *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://www.linkedin.com/in/johndoe" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">
                    Your LinkedIn profile helps us prevent duplicate votes.
                  </p>
                </FormItem>
              )}
            />

            {result?.message && !result.blocked && (
              <Alert variant="destructive">
                <AlertDescription>
                  <div className="whitespace-pre-line">{result.message}</div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <WSAButton 
                type="button" 
                variant="secondary" 
                onClick={handleClose}
                disabled={isSubmitting}
                style={{
                  width: '180.66px',
                }}
              >
                Cancel
              </WSAButton>
              <WSAButton 
                type="submit" 
                variant="primary"
                disabled={isSubmitting} 
                style={{
                  width: '180.66px',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </WSAButton>
            </div>
          </form>
        </Form>
      </DialogContent>
      
      {/* Voting Closed Dialog */}
      <VotingClosedDialog
        open={showVotingClosed}
        onOpenChange={setShowVotingClosed}
        startDate={votingStatus.startDate}
      />
    </Dialog>
  );
}