let timer;
let timeLeft = 600; // 10 minutes in seconds

// Function to fetch leaderboard data from GitHub
async function fetchLeaderboard() {
    // Function code remains the same
}

// Function to update leaderboard data on GitHub
async function updateLeaderboard(newEntry) {
    // Function code remains the same
}

// Function to check if the device is in landscape mode
function isLandscapeMode() {
    // Check if the window inner height is less than the inner width
    return window.innerHeight < window.innerWidth;
}

// Function to display a landscape mode warning
function showLandscapeWarning() {
    // Create a warning message element
    const landscapeWarning = document.createElement('div');
    landscapeWarning.innerHTML = `
        <p>Please rotate your device to landscape mode for the best experience.</p>
    `;
    landscapeWarning.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        z-index: 1000;
    `;

    // Append the warning message to the document body
    document.body.appendChild(landscapeWarning);

    // Function to handle screen orientation change
    function orientationChangeHandler() {
        if (isLandscapeMode()) {
            landscapeWarning.style.display = 'none';
            window.removeEventListener('orientationchange', orientationChangeHandler);
        }
    }

    // Listen for orientation change events
    window.addEventListener('orientationchange', orientationChangeHandler);
}

// Function to start the quiz
function startQuiz() {
    // Check if the device is in portrait mode and show warning
    if (!isLandscapeMode()) {
        showLandscapeWarning();
        return;
    }

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    if (!name || !phone || !email) {
        alert('Please enter your name, phone number, and email.');
        return;
    }

    const newEntry = { name, phone, email, points: 0, time: 0 }; // Initialize with basic data

    // Call updateLeaderboard to add new entry
    updateLeaderboard(newEntry);

    // Start the timer
    startTimer();

    // Redirect to quiz page
    window.location.href = 'quiz.html';
}

// Function to start the timer
function startTimer() {
    const timerElement = document.getElementById('timer');
    timer = setInterval(() => {
        timeLeft--;
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            submitQuiz();
        }
    }, 1000);
}

// Function to submit the quiz
async function submitQuiz() {
    clearInterval(timer);

    const form = document.getElementById('quizForm');
    const formData = new FormData(form);
    let score = 0;

    for (let [key, value] of formData.entries()) {
        if (value === 'correct') {
            score += 1;
        } else if (value === 'wrong') {
            score -= 0.25;
        }
    }

    const timeTaken = 600 - timeLeft;
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    const newEntry = { name: userName, email: userEmail, points: score, time: timeTaken };

    // Call updateLeaderboard to update scores
    updateLeaderboard(newEntry);

    // Redirect to results page
    window.location.href = 'results.html';
}

// Function to load leaderboard data on results page
async function loadResults() {
    // Check if the device is in portrait mode and show warning
    if (!isLandscapeMode()) {
        showLandscapeWarning();
        return;
    }

    const leaderboard = await fetchLeaderboard();
    const leaderboardTable = document.getElementById('leaderboard').querySelector('tbody');
    const userResultTable = document.getElementById('userResult').querySelector('tbody');
    const userName = localStorage.getItem('userName');
    let userRank, userEntry;

    // Clear existing rows
    leaderboardTable.innerHTML = '';
    userResultTable.innerHTML = '';

    // Populate the entire leaderboard
    leaderboard.forEach((entry, index) => {
        const row = document.createElement('tr');
        const minutes = Math.floor(entry.time / 60);
        const seconds = entry.time % 60;
        const timeFinal = `${minutes} min ${seconds < 10 ? '0' : ''}${seconds} sec`;

        row.innerHTML = `<td>${entry.rank}</td><td>${entry.name}</td><td>${entry.points}</td><td>${timeFinal}</td><td>${entry.email}</td>`;

        if (entry.rank <= 3) {
            row.classList.add('top3');
        }

        leaderboardTable.appendChild(row);

        if (entry.name === userName) {
            userRank = entry.rank;
            userEntry = entry;
        }
    });

    // Populate user result table
    if (userEntry) {
        const minutes = Math.floor(userEntry.time / 60);
        const seconds = userEntry.time % 60;
        const timeFinal = `${minutes} min ${seconds < 10 ? '0' : ''}${seconds} sec`;
        const row = document.createElement('tr');

        row.innerHTML = `<td>${userRank}</td><td>${userEntry.name}</td><td>${userEntry.points}</td><td>${timeFinal}</td><td>${userEntry.email}</td>`;
        userResultTable.appendChild(row);
    }

    document.getElementById('thankYouMessage').textContent = `Thank you, ${userName}, for participating!`;
}

// Update page logic based on current page
if (window.location.pathname.endsWith('quiz.html')) {
    startQuiz(); // Call startQuiz to check orientation and start timer on page load
} else if (window.location.pathname.endsWith('results.html')) {
    loadResults(); // Call loadResults to check orientation on page load
}
