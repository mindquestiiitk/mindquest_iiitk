import { useState } from "react";

interface TeamMemberSocials {
  linkedin?: string;
  instagram?: string;
  website?: string;
}

export interface TeamMember {
  id?: string;
  type: string;
  name: string;
  role: string;
  image: string;
  socials: TeamMemberSocials;
  batch?: string;
}

interface TeamCardProps {
  member: TeamMember;
}

export function TeamCard({ member }: TeamCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="overflow-hidden font-montserrat group transform transition-all duration-300 hover:scale-105 bg-white border border-card-overlay-background/20 rounded-lg shadow-md w-full max-w-[280px] flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden h-[250px]">
        <img
          src={member.image}
          alt={member.name}
          className="w-full h-full object-cover transition-all duration-500 transform"
          style={{
            transform: isHovered ? "scale(1.1)" : "scale(1)",
            objectPosition: "center top",
          }}
          onError={(e) => {
            console.error(
              `Failed to load image for ${member.name}:`,
              member.image
            );
            e.currentTarget.src =
              "https://via.placeholder.com/250x250?text=Image+Not+Found";
          }}
        />
        {/* Hover overlay with social links */}
        <div
          className={`absolute inset-0 bg-card-overlay-background/40 flex items-center justify-center gap-4 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {member.socials.linkedin && member.socials.linkedin !== "#" && (
            <a
              href={member.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 rounded-full hover:bg-green-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-card-overlay-background"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          )}
          {member.socials.instagram && member.socials.instagram !== "#" && (
            <a
              href={member.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 rounded-full hover:bg-green-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-card-overlay-background"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          )}
          {member.socials.website && member.socials.website !== "#" && (
            <a
              href={member.socials.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-2 rounded-full hover:bg-green-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-card-overlay-background"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Info Container - Below the image */}
      <div className="p-4 bg-white flex-grow flex flex-col">
        <h3 className="text-card-overlay-background text-lg font-bold mb-1">
          {member.name}
        </h3>
        <p className="text-gray-600 text-sm mb-1">{member.role}</p>
        <div className="mt-auto">
          <p className="text-gray-500 text-xs font-medium">
            {member.type
              ? member.type.charAt(0).toUpperCase() + member.type.slice(1)
              : member.role && member.role.includes("Developer")
              ? "Developer"
              : "Team Member"}
            {member.batch && ` • Batch ${member.batch}`}
          </p>
        </div>
      </div>
    </div>
  );
}
