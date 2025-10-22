"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Send, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface NomineeEmailSenderProps {
  nomination: {
    id: string;
    type: 'person' | 'company';
    firstname?: string;
    lastname?: string;
    companyName?: string;
    company_name?: string;
    personEmail?: string;
    companyEmail?: string;
    last_email_sent_at?: string;
    email_sent_count?: number;
    nomination_source?: string;
  };
  onEmailSent?: () => void;
}

export function NomineeEmailSender({ nomination, onEmailSent }: NomineeEmailSenderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState(
    nomination.personEmail || nomination.companyEmail || ''
  );
  const [transactionalId, setTransactionalId] = useState('cmfb0xhia0qnaxj0ig98plajz');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const nomineeName = nomination.type === 'person' 
    ? `${nomination.firstname || ''} ${nomination.lastname || ''}`.trim()
    : nomination.companyName || nomination.company_name || 'Company';

  const handleSendEmail = async () => {
    if (!email || !transactionalId) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/send-nominee-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nominationId: nomination.id,
          email: email,
          transactionalId: transactionalId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Email sent successfully!' });
        onEmailSent?.();
        setTimeout(() => {
          setIsOpen(false);
          setMessage(null);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to send email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastEmailSent = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Email to Nominee
          </DialogTitle>
          <DialogDescription>
            Send a notification email to {nomineeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Nominee Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium">{nomineeName}</div>
            <div className="text-xs text-gray-600">
              {nomination.type === 'person' ? 'Person' : 'Company'} • 
              Source: {nomination.nomination_source === 'admin' ? 'Added by Admin' : 'Public Nomination'}
            </div>
          </div>

          {/* Email History */}
          {nomination.last_email_sent_at && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Last Email Sent:</span>
              </div>
              <div className="text-sm text-blue-800 mt-1">
                {formatLastEmailSent(nomination.last_email_sent_at)}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Total emails sent: {nomination.email_sent_count || 0}
              </div>
            </div>
          )}

          {/* Email Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nominee@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="transactionalId">Transactional ID</Label>
              <Input
                id="transactionalId"
                value={transactionalId}
                onChange={(e) => setTransactionalId(e.target.value)}
                placeholder="cmfb0xhia0qnaxj0ig98plajz"
                className="mt-1"
              />
              <div className="text-xs text-gray-500 mt-1">
                Default ID for nominee notifications
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isLoading || !email || !transactionalId}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isLoading ? 'Sending...' : 'Send Email'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}