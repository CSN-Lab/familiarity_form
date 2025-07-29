import { saveResponse } from './firebase-config.js';

// === Initialize variables ===
let faceData = [];
let currentIndex = 0;
let subID = '';

const startBtn = document.getElementById("startBtn");
const stimulusImg = document.getElementById("stimulus");
const imageContainer = document.getElementById("image-container");
const responseButtons = document.getElementById("response-buttons");

// === Start Task on Button Click ===
startBtn.addEventListener("click", () => {
    const urlParams = new URLSearchParams(window.location.search);
    subID = urlParams.get('subID');

    if (!subID) {
        alert("No subject ID found in URL. Please check the link.");
        return;
    }

    // === Load CSV and filter rows for this subject ===
    Papa.parse('data/subject_face_dictionary.csv', {
        download: true,
        header: true,
        complete: function(results) {
            faceData = results.data.filter(row => row.sub_id === subID && row.face_id);
            if (faceData.length === 0) {
                alert("No face data found for subject: " + subID);
                return;
            }

            shuffleArray(faceData); // Randomize presentation order
            document.getElementById("instructions").style.display = "none";
            imageContainer.style.display = "block";
            responseButtons.style.display = "block";
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
        alert("Task complete! Thank you.");
        imageContainer.style.display = "none";
        responseButtons.style.display = "none";
        return;
    }

    const currentFace = faceData[currentIndex];
    const faceId = currentFace.face_id;
    const imagePath = `stim/all_faces/${faceId}.png`;
    stimulusImg.src = imagePath;
}

// === Save response and show next ===
async function recordResponse(answer) {
    const currentFace = faceData[currentIndex];
    const faceID = currentFace.face_id;

    const responseTime = Date.now(); // Optional: you could subtract from stimulus onset time
    await saveResponse(subID, faceID, {
        answer,
        responseTime,
        timestamp: Date.now()
    });

    currentIndex++;
    showNextImage();
}

document.getElementById("yesBtn").addEventListener("click", () => recordResponse("yes"));
document.getElementById("noBtn").addEventListener("click", () => recordResponse("no"));
