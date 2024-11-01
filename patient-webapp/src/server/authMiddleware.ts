import { NextApiRequest, NextApiResponse } from "next";
import { DecodedIdToken } from "firebase-admin/auth";

import admin from "firebase-admin";

var serviceAccount = require("@/server/serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const verifyIdToken = async (token: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export async function authMiddlewareNode(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<DecodedIdToken | void> {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split("Bearer ")[1];
  console.log(token);

  if (!token) {
    console.log("No token provided");
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decodedToken = await verifyIdToken(token);
    return decodedToken; // Return the decoded token
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
}
