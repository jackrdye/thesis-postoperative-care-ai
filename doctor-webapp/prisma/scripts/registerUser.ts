import { db } from "@/server/db";
import admin from "firebase-admin";
import serviceAccount from "@/server/serviceAccountKey.json";
import { ServiceAccount } from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });
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

export async function registerDoctor(name: string, email: string, password: string) {
  if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string') {
    throw new Error("Name and email must be strings, and name, email, and password are required");
  }

  try {
    await db.$transaction(async (prisma) => {
      const doctor = await prisma.doctor.create({
        data: {
          name,
          email,
        },
      });

      const uid = doctor.id;
      await createUserWithCustomUID(uid, email, password);
    }, { timeout: 10000 }); // Increase timeout to 10 seconds
    console.log("Doctor registration successful");
  } catch (error) {
    console.error("Error during doctor registration:", error);
    throw new Error("Doctor registration failed");
  }
}

export async function registerPatient(firstName: string, lastName: string, email: string, password: string) {
  if (!firstName || !lastName || !email || !password || typeof firstName !== 'string' || typeof lastName !== 'string' || typeof email !== 'string') {
    throw new Error("First name, last name, and email must be strings, and email and password are required");
  }

  try {
    await db.$transaction(async (prisma) => {
      const patient = await prisma.patient.create({
        data: {
          firstName,
          lastName,
          email,
        },
      });

      const uid = patient.id;
      await createUserWithCustomUID(uid, email, password);
    }, { timeout: 10000 }); // Increase timeout to 10 seconds
    console.log("Patient registration successful");
  } catch (error) {
    console.error("Error during patient registration:", error);
    throw new Error("Patient registration failed");
  }
}
