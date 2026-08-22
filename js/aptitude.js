const API_URL = "https://aptitude-gold.vercel.app/Random";

const quizCard   = document.getElementById('quizCard');
const qCountEl   = document.getElementById('qCount');
const qScoreEl   = document.getElementById('qScore');

let questionNumber = 0;
let score = 0;
let currentAnswer = "";
let answered = false;

function normalize(str){
    return (str || "").toString().trim().toLowerCase();
}

async function loadQuestion(){

    answered = false;

    quizCard.innerHTML = `
        <div class="loader">
            <div class="spinner"></div>
            <p>Loading question...</p>
        </div>
    `;

    try{

        const res = await fetch(API_URL, { cache: "no-store" });

        if(!res.ok) throw new Error("Bad response");

        const data = await res.json();
        renderQuestion(data);

    }catch(err){

        quizCard.innerHTML = `
            <div class="error-box">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <p>Couldn't load a question right now.</p>
                <div class="quiz-actions" style="justify-content:center;margin-top:20px;">
                    <button class="primary-btn" onclick="loadQuestion()">Try Again</button>
                </div>
            </div>
        `;

    }
}

function renderQuestion(data){

    questionNumber++;
    qCountEl.textContent = questionNumber;

    currentAnswer = normalize(data.answer);

    const letters = ['A','B','C','D','E','F'];

    const optionsHTML = (data.options || []).map((opt, i) => `
        <button class="option" data-value="${encodeURIComponent(opt)}" onclick="selectOption(this)">
            <span class="opt-letter">${letters[i] || i+1}</span>
            <span>${opt.trim()}</span>
        </button>
    `).join('');

    quizCard.innerHTML = `
        <span class="q-number">Question ${questionNumber}</span>
        <p class="q-text">${data.question}</p>

        <div class="options" id="optionsList">
            ${optionsHTML}
        </div>

        <div class="explanation" id="explanationBox">
            <strong>Explanation:</strong> <span id="explanationText"></span>
        </div>

        <div class="quiz-actions">
            <span class="feedback-tag" id="feedbackTag"></span>
            <button class="primary-btn" id="nextBtn" onclick="loadQuestion()" disabled>
                Next Question <i class="fa-solid fa-arrow-right"></i>
            </button>
        </div>
    `;

    document.getElementById('explanationText').textContent = data.explanation || "";
}

function selectOption(btn){

    if(answered) return;
    answered = true;

    const chosen = normalize(decodeURIComponent(btn.dataset.value));
    const allOptions = document.querySelectorAll('#optionsList .option');
    const feedbackTag = document.getElementById('feedbackTag');
    const nextBtn = document.getElementById('nextBtn');
    const explanationBox = document.getElementById('explanationBox');

    allOptions.forEach(opt => {

        opt.disabled = true;

        const val = normalize(decodeURIComponent(opt.dataset.value));

        if(val === currentAnswer){
            opt.classList.add('correct');
        }else if(opt === btn){
            opt.classList.add('incorrect');
        }
    });

    if(chosen === currentAnswer){
        score++;
        feedbackTag.textContent = "Correct!";
        feedbackTag.classList.add('show','right');
    }else{
        feedbackTag.textContent = "Incorrect";
        feedbackTag.classList.add('show','wrong');
    }

    qScoreEl.textContent = score;
    explanationBox.classList.add('show');
    nextBtn.disabled = false;
}

// Mobile nav toggle

const menuBtn = document.getElementById('menuBtn');
const navLinks = document.querySelector('.nav-links');

if(menuBtn && navLinks){

    menuBtn.addEventListener('click', () => {

        navLinks.classList.toggle('open');
        const isOpen = navLinks.classList.contains('open');

        menuBtn.innerHTML = isOpen
            ? '<i class="fa-solid fa-xmark"></i>'
            : '<i class="fa-solid fa-bars"></i>';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });
}

// Init

loadQuestion();
