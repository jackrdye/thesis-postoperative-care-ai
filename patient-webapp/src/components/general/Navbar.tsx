import { useRouter } from "next/router";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

interface NavbarProps {
  title: string;
  phoneNumber?: string;
  showVerticalDotIcon?: boolean;
  showBackArrow?: boolean;
}

export default function Navbar({
  title,
  phoneNumber,
  showVerticalDotIcon,
  showBackArrow,
}: NavbarProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  const handlePhoneClick = () => {
    console.log(`Phone icon clicked, number is ${phoneNumber}`);
  };

  const handleVerticalDotClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <nav className="w-full border-gray-200 bg-blue-600/95 py-0.5 dark:bg-gray-900 sm:rounded-t-lg">
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-2 px-3">
        {showBackArrow && (
          <button
            className="mr-2 flex items-center justify-center rounded-full p-1 text-gray-100"
            aria-label="Go back"
            onClick={handleBackClick}
          >
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
        <div className="ml-auto flex items-center">
          {phoneNumber && (
            <button
              className="mr-2 flex items-center justify-center rounded-full p-1 text-gray-100"
              aria-label="Contact via phone"
              onClick={handlePhoneClick}
            >
              <i className="fas fa-phone text-xl"></i>
            </button>
          )}
          {showVerticalDotIcon && (
            <div className="relative">
              <button
                className="flex items-center justify-center rounded-full p-1 text-gray-100"
                aria-label="Open menu"
                onClick={handleVerticalDotClick}
              >
                <i className="fas fa-ellipsis-v text-xl"></i>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg">
                  <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                    Feedback
                  </button>
                  <button
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                  {/* Add more options here as needed */}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
