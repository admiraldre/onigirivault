// src/api.js
import axios from 'axios';
import { Auth } from 'aws-amplify';

export const fetchData = async () => {
  try {
    // Get the current session, including the access token
    const session = await Auth.currentSession();
    const accessToken = session.getAccessToken().getJwtToken();

    // Make an API call with the access token in the Authorization header
    const response = await axios.get(process.env.REACT_APP_API_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};