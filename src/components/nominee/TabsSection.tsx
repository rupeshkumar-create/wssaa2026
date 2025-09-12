"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShareButtons } from "@/components/ShareButtons";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { User, Building2, Calendar, Award, Share2, Info } from "lucide-react";
import { formatCategoryName } from "@/lib/utils/category-formatter";

interface TabsSectionProps {
  nominee: any;
  nomineeData: any;
  whyVoteText?: string;
  isPersonNomination: boolean;
}

export function TabsSection({ nominee, nomineeData, whyVoteText, isPersonNomination }: TabsSectionProps) {
  // Set default tab to "why-vote" if available, otherwise "details"
  const [activeTab, setActiveTab] = useState(whyVoteText ? "why-vote" : "details");

  const tabs = [
    { id: "why-vote", label: "Why Vote", icon: Award, disabled: !whyVoteText },
    { id: "details", label: "Details", icon: Info },
    { id: "share", label: "Share", icon: Share2 },
  ].filter(tab => !tab.disabled);

  const tabContent = {
    details: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-0 shadow-md rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Award className="h-5 w-5 mr-2 text-orange-500" />
                Category Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-gray-700">Award Category</h4>
                <Badge variant="outline" className="text-sm">
                  {formatCategoryName(nomineeData.category) || 'Unknown Category'}
                </Badge>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-2 text-gray-700">Nomination Type</h4>
                <Badge variant={isPersonNomination ? "default" : "secondary"}>
                  {isPersonNomination ? "Individual Nomination" : "Company Nomination"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-gray-700">Nomination Date</h4>
                <p className="text-gray-600">
                  {nomineeData.createdAt ? new Date(nomineeData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
              {nomineeData.approvedAt && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 text-gray-700">Approved Date</h4>
                    <p className="text-gray-600">
                      {new Date(nomineeData.approvedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional nominee information */}
        <Card className="border-0 shadow-md rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              {isPersonNomination ? (
                <User className="h-5 w-5 mr-2 text-orange-500" />
              ) : (
                <Building2 className="h-5 w-5 mr-2 text-orange-500" />
              )}
              {isPersonNomination ? "Professional Information" : "Company Information"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isPersonNomination && (nominee.title || nominee.jobtitle) && (
                <div>
                  <h4 className="font-medium mb-1 text-gray-700">Position</h4>
                  <p className="text-gray-600">{nominee.title || nominee.jobtitle}</p>
                </div>
              )}
              
              {!isPersonNomination && nominee.industry && (
                <div>
                  <h4 className="font-medium mb-1 text-gray-700">Industry</h4>
                  <p className="text-gray-600">{nominee.industry}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    "why-vote": whyVoteText && (
      <Card className="border-0 shadow-md rounded-xl">
        <CardHeader className="pb-4 px-4 md:px-6 pt-6">
          <CardTitle className="flex items-center text-lg md:text-xl">
            <Award className="h-5 w-5 mr-2 text-orange-500" />
            Why you should vote for {nominee.displayName || nominee.name || 'this nominee'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 px-4 md:px-6 pb-6">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
              {whyVoteText}
            </p>
          </div>
        </CardContent>
      </Card>
    ),
    share: (
      <Card className="border-0 shadow-md rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2 text-orange-500" />
            Share This Nomination
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Help spread the word about this outstanding nominee by sharing their profile with your network.
            </p>
            <ShareButtons 
              nomineeName={nominee.displayName || nominee.name || 'Nominee'}
              liveUrl={nomineeData.liveUrl || ''}
            />
          </div>
        </CardContent>
      </Card>
    ),
  };

  return (
    <ScrollReveal>
      <section className="bg-slate-50 p-6 md:p-8">
        <div className="max-w-full">
          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8 bg-white rounded-xl p-2 md:p-3 shadow-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-xl font-semibold transition-all duration-300 relative z-10 text-sm md:text-base whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#00AEC5] to-[#0D8196] text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-[#00AEC5] hover:bg-gradient-to-r hover:from-[#00AEC5]/10 hover:to-[#0D8196]/10"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-1.5 md:mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {tabContent[activeTab as keyof typeof tabContent]}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </ScrollReveal>
  );
}