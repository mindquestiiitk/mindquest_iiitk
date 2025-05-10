import { useState } from "react";
import { Link } from "react-router-dom";

interface EventCardProps {
  id: string;
  title: string;
  image: string;
  images: string[];
  poster: string;
  brief: string;
  date: string;
  thumbnail?: string;
}

export function EventCard({
  id,
  title,
  images,
  poster,
  brief,
  date,
}: EventCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Format date from DD/MM/YYYY to a more readable format
  const formatDate = (dateString: string): string => {
    try {
      const parts = dateString.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed in JS
        const year = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);

        // Format as "Month DD, YYYY"
        return dateObj.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      }
      return dateString; // Return as is if not in expected format
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Return original on error
    }
  };

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
          className={`absolute inset-0 bg-card-overlay-background/50 bg-opacity-100 flex flex-col justify-center items-center p-4 transition-all duration-300 ${
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-100 md:opacity-0 translate-y-0 md:translate-y-4"
          }`}
        >
          <h3 className="text-white text-xl font-bold mb-1 transform transition-all duration-300">
            {title}
          </h3>
          <p className="text-white text-xs font-medium mb-2 transform transition-all duration-300">
            {formatDate(date)}
          </p>
          <p className="text-white text-sm font-light mb-3 text-center transform transition-all duration-300">
            {brief}
          </p>
          <Link
            to={`/events/${id}`}
            className="transform transition-all duration-300 hover:scale-105"
          >
            <button className="px-4 py-2 bg-white md:bg-[#D4F3D9] text-card-overlay-background hover:bg-white  hover:text-card-overlay-background transition-all duration-300 rounded-md">
              Know More
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
