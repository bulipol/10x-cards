import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { UserMenu } from "./auth/UserMenu";

interface NavLink {
  href: string;
  label: string;
}

interface NavigationProps {
  user: { email: string } | null;
}

const navLinks: NavLink[] = [
  { href: "/generate", label: "Generate" },
  { href: "/flashcards", label: "My Flashcards" },
  { href: "/study", label: "Study Session" },
  { href: "/generations", label: "History" },
];

export function Navigation({ user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="text-xl font-bold text-primary hover:opacity-80 transition-opacity">
            10x Cards
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-primary transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center">
            {user ? (
              <UserMenu userEmail={user.email} />
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <a href="/login">Login</a>
                </Button>
                <Button asChild>
                  <a href="/register">Register</a>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="px-4 pt-2">
              {user ? (
                <UserMenu userEmail={user.email} />
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="ghost" asChild className="w-full">
                    <a href="/login">Login</a>
                  </Button>
                  <Button asChild className="w-full">
                    <a href="/register">Register</a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
