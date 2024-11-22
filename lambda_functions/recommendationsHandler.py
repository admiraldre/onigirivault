import json
import requests
import boto3
from collections import Counter
from datetime import datetime
import random

# AWS Clients
s3 = boto3.client('s3')
BUCKET_NAME = "ov-favelist"

# Genre ID Mapping
GENRE_IDS = {
    "Action": 1, "Adventure": 2, "Comedy": 4, "Drama": 7, "Fantasy": 8,
    "Horror": 10, "Mystery": 14, "Romance": 22, "Sci-Fi": 24, "Slice of Life": 26,
    "Sports": 28, "Supernatural": 30, "Suspense": 37, "Ecchi": 9, "Harem": 49,
    "Isekai": 50, "Iyashikei": 51, "Magical Girl": 52, "Martial Arts": 53,
    "Mecha": 54, "Military": 55, "Music": 56, "Parody": 57, "Psychological": 58,
    "Reincarnation": 59, "Reverse Harem": 60, "Romantic Subtext": 61, "Samurai": 62,
    "School": 63, "Space": 64, "Super Power": 65, "Time Travel": 66, "Vampire": 67,
    "Video Game": 68, "Shoujo": 27, "Josei": 41, "Kids": 42, "Seinen": 43, "Shounen": 44
}

# Helper function to filter unique recommendations by title
def filter_unique_recommendations(recommendations):
    seen_titles = set()
    unique_recommendations = []
    for anime in recommendations:
        if anime["title"] not in seen_titles:
            seen_titles.add(anime["title"])
            unique_recommendations.append(anime)
    return unique_recommendations

def lambda_handler(event, context):
    # Extract user ID
    if "requestContext" in event and "authorizer" in event["requestContext"]:
        user_id = event['requestContext']['authorizer']['claims']['sub']
    else:
        user_id = "test-user-id"  # Mock user ID for testing

    object_key = f"users/{user_id}/favorites.json"
    http_method = event.get('httpMethod', '').upper()

    if http_method == "GET":
        # Retrieve user's favorites from S3
        try:
            response = s3.get_object(Bucket=BUCKET_NAME, Key=object_key)
            favorites = json.loads(response['Body'].read().decode('utf-8'))
        except s3.exceptions.NoSuchKey:
            favorites = []  # No favorites exist for the user

        # Count genres from user's favorites
        genre_counts = Counter(
            genre for favorite in favorites for genre in favorite.get("genres", [])
        )

        if not genre_counts:
            return {
                'statusCode': 200,
                'body': json.dumps({
                    "message": "No favorite genres found. Please add favorites first.",
                    "recommendations": []
                })
            }

        # Find the most frequent genre
        most_frequent_genre = genre_counts.most_common(1)[0][0]
        genre_id = GENRE_IDS.get(most_frequent_genre)

        # Fetch recommendations from Jikan API
        try:
            response = requests.get(
                f"https://api.jikan.moe/v4/anime?genres={genre_id}&order_by=score&sort=desc&limit=20"
            )
            response.raise_for_status()  # Raise HTTPError for bad responses
            data = response.json()
        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            # Handle API errors
            return {
                'statusCode': 500,
                'body': json.dumps({
                    "message": "Failed to fetch recommendations from Jikan API.",
                    "error": str(e)
                })
            }

        # Validate API response
        if "data" not in data:
            return {
                'statusCode': 500,
                'body': json.dumps({
                    "message": "Unexpected API response format.",
                    "response": data
                })
            }

        # Process recommendations
        recommendations = [
            {
                "title": anime["title"],
                "score": anime["score"],
                "url": anime["url"]
            }
            for anime in data["data"] if anime.get("score", 0) > 8
        ]

        # Shuffle and filter unique recommendations
        random.shuffle(recommendations)  # Shuffle for randomness
        unique_recommendations = filter_unique_recommendations(recommendations)

        # Limit to 5 recommendations
        unique_recommendations = unique_recommendations[:5]

        # Response
        response_body = {
            "favorite_genre": most_frequent_genre,
            "recommendations": unique_recommendations
        }

        return {
            'statusCode': 200,
            'body': json.dumps(response_body)
        }

    return {
        'statusCode': 400,
        'body': json.dumps({"message": "Invalid request"})
    }