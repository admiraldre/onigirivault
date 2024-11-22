import json
import requests
import boto3
from datetime import datetime

# Initialize AWS clients
s3 = boto3.client('s3')
stepfunctions = boto3.client('stepfunctions')  # For invoking Step Functions
BUCKET_NAME = "ov-favelist"

def lambda_handler(event, context):
    print("Received event:", json.dumps(event))  # Add logging

    # Check if requestContext exists
    if "requestContext" in event and "authorizer" in event["requestContext"]:
        user_id = event['requestContext']['authorizer']['claims']['sub']
    else:
        # Mock user ID for testing (remove in production)
        user_id = "test-user-id"

    object_key = f"users/{user_id}/favorites.json"
    object_key_transformed = f"users/{user_id}/transformed_data.json"
    object_key_genres = f"users/{user_id}/transformed_genres_data.json"
    http_method = event.get('httpMethod', '').upper()

    if http_method == "POST":
        # POST: Add anime to favorites and create transformed data
        try:
            body = json.loads(event['body'])
            anime_id = str(body['anime_id'])
            title = body.get('title')
        except (TypeError, KeyError, json.JSONDecodeError) as e:
            return {'statusCode': 400, 'body': 'Invalid request: Missing or invalid anime_id or title'}

        # Fetch anime details from Jikan API to get full information
        if not title:
            try:
                checker = 3
                jikan_url = f"https://api.jikan.moe/v4/anime/{anime_id}"
                jikan_response = requests.get(jikan_url)
                jikan_response.raise_for_status()
                anime_data = jikan_response.json()['data']
                title = anime_data['title']
                genres = [genre['name'] for genre in anime_data['genres']]  # Get genres
                studios = [studio['name'] for studio in anime_data['studios']]  # Get studios
            except requests.RequestException as e:
                return {'statusCode': 404, 'body': 'Anime not found in Jikan API.'}

        # Load existing favorites from S3
        try:
            response = s3.get_object(Bucket=BUCKET_NAME, Key=object_key)
            favorites = json.loads(response['Body'].read().decode('utf-8'))
        except s3.exceptions.NoSuchKey:
            favorites = []  # If no favorites file, initialize an empty list

        # Check if the anime is already in the favorites
        anime_exists = any(fav['anime_id'] == anime_id for fav in favorites)

        if anime_exists:
            checker = 1

            step_function_input = {
            'status': 'success',
            'checker' : checker,
            'anime_id': anime_id,
            'title': title,
            'message': f'"{title}" is already in favorites.'
            }

            try:
                response = stepfunctions.start_execution(
                stateMachineArn="arn:aws:states:us-east-1:376129845111:stateMachine:MyStateMachine-attux0t4j",
                input=json.dumps(step_function_input)
                )
                print("Step Function execution started:", response)
            except Exception as e:
                return {'statusCode': 500, 'body': f'Failed to invoke Step Function: {str(e)}'}

            return {
                'statusCode': 200,
                'body': f'"{title}" is already in favorites.'
            }

        # Add new favorite if it doesn't already exist
        checker = 0
        new_favorite = {
            'anime_id': anime_id,
            'title': title,
            'genres': genres,  # Add genres
            'studios': studios  # Add studios
        }
        favorites.append(new_favorite)

        # Save the updated favorites list back to S3
        try:
            s3.put_object(Bucket=BUCKET_NAME, Key=object_key, Body=json.dumps(favorites))
        except Exception as e:
            return {'statusCode': 500, 'body': 'Failed to update favorites.'}

        # Prepare the Step Function input
        step_function_input = {
            'status': 'success',
            'checker' : checker,
            'anime_id': anime_id,
            'title': title,
            'message': f'"{title}" has been added to favorites.'
        }

        # Trigger the Step Function
        try:
            response = stepfunctions.start_execution(
                stateMachineArn="arn:aws:states:us-east-1:376129845111:stateMachine:MyStateMachine-attux0t4j",
                input=json.dumps(step_function_input)
            )
            print("Step Function execution started:", response)
        except Exception as e:
            return {'statusCode': 500, 'body': f'Failed to invoke Step Function: {str(e)}'}

        # -------------- Generate Transformed Data for Personalize ----------------------
        # 1. Transformed Data: ITEM_ID, TIMESTAMP, USER_ID
        transformed_data = []
        timestamp = int(datetime.now().timestamp())  # Current timestamp
        for fav in favorites:
            anime_id = fav['anime_id']
            transformed_data.append({
                "ITEM_ID": anime_id,
                "TIMESTAMP": timestamp,
                "USER_ID": user_id
            })

        # 2. Transformed Genres Data: ITEM_ID, GENRES (concatenated as a string)
        transformed_genres_data = []
        for fav in favorites:
            anime_id = fav['anime_id']
            genres = ', '.join(fav['genres'])  # Concatenate genres with commas
            transformed_genres_data.append({
                "ITEM_ID": anime_id,
                "GENRES": genres  # Store genres as a string
            })

        # Save transformed data to S3
        try:
            # Save transformed_data.json
            s3.put_object(Bucket=BUCKET_NAME, Key=object_key_transformed, Body=json.dumps(transformed_data))

            # Save transformed_genres_data.json
            s3.put_object(Bucket=BUCKET_NAME, Key=object_key_genres, Body=json.dumps(transformed_genres_data))

            return {'statusCode': 200, 'body': f'"{title}" has been added to favorites, and transformed data saved.'}
        except Exception as e:
            return {'statusCode': 500, 'body': 'Failed to save transformed data to S3.'}

    elif http_method == "GET":
        # GET: Retrieve all favorites
        try:
            response = s3.get_object(Bucket=BUCKET_NAME, Key=object_key)
            favorites = json.loads(response['Body'].read().decode('utf-8'))
        except s3.exceptions.NoSuchKey:
            favorites = []  # If no favorites file, initialize an empty list

        return {'statusCode': 200, 'body': json.dumps(favorites)}

    elif http_method == "DELETE":
        # DELETE: Remove anime from favorites
        try:
            body = json.loads(event['body'])
            anime_id = str(body['anime_id'])  # Ensure anime_id is treated as a string
        except (TypeError, KeyError, json.JSONDecodeError) as e:
            return {'statusCode': 400, 'body': 'Invalid request: Missing or invalid anime_id'}

        # Fetch anime details from Jikan API to get the title
        try:
            jikan_url = f"https://api.jikan.moe/v4/anime/{anime_id}"
            jikan_response = requests.get(jikan_url)
            jikan_response.raise_for_status()
            anime_data = jikan_response.json()['data']
            title = anime_data['title']
        except requests.RequestException as e:
            return {'statusCode': 404, 'body': 'Anime not found in Jikan API.'}

        # Load existing favorites from S3
        try:
            response = s3.get_object(Bucket=BUCKET_NAME, Key=object_key)
            favorites = json.loads(response['Body'].read().decode('utf-8'))
        except s3.exceptions.NoSuchKey:
            favorites = []  # If no favorites file, initialize an empty list

        # Check if anime exists in favorites
        anime_to_remove = next((fav for fav in favorites if fav['anime_id'] == anime_id), None)
        
        if not anime_to_remove:
            return {'statusCode': 400, 'body': f'"{title}" is not in favorites.'}

        # Remove the anime from favorites
        favorites = [fav for fav in favorites if fav['anime_id'] != anime_id]

        # Save the updated favorites list back to S3
        try:
            s3.put_object(Bucket=BUCKET_NAME, Key=object_key, Body=json.dumps(favorites))
            return {'statusCode': 200, 'body': f'"{title}" has been removed from favorites.'}
        except Exception as e:
            return {'statusCode': 500, 'body': 'Failed to update favorites.'}

    return {'statusCode': 400, 'body': 'Invalid request'}
