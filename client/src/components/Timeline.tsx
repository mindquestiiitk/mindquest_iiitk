import React, { useState, useEffect, useRef } from 'react';

const Timeline = ({ events }: { events: { date: string; name: string; details: string }[] }) => {
  const [isVisible, setIsVisible] = useState(new Array(events.length).fill(false));
  const eventRefs = useRef(events.map(() => React.createRef()));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = eventRefs.current.findIndex(ref => ref.current === entry.target);
          if (entry.isIntersecting && index !== -1) {
            setIsVisible((prev) => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 } // Adjust threshold as needed
    );

    eventRefs.current.forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      eventRefs.current.forEach((ref) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, [events]);

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-1/2 h-full border-black-500 border-2 -translate-x-1/2"></div>

      {/* Events */}
      {events.map((event, index) => (
        <div
          key={index}
          ref={eventRefs.current[index]}
          className={`relative flex items-center my-12 ${
            index % 2 === 0 ? 'justify-start' : 'justify-end'
          } ${isVisible[index] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-opacity duration-1000 ease-in-out transition-transform`}
        >
          {/* Dot on the line */}
          <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full z-10"></div>

          {/* Event Details (left or right) */}
          <div
            className={`w-1/2 px-4 ${
              index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'
            }`}
          >
            <h3 className="font-semibold">{event.date}</h3>
            <p className="text-gray-600">{event.name}</p>
            <p className="text-gray-500">{event.details}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
