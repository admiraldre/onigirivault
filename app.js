// Function to generate the SECRET_HASH
function getSecretHash(username) {
    const clientId = '2drs5052b2kp013bgs0rbh1gi0'; // Your Cognito App client ID
    const clientSecret = 'n651t7sp7fh1sfcfcea2guul5894ncgn9g2q9qb0q0rl3rd4ohm'; // Your Cognito App client secret
    const message = username + clientId;
    const hash = CryptoJS.HmacSHA256(message, clientSecret);
    return hash.toString(CryptoJS.enc.Base64);
}

// Initialize Cognito User Pool
const poolData = {
    UserPoolId: 'us-east-1_13v30q5on',
    ClientId: '2drs5052b2kp013bgs0rbh1gi0',
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// Placeholder function for getting Cognito user token
async function getUserToken() {
    return new Promise((resolve, reject) => {
        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.getSession((err, session) => {
                if (err) reject(err);
                else resolve(session.getIdToken().getJwtToken());
            });
        } else {
            reject('User is not logged in.');
        }
    });
}

// Sign-up function
document.getElementById('signUpButton').addEventListener('click', function () {
    const email = prompt("Enter your email:");
    const password = prompt("Enter your password:");
    
    const userAttributes = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email })
    ];

    userPool.signUp(email, password, userAttributes, null, (err, result) => {
        if (err) {
            alert("Error signing up: " + err.message || JSON.stringify(err));
        } else {
            alert("Signup successful. Please verify your email.");
        }
    });
});

// Sign-in function
document.getElementById('signInButton').addEventListener('click', function () {
    const email = prompt("Enter your email:");
    const password = prompt("Enter your password:");

    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password,
        SecretHash: getSecretHash(email), // Include the SECRET_HASH here
    });

    const userData = {
        Username: email,
        Pool: userPool,
    };

    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            alert('Sign in successful!');
            document.getElementById('signInButton').style.display = 'none';
            document.getElementById('signUpButton').style.display = 'none';
            document.getElementById('signOutButton').style.display = 'inline';
        },
        onFailure: function (err) {
            alert('Error signing in: ' + err.message || JSON.stringify(err));
            console.log("Error: ", err);
        }
    });
});

// Sign-out function
document.getElementById('signOutButton').addEventListener('click', function () {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
        cognitoUser.signOut();
        alert("Sign out successful.");
        document.getElementById('signInButton').style.display = 'inline';
        document.getElementById('signUpButton').style.display = 'inline';
        document.getElementById('signOutButton').style.display = 'none';
    }
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