import { PrismaClient } from "@prisma/client";
import { db } from "../../src/server/db";

async function addDoctor(name: string, email: string, image: string) {
  try {
    const newDoctor = await db.doctor.create({
      data: {
        name,
        email,
        image,
        operations: [],
      },
    });

    console.log("Doctor added successfully:", newDoctor);
  } catch (error) {
    console.error("Error adding doctor:", error);
  } finally {
    await db.$disconnect();
  }
}

addDoctor("Dr. John Doe", "john.doe@example.com", "https://example.com/doctor-image.jpg");
