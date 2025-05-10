import { useState, useRef, useEffect } from 'react';
import { faqs } from './faqs';
import gsap from 'gsap';

type DetailsSectionProps = {
    summary: React.ReactNode;
    content: string;
};

const DetailsSection: React.FC<DetailsSectionProps> = ({ summary, content }) => {
    const [isOpen, setIsOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const animation = useRef<gsap.core.Timeline>();
    const arrowRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!contentRef.current) return;

        // Animation setup
        const ctx = gsap.context(() => {
            // Initial state
            gsap.set(contentRef.current, { height: 0, opacity: 0 });
            gsap.set(arrowRef.current, { rotate: isOpen ? 180 : 0 });
        });

        return () => { ctx.revert(); };
    }, []);

    useEffect(() => {
        if (!contentRef.current || !arrowRef.current) return;

        const contentHeight = contentRef.current.scrollHeight;

        if (isOpen) {
            // Open animation sequence
            animation.current = gsap.timeline()
                .to(arrowRef.current, {
                    rotate: 180,
                    duration: 0.2,
                    ease: "power2.out"
                })
                .to(contentRef.current, {
                    height: contentHeight,
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.inOut"
                }, "<0.1");
        } else {
            // Close animation sequence
            animation.current = gsap.timeline()
                .to(arrowRef.current, {
                    rotate: 0,
                    duration: 0.2,
                    ease: "power2.out"
                })
                .to(contentRef.current, {
                    height: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.inOut"
                }, "<0.1");
        }

        return () => {animation.current?.kill();}
    }, [isOpen]);

    return (
        <div className="w-full border-b border-primary-green font-roboto text-primary-green">
            <button
                className="w-full px-4 py-2 flex justify-between items-center focus:outline-none hover:text-green-600 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                {summary}
                <span ref={arrowRef} className="ml-4">▼</span>
            </button>
            <div
                ref={contentRef}
                className="overflow-hidden will-change-transform"
                style={{ opacity: 0, height: 0 }}
            >
                <div className="px-4 py-6 pt-0 ml-4 mt-4 text-black">
                    {content}
                </div>
            </div>
        </div>
    );
};

const FAQ = () => {
    return (
        <section className="bg-white text-primary-green font-roboto mb-12">
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
