import React from "react";

const legacyData = [
  {
    year: "2022-2023",
    people: [
      {
        name: "Sarthak Gupta",
        role: "Mentor",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        quote: "Guiding the club was a magical journey!",
        socials: {
          linkedin: "#",
          instagram: "#",
        },
      },
      {
        name: "John",
        role: "Lead",
        image: "https://randomuser.me/api/portraits/women/44.jpg",
        quote: "Creativity and teamwork made us shine.",
        socials: {
          linkedin: "#",
          instagram: "#",
        },
      },
      {
        name: "John",
        role: "Lead",
        image: "https://randomuser.me/api/portraits/women/45.jpg",
        quote: "Every event was a new adventure.",
        socials: {
          linkedin: "#",
          instagram: "#",
        },
      },
    ],
    events: [
      {
        title: "Game On: Fresher's Challenge",
        date: "11/10/2022",
        brief: "Freshers team-building games and creative challenges.",
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      },
      {
        title: "Mind Week: Speed Reading",
        date: "20/01/2023",
        brief: "Speed reading workshop for efficient exam prep.",
        image: "https://images.unsplash.com/photo-1464983953574-0892a716854b",
      },
    ],
  },
  {
    year: "2023-2024",
    people: [
      {
        name: "Vishal",
        role: "Sublead - Art",
        image: "https://randomuser.me/api/portraits/men/43.jpg",
        quote: "Art brings everyone together.",
        socials: {
          linkedin: "#",
          instagram: "#",
        },
      },
      {
        name: "Sarthak Yadav",
        role: "Sublead - Tech",
        image: "https://randomuser.me/api/portraits/men/46.jpg",
        quote: "Tech is the magic behind the scenes.",
        socials: {
          linkedin: "#",
          instagram: "#",
        },
      },
    ],
    events: [
      {
        title: "Christmas Bash",
        date: "24/12/2023",
        brief: "A night of joy, games & festive magic.",
        image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
      },
      {
        title: "Apoorv's Got Latent",
        date: "07/03/2024",
        brief: "A parody to India's Got Talent!",
        image: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
      },
    ],
  },
];

const WallOfLegacy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-primary-green text-5xl font-bold text-center mb-12 font-acme text-magic">
        Wall of Legacy
      </h1>
      <p className="text-center text-lg text-foreground mb-10">
        Honoring our past mentors, leads, subleads, and the events that shaped
        our journey.
      </p>
      {legacyData.map((batch, idx) => (
        <div key={batch.year} className="mb-16">
          <h2 className="text-primary-green text-3xl font-semibold mb-8 text-center font-acme">
            {batch.year}
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {batch.people.map((person, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-xs flex flex-col items-center border border-accent"
              >
                <img
                  src={person.image}
                  alt={person.name}
                  className="rounded-full w-28 h-28 object-cover mb-4 border-4 border-accent"
                />
                <h3 className="text-xl font-bold text-primary-green mb-1">
                  {person.name}
                </h3>
                <p className="text-green-700 mb-2">{person.role}</p>
                <blockquote className="italic text-muted-foreground text-center mb-2">
                  “{person.quote}”
                </blockquote>
                <div className="flex gap-4">
                  {person.socials.linkedin && (
                    <a
                      href={person.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                  {person.socials.instagram && (
                    <a
                      href={person.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-accent"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {batch.events && (
            <div>
              <h3 className="text-primary-green text-2xl font-semibold mb-4 text-center font-acme">
                Events Conducted
              </h3>
              <div className="flex flex-wrap justify-center gap-8">
                {batch.events.map((event, j) => (
                  <div
                    key={j}
                    className="bg-eventcard-background w-[250px] rounded-xl shadow p-4 flex flex-col items-center border border-accent"
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="rounded-lg w-full h-40 object-cover mb-3"
                    />
                    <h4 className="text-lg font-bold text-primary-green mb-1 text-center">
                      {event.title}
                    </h4>
                    <p className="text-green-700 text-sm mb-1">{event.date}</p>
                    <p className="text-foreground text-center text-sm">
                      {event.brief}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WallOfLegacy;
