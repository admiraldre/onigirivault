// API URL for fetching anime data
const apiUrl = 'https://z0vjtrx3vf.execute-api.us-east-1.amazonaws.com/prod/anime';

// Placeholder function for getting Cognito user token
async function getUserToken() {
    return new Promise((resolve, reject) => {
        const user = AWS.config.credentials.identityId;
        if (user) {
            AWS.config.credentials.refresh((err) => {
                if (err) reject(err);
                else resolve(AWS.config.credentials.idToken.jwtToken); // Retrieve JWT token
            });
        } else {
            reject('User is not logged in.');
        }
    });
}

// Handle sign-in functionality
document.getElementById('signInButton').addEventListener('click', async function () {
    // Replace with Cognito User Pool sign-in logic
    alert("Sign In functionality will be implemented here.");
});

// Handle sign-up functionality
document.getElementById('signUpButton').addEventListener('click', async function () {
    // Replace with Cognito User Pool sign-up logic
    alert("Sign Up functionality will be implemented here.");
});

// Search Button Click Event
document.getElementById('searchButton').addEventListener('click', async function () {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert('Please enter a search query');
        return;
    }

    try {
        // Get the authentication token
        const token = await getUserToken();

        const response = await fetch(`${apiUrl}?q=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token // Include JWT token in the Authorization header
            }
        });

        const data = await response.json();
        // Handle response data
        handleResponseData(data);
    } catch (error) {
        console.error(error);
        alert('Error fetching data: ' + error);
    }
});

// Handle the response data
function handleResponseData(data) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = ''; // Clear previous results

    // Check if data is wrapped in a 'body' property
    if (data.body) {
        data = JSON.parse(data.body); // Parse if wrapped in a 'body'
    }

    // Check if an error exists in the response
    if (data.error) {
        alert(data.error);
        return;
    }

    // Ensure 'data' is an array before proceeding
    const results = Array.isArray(data) ? data : data.results || []; // Adjust 'results' based on the actual structure

    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
        return;
    }

    // Loop through the results array and display the anime data
    results.forEach((anime) => {
        const animeDiv = document.createElement('div');
        animeDiv.classList.add('anime-card');
        animeDiv.innerHTML = `
            <h3>${anime.title}</h3>
            <p><strong>Score:</strong> ${anime.score}</p>
            <p><strong>Genres:</strong> ${anime.genres}</p>
            <p><strong>Synopsis:</strong> ${anime.synopsis}</p>
            <a href="${anime.url}" target="_blank">View on MyAnimeList</a>
        `;
        resultsDiv.appendChild(animeDiv);
    });
}