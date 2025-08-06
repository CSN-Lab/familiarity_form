import { checkIfCompleted, saveResponse, getPreviousResponse } from './firebase-config.js';
import { markSurveyComplete } from './firebase-config.js';

// === Initialize variables ===
let faceData = [];
let currentIndex = 0;
let subID = '';

const startBtn = document.getElementById("startBtn");
const stimulusImg = document.getElementById("stimulus");
const imageContainer = document.getElementById("image-container");
const responseContainer = document.getElementById("response-container");
const continueBtn = document.getElementById("continueBtn");
const options = document.querySelectorAll("input[name='familiarity']");


// === Start Task on Button Click ===
startBtn.addEventListener("click", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  subID = urlParams.get('subID');

  if (!subID) {
    alert("No subject ID found in URL. Please check the link.");
    return;
  }

  const alreadyCompleted = await checkIfCompleted(subID);
  if (alreadyCompleted) {
    alert("You have already completed this survey. Thank you!");
    return;
  }

  // === Load CSV and filter rows for this subject ===
  Papa.parse('data/subject_face_dictionary.csv', {
    download: true,
    header: true,
    complete: async function (results) {
      faceData = results.data.filter(row => row.sub_id === subID && row.face_id);
      if (faceData.length === 0) {
        alert("No face data found for subject: " + subID);
        return;
      }

      const previousResponses = await getPreviousResponse(subID) || [];
      const seenFaceIds = new Set(previousResponses.map(r => r.face_id));
      faceData = faceData.filter(face => !seenFaceIds.has(face.face_id));
      currentIndex = previousResponses.length;

      shuffleArray(faceData); // Randomize presentation order
      document.getElementById("instructions").style.display = "none";
      imageContainer.style.display = "block";
      responseContainer.style.display = "block";
      showNextImage();
    }
  });
});

// === Randomize array in-place ===
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// === Display next image ===
function showNextImage() {
  if (currentIndex >= faceData.length) {
    imageContainer.style.display = "none";
    responseContainer.style.display = "none";
    document.getElementById('completion-message').style.display = "block";
    markSurveyComplete(subID);
    return;
  }

  const currentFace = faceData[currentIndex];
  const faceId = currentFace.face_id;
  const imagePath = `stim/all_faces/${faceId}.png`;
  stimulusImg.src = imagePath;

  // Reset radio buttons and disable Continue
  options.forEach(opt => opt.checked = false);
  continueBtn.disabled = true;
}

// === Enable Continue button when a radio option is selected ===
options.forEach(option => {
  option.addEventListener("change", () => {
    continueBtn.disabled = false;
  });
});

// === Handlex Continue button click ===
continueBtn.addEventListener("click", async () => {
  const selected = [...options].find(opt => opt.checked);
  if (!selected) return;

  const currentFace = faceData[currentIndex];
  const faceID = currentFace.face_id;

  await saveResponse(subID, faceID, {
    answer: selected.value,
    index: currentIndex,
    timestamp: Date.now()
  });

  currentIndex++;
  showNextImage();
});

