// About Us - static page. Text is from the About Us page of the original
// opportunitycrudes.com site.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Opportunity Crudes',
  description:
    'Opportunity Crudes, from Hydrocarbon Publishing Company, is a knowledge base for refiners processing opportunity (price-advantaged) crudes.',
};

const offerings = [
  {
    title: 'Market Trends and Outlooks',
    text: 'We have been monitoring and assessing oil market for global refiners over 30 years with main focus on oil futures and spot prices, production trends of heavy crudes and shale oil, and crack margins. Because of market volatility and shifting refining economics, it is important and invaluable for operators to keep abreast of changing trends of opportunity crudes and stay profitable.',
  },
  {
    title: 'Latest Technologies',
    text: 'Technology developments in process designs, catalysts and additives, hardware equipment, analytical instruments, and Internet of Things (IoT) are ongoing to solve evolving problems. We report the latest commercial licenses, usage announcements, and unit revamps to keep refiners well-informed ahead of the competition.',
  },
  {
    title: 'Crude Processing Experiences',
    text: 'We offer indispensable operating experiences via timely webinars and white papers to shares knowledges of industry practitioners and technology holders with real case studies. Selected presentations of our Opportunity Crudes Conferences are also available to support insights of processing practices worldwide.',
  },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-4xl font-bold mb-8 text-gray-900 border-b border-gray-200 pb-4">
        About Us
      </h1>

      <p className="text-lg leading-relaxed text-gray-700 mb-12">
        Opportunity Crudes webpage is created and supported by Hydrocarbon Publishing Company, a part
        of HPC Global Energy, to provide a comprehensive knowledge base for refiners to process
        opportunity crudes (aka price-advantaged crudes). The goal is to help the industry tackle
        inherently poorer quality of these less expensive crudes—high volumes of residual or
        bottom-of-the-barrel fractions and/or highly acidic (or high TAN number)—and overcome
        property issues resulted from upstream and midstream operations, e.g., contaminated with
        organic chlorides, methanol, and other additives.
      </p>

      <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">What we do</h2>
      <p className="text-gray-700 mb-8 text-center">
        We offer three key information: <b>Market Trends and Outlooks</b>, <b>Latest Technologies</b>,{' '}
        <b>Crude Processing Experiences</b>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {offerings.map(({ title, text }) => (
          <section key={title}>
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">{title}</h3>
            <p className="leading-relaxed text-gray-700">{text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
