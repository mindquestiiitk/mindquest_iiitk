import React from 'react';
import { faqs } from './faqs';


type DetailsSectionProps = {
  summary: string;
  content: string;
};

const DetailsSection: React.FC<DetailsSectionProps> = ({ summary, content }) => {
  return (
    <details className="w-full border rounded-lg font-roboto hover:cursor-pointer text-light-green">
      <summary className="px-4 py-6 focus:outline-none focus-visible:dark:lighter-green">
        {summary}
      </summary>
      <p className="px-4 py-6 pt-0 ml-4 -mt-4 dark:text-gray-600 ">
        {content}
      </p>
    </details>
  );
};


const FAQ = () => {
  return (
    <section className="dark:bg-gray-100 dark:text-gray-800">
      <div className="container flex flex-col justify-center px-4 py-8 mx-auto md:p-8">
        <h2 className="text-2xl font-acme text-light-green font-semibold sm:text-4xl my-auto py-6">
          FAQs
        </h2>
        <div className="space-y-4">
        {faqs.map((faq, index) => (
        <DetailsSection
          key={index}
          summary={faq.question}
          content={faq.answer}
        />
      ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
