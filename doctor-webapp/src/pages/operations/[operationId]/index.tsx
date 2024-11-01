import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useOperation } from '@/hooks/useOperation';
import Head from 'next/head';
import Link from 'next/link';

const OperationPage: React.FC = () => {
  const router = useRouter();
  const { operationId } = router.query;
  const { data: operation, isLoading, error } = useOperation(operationId as string);

  // State for the post-op instructions display
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPostOpInstructionsOverflowing, setIsPostOpInstructionsOverflowing] = useState(false);
  const postOpInstructionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (operation?.postOpInstructions && postOpInstructionsRef.current) {
      const lineHeight = parseFloat(getComputedStyle(postOpInstructionsRef.current).lineHeight);
      const maxLines = 3;
      const maxHeight = lineHeight * maxLines;
      setIsPostOpInstructionsOverflowing(postOpInstructionsRef.current.scrollHeight > maxHeight);
    }
  }, [operation?.postOpInstructions]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error as string}</div>;
  if (!operation) return <div>Operation not found</div>;

  return (
    <>
      <Head>
        <title>{operation.procedureName} - Operation Details</title>
      </Head>
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{operation.procedureName}</h1>

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
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-6 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 sm:col-span-1">Age</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">{operation.patientInformation.age}</dd>
                <dt className="text-sm font-medium text-gray-500 sm:col-span-1">Height</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">{operation.patientInformation.height} cm</dd>
                <dt className="text-sm font-medium text-gray-500 sm:col-span-1">Weight</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">{operation.patientInformation.weight} kg</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{operation.patientInformation.gender}</dd>
              </div>
            </dl>
          </div>
        </div>

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
                <dd
                  ref={postOpInstructionsRef}
                  className={`mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 ${isExpanded ? '' : 'line-clamp-3'}`}
                >
                  {operation.postOpInstructions}
                </dd>
                {isPostOpInstructionsOverflowing && (
                  <button
                    className="text-blue-500 text-xs hover:underline mt-2"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                )}
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

        <h2 className="text-xl font-semibold mt-8 mb-4">Chats</h2>
        {operation.chats.map((chat) => {
          const patientMessages = chat.messages.filter(
            (message) => message.sender === 'PATIENT'
          );
          const mostRecentPatientMessage = patientMessages[patientMessages.length - 1];

          return (
            <Link key={chat.id} legacyBehavior href={`/operations/${operationId}/chat/${chat.id}`}>
              <a className="block bg-white shadow overflow-hidden sm:rounded-lg mb-4">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{chat.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Unverified messages: {chat.numUnverifiedMessages}
                  </p>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Most recent patient message: {mostRecentPatientMessage?.text}
                  </p>
                </div>
              </a>
            </Link>
          );
        })}
      </div>
    </>
  );
};

export default OperationPage;
