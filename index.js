import { saveResponse } from './firebase-config.js';

// === Global Variables ===
let faceData = [];
let currentIndex = 0;
let subID = '';
let trialStartTime = 0;

const startBtn = document.getElementById("startBtn");
const stimulusImg = document.getElementById("stimulus");
const imageContainer = document.getElementById("image-container");
const responseButtons = document.getElementById("response-buttons");
const thankYouScreen = document.getElementById("thank-you");

const folderList = ['B2S_image_stimuli', 'B4S_image_stimuli', 'stranger_image_stimuli'];

// === Shuffle Function ===
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// === Start Task ===
startBtn.addEventListener("click", () => {
  const urlParams = new URLSearchParams(window.location.search);
  subID = urlParams.get('subID');

  if (!subID) {
    alert("No subject ID found in URL. Please check the link");
    return;
  }

  Papa.parse('data/subject_face_dictionary.csv', {
    download: true,
    header: true,
    complete: function(results) {
      faceData = results.data.filter(row => row.sub_id === subID && row.face_id);
      if (faceData.length === 0) {
        alert("No face data found for subject: " + subID);
        return;
      }

      shuffleArray(faceData);

      document.getElementById("instructions").style.display = "none";
      imageContainer.style.display = "block";
      responseButtons.style.display = "block";

      showNextImage();
    }
  });
});

// === Load Image from Folder List ===
function tryLoadingImage(faceId, folderIndex) {
  if (folderIndex >= folderList.length) {
    alert(`Image for ${faceId} not found in any folder.`);
    currentIndex++;
    showNextImage();
    return;
  }

  const folder = folderList[folderIndex];
  const imagePath = `stim/${folder}/${faceId}.png`;

  stimulusImg.onerror = () => {
    tryLoadingImage(faceId, folderIndex + 1);
  };

  stimulusImg.onload = () => {
    stimulusImg.onerror = null;
    trialStartTime = Date.now(); // Start timing when image successfully loads
  };

  stimulusImg.src = imagePath;
}

// === Show Next Face ===
function showNextImage() {
  if (currentIndex >= faceData.length) {
    imageContainer.style.display = "none";
    responseButtons.style.display = "none";
    thankYouScreen.style.display = "block";
    return;
  }

  const currentFace = faceData[currentIndex];
  const faceId = currentFace.face_id;

  tryLoadingImage(faceId, 0);
}

// === Record Response ===
async function recordResponse(answer) {
  const currentFace = faceData[currentIndex];
  const faceID = currentFace.face_id;

  const responseTime = Date.now() - trialStartTime;

  await saveResponse(subID, faceID, {
    answer,
    responseTime,
    timestamp: Date.now()
  });

  currentIndex++;
  showNextImage();
}

// === Button Handlers ===
document.getElementById("yesBtn").addEventListener("click", () => recordResponse("yes"));
document.getElementById("noBtn").addEventListener("click", () => recordResponse("no"));
