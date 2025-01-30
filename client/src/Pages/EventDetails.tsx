import { useParams } from "react-router-dom"
import { motion } from "framer-motion"


// Mock data - replace with actual data fetching logic
const events = [
    {
        id: "1",
        title: "Mental Wellness Workshop",
        image: "https://www.thewowstyle.com/wp-content/uploads/2015/01/nature-images..jpg",
        brief: "Join us for a transformative experience",
        description:
            "Discover techniques and strategies to enhance your mental well-being in this interactive workshop. Learn from experts and connect with like-minded individuals in a supportive Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas repudiandae reiciendis deserunt similique? Laudantium laborum perferendis, officiis debitis dolores, optio, aut id accusamus neque necessitatibus reprehenderit! Quaerat in doloribus quae itaque atque! Dolorum eligendi omnis ratione aperiam mollitia error dolor assumenda quam iste ea? Aspernatur atque quas voluptatem culpa ducimus. Rem facere minus nobis possimus consequuntur laborum ex deleniti non saepe exercitationem delectus, eveniet officiis voluptates fugiat soluta aspernatur perspiciatis. Autem laudantium optio ratione illum nemo consectetur omnis. Totam nobis quas doloremque optio sequi expedita culpa fuga itaque pariatur alias voluptas asperiores quisquam, odit consequuntur, corrupti et reprehenderit quam? Expedita doloremque enim ipsum modi tempore nam sequi consequuntur cum quos veritatis quasi iusto, iure tenetur deleniti eveniet, eum provident, amet perferendis? Autem, maiores debitis! Iure rem tempore quam animi recusandae praesentium aut voluptatem obcaecati sed nostrum? Molestias ab, optio voluptate facilis placeat tempore incidunt dolores! Suscipit mollitia id molestiae accusantium voluptates animi voluptate. Asperiores nihil repudiandae, ipsa consequuntur possimus accusamus minima tempore omnis quas, eveniet quia suscipit quam? Quia, dicta? Voluptatem non inventore velit deserunt labore ea! Sunt alias accusamus consequatur? Quae ratione voluptate quod. Dolore placeat et atque autem distinctio, quos excepturi id ab qui adipisci ipsum voluptates perferendis?",
        date: "August 15-17, 2023",
        location: "Mindful Center, California",
    },
    // Add more events as needed
]

export function EventDetail() {
    const { eventId } = useParams<{ eventId: string }>();
    const event = events.find((e) => e.id === eventId);

    if (!event) {
        return <div>Event not found</div>;
    }

    const organizers = [
        { id: 1, name: "Organizer 1", image: "https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250" },
        { id: 2, name: "Organizer 2", image: "https://i.pravatar.cc/250?u=mail@ashallendesign.co.uk" },
        { id: 3, name: "Organizer 3", image: "https://eu.ui-avatars.com/api/?name=Sarthak+Gupta&size=250" },
        // use https://eu.ui-avatars.com/api/?name=John+Doe&size=250 to generate random avatar from name
    ];

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
                        <div className="h-1/2 flex-shrink-0">
                            <img
                                src={event.image || "/placeholder.svg"}
                                alt={event.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Bottom half - Organizer Images */}
                        <div className="h-1/2 bg-background-secondary p-4 flex gap-4 justify-center items-center">
                            {organizers.map((organizer) => (
                                <div
                                    key={organizer.id}
                                    className="w-20 h-20 rounded-full overflow-hidden shadow-md"
                                >
                                    <img
                                        src={organizer.image}
                                        alt={organizer.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
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
                        <p className="text-lg mb-6 text-card-overlay-background">
                            {event.description}
                        </p>
                        <button className="px-4 py-2 bg-card-overlay-background text-white hover:bg-card-overlay-background/90 transition-all duration-300 rounded-md">
                            Register Now
                        </button>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
}


