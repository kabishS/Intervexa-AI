/* =========================================================
   CONFIG
   ⚠️ SECURITY NOTE: This key is embedded client-side, meaning
   anyone who views page source / devtools can read it. Fine for
   local testing. For any public deployment, proxy this call
   through a backend (e.g. a Supabase Edge Function) so the key
   never reaches the browser.
   ========================================================= */
const CONFIG = {
  GROQ_API_KEY: "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",
  GROQ_MODEL: "openai/gpt-oss-120b", // current recommended Groq model (llama-3.3-70b-versatile was deprecated)
  GROQ_ENDPOINT: "https://api.groq.com/openai/v1/chat/completions",
  FEEDBACK_EVERY: 10, // number of answered questions between feedback checkpoints (never shown to the user)
  AVATAR_IMAGES: {
    female: "../assets/IntervexaAI_home_girl.png",
    male: "../assets/IntervexaAI_home_boy.png"
  }
};

/* =========================================================
   STATE
   ========================================================= */
const state = {
  role: "",
  level: "",
  gender: "female",
  history: [],       // full chat history sent to Groq (system + Q/A turns)
  buffer: [],         // { question, answer } pairs since the last feedback checkpoint
  answeredCount: 0,   // total answered questions (internal only, never displayed)
  recognizing: false,
  cameraStream: null
};

/* =========================================================
   DOM refs
   ========================================================= */
const el = (id) => document.getElementById(id);
const screens = {
  setup: el("screen-setup"),
  interview: el("screen-interview"),
  feedback: el("screen-feedback")
};
function showScreen(name){
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

/* =========================================================
   Groq API call
   ========================================================= */
async function callGroq(messages, temperature = 0.7) {
  const res = await fetch(CONFIG.GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${CONFIG.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: CONFIG.GROQ_MODEL,
      messages,
      temperature
    })
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

/* =========================================================
   Voice selection (Text-to-speech)
   ========================================================= */
const FEMALE_VOICE_HINTS = ["female", "samantha", "victoria", "karen", "zira", "susan", "moira", "tessa", "fiona", "google us english", "google uk english female", "allison", "ava", "serena"];
const MALE_VOICE_HINTS = ["male", "david", "daniel", "alex", "fred", "george", "google uk english male", "aaron", "gordon", "arthur"];

let cachedVoices = [];
function loadVoices() {
  cachedVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
}
if ("speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice(gender) {
  if (!cachedVoices.length) loadVoices();
  const hints = gender === "male" ? MALE_VOICE_HINTS : FEMALE_VOICE_HINTS;
  const englishVoices = cachedVoices.filter(v => v.lang && v.lang.toLowerCase().startsWith("en"));
  const pool = englishVoices.length ? englishVoices : cachedVoices;

  let match = pool.find(v => hints.some(h => v.name.toLowerCase().includes(h)));
  if (match) return match;

  // Fallback: just alternate between two distinct voices if available
  if (pool.length > 1) return gender === "male" ? pool[1] : pool[0];
  return pool[0] || null;
}

/* =========================================================
   Text-to-speech
   ========================================================= */
function speak(text) {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window)) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(state.gender);
    if (voice) utter.voice = voice;
    // Fallback pitch shaping when no explicit gendered voice is found
    utter.pitch = state.gender === "male" ? 0.85 : 1.15;
    utter.rate = 1;
    avatarFrame.classList.add("speaking");
    orbStatus("Intervexa is speaking…");
    utter.onend = () => {
      avatarFrame.classList.remove("speaking");
      orbStatus("Your turn — speak or type your answer.");
      resolve();
    };
    utter.onerror = () => {
      avatarFrame.classList.remove("speaking");
      resolve();
    };
    window.speechSynthesis.speak(utter);
  });
}
function orbStatus(text){
  // status now lives in the footer note area under the answer box; keep as a no-op hook
  // (kept as a function so future UI additions can subscribe to status changes)
}

/* =========================================================
   Camera (getUserMedia)
   ========================================================= */
async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    state.cameraStream = stream;
    cameraVideo.srcObject = stream;
    cameraOffMsg.style.display = "none";
  } catch (err) {
    console.warn("Camera unavailable:", err);
    cameraOffMsg.style.display = "block";
  }
}
function stopCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(t => t.stop());
    state.cameraStream = null;
  }
}

/* =========================================================
   Speech-to-text (Web Speech API)
   ========================================================= */
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;
if (SpeechRecognitionAPI) {
  recognizer = new SpeechRecognitionAPI();
  recognizer.continuous = true;
  recognizer.interimResults = true;
  recognizer.lang = "en-US";

  recognizer.onresult = (event) => {
    let finalTranscript = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalTranscript += transcript + " ";
    }
    if (finalTranscript) {
      answerInput.value = (answerInput.value + " " + finalTranscript).trim();
    }
  };
  recognizer.onend = () => {
    state.recognizing = false;
    micBtn.classList.remove("recording");
    cameraFrame.classList.remove("recording");
  };
  recognizer.onerror = () => {
    state.recognizing = false;
    micBtn.classList.remove("recording");
    cameraFrame.classList.remove("recording");
  };
} else {
  // micBtn may not exist yet at parse time in some browsers; guarded on DOMContentLoaded below
}

function toggleRecording() {
  if (!recognizer) return;
  if (state.recognizing) {
    recognizer.stop();
  } else {
    window.speechSynthesis.cancel();
    avatarFrame.classList.remove("speaking");
    state.recognizing = true;
    micBtn.classList.add("recording");
    cameraFrame.classList.add("recording");
    try { recognizer.start(); } catch (e) { /* already started */ }
  }
}

