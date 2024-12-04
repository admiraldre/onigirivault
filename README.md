# OnigiriVault - Anime & Manga Recommender App

## Team Members
- **Andrei Vivar**
- **Nduonyi Jack Ukitetu**
- **Raiden Yamaoka**

## Project Overview
**OnigiriVault** is an anime and manga recommender app that helps users track and recommend anime based on their preferences. It uses the **Jikan API** to fetch anime data from **MyAnimeList**, and it integrates several AWS services to manage user data, store preferences, and generate recommendations.

The app provides:
- User authentication via **Amazon Cognito**
- A personal **watchlist** and **favourites** system stored in **Amazon S3**
- An anime **recommendation system** powered by **Amazon Personalize**

## Technologies & AWS Services
- **Amazon S3**: To store user data (watchlist and favourites).
- **Amazon Cognito**: User authentication and management.
- **AWS Lambda**: Backend logic for handling API requests.
- **AWS Step Functions**: For orchestrating workflows related to recommendation generation.
- **Amazon API Gateway**: To create, publish, and manage APIs securely.
- **AWS X-Ray**: For tracing and monitoring API requests.
- **AWS Systems Manager Parameter Store**: For managing sensitive information.
- **Jikan API**: Provides anime data.
- **Amazon SNS**: For sending notifications about new recommendations or changes in user lists.
- **Amazon Personalize**: Used for generating anime recommendations.

## Features
- **User Login**: Register and log in securely using **Amazon Cognito**.
- **Search Anime/Manga**: Search anime and manga titles from the Jikan API.
- **Add to Favourites/Watchlist**: Save anime to the watchlist or favourites list.
- **Recommendation System**: Get anime recommendations based on genres and user preferences.
- **Notification System**: Receive notifications for new recommendations.

## Architecture

### Front-End:
- **Amazon Cognito** for authentication.
- The user’s preferences (watchlist and favourites) are stored in **Amazon S3**.

### Back-End:
- **API Gateway** exposes endpoints for interacting with the Jikan API and handling user data.
- **AWS Lambda** handles backend logic like adding, updating, and removing favourites, as well as generating recommendations.
- **Amazon Personalize** is used to recommend anime based on user preferences.
- **AWS Step Functions** orchestrates the workflows for recommendation generation.

## Functional Requirements
- **User Login**: Users must be able to register, log in, and securely manage their accounts.
- **Search Anime/Manga Data**: Users should be able to search and browse anime data.
- **Add to Favourites/Watchlist**: Users can save anime to their watchlist or mark them as favourites.
- **Recommendation System**: Generate anime recommendations based on the user’s watch history and preferences.
- **Notification System**: Notify users of new recommendations.

## Setup & Configuration

To set up and test the API using **Postman**, follow these steps:

1. **Authentication Configuration**:
   - **Auth Type**: OAuth 2.0
   - **Token Name**: (Any)
   - **Grant Type**: Authorization Code
   - **Callback URL**: https://oauth.pstmn.io/v1/browser-callback
   - **Auth URL**: `https://onigirivault.auth.us-east-1.amazoncognito.com/oauth2/authorize`
   - **Access Token URL**: `https://onigirivault.auth.us-east-1.amazoncognito.com/oauth2/token`
   - **Client ID**: 2drs5052b2kp013bgs0rbh1gi0
   - **Client Secret**: n651t7sp7fh1sfcfcea2guul5894ncgn9g2q9qb0q0rl3rd4ohm
   - **Scope**: blank
   - **State**: blank
   - **Client Authentication**: Send as Basic Auth Header

2. Once you have created an account in Cognito, use the **ID Token** for authentication.

3. **API Calls**:
   - **Search Anime**: `GET https://z0vjtrx3vf.execute-api.us-east-1.amazonaws.com/prod/anime?q={anime_name}`
   - **Favourites List**:
     - `GET https://z0vjtrx3vf.execute-api.us-east-1.amazonaws.com/prod/favourites`
     - `POST https://z0vjtrx3vf.execute-api.us-east-1.amazonaws.com/prod/favourites` (Add anime by ID)
     - `DELETE https://z0vjtrx3vf.execute-api.us-east-1.amazonaws.com/prod/favourites` (Remove anime by ID)
   - **Recommendations**: `GET https://z0vjtrx3vf.execute-api.us-east-1.amazonaws.com/prod/recommendations`

## Challenges Encountered
- **API Gateway Integration**: Connecting Postman with API Gateway initially faced issues due to incorrect access token usage. The solution was using the Access ID instead.
- **Step Function Triggering**: API Gateway directly triggered the Step Function, causing unclear responses. We fixed this by introducing a Lambda function to provide better feedback.

## Testing & Evaluation
- **S3**: The favourites list is stored in Amazon S3, and tested via GET, POST, and DELETE methods.
- **API Gateway**: Endpoints for `/anime`, `/favourites`, and `/recommendations` were tested using Postman.
- **Lambda Functions**: Functions like `animeAPICleaner`, `favelist_handler`, `recommendationHandler`, and `awsXRayCheck` were tested using Lambda's built-in testing features.
- **AWS SNS**: Notifications for added or removed favourites were tested through Amazon SNS.
- **Amazon Personalize**: Recommendations were validated using a dummy dataset and tested with various user watchlists.

## Cost Analysis
- The project currently has no cost due to the limited usage.
- For high traffic (e.g., 30 million API calls/month), cost estimates are available in the linked spreadsheet.

## Teamwork & Collaboration
- Regular meetings were held to assign tasks and work collaboratively within a single AWS account.
- We faced challenges with API integration and AWS Cognito setup, but through collaboration, we solved them efficiently.

## Reflection
- **Raiden**: I found the integration of the Cognito login and X-Ray to be straightforward and efficient.
- **Jack**: The Jikan API integration and using Lambda to trigger Step Functions were learning experiences, especially with Postman.
- **Andrei**: I faced challenges with AWS Cognito integration but was able to work on the UI and API features.

## Reproducibility
To run the project and interact with the APIs, use the provided Postman configuration and API calls as mentioned in the **Setup & Configuration** section.

For more detailed steps, you can refer to the setup provided in the **API Calls** section above.

## Video Demo
[Click for the Demo Video](https://youtu.be/2c7q1s4Jxv8)