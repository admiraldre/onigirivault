// API URL for fetching anime data
const apiUrl = 'https://z0vjtrx3vf.execute-api.us-east-1.amazonaws.com/prod/anime';

// Placeholder function for getting Cognito user token
async function getUserToken() {
    return new Promise((resolve, reject) => {
        const user = AWS.config.credentials.identityId;
        if (user) {
            AWS.config.credentials.refresh((err) => {
                if (err) reject(err);
                else resolve(AWS.config.credentials.idToken.jwtToken);
            });
        } else {
            reject('User is not logged in.');
        }
    });
}

// Show the sign-in form and hide the sign-up form
document.getElementById('showSignIn').addEventListener('click', () => {
    document.getElementById('signUpForm').style.display = 'none';
    document.getElementById('signInForm').style.display = 'block';
});

// Show the sign-up form and hide the sign-in form
document.getElementById('showSignUp').addEventListener('click', () => {
    document.getElementById('signInForm').style.display = 'none';
    document.getElementById('signUpForm').style.display = 'block';
});

// Sign-In button event listener
document.getElementById('signInButton').addEventListener('click', async function () {
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    
    // Implement sign-in logic (e.g., Firebase or AWS Cognito)
    try {
        const result = await signInUser(email, password);
        if (result.success) {
            alert('Sign-in successful!');
            document.getElementById('authForms').style.display = 'none'; // Hide the auth forms
            document.getElementById('searchSection').style.display = 'block'; // Show the search section
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Sign-In Failed: ' + error.message);
    }
});

// Sign-Up button event listener
document.getElementById('signUpButton').addEventListener('click', async function () {
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    
    // Implement sign-up logic (e.g., Firebase or AWS Cognito)
    try {
        const result = await signUpUser(email, password);
        if (result.success) {
            alert('Sign-up successful! Please sign in.');
            document.getElementById('signUpForm').style.display = 'none';
            document.getElementById('signInForm').style.display = 'block';
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Sign-Up Failed: ' + error.message);
    }
});

// Placeholder functions for sign-in/sign-up logic (replace with actual implementation)
async function signInUser(email, password) {
    // Implement the actual authentication logic here using Cognito or another service
    // For example, if using Cognito:
    // try {
    //     await CognitoUser.authenticateUser(new CognitoAuthenticationDetails(...));
    //     return { success: true };
    // } catch (error) {
    //     return { success: false, message: error.message };
    // }
    return { success: true }; // Example success response
}

async function signUpUser(email, password) {
    // Implement the sign-up logic here
    return { success: true }; // Example success response
}

// Anime search button event listener
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

// Function to display the search results
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