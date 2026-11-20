let cards = JSON.parse(localStorage.getItem("rrCards")) || [
    {q:"What does HTML stand for?",a:"HyperText Markup Language",category:"HTML",mastered:false},
    {q:"What is CSS used for?",a:"Styling and designing web pages",category:"CSS",mastered:false},
    {q:"What is JavaScript?",a:"A programming language used to make websites interactive",category:"JavaScript",mastered:false},
    {q:"What is an HTML element?",a:"An element consists of a start tag, content and an end tag",category:"HTML",mastered:false},
    {q:"What is a CSS selector?",a:"It selects HTML elements to apply styles",category:"CSS",mastered:false}
];

let xp = Number(localStorage.getItem("rrXP")) || 0;
let sessions = Number(localStorage.getItem("rrSessions")) || 0;
let streak = Number(localStorage.getItem("rrStreak")) || 0;
let lastVisit = localStorage.getItem("rrLastVisit");

let current = 0;
let flipped = false;
let quizQuestions = [];
let quizIndex = 0;
let score = 0;
let answered = false;

// DAILY STREAK

function updateStreak() {
    let today = new Date();
    let todayKey = today.getFullYear() + "-" +
        (today.getMonth() + 1) + "-" + today.getDate();

    if (lastVisit !== todayKey) {
        if (lastVisit) {
            let previous = new Date(lastVisit);
            previous.setHours(0, 0, 0, 0);

            let currentDate = new Date(today);
            currentDate.setHours(0, 0, 0, 0);

            let difference = Math.round(
                (currentDate - previous) / 86400000
            );

            streak = difference === 1 ? streak + 1 : 1;
        } else {
            streak = 1;
        }

        lastVisit = todayKey;
        localStorage.setItem("rrLastVisit", todayKey);
        localStorage.setItem("rrStreak", streak);
    }
}

// SAVE DATA

function saveData() {
    localStorage.setItem("rrCards", JSON.stringify(cards));
    localStorage.setItem("rrXP", xp);
    localStorage.setItem("rrSessions", sessions);
    localStorage.setItem("rrStreak", streak);

    updateStats();
}

// NAVIGATION

function showPage(page) {
    document.querySelectorAll(".page").forEach(section => {
        section.classList.remove("active");
    });

    document.getElementById(page).classList.add("active");

    if (page === "study") {
        sessions++;
        saveData();
        renderStudy();
    }

    if (page === "create") {
        renderSavedCards();
    }

    if (page === "dashboard") {
        updateStats();
    }
}

// DASHBOARD

function updateStats() {
    let total = cards.length;
    let mastered = cards.filter(card => card.mastered).length;
    let percent = total ? Math.round(mastered / total * 100) : 0;

    document.getElementById("total").textContent = total;
    document.getElementById("mastered").textContent = mastered;
    document.getElementById("xp").textContent = xp;
    document.getElementById("sessions").textContent = sessions;

    document.getElementById("dashTotal").textContent = total;
    document.getElementById("dashMastered").textContent = mastered;
    document.getElementById("dashXP").textContent = xp;

    document.getElementById("streak").textContent = streak;

    document.getElementById("progressBar").style.width = percent + "%";
    document.getElementById("progressText").textContent =
        percent + "% Completed";

    let goal = Math.min(mastered, 5);

    document.getElementById("goalBar").style.width =
        (goal / 5 * 100) + "%";

    document.getElementById("goalText").textContent =
        goal + " / 5 mastered";

    let achievement = "🌱 Beginner – Start your learning journey!";

    if (mastered >= 1)
        achievement = "🥉 First Step – Mastered your first card!";

    if (mastered >= 5)
        achievement = "🥈 Memory Master – 5 cards mastered!";

    if (mastered >= 10)
        achievement = "🏆 Recall Champion – 10 cards mastered!";

    document.getElementById("achievement").textContent = achievement;
}

// STUDY AND SEARCH

function getFilteredCards() {
    let search = document.getElementById("search").value.toLowerCase();
    let category = document.getElementById("categoryFilter").value;

    return cards.filter(card => {
        let matchesSearch =
            card.q.toLowerCase().includes(search) ||
            card.a.toLowerCase().includes(search) ||
            card.category.toLowerCase().includes(search);

        let matchesCategory =
            category === "all" || card.category === category;

        return matchesSearch && matchesCategory;
    });
}

function renderStudy() {
    let filtered = getFilteredCards();

    if (current >= filtered.length) current = 0;

    let card = filtered[current];

    if (!card) {
        document.getElementById("cardNumber").textContent = "No Cards";
        document.getElementById("cardContent").textContent =
            "No matching flashcards found!";
        document.getElementById("flipHint").textContent =
            "Try another search or create a new card.";
        return;
    }

    flipped = false;

    document.getElementById("cardNumber").textContent =
        "Card " + (current + 1) + " of " + filtered.length;

    document.getElementById("cardContent").textContent = card.q;

    document.getElementById("flipHint").textContent =
        card.mastered ? "⭐ Mastered | Click to reveal answer" :
        "Click to reveal answer";

    document.getElementById("studyMessage").textContent = "";
}

function flipCard() {
    let filtered = getFilteredCards();

    if (!filtered.length) return;

    let card = filtered[current];

    flipped = !flipped;

    document.getElementById("cardContent").textContent =
        flipped ? card.a : card.q;

    document.getElementById("flipHint").textContent =
        flipped ? "Answer revealed! Click to see question" :
        "Click to reveal answer";
}

function nextCard() {
    let filtered = getFilteredCards();

    if (filtered.length) {
        current = (current + 1) % filtered.length;
        renderStudy();
    }
}

