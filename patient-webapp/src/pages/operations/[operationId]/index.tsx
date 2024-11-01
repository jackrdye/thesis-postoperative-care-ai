// Page to display all of the chats for a particular operation

import { useRouter } from "next/router";
import { useQueryClient } from "react-query";
import { useOperation } from "@/hooks/useOperation";
import Navbar from "@/components/general/Navbar";
import ChatCard from "@/components/ChatCard";
import { auth } from "@/firebase";

const Operation = () => {
  const router = useRouter();
  const queryClient = useQueryClient(); // Get the query client
  const operationId = router.query.operationId as string;

  // Ensure operations are fetched and cached
  // Retrieve the operation using the operation ID
  const { data: operation, isLoading: loadingOperation } =
    useOperation(operationId);

  if (loadingOperation) return <div>Loading operation details...</div>;
  if (!operation) return <div>Operation not found.</div>;

  const handleAddChat = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      const token = await user.getIdToken();
      const response = await fetch(`/api/operations/${operationId}/new-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ operationId }),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: { chatId: string } = await response.json();
      queryClient.invalidateQueries("operations"); // Invalidate the query to refresh the operation data
      const newChatId = data.chatId;
      router.push(`/operations/${operationId}/chat/${newChatId}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
      // Handle error appropriately
    }
  };

  return (
    <main className="relative mx-auto flex h-screen max-h-screen max-w-screen-sm flex-col items-center sm:rounded-2xl sm:border-8 sm:border-gray-300">
      <Navbar
        title={`${operation.procedureName}`}
        showBackArrow
        phoneNumber="1234"
      />
      {/* <Head>
        <title>{operation.procedureName} - Operation Details</title>
      </Head> */}
      <div className="max-w-4xl mx-auto p-4 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">{operation.procedureName}</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Operation Details</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 sm:col-span-2">Procedure Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">
                  {new Date(operation.procedureDate).toLocaleDateString()}
                </dd>
                <dt className="text-sm font-medium text-gray-500 sm:col-span-2">Est. Recovery Date</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">
                  {new Date(operation.estRecoveryDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Procedure Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{operation.procedureDescription}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Post-Op Instructions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{operation.postOpInstructions}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Prescriptions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {operation.prescriptions.join(', ')}
                </dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{operation.notes}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Patient Information</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 sm:col-span-1">Name</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {operation.patient.firstName} {operation.patient.lastName}
                </dd>
                <dt className="text-sm font-medium text-gray-500 sm:col-span-1">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{operation.patient.email}</dd>
              </div>
              <div className="bg-white px-4 py-5 grid grid-cols-3 gap-4 grid-cols-6 px-6">
                <dt className="text-sm font-medium text-gray-500 col-span-1">Age</dt>
                <dd className="text-sm text-gray-900 col-span-1">{operation.patientInformation.age}</dd>
                <dt className="text-sm font-medium text-gray-500 col-span-1">Height</dt>
                <dd className="text-sm text-gray-900 col-span-1">{operation.patientInformation.height} cm</dd>
                <dt className="text-sm font-medium text-gray-500 col-span-1">Weight</dt>
                <dd className="text-sm text-gray-900 col-span-1">{operation.patientInformation.weight} kg</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{operation.patientInformation.gender}</dd>
              </div>
            </dl>
          </div>
        </div>
        {/* Display all of the chats for this operation */}
        <h2 className="text-xl font-semibold mt-8 mb-4">Chats</h2>
        {operation.chats.map((chat) => (
          <ChatCard
            key={chat.id}
            chat={chat}
            operationId={operationId}
          />
        ))}
      </div>  

      <button
        onClick={handleAddChat}
        className="absolute bottom-4 right-4 rounded-full bg-blue-600 p-5 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2"
      >
        <i className="fas fa-plus"></i>
      </button>
    </main>
  );
};

export default Operation;
