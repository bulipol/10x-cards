import { useState } from "react";
import { Button } from "../ui/button";
import { LogOut, User } from "lucide-react";

interface UserMenuProps {
  userEmail: string;
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        console.error("Logout failed");
        setIsLoggingOut(false);
        return;
      }

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
        <User size={16} />
        <span>{userEmail}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="gap-2"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">{isLoggingOut ? "Logging out..." : "Logout"}</span>
      </Button>
    </div>
  );
}
