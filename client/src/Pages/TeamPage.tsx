import Navbar_Home from "../components/Navbar/Navbar_Home";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";

interface TeamMember {
  name: string;
  role: string;
  image: string;
  socials: {
    linkedin?: string;
    twitter?: string;
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

const TeamPage = () => {

  const [fetchMembers, setFetchMembers] = useState<{ people: TeamData } | null>(null);

  useEffect(() => {
    document.title = "MindQuest - Team";
    (async () => {
      fetch("./people.json")
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
          setFetchMembers(data)
        })
    })()

  }, []);

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <div className="flex flex-col items-center w-full md:w-1/4">
      <div className="bg-lighter-green rounded-2xl p-2 w-56 h-56 mb-4 aspect-square">
        <img
          src={member.image}
          alt={member.name}
          className="rounded-xl w-full h-full object-cover object-top"
        />
      </div>
      <h3 className="text-primary-green font-semibold text-lg">{member.name}</h3>
      <p className="text-green-600 text-sm mb-2">{member.role}</p>
      <div className="flex gap-4 text-green-700">
        {member.socials.linkedin && (
          <a href={member.socials.linkedin} className="hover:text-green-900">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
        )}
        {member.socials.twitter && (
          <a href={member.socials.twitter} className="hover:text-green-900">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
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
    </div>
  );

  return (
    <>
      <Navbar_Home />
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
      <Footer />
    </>
  );
};

export default TeamPage;
