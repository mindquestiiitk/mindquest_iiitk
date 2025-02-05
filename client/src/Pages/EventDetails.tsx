import { useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { events } from "../../public/events.json"
import { useEffect } from "react";
import { EventCarousel } from "@/components/EventCarousel";

export function EventDetail() {
    const { eventId } = useParams<{ eventId: string }>();
    const event = events.find((e) => e.id === eventId);
    useEffect(() => {
        const onLoad = () => {
            window.scrollTo(0, 0);
        }
        window.addEventListener("load", onLoad);
        return () => window.removeEventListener("load", onLoad)
    }, [])

    if (!event) {
        return <div>Event not found</div>;
    }

    // const organizers = [
    //     { id: 1, name: "Organizer 1", image: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250" },
    //     { id: 2, name: "Organizer 2", image: "https://i.pravatar.cc/250?u=mail@ashallendesign.co.uk" },
    //     { id: 3, name: "Organizer 3", image: "https://eu.ui-avatars.com/api/?name=Sarthak+Gupta&size=250" },
    //     // use https://eu.ui-avatars.com/api/?name=John+Doe&size=250 to generate random avatar from name
    // ];

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto py-8 px-4"
            >
                <div className="flex flex-col md:flex-row gap-8 bg-eventcard-background rounded-2xl overflow-hidden shadow-xl">
                    {/* Left Section */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="md:w-1/2 flex flex-col"
                    >
                        {/* Top half - Event Image */}
                        {event.poster &&
                            <div className="max-h-1/2 flex-shrink-0 flex items-center justify-center">
                                <img
                                    src={event.poster || "/placeholder.svg"}
                                    alt={event.title}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                        }
                            <EventCarousel images={event.images} />

                    </motion.div>

                    {/* Right Section */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="md:w-1/2 p-8"
                    >
                        <h1 className="text-3xl font-bold mb-4 text-card-overlay-background font-acme">
                            {event.title}
                        </h1>
                        <p className="text-card-overlay-background/80 mb-4">
                            {event.date}
                        </p>
                        <p className="text-card-overlay-background/80 mb-6">
                            {event.location}
                        </p>
                        {
                            event.description.split('\n').map((line) => (
                                <p className="text-lg mb-6 text-card-overlay-background">
                                    {line}
                                </p>
                            ))
                        }
                        {/* Bottom half - Organizer Images */}
                        {/* <div className="h-1/8 bg-background-secondary p-4 flex gap-4 justify-center items-center">
                            {organizers.map((organizer) => (
                                <div
                                    key={organizer.id}
                                    className="w-20 h-20 rounded-full overflow-hidden shadow-md "
                                >
                                    <img
                                        src={organizer.image}
                                        alt={organizer.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div> */}
                        {/* <button className="px-4 py-2 bg-card-overlay-background text-white hover:bg-card-overlay-background/90 transition-all duration-300 rounded-md">
                            Register Now
                        </button> */}
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}


