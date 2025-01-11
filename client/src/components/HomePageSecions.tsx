import React, { useState } from 'react';
const teamMembers = [
    {
        name: 'Renjitha Mam',
        role: 'Club Coordinator',
        socialLinks: ["linkedin.com/renjitha", "#", "renjitha.com"]
    },
    {
        name: 'Saarthak Guptha',
        role: 'Club Lead',
        socialLinks: ["linkedin.com/saarthak", "#", "saarthak.com"]

    },
    {
        name: 'Sarthak Yadav',
        role: 'Club Member',
        socialLinks: ["linkedin.com/sarthak", "#", "sarthak.com"]

    },
    {
        name: 'Rens',
        role: 'Club',
        socialLinks: ["linkedin.com/rens", "#", "rens.com"]

    }
];


const TeamCard: React.FC<{ name: string; role: string; socialLinks: string[] }> = ({ name, role, socialLinks }) => {
    return (
        <div className="flex flex-col items-center px-4">
            <div className="bg-green-300 w-40 h-40 rounded-xl mb-2"></div>
            <h3 className="text-center font-medium">{name}</h3>
            <p className="text-center text-gray-500 text-sm mb-2">{role}</p>
            <div className="flex space-x-2">
                {socialLinks.map((link, index) => (
                    <a href={link} key={index} target="_blank" rel="noopener noreferrer" className="text-gray-700">
                        {index === 0 && <span className="fab fa-linkedin"></span>}
                        {index === 1 && <span className="fas fa-times"></span>}
                        {index === 2 && <span className="fas fa-globe"></span>}
                    </a>
                ))}
            </div>
        </div>
    );
};

export const TeamSection = () => {
    const [startIndex, setStartIndex] = useState(0);
    const visibleMembers = teamMembers.slice(startIndex, startIndex + 3);

    const handleNext = () => {
        if (startIndex + 3 < teamMembers.length) {
            setStartIndex(startIndex + 1);
        }
    };

    const handlePrev = () => {
        if (startIndex > 0) {
            setStartIndex(startIndex - 1);
        }
    };


    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-green-800 mb-2">Our Team</h2>
                <p className="text-gray-700 mb-8">Meet the dedicated individuals behind our club.</p>


                <div className="flex space-x-4 overflow-x-auto items-center justify-center overflow-y-hidden">
                    {visibleMembers.map((member, index) => (
                        <TeamCard
                            key={index}
                            name={member.name}
                            role={member.role}
                            socialLinks={member.socialLinks}
                        />
                    ))}
                </div>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2 items-center justify-between">
                        {Array.from({ length: Math.ceil(teamMembers.length / 3) }).map((_, index) => (
                            <span
                                key={index}
                                className={`w-2 h-2 rounded-full ${startIndex / 3 === index ? 'bg-green-500' : 'bg-gray-300'}`}>
                            </span>
                        ))}
                    </div>
                    <div className="space-x-2">
                        <button
                            onClick={handlePrev}
                            disabled={startIndex === 0}
                            className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 disabled:opacity-50">
                            <i className="fas fa-chevron-left"></i>
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={startIndex + 3 >= teamMembers.length}
                            className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 disabled:opacity-50">
                            <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export const MoodSection: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-6 bg-gray-50">
      {/* Mood Insights Card */}
      <div className="bg-green-200 rounded-xl p-6 md:w-3/4 flex flex-col justify-between">
        <div>
            <h2 className="text-2xl font-bold text-green-800 mb-4">Mood Insights</h2>
            <p className="text-gray-700 mb-4">
            "Understanding your mood is the first step to better
            mental well-being. Take a moment to reflect and gain
            insights into how you're feeling today.
            Let's explore together!"
            </p>
        </div>

        <button className="bg-white text-green-700 border border-green-700 rounded-full px-6 py-2 flex items-center self-start mt-4 hover:bg-green-100 focus:outline-none focus:ring focus:ring-green-200">
        Track Your Mood <i className="fas fa-arrow-right ml-2"></i>
        </button>

      </div>

      {/* Mood Tracker Card */}
      <div className="bg-green-700 rounded-xl p-6 md:w-1/4 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-white mb-4">Mood Tracker</h2>
          <div className="bg-green-300 rounded-full p-4 mb-4">
            <i className="fas fa-face-smile text-7xl text-green-700"></i>
        </div>
        <p className="text-white text-center">Congratulation!<br/>Your mentally Healthy</p>
      </div>
    </div>
  );
};

export const ChatInterface: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-6">
    {/* Main Chat Section */}
      <div className="bg-background-secondary rounded-xl p-4 flex items-center justify-between  gap-4 h-[200px]">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mr-4">
              <div className="bg-green-700 w-20 h-20 rounded-xl mb-2"></div>
              <p className="text-sm text-gray-700">Seren ai</p>
          </div>
          {/* Chat Input Section */}
          <div className="flex flex-col flex-grow justify-center">
             <div className="mb-1">
               <h2 className="text-xl font-medium text-gray-800">Hi</h2>
               <h2 className="text-xl font-medium text-gray-800">Steve Jobs</h2>
             </div>
            <div className="bg-white border border-green-300 rounded-full flex items-center pr-2 py-1">
               <input type="text" placeholder="Type Something" className="focus:outline-none ml-4 flex-grow"/>
                <button className="bg- p-2 rounded-full text-green-700">
                 <i className="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
      </div>
      {/* Contact Councelor Section */}
       <div className="ml-4 bg-accent rounded-xl p-3 text-center flex items-center justify-center whitespace-nowrap transform rotate-90 cursor-pointer">
            <p className="text-accent-foreground flex items-center ">
              <i className="fas fa-arrow-left mr-2 transform rotate-45"></i>
            Contact Councelor
            </p>
        </div>
    </div>
  );
};

export const KeyFeatures: React.FC = () => {
  const features = [
    {
      title: "Binaural Beats",
      description: "Relax with calming audio tracks to improve focus and well-being.",
    },
    {
      title: "Binaural Beats",
      description: "Become part of a supportive community dedicated to mental health.",
    },
    {
      title: "Binaural Beats",
      description: "Access a variety of resources designed to help you thrive.",
    },
  ];

  return (
    <div className="bg-green-100 p-8 rounded-lg text-center">
      <h2 className="text-2xl font-bold text-green-800 mb-6">Key Features</h2>
      <div className="flex flex-wrap justify-center gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-green-200 p-6 rounded-lg shadow-md w-64"
          >
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-green-700 text-sm">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};


