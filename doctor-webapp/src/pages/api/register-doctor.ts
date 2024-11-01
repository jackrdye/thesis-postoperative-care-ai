import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/server/db";

import admin from "firebase-admin";

var serviceAccount = require("@/server/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end(); // Method Not Allowed
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string') {
    return res.status(400).json({ error: "Name and email must be strings, and name, email, and password are required" });
  }

  try {
    // Start a transaction
    await db.$transaction(async (prisma) => {
      // Create doctor in MongoDB
      const doctor = await prisma.doctor.create({
        data: {
          name,
          email,
          image: "",
        },
      });

      // Use the doctor's MongoDB _id as the Firebase UID
      const uid = doctor.id;

      // Create a new Firebase user with the custom UID
      await createUserWithCustomUID(uid, email, password);

      res.status(200).json({ message: "Doctor registration successful" });
    });
  } catch (error) {
    console.error("Error during doctor registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function createUserWithCustomUID(uid: string, email: string, password: string) {
  try {
    await admin.auth().createUser({
      uid,
      email,
      password,
    });
  } catch (error) {
    console.error("Error creating Firebase user:", error);
    throw new Error("Failed to create Firebase user");
  }
}
