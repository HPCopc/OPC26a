// Contact Us - public page. The form itself is a client component.
import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Opportunity Crudes',
  description: 'Contact OpportunityCrudes.com about advertising, events and the Opportunity Crudes Conference.',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 border-b border-gray-200 pb-4">
        Contact Us
      </h1>

      <div className="flex flex-col md:flex-row gap-10">
        <section className="md:w-3/5 md:pr-10 md:border-r md:border-gray-200">
          <ContactForm />
        </section>

        <aside className="md:w-2/5 flex flex-col gap-6 text-gray-700">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Telephone</p>
            <a href="tel:+16104080117" className="hover:underline">+1 610.408.0117</a>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Email</p>
            <a href="mailto:Info@opportunitycrudes.com" className="text-blue-600 hover:underline">
              Info@opportunitycrudes.com
            </a>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Mail</p>
            <address className="not-italic leading-relaxed">
              P.O. Box 815<br />
              Paoli, PA 19301-0815<br />
              USA
            </address>
          </div>
        </aside>
      </div>
    </div>
  );
}
