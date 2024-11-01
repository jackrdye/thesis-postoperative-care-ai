import { NextApiRequest, NextApiResponse } from "next";
import { authMiddlewareNode } from "@/server/authMiddleware";
import { db } from "@/server/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { operationId } = req.query;

  try {
    // Verify the user's identity
    const decodedToken = await authMiddlewareNode(req, res);
    if (!decodedToken) return; // If the token is invalid, the middleware will handle the response

    // Retrieve the specific operation from the database, including doctor and patient information
    const operation = await db.operation.findUnique({
      where: {
        id: operationId as string,
      },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!operation) {
      res.status(404).json({ error: "Operation not found" });
      return;
    }

    // Verify that the operation belongs to the authenticated doctor
    if (operation.doctorId !== decodedToken.uid) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.status(200).json(operation);
  } catch (error) {
    console.error("Error retrieving operation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
