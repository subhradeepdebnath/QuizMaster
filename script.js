// ====== ELEMENTS ======
const questionEl = document.getElementById("question");
const optionBtns = document.querySelectorAll(".option");
const nextBtn = document.getElementById("nextBtn");
const timerEl = document.getElementById("timer");

const startContainer = document.getElementById("startContainer");
const startBtn = document.getElementById("startBtn");
const categorySelect = document.getElementById("category");
const difficultySelect = document.getElementById("difficulty");

const questionCounter = document.getElementById("questionCounter");
const progressFill = document.getElementById("progressFill");

// ====== VARIABLES ======
let questions = [];
let currentQuestion = 0;
let score = 0;
let autoNextTimer = null;
let timeLeft = 10;
let timerInterval = null;

// hide quiz container initially
document.querySelector(".quiz-container").style.display = "none";
nextBtn.style.display = "none";

// ====== START QUIZ ======
startBtn.onclick = () => {
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;

    startContainer.style.display = "none";
    document.querySelector(".quiz-container").style.display = "block";

    getQuestions(category, difficulty);
};

// ====== FETCH QUESTIONS ======
async function getQuestions(category, difficulty) {
    try {
        const response = await fetch(
            `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`
        );
        const data = await response.json();
        questions = data.results;
        showQuestion();
    } catch (err) {
        questionEl.innerHTML = "Error loading questions. Please try again.";
        console.error(err);
    }
}

// ====== SHOW QUESTION ======
function showQuestion() {
    clearTimeout(autoNextTimer);
    clearInterval(timerInterval);
    nextBtn.style.display = "none";

    const q = questions[currentQuestion];
    questionEl.innerHTML = q.question;

    // ====== PROGRESS BAR + COUNTER ======
    questionCounter.innerHTML = `Question ${currentQuestion + 1} of ${questions.length}`;
    const progressPercent = (currentQuestion / questions.length) * 100;
    progressFill.style.width = `${progressPercent}%`;

    // ====== MIX ANSWERS ======
    let options = [...q.incorrect_answers, q.correct_answer];
    options.sort(() => Math.random() - 0.5);

    // assign options to buttons
    optionBtns.forEach((btn, index) => {
        if (options[index]) {
            btn.disabled = false;
            btn.style.display = "block";
            btn.classList.remove("correct", "wrong");
            btn.innerHTML = options[index];

            btn.onclick = () => {
                clearInterval(timerInterval);

                if (options[index] === q.correct_answer) {
                    btn.classList.add("correct");
                    score++;
                } else {
                    btn.classList.add("wrong");
                    optionBtns.forEach(b => {
                        if (b.innerHTML === q.correct_answer) {
                            b.classList.add("correct");
                        }
                    });
                }

                optionBtns.forEach(b => b.disabled = true);
                nextBtn.style.display = "block";

                autoNextTimer = setTimeout(nextQuestion, 2000);
            };
        } else {
            btn.style.display = "none";
        }
    });

    // ====== TIMER ======
    timeLeft = 10;
    timerEl.innerHTML = `Time Left: ${timeLeft}s`;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.innerHTML = `Time Left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            optionBtns.forEach(b => b.disabled = true);

            // show correct answer
            optionBtns.forEach(b => {
                if (b.innerHTML === q.correct_answer) {
                    b.classList.add("correct");
                }
            });

            nextBtn.style.display = "block";

            autoNextTimer = setTimeout(nextQuestion, 1000);
        }
    }, 1000);
}

// ====== NEXT QUESTION ======
function nextQuestion() {
    clearTimeout(autoNextTimer);
    clearInterval(timerInterval);

    currentQuestion++;
    if (currentQuestion < questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

// NEXT button click
nextBtn.onclick = nextQuestion;

// ====== SHOW SCORE ======
function showScore() {
    document.querySelector(".quiz-container").innerHTML = `
        <h2>Your Score: ${score}/${questions.length}</h2>
        <button onclick="location.reload()">Play Again</button>
    `;
}