// Function to fetch leaderboard data from GitHub
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

// Function to update leaderboard data on GitHub
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

// Modify startQuiz function to call updateLeaderboard
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

// Modify submitQuiz function to handle scoring and updating leaderboard
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
    startTimer();
} else if (window.location.pathname.endsWith('results.html')) {
    loadResults();
}
