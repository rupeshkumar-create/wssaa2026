"use client";

import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { WSAButton } from "@/components/ui/wsa-button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <ScrollReveal>
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              About World Staffing Awards 2026
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Recognizing excellence and innovation in the global staffing industry since 2021
            </p>
          </div>
        </ScrollReveal>

        {/* Mission Section */}
        <ScrollReveal delay={0.1}>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The World Staffing Awards celebrates the outstanding achievements of individuals and companies 
              who are driving transformation in the talent acquisition and staffing industry. Since 2021, our mission is 
              to recognize innovation, excellence, and leadership that shapes the future of work.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Through this platform, we honor those who demonstrate exceptional performance, innovative 
              solutions, and commitment to advancing the staffing profession globally.
            </p>
            <p className="text-gray-600 leading-relaxed">
              As part of the annual <a href="https://www.candidately.com/worldstaffingsummit" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-600 underline">World Staffing Summit</a>, 
              these awards have become a cornerstone event for recognizing excellence in our industry, bringing together 
              the global staffing community to celebrate achievements and share insights.
            </p>
          </section>
        </ScrollReveal>

        {/* What We Celebrate */}
        <ScrollReveal delay={0.2}>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">What We Celebrate</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Innovation</h3>
                <p className="text-gray-600 leading-relaxed">
                  Groundbreaking solutions and technologies that transform how we connect talent with opportunities.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Excellence</h3>
                <p className="text-gray-600 leading-relaxed">
                  Outstanding performance and results that set new standards in the staffing industry.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Leadership</h3>
                <p className="text-gray-600 leading-relaxed">
                  Visionary leaders who inspire change and drive the industry forward.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Impact</h3>
                <p className="text-gray-600 leading-relaxed">
                  Meaningful contributions that create positive change in the world of work.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* World Staffing Summit Connection */}
        <ScrollReveal delay={0.3}>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Part of the World Staffing Summit</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The World Staffing Awards is proudly presented as part of the annual World Staffing Summit, 
              a premier conference that has been bringing together industry leaders, innovators, and professionals 
              since 2021. This yearly conference serves as the global gathering point for the staffing and 
              recruitment community.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              The Summit features keynote presentations, panel discussions, networking opportunities, and the 
              highlight of our awards ceremony, where we celebrate the year's most outstanding achievements 
              in staffing and talent acquisition.
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed">
                <strong>Learn more about the World Staffing Summit:</strong> Visit{' '}
                <a href="https://www.candidately.com/worldstaffingsummit" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:text-orange-700 underline font-medium">
                  candidately.com/worldstaffingsummit
                </a>{' '}
                to discover the full conference experience, including speaker lineup, agenda, and registration details.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* Award Categories */}
        <ScrollReveal delay={0.4}>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Award Categories</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Our comprehensive award categories recognize excellence across all aspects of the staffing industry:
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2 text-gray-900">Individual Excellence</h3>
                <p className="text-sm text-gray-600">
                  Recognizing outstanding professionals who have made significant contributions to the industry.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2 text-gray-900">Company Innovation</h3>
                <p className="text-sm text-gray-600">
                  Celebrating organizations that lead through innovation and exceptional service delivery.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2 text-gray-900">Industry Impact</h3>
                <p className="text-sm text-gray-600">
                  Honoring initiatives that create lasting positive change in the staffing ecosystem.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Voting Process */}
        <ScrollReveal delay={0.5}>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Voting Process</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The World Staffing Awards follows a transparent and fair voting process that ensures the most 
              deserving candidates are recognized for their achievements.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">Nomination</h3>
                  <p className="text-gray-600 text-sm">
                    Industry professionals submit nominations for outstanding individuals and companies.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">Review</h3>
                  <p className="text-gray-600 text-sm">
                    All nominations are carefully reviewed and verified by our expert panel.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">Voting</h3>
                  <p className="text-gray-600 text-sm">
                    The industry community votes for their preferred nominees in each category.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-gray-900">Recognition</h3>
                  <p className="text-gray-600 text-sm">
                    Winners are announced and celebrated at our annual awards ceremony.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Contact */}
        <ScrollReveal delay={0.6}>
          <section className="text-center bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Get Involved</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Join us in celebrating excellence in the staffing industry. Whether you're nominating 
              a colleague, voting for your favorites, or simply following the awards, your participation 
              helps recognize the best in our industry.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <WSAButton asChild variant="primary" size="lg">
                <Link href="/nominees">
                  View Nominees
                </Link>
              </WSAButton>
              <a 
                href="mailto:info@worldstaffingawards.com" 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-0 flex items-center justify-center"
                style={{
                  width: '189.02px',
                  height: '45.6px',
                  border: 'none'
                }}
              >
                Contact Us
              </a>
            </div>
          </section>
        </ScrollReveal>
      </div>
    </div>
  );
}