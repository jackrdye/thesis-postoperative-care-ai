import { PrismaClient } from '@prisma/client';
import { ObjectId } from 'mongodb';
import { registerDoctor, registerPatient } from './registerUser';

const prisma = new PrismaClient();

async function main() {
  // Create a doctor using the registerDoctor function
  const doctorEmail = 'john.doe@example.com';
  const doctorPassword = 'securePassword123'; // You should use a secure method to generate or obtain passwords
  await registerDoctor('Dr. John Doe', doctorEmail, doctorPassword);

  // Fetch the created doctor from the database
  const doctor = await prisma.doctor.findUnique({
    where: { email: doctorEmail },
  });

  if (!doctor) {
    throw new Error('Failed to create doctor');
  }

  // Create a patient using the registerPatient function
  const patientEmail = 'jane.doe@example.com';
  const patientPassword = 'securePassword456'; // You should use a secure method to generate or obtain passwords
  await registerPatient("Jane", "Doe", patientEmail, patientPassword);

  // Fetch the created patient from the database
  const patient = await prisma.patient.findUnique({
    where: { email: patientEmail },
  });

  if (!patient) {
    throw new Error('Failed to create patient');
  }

  // Create an operation with nested fields
  const operation = await prisma.operation.create({
    data: {
      procedureName: "Appendectomy",
      procedureDescription: "Appendectomy is a surgical procedure to remove the appendix, a small organ located at the end of the large intestine. It is performed to treat appendicitis, an inflammation of the appendix that can lead to a potentially life-threatening infection.",
      procedureDate: new Date("2024-07-08T23:18:05.615Z"),
      patientInformation: {
        age: 30,
        height: 170,
        weight: 70,
        gender: "male"
      },
      prescriptions: [
        "Medication1",
        "Medication2"
      ],
      postOpInstructions: "Rest and follow up in one week",
      estRecoveryDate: new Date("2024-08-07T23:18:05.615Z"),
      recoveryTimeline: [
        {
          date: new Date("2024-07-08T23:18:05.616Z"),
          description: "Initial recovery"
        },
        {
          date: new Date("2024-07-23T23:18:05.616Z"),
          description: "Follow-up visit"
        }
      ],
      notes: "Surgery was successful with no complications.",
      doctorId: doctor.id,
      patientId: patient.id,
      chats: [
        {
          id: new ObjectId("60c72b2f9b1d8b3a4c8e4d20").toString(),
          title: "Chat 1",
          messages: [
            {
              id: new ObjectId("60c72b2f9b1d8b3a4c8e4d21").toString(),
              text: "Hello, how can I help you today?",
              sender: "AI",
              timestamp: new Date("2022-12-31T13:00:00.000Z"),
              readByPatient: true,
              readTimestamp: new Date("2022-12-31T13:01:00.000Z"),
              verificationStatus: "VERIFIED",
              doctorNote: "",
              readByDoctor: true
            },
            {
              id: new ObjectId("60c72b2f9b1d8b3a4c8e4d22").toString(),
              text: "I have a question about my prescription.",
              sender: "PATIENT",
              timestamp: new Date("2022-12-31T14:00:00.000Z"),
              readByPatient: false,
              readByDoctor: true,
              readTimestamp: new Date("2022-12-31T14:01:00.000Z")
            },
            {
              id: new ObjectId("60c72b2f9b1d8b3a4c8e4d23").toString(),
              text: "Sure, please provide me with the details.",
              sender: "AI",
              timestamp: new Date("2022-12-31T14:05:00.000Z"),
              verificationStatus: "VERIFIED",
              doctorNote: "",
              readByPatient: true,
              readTimestamp: new Date("2022-12-31T14:06:00.000Z"),
              readByDoctor: true
            },
            {
              id: new ObjectId("60c72b2f9b1d8b3a4c8e4d24").toString(),
              text: "Hello, how can I help you today?",
              sender: "AI",
              timestamp: new Date("2022-12-31T15:00:00.000Z"),
              verificationStatus: "VERIFIED",
              doctorNote: "",
              readByPatient: true,
              readTimestamp: new Date("2022-12-31T15:01:00.000Z"),
              readByDoctor: true
            },
            {
              id: new ObjectId("60c72b2f9b1d8b3a4c8e4d25").toString(),
              text: "I have a question about my prescription.",
              sender: "PATIENT",
              timestamp: new Date("2022-12-31T15:05:00.000Z"),
              readByPatient: true,
              readByDoctor: true,
              readTimestamp: new Date("2022-12-31T15:06:00.000Z")
            },
            {
              id: new ObjectId("60c72b2f9b1d8b3a4c8e4d26").toString(),
              text: "Sure, please provide me with the details.",
              sender: "AI",
              timestamp: new Date("2022-12-31T15:10:00.000Z"),
              verificationStatus: "VERIFIED",
              doctorNote: "",
              readByPatient: true,
              readTimestamp: new Date("2022-12-31T15:11:00.000Z"),
              readByDoctor: true
            },
            {
              id: new ObjectId("60c72b2f9b1d8b3a4c8e4d27").toString(),
              text: "Hello, how can I help you today?",
              sender: "AI",
              timestamp: new Date("2022-12-31T16:00:00.000Z"),
              verificationStatus: "VERIFIED",
              doctorNote: "",
              readByPatient: true,
              readTimestamp: new Date("2022-12-31T16:01:00.000Z"),
              readByDoctor: true
            },
            {
              id: new ObjectId("60c72b2f9b1d8b3a4c8e4d28").toString(),
              text: "I have a question about my prescription.",
              sender: "PATIENT",
              timestamp: new Date("2022-12-31T16:05:00.000Z"),
              readByPatient: true,
              readByDoctor: true,
              readTimestamp: new Date("2022-12-31T16:06:00.000Z")
            },
            {
              id: new ObjectId("60c72b2f9b1d8b3a4c8e4d29").toString(),
              text: "Sure, please provide me with the details.",
              sender: "AI",
              timestamp: new Date("2022-12-31T16:10:00.000Z"),
              verificationStatus: "VERIFIED",
              doctorNote: "",
              readByPatient: true,
              readTimestamp: new Date("2022-12-31T16:11:00.000Z"),
              readByDoctor: true
            },
            {
              id: new ObjectId("66d7bc738367b208ad180be4").toString(),
              text: "What was my last question? Just tell me the questiona nd nothing else",
              sender: "PATIENT",
              timestamp: new Date("2024-09-04T01:48:35.361Z"),
              readByPatient: true,
              readByDoctor: false,
              readTimestamp: null
            },
            {
              id: new ObjectId("66d7bc788367b208ad180be5").toString(),
              text: "Given that it's been 57 days since your appendectomy, you're generally beyond the initial 4-6 week recovery period recommended for such a procedure. Therefore, you should typically be safe to resume swimming, assuming you have healed properly and have had no complications. However, there are a few important points to consider:\n\n1. **Healing of Incisions**: Ensure that your surgical incisions are fully healed and there are no open wounds, signs of infection (such as redness, swelling, or discharge), or any discomfort.\n2. **Physical Condition**: Assess your overall strength and endurance, as swimming can be physically demanding. Start with gentle activities and gradually increase intensity.\n3. **Medical Clearance**: It is essential to get approval from your healthcare provider or surgeon to confirm that your recovery process is on track and you're cleared for activities like swimming.\n\nIf you haven't had a follow-up consultation, or if you are unsure, it's always best to double-check with your healthcare provider before returning to swimming or other strenuous activities. If you experience any pain or unusual symptoms while swimming, stop immediately and consult your healthcare provider.",
              sender: "AI",
              timestamp: new Date("2024-09-04T01:48:40.718Z"),
              verificationStatus: "UNVERIFIED",
              doctorNote: "",
              readByPatient: true,
              readByDoctor: false,
              readTimestamp: null
            },
            {
              id: new ObjectId("66d7bcd08367b208ad180be6").toString(),
              text: "How many days are in a year?",
              sender: "PATIENT",
              timestamp: new Date("2024-09-04T01:50:08.291Z"),
              readByPatient: true,
              readByDoctor: false,
              readTimestamp: null
            },
            {
              id: new ObjectId("66d7bcdf8367b208ad180be7").toString(),
              text: "Given that you're 57 days post-appendectomy, you should be in the later stages of recovery. Here are some key points to consider:\n\n### Healing and Activities:\n- **Recovery:** By this time, your surgical incisions are generally well-healed, and you should be returning to most of your normal activities.\n- **Exercise:** You can usually resume light to moderate exercise, but listen to your body. Avoid heavy lifting or strenuous activities if you experience any pain or discomfort.\n\n### Diet and Hydration:\n- **Balanced Diet:** Continue to eat a balanced diet rich in fruits, vegetables, lean proteins, and whole grains.\n- **Hydration:** Drink plenty of water to stay hydrated.\n\n### Monitoring and Care:\n- **Incision Care:** Monitor for signs of infection such as redness, swelling, or discharge. Normal bathing is typically fine by now.\n- **Pain Management:** Mild discomfort can be managed with over-the-counter pain relievers like acetaminophen or ibuprofen. Any severe or persistent pain should be immediately reported to your healthcare provider.\n- **Watch for Complications:** Be alert for symptoms such as fever, increasing abdominal pain, nausea, or any unusual signs, and seek medical advice promptly.\n\n### Follow-up:\n- **Appointments:** Ensure you attend all follow-up appointments with your healthcare provider to monitor your healing progress.\n\n### Emotional Well-being:\n- **Mental Health:** It's normal to experience a range of emotions post-surgery. Activities that promote relaxation, such as gentle yoga or meditation, can be beneficial. If you feel persistent anxiety or emotional distress, consider speaking to a healthcare provider.\n\nYour recovery timeline can vary based on individual health factors, so always consult your surgeon or healthcare provider for personalized advice. If you have any specific concerns or questions about your recovery process, don't hesitate to reach out for more guidance.",
              sender: "AI",
              timestamp: new Date("2024-09-04T01:50:23.288Z"),
              verificationStatus: "UNVERIFIED",
              doctorNote: "",
              readByPatient: false,
              readByDoctor: false,
              readTimestamp: null
            }
          ],
          oldestUnverifiedMessage: new Date("2024-07-08T23:18:05.616Z"),
          numUnverifiedMessages: 1
        },
        {
          id: new ObjectId("60c72b2f9b1d8b3a4c8e4d3f").toString(),
          title: "Chat 2",
          messages: [],
          oldestUnverifiedMessage: new Date("2024-07-08T23:18:05.616Z"),
          numUnverifiedMessages: 0
        }
      ],
    },
  });

  console.log('Dummy data inserted:', { doctor, patient, operation });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
