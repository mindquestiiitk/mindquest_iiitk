import NavbarHome from "../components/Navbar/Navbar_Home";
import Footer from "../components/Footer";

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

const TeamPage = () => {
  const teamMembers = {
    patrons: [
      {
        name: "Renjitha Mam",
        role: "Club Coordinator",
        image: "/api/placeholder/200/200",
        socials: {
          linkedin: "#",
          twitter: "#",
          website: "#",
        },
      },
      {
        name: "Saarthak Gupta",
        role: "Club Lead",
        image: "/api/placeholder/200/200",
        socials: {
          linkedin: "#",
          twitter: "#",
          website: "#",
        },
      },
      {
        name: "Renjitha Mam",
        role: "Club Coordinator",
        image: "/api/placeholder/200/200",
        socials: {
          linkedin: "#",
          twitter: "#",
          website: "#",
        },
      },
    ],
    coreMembers: [
      {
        name: "John Doe",
        role: "Core Member",
        image: "/api/placeholder/200/200",
        socials: {
          linkedin: "#",
          twitter: "#",
          website: "#",
        },
      },
      {
        name: "Jane Smith",
        role: "Core Member",
        image: "/api/placeholder/200/200",
        socials: {
          linkedin: "#",
          twitter: "#",
          website: "#",
        },
      },
      {
        name: "Alice Johnson",
        role: "Core Member",
        image: "/api/placeholder/200/200",
        socials: {
          linkedin: "#",
          twitter: "#",
          website: "#",
        },
      },
    ],
    members: [
      {
        name: "Bob Brown",
        role: "Member",
        image: "/api/placeholder/200/200",
        socials: {
          linkedin: "#",
          twitter: "#",
          website: "#",
        },
      },
      {
        name: "Charlie Davis",
        role: "Member",
        image: "/api/placeholder/200/200",
        socials: {
          linkedin: "#",
          twitter: "#",
          website: "#",
        },
      },
      {
        name: "Eve Wilson",
        role: "Member",
        image: "/api/placeholder/200/200",
        socials: {
          linkedin: "#",
          twitter: "#",
          website: "#",
        },
      },
    ],
  };

  const TeamMemberCard = ({ member }: { member: TeamMember }) => (
    <div className="flex flex-col items-center">
      <div className="bg-green-100 rounded-2xl p-2 w-48 h-48 mb-4">
        <img
          src={member.image}
          alt={member.name}
          className="rounded-xl w-full h-full object-cover"
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
      <NavbarHome />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-primary-green text-4xl font-bold text-center mb-12 font-acme">
          Meet our Team
        </h1>

        {/* Patrons Section */}
        <div className="mb-16">
          <h2 className="text-primary-green text-2xl font-medium text-center mb-8 font-acme">
            Patrons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            {teamMembers.patrons.map((patron, index) => (
              <TeamMemberCard key={index} member={patron} />
            ))}
          </div>
        </div>

        {/* Core Members Section */}
        <div className="mb-16">
          <h2 className="text-primary-green text-2xl font-medium text-center mb-8 font-acme">
            Core Members
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            {teamMembers.coreMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>
        </div>

        {/* Members Section */}
        <div>
          <h2 className="text-primary-green text-2xl font-medium text-center mb-8 font-acme">
            Members
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
            {teamMembers.members.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TeamPage;
