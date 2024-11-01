import { useEffect } from 'react';
import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";
import { QueryClient, QueryClientProvider } from 'react-query';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/router';
import { auth } from '@/server/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import "@/styles/globals.css";

// Create a client
const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  // useEffect(() => {
  //   const autoLogin = async () => {
  //     const doctorEmail = 'john.doe@example.com';
  //     const doctorPassword = 'securePassword123';
  //     try {
  //       await signInWithEmailAndPassword(auth, doctorEmail, doctorPassword);
  //       router.push('/'); // Redirect to home page after successful auto-login
  //     } catch (error) {
  //       console.error("Auto-login failed:", error);
  //     }
  //   };

  //   if (!loading && !user) {
  //     autoLogin(); // Attempt to auto-login
  //   }
  // }, [user, loading, router]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while checking auth
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className={GeistSans.className}>
        <Component {...pageProps} />
      </div>
    </QueryClientProvider>
  );
};

export default MyApp;
