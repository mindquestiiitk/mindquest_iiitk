import { motion } from "framer-motion"
import { EventCard } from "../components/EventCard"
import Footer from "@/components/Footer"
import Navbar_Home from "@/components/Navbar/Navbar_Home"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"

// Define interfaces
interface Event {
  id: string
  title: string
  image: string
  brief: string
}

interface EventsData {
  events: {
    upcomingEvents: Event[]
    pastEvents: Event[]
  }
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
    ;(async () => {
      try {
        const response = await fetch("./events.json")
        const data = await response.json()
        console.log("Fetched events data:", data)
        setEventsData(data)
      } catch (error) {
        console.error("Error fetching events data:", error)
      }
    })()
  }, [])

  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="z-50">
        <Navbar_Home />
      </div>
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

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2 mx-auto mb-8">
              <TabsTrigger className="data-[state=active]:bg-accent/90 data-[state=active]:text-white" value="upcoming">Upcoming Events</TabsTrigger>
              <TabsTrigger className="data-[state=active]:bg-accent/90 data-[state=active]:text-white" value="past">Past Events</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              {eventsData && eventsData.events.upcomingEvents && (
                <EventGrid events={eventsData.events.upcomingEvents} />
              )}
            </TabsContent>
            <TabsContent value="past">
              {eventsData && eventsData.events.pastEvents && (
                <EventGrid events={eventsData.events.pastEvents} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}