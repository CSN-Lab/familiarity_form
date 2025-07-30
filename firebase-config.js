// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// Define db!
const db = getFirestore(app);

// Save response (with nested response object)
export const saveResponse = async (subId, faceId, response) => {
  await addDoc(collection(db, "faceResponses"), {
    sub_id: subId,
    face_id: faceId,
    response: response,          // includes answer, responseTime, timestamp
    timestamp: Date.now()
  });
};

