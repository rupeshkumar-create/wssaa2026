"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Vote } from "lucide-react";

interface VotingClosedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  votingStartDate?: string;
  message?: string;
}

export function VotingClosedDialog({ 
  isOpen, 
  onClose, 
  votingStartDate,
  message 
}: VotingClosedDialogProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Voting Not Yet Open
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <DialogDescription className="text-gray-600 text-base leading-relaxed">
            {message || "Voting is currently closed. Please check back when voting opens."}
          </DialogDescription>
          
          {votingStartDate && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">
                    Voting Opens:
                  </h4>
                  <p className="text-orange-800 text-sm">
                    {formatDate(votingStartDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Vote className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  What You Can Do Now:
                </h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Browse the current nominees</li>
                  <li>• Share nominee profiles with your network</li>
                  <li>• Set a reminder to vote when it opens</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onClose}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            Got It
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}