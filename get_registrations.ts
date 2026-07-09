import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    const snapshot = await getDocs(collection(db, "registrations"));
    console.log("=== REGISTRATIONS CREATEDAT CHECK ===");
    for (const doc of snapshot.docs) {
      const data = doc.data();
      console.log(`Name: ${data.studentName}, createdAt: ${data.createdAt ? JSON.stringify(data.createdAt) : "MISSING"}`);
    }
    console.log("=== END ===");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

run();
