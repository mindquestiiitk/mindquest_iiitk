import { useState } from "react"
import { Link } from "react-router-dom"

interface EventCardProps {
  id: string
  title: string
  image: string
  images: string[]
  poster: string
  brief: string
  thumbnail?: string
}

export function EventCard({ id, title, images, poster, brief }: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative overflow-hidden font-montserrat group transform transition-all duration-300 hover:scale-105  bg-eventcard-background border-card-overlay-background rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-0">
        <img
          src={poster || images[0]}
          alt={title}
          className="w-full h-[200px] object-cover transition-all duration-500 transform"
          style={{
            opacity: isHovered ? 0.8 : 1,
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        />
        <div
          className={`absolute inset-0 bg-card-overlay-background/50 bg-opacity-100 flex flex-col justify-center items-center p-4 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-100 md:opacity-0 translate-y-0 md:translate-y-4"
            }`}
        >
          <h3 className="text-white text-xl font-bold mb-2 transform transition-all duration-300">{title}</h3>
          <p className="text-white text-sm font-light mb-4 text-center transform transition-all duration-300">{brief}</p>
          <Link to={`/events/${id}`} className="transform transition-all duration-300 hover:scale-105">
            <button className="px-4 py-2 bg-white md:bg-[#D4F3D9] text-card-overlay-background hover:bg-white  hover:text-card-overlay-background transition-all duration-300 rounded-md">
              Know More
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

