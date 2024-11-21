import json
import requests

def lambda_handler(event, context):
    query = event.get('queryStringParameters', {}).get('q', '').strip()
    if not query:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Missing or empty query parameter: q'})
        }

    try:
        # Fetch anime data from Jikan API
        response = requests.get(f"https://api.jikan.moe/v4/anime?q={query}")
        response.raise_for_status()
        data = response.json()

        def format_anime(anime):
            # Extract genres
            genres_list = anime.get("genres", [])
            genre_names = [genre.get("name") for genre in genres_list]
            genre_names_str = ", ".join(genre_names)

            # Return formatted anime details
            return {
                "title": anime.get("title"),
                "score": anime.get("score"),
                "url": anime.get("url"),
                "genres": genre_names_str,
                "anime_id": anime.get("mal_id"),
                "synopsis": anime.get("synopsis"),
            }

        # Filter and format the data
        filtered_data = [
            format_anime(anime)
            for anime in data.get('data', [])
            if query.lower() in anime.get("title", "").lower()
        ]

        # Return the JSON object directly
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': {"data": filtered_data}  # Directly return the object
        }

    except requests.RequestException as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': {'error': 'Failed to fetch data from Jikan API', 'details': str(e)}
        }
