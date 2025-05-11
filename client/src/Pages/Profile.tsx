import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { authService } from "../services/auth.service";
import { avatarImages } from "../constants/avatars";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { toast } from "../components/ui/use-toast";
import { Avatar } from "../components/Avatar";

export default function Profile() {
  const { user, updateUserProfile, logout, changePassword } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedAvatarId, setSelectedAvatarId] = useState("");

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    document.title = "MindQuest - Profile";

    // Redirect if not logged in
    if (!user) {
      navigate("/login");
      return;
    }

    // Initialize form with user data
    setName(user.name || "");
    setEmail(user.email || "");
    setSelectedAvatarId(user.avatarId || "default");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setIsLoading(true);

      // Only send the fields we want to update (name and avatarId)
      // Do NOT send email as it's causing Firestore errors
      const updateData = {
        name,
        avatarId: selectedAvatarId,
      };

      // Update profile in Firebase and local state
      await authService.updateProfile(updateData);

      // Update local user state
      updateUserProfile({
        ...user,
        ...updateData,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword) {
      toast({
        title: "Error",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "New password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(currentPassword, newPassword);

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Success",
        description: "Your password has been changed successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Change password error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-card-overlay-background">
            Your Profile
          </h1>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0010.707 2H4a1 1 0 00-1 1zm10 8.414V17h-5v-5.586l5 .001zm-6-1V17H4V4h5v6.414l-2-2L5.586 10l4.414 4.414L14.414 10 13 8.586l-2 2z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-center p-4 bg-gray-50 rounded-lg mb-4">
                <div className="flex-shrink-0 relative group">
                  {/* Clickable Avatar with Popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="cursor-pointer relative">
                        <Avatar
                          size="xl"
                          showStatus={false}
                          clickable={false}
                          className="border-4 border-white shadow-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full flex items-center justify-center transition-all">
                          <span className="text-white opacity-0 group-hover:opacity-100 font-medium">
                            Change
                          </span>
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="center">
                      <div className="p-4 border-b">
                        <h3 className="font-medium">Select Avatar</h3>
                        <p className="text-sm text-gray-500">
                          Choose a new profile picture
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 p-4 max-h-[300px] overflow-y-auto">
                        {avatarImages
                          .filter(
                            (avatar) =>
                              avatar.id !== "default" ||
                              avatar.src !==
                                avatarImages.find((a) => a.id === "prof1")?.src
                          )
                          .map((avatar) => (
                            <div
                              key={avatar.id}
                              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                selectedAvatarId === avatar.id
                                  ? "border-green-500 shadow-md"
                                  : "border-gray-200 hover:border-green-300"
                              }`}
                              onClick={() => setSelectedAvatarId(avatar.id)}
                            >
                              <div className="aspect-square">
                                <img
                                  src={avatar.src}
                                  alt={avatar.alt}
                                  className="w-full h-full object-cover"
                                />
                                {selectedAvatarId === avatar.id && (
                                  <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                                    <div className="bg-white rounded-full p-1">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 text-green-500"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-semibold text-lg">
                    {user.name || "User"}
                  </h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <div className="flex items-center justify-center md:justify-start mt-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {user.role || "User"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={user.role || "User"}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Role cannot be changed</p>
              </div>

              {/* Change Password Section - Only show for email/password users */}
              <div className="pt-4 border-t mt-6">
                <h3 className="text-lg font-medium mb-4">
                  Password Management
                </h3>

                {user.provider === "google" ? (
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        className="h-5 w-5 mr-2"
                      >
                        <path
                          fill="#FFC107"
                          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                        <path
                          fill="#FF3D00"
                          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                        />
                        <path
                          fill="#4CAF50"
                          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                        />
                        <path
                          fill="#1976D2"
                          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                      </svg>
                      <h3 className="text-md font-medium text-blue-800">
                        Google Account
                      </h3>
                    </div>
                    <p className="mt-2 text-sm text-blue-700">
                      You're signed in with Google. Password management is
                      handled through your Google account.
                    </p>
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Manage your Google account
                      <svg
                        className="ml-1 h-4 w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Enter your current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Enter your new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="mt-2"
                    >
                      {isChangingPassword
                        ? "Changing Password..."
                        : "Change Password"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414a1 1 0 00-.293-.707L11.414 2.414A1 1 0 0010.707 2H4a1 1 0 00-1 1zm10 8.414V17h-5v-5.586l5 .001zm-6-1V17H4V4h5v6.414l-2-2L5.586 10l4.414 4.414L14.414 10 13 8.586l-2 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
