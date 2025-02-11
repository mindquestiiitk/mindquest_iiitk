import { motion } from "framer-motion"
import { EventCard } from "../components/EventCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"

// Define interfaces
interface Event {
  id: string
  title: string
  date: string
  image: string
  images: string[]
  poster: string
  brief: string
}

interface EventsData {
  events: Event[]
}

interface EventGridProps {
  events: Event[]
  animate?: boolean
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
)

export function Events() {
  const [eventsData, setEventsData] = useState<EventsData | null>(null)

  useEffect(() => {
    document.title = "MindQuest - Events"
      ; (async () => {
        try {
          const response = await fetch("./events.json")
          const data = await response.json()
          setEventsData(data)
        } catch (error) {
          console.error("Error fetching events data:", error)
        }
      })()
  }, [])

  const findUpcomingEvents = (events: Event[]) => {
    const currentDate = new Date();
    return events.filter((event) => {
      const [day,month, year] = event.date.split("/").map(Number);
      const eventDate = new Date(year, month - 1, day); // Month is 0-based in JavaScript Date()
      return eventDate > currentDate;
    });
  };

  const findPastEvents = (events: Event[]) => {
    const currentDate = new Date();
    return events.filter((event) => {
      const [day, month, year] = event.date.split("/").map(Number);
      const eventDate = new Date(year, month - 1, day); // Month is 0-based in JavaScript Date()
      return eventDate < currentDate;
    });
  };
  

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
              <TabsTrigger className="data-[state=active]:bg-accent/90 data-[state=active]:text-white" value="past">Past Events</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-accent/90 data-[state=active]:text-white" value="upcoming">Upcoming Events</TabsTrigger>
            </TabsList>
            <TabsContent value="past">
              {eventsData && eventsData.events && (
                <EventGrid events={findPastEvents(eventsData.events)} />
              )}
            </TabsContent>
            <TabsContent value="upcoming">
              {eventsData && eventsData.events && (
                <EventGrid events={findUpcomingEvents(eventsData.events)} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}