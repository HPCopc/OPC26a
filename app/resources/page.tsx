import React from 'react';
import Link from 'next/link';

export default function ResourcesPage() {
  return (
    <div >
      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Title */}
        <h1 className="text-4xl font-bold mb-12 text-gray-900 border-b border-gray-200 pb-4">
          Resources
        </h1>

        {/* Crude Management Section */}
        <section className="mb-16">
          {/* Section Title */}
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Crude Management</h2>

          {/* Description Paragraph */}
          <div className="prose prose-lg text-gray-700 mb-8">
            <p className="leading-relaxed">
              This online knowledge base offers extensive coverage of crude management skills 
              to help refiners incorporate unconventional oil into the refinery crude slate. 
              It identifies major concerns and solutions, including corrosion caused by high 
              TAN crudes, fouling in desalters and subsequent units, catalyst deactivation 
              from highly contaminated crudes, analysis and miscibility determination methods, 
              assays and simulation, selection and blending, blending mechanics, and solutions 
              to oil storage and logistics issues.
            </p>
          </div>

          {/* Learn More Link */}
          <Link 
            href="/resources/crude-management" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group"
          >
            Learn more 
            <svg 
              className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </section>

        {/* Additional Resources Sections (You can add more as needed) */}
       </div>

      {/* Optional: Add metadata for SEO */}
      <HeadContent />
    </div>
  );
}

// Separate component for head metadata (Next.js App Router)
function HeadContent() {
  return (
    <>
      <title>Resources | Opportunity Crudes</title>
      <meta 
        name="description" 
        content="Online knowledge base offering extensive coverage of crude management skills for refiners incorporating unconventional oil into refinery crude slates." 
      />
    </>
  );
}