import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Default avatar if none is provided
const DEFAULT_AVATAR = "/avatars/default-avatar.png";

interface UserAvatarProps {
  avatarUrl?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  linkToProfile?: boolean;
}

export function UserAvatar({ 
  avatarUrl = DEFAULT_AVATAR, 
  size = "md", 
  className,
  linkToProfile = false
}: UserAvatarProps) {
  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16"
  };

  const avatarComponent = (
    <img
      src={avatarUrl}
      alt="User Avatar"
      className={cn(
        "rounded-full object-cover border border-gray-200",
        sizeClasses[size],
        className
      )}
      onError={(e) => {
        e.currentTarget.src = DEFAULT_AVATAR;
      }}
    />
  );

  // If linkToProfile is true, wrap the avatar in a Link component
  if (linkToProfile) {
    return (
      <Link 
        to="/profile" 
        className="relative group"
        title="View Profile"
      >
        {avatarComponent}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-200"></div>
      </Link>
    );
  }

  return avatarComponent;
}
