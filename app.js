const apiUrl = 'https://z0vjtrx3vf.execute-api.us-east-1.amazonaws.com/prod/anime';

document.getElementById('searchButton').addEventListener('click', function() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        alert('Please enter a search query');
        return;
    }

    fetch(`${apiUrl}?q=${query}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        // Check if the response contains a 'body' field and parse it if necessary
        if (data.body) {
            data = JSON.parse(data.body);
        }

        console.log(data); // Log data for debugging purposes

        if (data.error) {
            alert(data.error);
        } else {
            const resultsDiv = document.getElementById('results');
            resultsDiv.innerHTML = ''; // Clear previous results

            if (data.length === 0) {
                resultsDiv.innerHTML = '<p>No results found.</p>';
                return;
            }

            data.forEach(anime => {
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
    })
    .catch(error => {
        console.error(error); // Log error for debugging
        alert('Error fetching data: ' + error);
    });
});