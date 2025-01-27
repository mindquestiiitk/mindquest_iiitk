import { motion } from "framer-motion"
import { EventCard } from "../components/EventCard"
import Footer from "@/components/Footer"
import Navbar_Home from "@/components/Navbar/Navbar_Home"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the Event interface
interface Event {
  id: string
  title: string
  image: string
  brief: string
}

const upcomingEvents: Event[] = [
  {
    id: "1",
    title: "Mental Wellness Workshop",
    image: "https://www.thewowstyle.com/wp-content/uploads/2015/01/nature-images..jpg",
    brief: "Join us for a transformative experience",
  },
  {
    id: "2",
    title: "Mindfulness Retreat",
    image: "https://via.placeholder.com/300x200",
    brief: "Discover inner peace and clarity",
  },
  {
    id: "3",
    title: "Stress Management Seminar",
    image: "https://via.placeholder.com/300x200",
    brief: "Learn effective coping strategies",
  },
  {
    id: "4",
    title: "Stress Management Seminar",
    image: "https://via.placeholder.com/300x200",
    brief: "Learn effective coping strategies",
  },
  {
    id: "5",
    title: "Stress Management Seminar",
    image: "https://via.placeholder.com/300x200",
    brief: "Learn effective coping strategies",
  },
  {
    id: "6",
    title: "Stress Management Seminar",
    image: "https://via.placeholder.com/300x200",
    brief: "Learn effective coping strategies",
  },
  {
    id: "7",
    title: "Stress Management Seminar",
    image: "https://via.placeholder.com/300x200",
    brief: "Learn effective coping strategies",
  },
]

const pastEvents: Event[] = [
  {
    id: "p1",
    title: "Meditation Workshop 2023",
    image: "https://via.placeholder.com/300x200",
    brief: "A deep dive into meditation practices",
  },
  {
    id: "p2",
    title: "Yoga Retreat 2023",
    image: "https://via.placeholder.com/300x200",
    brief: "Three days of mindful movement",
  },
  {
    id: "p3",
    title: "Mental Health Symposium",
    image: "https://via.placeholder.com/300x200",
    brief: "Expert talks on mental wellness",
  },
  {
    id: "p4",
    title: "Wellness Conference 2023",
    image: "https://via.placeholder.com/300x200",
    brief: "Annual gathering of wellness experts",
  },
]

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
  return (
    <div className="relative flex flex-col min-h-screen">
      <div className=" z-50">
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
              <EventGrid events={upcomingEvents} />
            </TabsContent>
            <TabsContent value="past">
              <EventGrid events={pastEvents} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}

