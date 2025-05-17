import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { parseDate } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  title: string;
  image: string;
  brief: string;
  date: string;
}

interface TimelineItemProps {
  event: TimelineEvent;
  isLeft: boolean;
  index: number;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ event, isLeft, index }) => {
  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  return (
    <div 
      ref={ref}
      className={`mb-16 flex flex-col ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} md:items-center`}
      data-index={index}
    >
      {/* Timeline connector - desktop only */}
      <div 
        className={`w-6 h-6 rounded-full border-4 border-green-500 bg-white flex items-center justify-center
          md:absolute md:left-1/2 md:-translate-x-1/2 z-10
          hidden md:flex
          ${inView ? 'animate-pulse' : 'opacity-50'}`}
      />
      
      {/* Mobile timeline connector - only visible on mobile */}
      <div 
        className={`w-6 h-6 rounded-full border-4 border-green-500 bg-white flex items-center justify-center 
          absolute left-0 md:hidden
          ${inView ? 'animate-pulse' : 'opacity-50'}`}
      />
      
      {/* Date connector line - desktop only */}
      <div 
        className={`hidden md:block md:absolute h-0.5 bg-green-500 
          ${isLeft ? 'left-1/2 w-10 translate-x-1/2' : 'right-1/2 w-10 -translate-x-1/2'}`}
      />
      
      {/* Date - desktop */}
      <div 
        className={`hidden md:block md:absolute text-sm font-bold text-green-600 bg-green-100 py-1 px-2 rounded-full z-10
          ${isLeft ? 'md:left-1/2 md:translate-x-10' : 'md:right-1/2 md:-translate-x-10'}`}
      >
        {event.date}
      </div>
      
      {/* Date - mobile */}
      <div className="text-sm font-bold text-green-600 ml-10 mb-2 md:hidden">
        {event.date}
      </div>
      
      {/* Content */}
      <div 
        className={`w-full md:w-5/12 pl-10 md:pl-0 md:px-6 ${
          inView ? (isLeft ? 'md:animate-fadeInLeft' : 'md:animate-fadeInRight') : 'opacity-0'
        } animate-fadeIn`}
      >
        <Link to={`/events/${event.id}`} className="block">
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-800 mb-2">{event.title}</h3>
            <p className="text-gray-600">{event.brief}</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

const Timeline: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('./events.json');
        const data = await response.json();
        setEvents(data.events);
      } catch (error) {
        console.error('Error fetching events data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-4">
      <div className="lg:container mx-auto px-4 relative">
        <h2 className="text-3xl font-bold text-center text-green-800 my-8">Timeline</h2>
        
        {/* Central line - desktop */}
        <div className="absolute left-1/2 top-32 bottom-0 w-0.5 bg-gray-300 -translate-x-1/2 hidden md:block"></div>
        
        {/* Left line - mobile */}
        <div className="absolute left-0 top-32 bottom-0 w-0.5 bg-gray-300 md:hidden"></div>
        
        <div ref={timelineRef} className="relative pl-6 md:pl-0">
          {events.sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()).map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLeft={index % 2 === 0}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;