/* =========================================================
   Interview flow
   ========================================================= */
function systemPrompt() {
  return `You are Intervexa AI, a professional, encouraging mock interview coach conducting a live spoken interview for a ${state.level} ${state.role} position.

Rules:
- Ask exactly one interview question at a time.
- Vary question types across: background/experience, behavioral, role-specific technical or situational, and problem-solving.
- Never number the questions or mention how many have been asked.
- Never repeat a question already asked in this conversation.
- Respond with ONLY the question text, no preamble, no labels like "Question:", no quotation marks.
- Keep each question concise (1-3 sentences), natural, and conversational, as a real interviewer would speak it aloud.`;
}

async function askNextQuestion() {
  questionBox.classList.add("loading");
  questionText.textContent = "Thinking of the next question…";
  submitBtn.disabled = true;
  micBtn.disabled = !recognizer;

  try {
    const messages = [{ role: "system", content: systemPrompt() }, ...state.history];
    const question = await callGroq(messages);
    state.history.push({ role: "assistant", content: question });
    questionBox.classList.remove("loading");
    questionText.textContent = question;
    submitBtn.disabled = false;
    micBtn.disabled = !recognizer;
    await speak(question);
  } catch (err) {
    questionBox.classList.remove("loading");
    questionText.textContent = "Something went wrong reaching the AI. Check your connection and try again.";
    console.error(err);
    submitBtn.disabled = false;
  }
}

async function submitAnswer() {
  const answer = answerInput.value.trim();
  if (!answer) { answerInput.focus(); return; }

  const lastQuestion = state.history[state.history.length - 1]?.content || "";
  state.history.push({ role: "user", content: answer });
  state.buffer.push({ question: lastQuestion, answer });
  state.answeredCount++;
  answerInput.value = "";

  if (state.answeredCount % CONFIG.FEEDBACK_EVERY === 0) {
    await showFeedback();
  } else {
    await askNextQuestion();
  }
}

async function showFeedback(isFinal = false) {
  showScreen("feedback");
  feedbackText.textContent = "Analyzing your recent answers…";
  continueBtn.style.display = isFinal ? "none" : "inline-flex";

  const pairsText = state.buffer.map((p) =>
    `Q: ${p.question}\nA: ${p.answer}`
  ).join("\n\n");

  const feedbackPrompt = `You are Intervexa AI, an interview coach. Below are a candidate's most recent answers in a mock interview for a ${state.level} ${state.role} role.

${pairsText || "(No answers recorded yet.)"}

Give constructive, encouraging feedback in a short, clearly structured format using plain text with these sections:
- Strengths: 2-3 bullet points
- Areas to improve: 2-3 bullet points
- One tip for the next round of questions

Be specific and reference their actual answers where useful. Do not mention question numbers or counts. Keep it under 180 words.`;

  try {
    const feedback = await callGroq([{ role: "user", content: feedbackPrompt }], 0.6);
    feedbackText.textContent = feedback;
  } catch (err) {
    feedbackText.textContent = "Couldn't generate feedback right now — check your connection and try continuing again.";
    console.error(err);
  }
  state.buffer = [];
}

/* =========================================================
   Event wiring
   ========================================================= */
const roleInput = el("roleInput");
const levelSelect = el("levelSelect");
const startBtn = el("startBtn");
const setupError = el("setupError");
const roleLabel = el("roleLabel");
const endBtn = el("endBtn");
const avatarFrame = el("avatarFrame");
const avatarImage = el("avatarImage");
const questionBox = el("questionBox");
const questionText = el("questionText");
const cameraFrame = el("cameraFrame");
const cameraVideo = el("cameraVideo");
const cameraOffMsg = el("cameraOffMsg");
const answerInput = el("answerInput");
const micBtn = el("micBtn");
const submitBtn = el("submitBtn");
const feedbackText = el("feedbackText");
const continueBtn = el("continueBtn");
const restartBtn = el("restartBtn");

if (!recognizer) {
  micBtn.disabled = true;
  micBtn.title = "Voice input isn't supported in this browser — type your answer instead.";
}

startBtn.addEventListener("click", async () => {
  const role = roleInput.value.trim();
  if (!role) { setupError.textContent = "Please enter a role to interview for."; return; }
  setupError.textContent = "";

  state.role = role;
  state.level = levelSelect.value;
  state.gender = document.querySelector('input[name="gender"]:checked').value;
  state.history = [];
  state.buffer = [];
  state.answeredCount = 0;

  avatarImage.src = CONFIG.AVATAR_IMAGES[state.gender];
  roleLabel.textContent = `${state.level} · ${state.role}`;

  showScreen("interview");
  initCamera();
  await askNextQuestion();
});

micBtn.addEventListener("click", toggleRecording);
submitBtn.addEventListener("click", submitAnswer);
answerInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitAnswer();
});

endBtn.addEventListener("click", async () => {
  window.speechSynthesis.cancel();
  if (recognizer && state.recognizing) recognizer.stop();
  stopCamera();
  await showFeedback(true);
});

continueBtn.addEventListener("click", async () => {
  showScreen("interview");
  initCamera();
  await askNextQuestion();
});

restartBtn.addEventListener("click", () => {
  state.history = [];
  state.buffer = [];
  state.answeredCount = 0;
  roleInput.value = "";
  setupError.textContent = "";
  stopCamera();
  showScreen("setup");
});
