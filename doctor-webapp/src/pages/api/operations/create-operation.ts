// src/pages/api/operations/create-operation.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { authMiddlewareNode } from "@/server/authMiddleware";
import { z } from 'zod';

const prisma = new PrismaClient();

// Define the schema for input validation
const OperationSchema = z.object({
  patientEmail: z.string().email(),
  procedureName: z.string(),
  procedureDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  procedureDescription: z.string(),
  patientInformation: z.object({
    age: z.number(),
    height: z.number(),
    weight: z.number(),
    gender: z.string(),
  }),
  estRecoveryDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  postOpInstructions: z.string(),
  prescriptions: z.array(z.string()),
  notes: z.string(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Verify the user's identity and ensure they are a doctor
      const decodedToken = await authMiddlewareNode(req, res);
      if (!decodedToken) return; // If the token is invalid, the middleware will handle the response

      // Check if the user is a doctor
      const doctor = await prisma.doctor.findUnique({
        where: { id: decodedToken.uid },
      });

      if (!doctor) {
        return res.status(403).json({ error: "Only doctors can create operations" });
      }

      // Validate input
      const validationResult = OperationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: validationResult.error.issues });
      }

      const {
        patientEmail,
        procedureName,
        procedureDate,
        procedureDescription,
        patientInformation,
        estRecoveryDate,
        postOpInstructions,
        prescriptions,
        notes,
      } = validationResult.data;
      console.log(validationResult.data);

      // Check if the patient exists, if not, create a new patient
      let patient = await prisma.patient.findUnique({
        where: { email: patientEmail },
      });

      if (!patient) {
        patient = await prisma.patient.create({
          data: {
            email: patientEmail,
            firstName: '', 
            lastName: '', 
          },
        });
      }

      const operation = await prisma.operation.create({
        data: {
          procedureName,
          procedureDate: new Date(procedureDate),
          procedureDescription,
          patientInformation,
          estRecoveryDate: new Date(estRecoveryDate),
          postOpInstructions,
          prescriptions,
          notes,
          patientId: patient.id,
          doctorId: decodedToken.uid, // Use the doctor's ID from Firebase token
          chats: []
        },
      });

      res.status(201).json(operation);
    } catch (error) {
      console.error("Error creating operation:", error);
      res.status(500).json({ error: 'Failed to create operation' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
