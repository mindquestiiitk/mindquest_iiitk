import { motion } from "framer-motion";
import { TeamCard, TeamMember } from "../components/TeamCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

interface TeamGridProps {
  members: TeamMember[];
  animate?: boolean;
}

const TeamGrid: React.FC<TeamGridProps> = ({ members, animate = true }) => {
  // Log the members to help with debugging
  console.log(`Rendering TeamGrid with ${members.length} members:`, members);

  return (
    <motion.div
      initial={animate ? { opacity: 0 } : false}
      animate={animate ? { opacity: 1 } : false}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    >
      {members.length > 0 ? (
        members.map((member: TeamMember, index: number) => (
          <motion.div
            key={member.id || `${member.name}-${index}`}
            initial={animate ? { opacity: 0, y: 20 } : false}
            animate={animate ? { opacity: 1, y: 0 } : false}
            transition={{
              delay: Math.min(index * 0.05, 1) + 0.2,
              duration: 0.5,
            }}
            className="flex justify-center"
          >
            <TeamCard member={member} />
          </motion.div>
        ))
      ) : (
        <div className="col-span-full text-center py-8 text-gray-500">
          No team members found in this category.
        </div>
      )}
    </motion.div>
  );
};

export function Teams() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "MindQuest - Teams";
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiUrl = import.meta.env.VITE_API_URL + "/teams";
        console.log("Fetching teams from:", apiUrl);

        // Fetch team members from the backend API
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Raw team data received:", data);

        // Check if data is an array
        if (Array.isArray(data)) {
          console.log("Number of team members received:", data.length);

          // Process the data to ensure all team members have a type field
          const processedData = ensureTypeField(data);
          setTeamMembers(processedData);

          // Log counts by type to help with debugging
          const typeCounts = processedData.reduce(
            (acc: any, member: TeamMember) => {
              acc[member.type] = (acc[member.type] || 0) + 1;
              return acc;
            },
            {}
          );
          console.log("Team members by type:", typeCounts);
        } else if (data.teams && Array.isArray(data.teams)) {
          console.log("Using data.teams instead");
          console.log("Number of team members received:", data.teams.length);
          // Process the data to ensure all team members have a type field
          const processedData = ensureTypeField(data.teams);
          setTeamMembers(processedData);
        } else {
          throw new Error("Received data is not in the expected format");
        }

        // Logging already done above
      } catch (error) {
        console.error("Error fetching team data:", error);

        // Display error message
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch team members"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const findPatrons = (members: TeamMember[]) => {
    return members.filter((member) => member.type === "patron");
  };

  const findMentors = (members: TeamMember[]) => {
    return members.filter((member) => member.type === "mentor");
  };

  const findLeads = (members: TeamMember[]) => {
    return members.filter((member) => member.type === "lead");
  };

  const findSubleads = (members: TeamMember[]) => {
    return members.filter((member) => member.type === "sublead");
  };

  const findMembers = (members: TeamMember[]) => {
    return members.filter((member) => member.type === "member");
  };

  const findDevelopers = (members: TeamMember[]) => {
    // Handle both cases: with and without type field
    return members.filter(
      (member) =>
        member.type === "developer" ||
        (member.role &&
          (member.role.toLowerCase().includes("developer") ||
            member.role.toLowerCase().includes("full stack") ||
            member.role.toLowerCase().includes("project manager")))
    );
  };

  // Helper function to ensure all team members have a type field
  const ensureTypeField = (members: TeamMember[]): TeamMember[] => {
    return members.map((member) => {
      if (!member.type) {
        // Determine type based on role if missing
        if (member.role) {
          if (
            member.role.toLowerCase().includes("developer") ||
            member.role.toLowerCase().includes("full stack") ||
            member.role.toLowerCase().includes("project manager")
          ) {
            return { ...member, type: "developer" };
          }
        }
        // Default to member if we can't determine the type
        return { ...member, type: "member" };
      }
      return member;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading team members...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <main className="flex-grow bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-card-overlay-background font-acme">
              Our Team
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
              Meet the dedicated individuals who make MindQuest possible
            </p>
          </motion.div>

          <Tabs defaultValue="patrons" className="w-full">
            <TabsList className="grid w-full max-w-[600px] grid-cols-3 mx-auto mb-10 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger
                className="data-[state=active]:bg-accent/90 data-[state=active]:text-white rounded-md transition-all"
                value="patrons"
              >
                Patrons & Mentors
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:bg-accent/90 data-[state=active]:text-white rounded-md transition-all"
                value="leads"
              >
                Leads & Subleads
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:bg-accent/90 data-[state=active]:text-white rounded-md transition-all"
                value="members"
              >
                Members & Developers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="patrons">
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-semibold text-card-overlay-background">
                    Patrons
                  </h2>
                  <div className="h-[1px] bg-gray-300 flex-grow ml-4"></div>
                </div>
                <TeamGrid members={findPatrons(teamMembers)} />
              </div>

              <div>
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-semibold text-card-overlay-background">
                    Mentors
                  </h2>
                  <div className="h-[1px] bg-gray-300 flex-grow ml-4"></div>
                </div>
                <TeamGrid members={findMentors(teamMembers)} />
              </div>
            </TabsContent>

            <TabsContent value="leads">
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-semibold text-card-overlay-background">
                    Leads
                  </h2>
                  <div className="h-[1px] bg-gray-300 flex-grow ml-4"></div>
                </div>
                <TeamGrid members={findLeads(teamMembers)} />
              </div>

              <div>
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-semibold text-card-overlay-background">
                    Subleads
                  </h2>
                  <div className="h-[1px] bg-gray-300 flex-grow ml-4"></div>
                </div>
                <TeamGrid members={findSubleads(teamMembers)} />
              </div>
            </TabsContent>

            <TabsContent value="members">
              <div className="mb-12">
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-semibold text-card-overlay-background">
                    Members
                  </h2>
                  <div className="h-[1px] bg-gray-300 flex-grow ml-4"></div>
                </div>
                <TeamGrid members={findMembers(teamMembers)} />
              </div>

              <div>
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-semibold text-card-overlay-background">
                    Developers
                  </h2>
                  <div className="h-[1px] bg-gray-300 flex-grow ml-4"></div>
                </div>
                <TeamGrid members={findDevelopers(teamMembers)} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
