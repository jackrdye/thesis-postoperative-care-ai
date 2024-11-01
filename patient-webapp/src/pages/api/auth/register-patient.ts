import type { NextApiRequest, NextApiResponse } from "next";
import { createUserWithCustomUID } from "@/server/firebase-server-functions";
import { db } from "@/server/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Only allow POST requests for this endpoint
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { email, password } = req.body;

  // Validate that required fields are provided
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Check if patient already exists
    let patient = await db.patient.findUnique({
      where: { email }
    });

    if (!patient) {
      // Create new patient if doesn't exist
      patient = await db.patient.create({
        data: {
          email,
          firstName: "",
          lastName: ""
        }
      });
    }

    // Use the patient's ID as Firebase UID
    const uid = patient.id;
    
    // Create Firebase user with the Prisma patient ID
    await createUserWithCustomUID(uid, email, password);

    res.status(200).json({ message: "Signup successful" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
