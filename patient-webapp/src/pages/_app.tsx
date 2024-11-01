import "@/styles/globals.css";
import type { AppProps } from "next/app";
// import "flowbite";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Import Font Awesome
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/general/ProtectedRoute";

const queryClient = new QueryClient();

const noAuthRequired = ["/auth/login", "/auth/create-account"];

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    // Can wrap WebSocketProvider around query client to listen for changes and invalidate react-query cache

    // Require authentication on all paths except login and sign up
    // Only store information in react query if the user is logged in

    <AuthProvider>
      {noAuthRequired.includes(router.pathname) ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
          </QueryClientProvider>
        </ProtectedRoute>
      )}
    </AuthProvider>
  );
}
