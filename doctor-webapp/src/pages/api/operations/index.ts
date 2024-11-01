import { NextApiRequest, NextApiResponse } from "next";
import { authMiddlewareNode } from "@/server/authMiddleware";
import { db } from "@/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Verify the user's identity
    const decodedToken = await authMiddlewareNode(req, res);
    if (!decodedToken) return; // If the token is invalid, the middleware will handle the response

    // Retrieve the user's operations from the database, including doctor and patient information
    const operations = await db.operation.findMany({
      where: {
        doctorId: decodedToken.uid, // Assuming the doctorId corresponds to the Firebase UID
      },
      include: {
        doctor: true,
        patient: true,
      },
    });

    res.status(200).json(operations);
  } catch (error) {
    console.error("Error retrieving operations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
