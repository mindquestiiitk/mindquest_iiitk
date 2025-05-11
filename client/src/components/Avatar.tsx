import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { avatarImages } from "../constants/avatars";

interface AvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  className?: string;
  clickable?: boolean;
}

export function Avatar({
  size = "md",
  showStatus = false,
  className = "",
  clickable = true,
}: AvatarProps) {
  const { user } = useAuth();
  const [avatarSrc, setAvatarSrc] = useState<string>(
    "/avatars/default-avatar.png"
  );

  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-20 h-20", // Larger size for profile display
  };

  useEffect(() => {
    // If user has an avatarId, find that avatar
    if (user?.avatarId) {
      const avatar = avatarImages.find((img) => img.id === user.avatarId);
      if (avatar) {
        setAvatarSrc(avatar.src);
        return;
      }
    }

    // If no avatarId or avatar not found, use default
    const defaultAvatar = avatarImages.find((img) => img.id === "default");
    if (defaultAvatar) {
      setAvatarSrc(defaultAvatar.src);
    }
  }, [user]);

  // If no user, don't render anything
  if (!user) return null;

  const AvatarContent = () => (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className="w-full h-full relative">
        <img
          src={avatarSrc}
          alt={`${user.name}'s Avatar`}
          className={`rounded-full object-cover w-full h-full border-2 border-white shadow-sm ${
            clickable
              ? "cursor-pointer hover:opacity-90 transition-opacity"
              : ""
          }`}
          onError={(e) => {
            // If avatar fails to load, use the default avatar
            const defaultAvatar = avatarImages.find(
              (img) => img.id === "default"
            );
            if (defaultAvatar) {
              e.currentTarget.src = defaultAvatar.src;
            }
          }}
        />
        {showStatus && (
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
        )}
      </div>
    </div>
  );

  // Wrap in Link if clickable
  if (clickable) {
    return (
      <Link to="/profile" aria-label="View profile">
        <AvatarContent />
      </Link>
    );
  }

  // Otherwise just return the avatar
  return <AvatarContent />;
}