function previousCard() {
    let filtered = getFilteredCards();

    if (filtered.length) {
        current = (current - 1 + filtered.length) % filtered.length;
        renderStudy();
    }
}

// MASTERED CARDS

function markMastered() {
    let filtered = getFilteredCards();

    if (!filtered.length) return;

    let card = filtered[current];

    if (!card.mastered) {
        card.mastered = true;
        xp += 10;

        document.getElementById("studyMessage").textContent =
            "🎉 Excellent! You earned 10 XP!";
    } else {
        document.getElementById("studyMessage").textContent =
            "⭐ This card is already mastered!";
    }

    saveData();
    renderStudy();
}

function markRevision() {
    let filtered = getFilteredCards();

    if (!filtered.length) return;

    filtered[current].mastered = false;

    document.getElementById("studyMessage").textContent =
        "↻ Card added back to revision practice!";

    saveData();
    renderStudy();
}

// CREATE FLASHCARDS

function addCard() {
    let question = document.getElementById("question").value.trim();
    let answer = document.getElementById("answer").value.trim();
    let category = document.getElementById("category").value;

    if (!question || !answer) {
        document.getElementById("createMessage").textContent =
            "⚠️ Please enter both question and answer.";
        return;
    }

    cards.push({
        q: question,
        a: answer,
        category: category,
        mastered: false
    });

    saveData();

    document.getElementById("question").value = "";
    document.getElementById("answer").value = "";

    document.getElementById("createMessage").textContent =
        "✅ Flashcard saved successfully!";

    renderSavedCards();
}

// DISPLAY SAVED CARDS

function renderSavedCards() {
    let box = document.getElementById("savedCards");
    box.innerHTML = "";

    cards.forEach((card, index) => {
        let div = document.createElement("div");
        div.className = "saved";

        let title = document.createElement("strong");
        title.textContent = card.q;

        let category = document.createElement("p");
        category.textContent = "Category: " + card.category;

        let status = document.createElement("p");
        status.textContent = card.mastered ?
            "⭐ Mastered" : "📖 Needs Practice";

        let del = document.createElement("button");
        del.className = "deleteBtn";
        del.textContent = "Delete";

        del.onclick = () => {
            if (confirm("Are you sure you want to delete this card?")) {
                cards.splice(index, 1);
                saveData();
                renderSavedCards();
                renderStudy();
            }
        };

        div.append(title, category, status, del);
        box.appendChild(div);
    });
}

// QUIZ CHALLENGE

function startQuiz() {
    if (cards.length < 2) {
        document.getElementById("quizQuestion").textContent =
            "Create at least 2 cards to start the quiz!";
        return;
    }

    quizQuestions = [...cards]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

    quizIndex = 0;
    score = 0;
    answered = false;

    document.getElementById("quizScore").textContent = "";
    showQuestion();
}

function showQuestion() {
    if (quizIndex >= quizQuestions.length) {
        document.getElementById("quizQuestion").textContent =
            "🎉 Quiz Completed!";

        document.getElementById("quizOptions").innerHTML = "";

        document.getElementById("quizCount").textContent =
            "Final Results";

        document.getElementById("quizFeedback").textContent =
            "You scored " + score + " out of " + quizQuestions.length;

        document.getElementById("quizScore").textContent =
            "🏆 You earned " + (score * 10) + " XP!";

        xp += score * 10;
        saveData();

        return;
    }

    answered = false;

    let card = quizQuestions[quizIndex];

    document.getElementById("quizCount").textContent =
        "Question " + (quizIndex + 1) + " of " + quizQuestions.length;

    document.getElementById("quizQuestion").textContent = card.q;
    document.getElementById("quizFeedback").textContent = "";

    let wrongAnswers = [...new Set(
        cards.filter(c => c.a !== card.a).map(c => c.a)
    )].sort(() => Math.random() - 0.5).slice(0, 3);

    let options = [card.a, ...wrongAnswers]
        .sort(() => Math.random() - 0.5);

    let box = document.getElementById("quizOptions");
    box.innerHTML = "";

    options.forEach(option => {
        let button = document.createElement("button");
        button.textContent = option;

        button.onclick = () => checkAnswer(option, card.a);

        box.appendChild(button);
    });
}

function checkAnswer(selected, correct) {
    if (answered) return;

    answered = true;

    if (selected === correct) {
        score++;

        document.getElementById("quizFeedback").textContent =
            "🎉 Correct answer! Great job!";
    } else {
        document.getElementById("quizFeedback").textContent =
            "❌ Incorrect! Correct answer: " + correct;
    }

    let next = document.createElement("button");

    next.textContent =
        quizIndex === quizQuestions.length - 1 ?
        "View Results" : "Next Question ➡";

    next.onclick = () => {
        quizIndex++;
        showQuestion();
    };

    document.getElementById("quizOptions").appendChild(next);
}

// DARK MODE

function toggleTheme() {
    document.body.classList.toggle("dark");

    let dark = document.body.classList.contains("dark");

    document.getElementById("themeBtn").textContent =
        dark ? "☀️ Light Mode" : "🌙 Dark Mode";

    localStorage.setItem("rrTheme", dark ? "dark" : "light");
}

// MOTIVATION

function newQuote() {
    let quotes = [
        "Every expert was once a beginner! 🌱",
        "Practice makes progress! 💜",
        "Believe in yourself and keep learning! ⭐",
        "Your future starts with what you learn today! 🚀",
        "One card at a time, one step closer to success! 🏆"
    ];

    document.getElementById("quote").textContent =
        quotes[Math.floor(Math.random() * quotes.length)];
}

// INITIALIZE APPLICATION

updateStreak();

if (localStorage.getItem("rrTheme") === "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeBtn").textContent = "☀️ Light Mode";
}

updateStats();
renderStudy();

