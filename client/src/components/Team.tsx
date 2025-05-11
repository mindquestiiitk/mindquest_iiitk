import { Link } from "react-router-dom";
import { team_photo } from "../assets";

const Team = () => {
  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto px-4 py-12">
      {/* Header Section */}
      <h1 className="text-primary-green text-4xl font-bold text-center mb-2">
        Our Team
      </h1>
      <p className="text-primary-green mb-8 text-center">
        Meet the dedicated individuals behind our club.
      </p>

      {/* Image Container */}
      <div className="relative w-full">
        <div className="bg-secondary-green rounded-[2rem] p-2 md:p-6">
          <img
            src={team_photo} // Replace with your actual image path
            alt="Team photo"
            className="w-full h-full rounded-[1.5rem] object-cover"
          />
        </div>

        {/* Centered Know More Button */}
        <div className="absolute bottom-0 left-0 w-full flex justify-center pb-4 md:pb-8">
          <Link
            to={"/teams"}
            className="flex items-center gap-2 bg-green-100 hover:bg-secondary-green transition-colors text-xs md:text-base px-2 py-1 md:px-4 md:py-2 rounded-full border-2 border-green-600"
          >
            <span className="text-primary-green font-medium">Know More</span>
            <div className="bg-primary-green rounded-full p-2">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Team;
