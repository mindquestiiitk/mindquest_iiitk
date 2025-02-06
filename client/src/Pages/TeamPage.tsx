import { useEffect, useState } from "react";

interface TeamMember {
  type: string;
  name: string;
  role: string;
  image: string;
  socials: {
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
}

interface TeamData {
  patrons: TeamMember[];
  mentors: TeamMember[];
  batch2022: TeamMember[];
  batch2023: TeamMember[];
  batch2024: TeamMember[];
  developers: TeamMember[];
}

const TeamMemberCard = ({ member }: { member: TeamMember }) => (
  <div className="flex flex-col items-center w-full md:w-1/4">
    <div className="bg-lighter-green rounded-2xl p-2 h-44 w-44 md:w-60 md:h-60 mb-4 aspect-square">
      <img
        loading="lazy"
        src={member.image}
        alt={member.name}
        className="rounded-xl w-full h-full object-cover object-top"
      />
    </div>
    <h3 className="text-primary-green font-semibold text-lg">{member.name}</h3>
    <p className="text-green-600 text-sm mb-2">{member.role}</p>
    {member.type !== "patron" &&
      <div className="flex gap-4 text-green-700">
      {member.socials.linkedin && (
        <a href={member.socials.linkedin} className="hover:text-green-900">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </a>
      )}
      {member.socials.instagram && (
          <a href={member.socials.instagram} className="hover:text-green-900">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>
        )}
      {member.socials.website && (
        <a href={member.socials.website} className="hover:text-green-900">
          <svg
            className="w-5 h-5"
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
    }
  </div>
);

const TeamPage = () => {

  const [fetchMembers, setFetchMembers] = useState<{ people: TeamData } | null>(null);

  useEffect(() => {
    document.title = "MindQuest - Team";
    (async () => {
      fetch("./people.json")
        .then((response) => response.json())
        .then((data) => {
          setFetchMembers(data)
        })
    })()

  }, []);


  return (
    <>
      <div className=" container mx-auto px-4 py-12">
        <h1 className="text-primary-green text-5xl font-bold text-center mb-12 font-acme">
          Meet our Team
        </h1>

        {/* Patrons Section */}
        <div className="mb-16">
          <h2 className="text-primary-green text-4xl font-medium text-center mb-8 font-acme">
            Patrons
          </h2>
          <div className="flex flex-wrap justify-center gap-x-24 gap-y-8 items-center">
            {fetchMembers && fetchMembers.people.patrons && fetchMembers.people.patrons.map((patron, index) => (
              <TeamMemberCard key={index} member={patron} />
            ))}
          </div>
        </div>

        {/* Mentor Section */}
        <div className="mb-16" >
          <h2 className="text-primary-green text-4xl font-medium text-center mb-8 font-acme">
            Mentor
          </h2>
          <div className="flex flex-wrap justify-center gap-x-24 gap-y-8 items-center">
            {fetchMembers && fetchMembers.people.mentors && fetchMembers.people.mentors.map((mentor, index) => (
              <TeamMemberCard key={index} member={mentor} />
            ))}
          </div>
        </div>


        {/* Members Section */}
        <div>
          <h2 className="text-primary-green text-4xl font-medium text-center mb-8 font-acme">
            Members
          </h2>
          <h2 className="text-primary-green text-2xl font-medium text-center mb-8 font-acme">
            Batch -2022
          </h2>
          <div className="flex flex-wrap justify-center gap-x-24 gap-y-8 items-center mb-8">
            {fetchMembers &&
              fetchMembers.people.batch2022.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
          </div>
          <h2 className="text-primary-green text-2xl font-medium text-center mb-8 font-acme">
            Batch -2023
          </h2>
          <div className="flex flex-wrap justify-center gap-x-24 gap-y-8 items-center mb-8">
            {fetchMembers &&
              fetchMembers.people.batch2023.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
          </div>
          <h2 className="text-primary-green text-2xl font-medium text-center mb-8 font-acme">
            Batch -2024
          </h2>
          <div className="flex flex-wrap justify-center gap-x-24 gap-y-8 items-center mb-8">
            {fetchMembers &&
              fetchMembers.people.batch2024.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
          </div>
        </div>
        <div>
          <h2 className="text-primary-green text-4xl font-medium text-center mb-8 font-acme">
            Developers
          </h2>
          <div className="flex flex-wrap justify-center gap-x-24 gap-y-8 items-center mb-8">
            {fetchMembers && fetchMembers.people.developers && fetchMembers.people.developers.map((developer, index) => (
              <TeamMemberCard key={index} member={developer} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamPage;
