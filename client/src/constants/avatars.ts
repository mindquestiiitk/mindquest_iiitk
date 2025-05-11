// Array of avatar images for user profiles
export const avatarImages = [
  // Default avatar should be first so it doesn't overlap with other options
  {
    id: "default",
    src: "/avatars/prof1.png", // Using prof1 as default
    alt: "Default Avatar",
  },
  // Other avatar options
  {
    id: "prof1",
    src: "/avatars/prof1.png",
    alt: "Avatar 1",
  },
  {
    id: "prof2",
    src: "/avatars/prof2.png",
    alt: "Avatar 2",
  },
  {
    id: "prof3",
    src: "/avatars/prof3.png",
    alt: "Avatar 3",
  },
];

// Function to get avatar by ID
export const getAvatarById = (id: string) => {
  return (
    avatarImages.find((avatar) => avatar.id === id) ||
    avatarImages[avatarImages.length - 1]
  ); // Return default if not found
};

// Function to get random avatar
export const getRandomAvatar = () => {
  const randomIndex = Math.floor(Math.random() * (avatarImages.length - 1)); // Exclude default avatar
  return avatarImages[randomIndex];
};
