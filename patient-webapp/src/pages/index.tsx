import { useOperations } from "@/hooks/useOperations";
import Head from "next/head";
import Link from "next/link";
import Navbar from "@/components/general/Navbar"; // Ensure you import the Navbar component

export default function Home() {
  const { data: operationData, isLoading } = useOperations();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!operationData || operationData.length === 0) {
    return <div>No operations found.</div>;
  }

  return (
    <main className="relative mx-auto flex h-screen max-h-screen max-w-screen-sm flex-col items-center sm:rounded-2xl sm:border-8 sm:border-gray-300">
      <Navbar
        title="Patient's Operations"
        showBackArrow={false} 
        showVerticalDotIcon={true}
      />
      <Head>
        <title>Your Operations</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="p-4 bg-gray-100 shadow-lg overflow-y-auto w-full h-full">
        {/* <h1 className="text-2xl font-bold mb-4">Your Operations</h1> */}
        {operationData.map((operation) => (
          <Link href={`/operations/${operation.id}`} key={operation.id}>
            <div className="bg-white rounded-lg p-4 mb-4 shadow relative">
              <h2 className="text-lg font-semibold mb-2">{operation.procedureName}</h2>
              <p className="text-sm text-gray-600">Doctor: {operation.doctor.name}</p>
              <p className="text-sm text-gray-600">Date: {new Date(operation.procedureDate).toLocaleDateString()}</p>
              {operation.chats && operation.chats.some(chat => chat.numUnverifiedMessages > 0) && (
                <div className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {operation.chats.reduce((total, chat) => total + (chat.numUnverifiedMessages || 0), 0)}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
