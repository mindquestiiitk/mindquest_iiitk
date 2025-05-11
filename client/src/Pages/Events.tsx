import { motion } from "framer-motion";
import { EventCard } from "../components/EventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

// Define interfaces
interface Event {
  id: string;
  title: string;
  date: string;
  image: string;
  images: string[];
  poster: string;
  brief: string;
}

interface EventGridProps {
  events: Event[];
  animate?: boolean;
}

const EventGrid: React.FC<EventGridProps> = ({ events, animate = true }) => (
  <motion.div
    initial={animate ? { opacity: 0 } : false}
    animate={animate ? { opacity: 1 } : false}
    transition={{ delay: 0.2, duration: 0.5 }}
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
  >
    {events.map((event: Event, index: number) => (
      <motion.div
        key={event.id}
        initial={animate ? { opacity: 0, y: 20 } : false}
        animate={animate ? { opacity: 1, y: 0 } : false}
        transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
      >
        <EventCard {...event} />
      </motion.div>
    ))}
  </motion.div>
);

export function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "MindQuest - Events";
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(
          "Fetching events from:",
          import.meta.env.VITE_API_URL + "/events"
        );
        const response = await fetch(import.meta.env.VITE_API_URL + "/events");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Raw events data received:", data);
        console.log("Number of events received:", data.length);

        // Transform the data to match the Event interface
        const transformedData = data.map((event: any) => {
          console.log("Processing event:", event);
          const transformed = {
            id: event.id,
            title: event.title,
            date: event.date,
            image: event.thumbnail || event.images[0] || "",
            images: event.images || [],
            poster: event.poster || "",
            brief: event.brief,
          };
          console.log("Transformed event:", transformed);
          return transformed;
        });

        console.log("Final transformed data:", transformedData);
        console.log("Number of transformed events:", transformedData.length);
        setEvents(transformedData);
      } catch (error) {
        console.error("Error fetching events data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch events"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Helper function to parse date in DD/MM/YYYY format
  const parseDate = (dateString: string): Date => {
    // Check if the date is in DD/MM/YYYY format
    const parts = dateString.split("/");
    if (parts.length === 3) {
      // Parse as DD/MM/YYYY
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    // Fallback to default parsing
    return new Date(dateString);
  };

  const findUpcomingEvents = (events: Event[]) => {
    const currentDate = new Date();
    console.log("Current date:", currentDate);

    return events.filter((event) => {
      const eventDate = parseDate(event.date);
      console.log(
        `Event: ${event.title}, Date string: ${
          event.date
        }, Parsed date: ${eventDate}, Is upcoming: ${eventDate > currentDate}`
      );
      return eventDate > currentDate;
    });
  };

  const findPastEvents = (events: Event[]) => {
    const currentDate = new Date();
    console.log("Current date:", currentDate);

    return events.filter((event) => {
      const eventDate = parseDate(event.date);
      console.log(
        `Event: ${event.title}, Date string: ${
          event.date
        }, Parsed date: ${eventDate}, Is past: ${eventDate < currentDate}`
      );
      return eventDate < currentDate;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-grow bg-eventcard-background/30">
        <div className="container mx-auto py-12 px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-8 text-card-overlay-background text-center font-acme"
          >
            Events
          </motion.h1>

          <Tabs defaultValue="past" className="w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 mx-auto mb-8">
              <TabsTrigger
                className="data-[state=active]:bg-accent/90 data-[state=active]:text-white"
                value="past"
              >
                Past Events
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:bg-accent/90 data-[state=active]:text-white"
                value="upcoming"
              >
                Upcoming Events
              </TabsTrigger>
            </TabsList>
            <TabsContent value="past">
              <EventGrid events={findPastEvents(events)} />
            </TabsContent>
            <TabsContent value="upcoming">
              <EventGrid events={findUpcomingEvents(events)} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
