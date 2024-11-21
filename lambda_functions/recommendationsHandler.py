import json
import requests
import boto3
import time

# Constants
MAX_RETRIES = 3  # Reduced number of retries
RETRY_DELAY = 2  # Delay between retries in seconds
MAX_GENRES = 3   # Limit the number of genres to process
MAX_ANIME_PER_GENRE = 3  # Limit the number of anime per genre

s3 = boto3.client('s3')
BUCKET_NAME = "ov-favelist"

def get_unique_genres(favorites):
    """Extract unique genres from the user's favorites."""
    genres = set()
    for anime in favorites:
        genres.update(anime.get("genres", []))
    return list(genres)

def fetch_anime_by_genre(genre, limit=MAX_ANIME_PER_GENRE):
    """Fetch anime by genre using the Jikan API with retry logic."""
    url = f"https://api.jikan.moe/v4/genres/anime"
    start_time = time.time()  # Track API request time
    
    for attempt in range(MAX_RETRIES):
        try:
            # Make the API request
            response = requests.get(url)
            response.raise_for_status()  # Raise an exception for any 4xx or 5xx errors
            
            # Log the entire response for debugging purposes
            print(f"Full API response for genre '{genre}': {json.dumps(response.json(), indent=2)}")
            
            # If the response is successful, parse the anime list
            anime_list = response.json().get("data", [])
            end_time = time.time()  # Track response time
            print(f"API call for genre '{genre}' completed in {end_time - start_time:.2f} seconds.")
            
            return [
                {
                    "title": anime.get("title", "No Title"),
                    "score": anime.get("score", "No Score"),
                    "genres": [g.get("name", "No Genre") for g in anime.get("genres", [])],
                    "description": anime.get("synopsis", "No Description"),
                    "studio": anime["studios"][0]["name"] if anime.get("studios") else "No Studio"
                }
                for anime in anime_list
            ]
        
        except requests.exceptions.RequestException as e:
            # Handle rate-limiting or other request exceptions
            if response.status_code == 429:
                print(f"Rate-limited by API for genre {genre}, retrying in {RETRY_DELAY} seconds...")
                time.sleep(RETRY_DELAY)
            else:
                print(f"Error fetching anime for genre {genre}: {e}")
                break  # For other errors, don't retry
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            break
    
    return []

def generate_recommendations(favorites):
    """Generate recommendations based on user favorites."""
    unique_genres = get_unique_genres(favorites)
    recommendations = []
    seen_titles = set()
    
    # Limit to the first few genres to avoid excessive processing
    for genre in unique_genres[:MAX_GENRES]:
        genre_recommendations = fetch_anime_by_genre(genre)
        for anime in genre_recommendations:
            if anime["title"] not in seen_titles:
                recommendations.append(anime)
                seen_titles.add(anime["title"])
    
    return recommendations

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))  # Logging for debugging

    # Extract user_id from Cognito
    if "requestContext" in event and "authorizer" in event["requestContext"]:
        user_id = event['requestContext']['authorizer']['claims']['sub']
    else:
        # Mock user ID for testing (remove in production)
        user_id = "test-user-id"

    object_key = f"users/{user_id}/favorites.json"

    # Load the user's favorites from S3
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=object_key)
        favorites = json.loads(response['Body'].read().decode('utf-8'))
    except s3.exceptions.NoSuchKey:
        return {
            "statusCode": 404,
            "body": json.dumps({"error": "No favorites found for the user."})
        }

    # Generate recommendations
    recommendations = generate_recommendations(favorites)

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(recommendations)
    }