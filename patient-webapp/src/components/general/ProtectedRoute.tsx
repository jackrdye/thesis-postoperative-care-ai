// components/ProtectedRoute.tsx
import { useRouter } from "next/router";
import { useEffect, useState, ReactNode } from "react";
import { auth } from "@/firebase"; // Ensure this path is correct
import { User } from "firebase/auth"; // Import the User type

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Update the type here
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser); // This should now work without error
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
