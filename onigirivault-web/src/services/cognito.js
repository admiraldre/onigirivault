// src/services/cognito.js
import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
  } from 'amazon-cognito-identity-js';
  import AWS from 'aws-sdk';
  
  const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID, // Your User Pool ID
    ClientId: process.env.REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID, // Your Web Client ID
  };
  
  const userPool = new CognitoUserPool(poolData);
  
  export const signUp = (username, password, email) => {
    const attributeList = [
      new AWS.CognitoIdentityServiceProvider.CognitoUserAttribute({
        Name: 'email',
        Value: email,
      }),
    ];
  
    return new Promise((resolve, reject) => {
      userPool.signUp(username, password, attributeList, null, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  };
  
  export const signIn = (username, password) => {
    const user = new CognitoUser({
      Username: username,
      Pool: userPool,
    });
  
    const authDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });
  
    return new Promise((resolve, reject) => {
      user.authenticateUser(authDetails, {
        onSuccess: (result) => resolve(result),
        onFailure: (err) => reject(err),
      });
    });
  };
  
  export const getCurrentUser = () => {
    return userPool.getCurrentUser();
  };