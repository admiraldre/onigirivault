// src/index.js or src/App.js
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';

// Get values from .env
const awsConfig = {
  Auth: {
    region: 'us-east-1',
    userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID,
    clientSecret: process.env.REACT_APP_COGNITO_CLIENT_SECRET,
    oauth: {
      domain: process.env.REACT_APP_COGNITO_OAUTH_DOMAIN,
      scope: ['email', 'openid', 'phone'],
      redirectSignIn: process.env.REACT_APP_COGNITO_REDIRECT_SIGN_IN,
      redirectSignOut: process.env.REACT_APP_COGNITO_REDIRECT_SIGN_OUT,
      responseType: 'code', // Use 'code' for OAuth 2.0 authorization code flow
    }
  },
  API: {
    endpoints: [
      {
        name: "OnigiriVaultAPI",
        endpoint: process.env.REACT_APP_API_URL,
        region: 'us-east-1'
      }
    ]
  }
};

Amplify.configure(awsConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);