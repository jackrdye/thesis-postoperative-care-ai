import Navbar from "@/components/general/Navbar";
import { Patient } from "@prisma/client";

interface PatientProfilePageProps {
  patientData: Patient;
}

export default function PatientProfilePage({ patientData }: PatientProfilePageProps) {
  console.log(patientData);
  return (
    <main className="bg-gray-200 h-screen">
      <Navbar title="Profile" showBackArrow showVerticalDotIcon />
      <div className="flex flex-col items-center">
        <div className="bg-white shadow-xl rounded-lg p-4 m-4">
          <p className="text-lg">
            <strong>Name:</strong> {patientData.firstName} {patientData.lastName}
          </p>
          <p className="text-lg">
            <strong>Email:</strong> {patientData.email}
          </p>
          {/* <p className="text-lg">
            <strong>Phone:</strong> {patientData.phone}
          </p> */}
        </div>
      </div>
    </main>
  );
}
