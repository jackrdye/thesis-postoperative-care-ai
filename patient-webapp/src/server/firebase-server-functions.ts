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

export async function createUserWithCustomUID(
  uid: string,
  email: string,
  password: string,
) {
  try {
    const userRecord = await admin.auth().createUser({
      uid: uid,
      email: email,
      password: password,
    });
    return userRecord;
  } catch (error: any) {
    throw new Error(`Error creating user: ${error.message}`);
  }
}
