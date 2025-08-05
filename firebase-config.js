// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


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
const db = getFirestore(app);

// check for previous response
export const getPreviousResponse = async (subID) => {
  const participantRef = doc(db, 'prod2026', subID);
  const docSnap = await getDoc(participantRef);

  if (docSnap.exists()){
    const data = docSnap.data();
    return Array.isArray(data.responses) ? data.responses : []; // return array if none exists
  }
}


// check if participant has completed the survey
export const checkIfCompleted = async (subID) => {
  const participantRef = doc(db, 'prod2026', subID);
  const docSnap = await getDoc(participantRef)

  if (docSnap.exists() && docSnap.data().completed){
    return true;
  }
  return false;
};

// save live responses
export const saveResponse = async(subID, faceId, response) => {
  const participantRef = doc(db, 'prod2026', subID);

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
    if (error.code === 'not-found' || error.message.includes("No document to update")) {
      await setDoc(participantRef, {
        responses: [responseEntry]
      });
    } else {
    console.error("Error saving response:", error);
    }
  }
};

// finalize survey

export const markSurveyComplete = async (subID) => {
  const participantRef = doc(db, 'prod2026', subID);

  try{
    await updateDoc(participantRef, {
      completed: true,
      submittedAt: Date.now()
    })
  } catch (error){
    console.error("Error finalizing the survey:", error)
  }
}

