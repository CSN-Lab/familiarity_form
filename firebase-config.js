// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyArYEdzeo9qFGVoI9DwGaFJz6GTxDR70Is",
  authDomain: "familiarity-form.firebaseapp.com",
  projectId: "familiarity-form",
  storageBucket: "familiarity-form.appspot.com", 
  messagingSenderId: "944921767554",
  appId: "1:944921767554:web:61b775d9b184320a0e4e9b",
  measurementId: "G-WRFW91ZYL0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Define db
const db = getFirestore(app);

// Save response
export const saveResponse = async(subID, faceId, response) => {
  const participantRef = doc(db, 'prod2026', subID); // In the db, create a collection for that year and one doc per participant

  // Attach face ID and timestamp to the response
  const responseEntry = {
    face_id: faceId,
    ...response,
    timestamp: Date.now()
  };

  try {
    await updateDoc(participantRef, {
      responses: arrayUnion(responseEntry)
    });
  } catch (error) {
    if (error.code ===  'not-found' || error.message.includes("No document to update")) {
      // If participant doc doesn't exist, create it with initial response
      await setDoc(participantRef, {
        responses: [responseEntry]
      });
    } else {
      console.error("Error saving response:", error);
    }
  };


}

