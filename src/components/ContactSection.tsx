"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Linkedin, MessageCircle, X } from "lucide-react";
import { WSAButton } from "@/components/ui/wsa-button";

interface ContactPerson {
  name: string;
  email: string;
  linkedin: string;
  role: string;
}

const contacts: ContactPerson[] = [
  {
    name: "Rupesh Kumar",
    email: "Rupesh.kumar@candidate.ly",
    linkedin: "https://www.linkedin.com/in/iamrupesh/",
    role: "Technical Lead"
  },
  {
    name: "Jan Jedlinski",
    email: "Jan@candidate.ly",
    linkedin: "https://www.linkedin.com/in/janjedlinski/",
    role: "Director"
  }
];

interface ContactButtonProps {
  position?: 'left' | 'right';
}

export function ContactButton({ position = 'left' }: ContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClass = position === 'right' ? 'bottom-6 right-4' : 'bottom-6 left-4';

  return (
    <>
      {/* Floating Contact Button */}
      <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none">
        <div className="container mx-auto px-4">
          <div className="flex justify-end">
            <motion.div
              className="pointer-events-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <WSAButton
                onClick={() => setIsOpen(true)}
                variant="primary"
                className="flex items-center gap-2"
                style={{ width: '180.66px', height: '45.6px' }}
              >
                <MessageCircle className="h-6 w-6" />
                <span className="hidden sm:inline text-lg font-medium">Need Help?</span>
              </WSAButton>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contact Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-orange-500" />
                  <h3 className="text-xl font-semibold text-gray-900">Need Help?</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-600 text-sm mb-6">
                Our team is here to assist you with any questions about nominations, voting, or the World Staffing Awards process.
              </p>

              {/* Contact Cards */}
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div 
                    key={contact.email}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                  >
                    <div className="text-center mb-4">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {contact.name}
                      </h4>
                      <p className="text-gray-600 text-xs">
                        {contact.role}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {/* Email Button */}
                      <WSAButton
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          window.open(`mailto:${contact.email}`, '_blank');
                          setIsOpen(false);
                        }}
                      >
                        <Mail className="mr-1 h-3 w-3" />
                        Email
                      </WSAButton>

                      {/* LinkedIn Button */}
                      <WSAButton
                        variant="secondary"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => {
                          window.open(contact.linkedin, '_blank');
                          setIsOpen(false);
                        }}
                      >
                        <Linkedin className="mr-1 h-3 w-3" />
                        LinkedIn
                      </WSAButton>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <p className="text-gray-500 text-xs">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}