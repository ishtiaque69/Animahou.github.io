let timer;
let timeLeft = 600; // 10 minutes in seconds

function startQuiz() {
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

    // Redirect to quiz page
    window.location.href = 'quiz.html';
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    timer = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(timer);
            submitQuiz(); // Automatically submit quiz when time runs out
        } else {
            let minutes = Math.floor(timeLeft / 60);
            let seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }, 1000);
}

async function submitQuiz() {
    clearInterval(timer); // Stop the timer

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

    // Update leaderboard
    await updateLeaderboard(newEntry);

    // Redirect to results page
    window.location.href = 'results.html';
}

async function updateLeaderboard(newEntry) {
    try {
        const leaderboard = await fetchLeaderboard();
        leaderboard.push(newEntry);

        const response = await fetch('data.json', {
            method: 'PUT', // Use 'PUT' method to update file
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ leaderboard })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        console.log('Leaderboard updated successfully');
    } catch (error) {
        console.error('Error updating leaderboard data:', error);
    }
}

async function fetchLeaderboard() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.leaderboard || []; // Assuming leaderboard is stored under 'leaderboard' key
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        return []; // Return empty array if there's an error
    }
}

// Start timer immediately if on quiz.html
if (window.location.pathname.endsWith('quiz.html')) {
    startTimer();
}
