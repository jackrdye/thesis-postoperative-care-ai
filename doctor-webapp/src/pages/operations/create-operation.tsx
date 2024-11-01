import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from "@/server/firebase";

const CreateOperation: React.FC = () => {
  const [patientEmail, setPatientEmail] = useState('');
  const [procedureName, setProcedureName] = useState('');
  const [procedureDate, setProcedureDate] = useState('');
  const [procedureDescription, setProcedureDescription] = useState('');
  const [age, setAge] = useState<number | undefined>();
  const [height, setHeight] = useState<number | undefined>();
  const [weight, setWeight] = useState<number | undefined>();
  const [gender, setGender] = useState('');
  const [estRecoveryDate, setEstRecoveryDate] = useState('');
  const [postOpInstructions, setPostOpInstructions] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [notes, setNotes] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    const token = await user.getIdToken();
    const response = await fetch('/api/operations/create-operation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        patientEmail,
        procedureName,
        procedureDate,
        procedureDescription,
        patientInformation: { age, height, weight, gender },
        estRecoveryDate,
        postOpInstructions,
        prescriptions: prescriptions.split(',').map(p => p.trim()), // Split prescriptions by comma
        notes,
      }),
    });

    if (response.ok) {
      router.push('/');
    } else {
      const errorData = await response.json();
      console.error('Failed to create operation: ', errorData);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md">
      <h1 className="text-2xl font-bold mb-4">Create New Operation</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Patient Email</label>
          <input
            type="email"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Procedure Name</label>
          <input
            type="text"
            value={procedureName}
            onChange={(e) => setProcedureName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Procedure Date</label>
          <input
            type="date"
            value={procedureDate}
            onChange={(e) => setProcedureDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Procedure Description</label>
          <textarea
            value={procedureDescription}
            onChange={(e) => setProcedureDescription(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Patient Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Patient Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Patient Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Patient Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Estimated Recovery Date</label>
          <input
            type="date"
            value={estRecoveryDate}
            onChange={(e) => setEstRecoveryDate(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Post-Op Instructions</label>
          <textarea
            value={postOpInstructions}
            onChange={(e) => setPostOpInstructions(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        {/* <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Prescriptions (comma-separated)</label>
          <input
            type="text"
            value={prescriptions}
            onChange={(e) => setPrescriptions(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div> */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Surgical Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Create Operation
        </button>
      </form>
    </div>
  );
};

export default CreateOperation;
