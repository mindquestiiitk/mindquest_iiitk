import { motion } from "framer-motion"
import { EventCard } from "../components/EventCard"
import Footer from "@/components/Footer"
import Navbar_Home from "@/components/Navbar/Navbar_Home"

const events = [
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

export function Events() {
  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar_Home />
      </div>
      <main className="flex-grow mt-16 bg-eventcard-background/30">
        <div className="container mx-auto py-12 px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-8 text-card-overlay-background text-center"
          >
            Upcoming Events
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          >
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
              >
                <EventCard {...event} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  )
}