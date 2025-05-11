import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Array of avatar images
const AVATAR_IMAGES = [
  "/avatars/avatar-1.png",
  "/avatars/avatar-2.png",
  "/avatars/avatar-3.png",
  "/avatars/avatar-4.png",
  "/avatars/avatar-5.png",
  "/avatars/avatar-6.png",
  "/avatars/avatar-7.png",
  "/avatars/avatar-8.png",
  "/avatars/avatar-9.png",
  "/avatars/avatar-10.png",
];

// Default avatar if none is selected
const DEFAULT_AVATAR = "/avatars/default-avatar.png";

interface AvatarSelectorProps {
  currentAvatar?: string;
  onSelect: (avatarUrl: string) => void;
  className?: string;
}

export function AvatarSelector({ 
  currentAvatar = DEFAULT_AVATAR, 
  onSelect,
  className 
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);
  
  // Update selected avatar when currentAvatar prop changes
  useEffect(() => {
    if (currentAvatar) {
      setSelectedAvatar(currentAvatar);
    }
  }, [currentAvatar]);

  const handleSelectAvatar = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    onSelect(avatarUrl);
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="relative">
        <img
          src={selectedAvatar}
          alt="Selected Avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-primary"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_AVATAR;
          }}
        />
      </div>
      
      <div className="grid grid-cols-5 gap-2 mt-4">
        {AVATAR_IMAGES.map((avatar, index) => (
          <button
            key={index}
            type="button"
            className={cn(
              "p-1 rounded-full transition-all",
              selectedAvatar === avatar
                ? "ring-2 ring-primary ring-offset-2"
                : "hover:ring-1 hover:ring-primary/50"
            )}
            onClick={() => handleSelectAvatar(avatar)}
          >
            <img
              src={avatar}
              alt={`Avatar option ${index + 1}`}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_AVATAR;
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
