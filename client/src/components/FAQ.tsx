import React, { useState } from 'react';
import { faqs } from './faqs';

type DetailsSectionProps = {
  summary: React.ReactNode;
  content: string;
};

const DetailsSection: React.FC<DetailsSectionProps> = ({ summary, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="w-full border-b border-primary-green font-roboto hover:cursor-pointer text-primary-green"
      open={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      <summary className="px-4 py-2 flex justify-between items-center focus:outline-none focus-visible:text-primary-green">
        {summary}
        <span className="ml-4">{isOpen ? '▲' : '▼'}</span>
      </summary>
      <p className="px-4 py-6 pt-0 ml-4 -mt-4 text-black">
        {content}
      </p>
    </details>
  );
};

const FAQ = () => {
  return (
    <section className="bg-white text-primary-green font-roboto">
      <div className="container flex flex-col justify-center px-4 py-8 mx-auto md:p-8">
        <h2 className="text-2xl font-acme text-primary-green font-semibold sm:text-4xl my-auto py-6">
          FAQs
        </h2>
        <hr className="border-primary-green mb-4" />
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <DetailsSection
              key={index}
              summary={<span className="text-lg">{faq.question}</span>}
              content={faq.answer}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
