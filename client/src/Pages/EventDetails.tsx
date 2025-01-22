import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import Footer from "@/components/Footer"
import Navbar_Home from "@/components/Navbar/Navbar_Home"

// Mock data - replace with actual data fetching logic
const events = [
  {
    id: "1",
    title: "Mental Wellness Workshop",
    image: "https://via.placeholder.com/600x400",
    brief: "Join us for a transformative experience",
    description:
      "Discover techniques and strategies to enhance your mental well-being in this interactive workshop. Learn from experts and connect with like-minded individuals in a supportive environment.",
    date: "August 15-17, 2023",
    location: "Mindful Center, California",
  },
  // Add more events as needed
]

export function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const event = events.find((e) => e.id === eventId)

  if (!event) {
    return <div>Event not found</div>
  }

  return (
    <>
    <Navbar_Home/>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-8 px-4"
    >
      <div className="flex flex-col md:flex-row gap-8 bg-[#D4F3D9] rounded-2xl overflow-hidden shadow-xl">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="md:w-1/2"
        >
          <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        </motion.div>
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="md:w-1/2 p-8"
        >
          <h1 className="text-3xl font-bold mb-4 text-[#006838]">{event.title}</h1>
          <p className="text-[#006838]/80 mb-4">{event.date}</p>
          <p className="text-[#006838]/80 mb-6">{event.location}</p>
          <p className="text-lg mb-6 text-[#006838]">{event.description}</p>
          <button className="px-4 py-2 bg-[#006838] text-[#D4F3D9] hover:bg-[#006838]/90 transition-all duration-300 rounded-md">
            Register Now
          </button>
        </motion.div>
      </div>
    </motion.div>
    <Footer/>
    </>
  )
}

