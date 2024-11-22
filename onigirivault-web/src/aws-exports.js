const awsconfig = {
  // API Configuration
  API: {
    endpoints: [
      {
        name: "OnigiriVaultAPI", // Your API's name
        endpoint: process.env.REACT_APP_API_URL, // API URL from .env
        region: 'us-east-1', // The region where your API is hosted
      }
    ]
  },
  // Cognito Authentication Configuration (without using Amplify Auth)
  // Auth: {
  //   region: 'us-east-1', // Region where your Cognito User Pool is located
  //   userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID, // Cognito User Pool ID from .env
  //   userPoolWebClientId: process.env.REACT_APP_COGNITO_USER_POOL_WEB_CLIENT_ID, // Cognito Web Client ID from .env
  //   oauth: {
  //     domain: process.env.REACT_APP_COGNITO_OAUTH_DOMAIN, // OAuth domain from .env
  //     scope: ['email', 'openid', 'phone'], // OAuth scopes
  //     redirectSignIn: process.env.REACT_APP_COGNITO_REDIRECT_SIGN_IN, // Sign-in redirect URL
  //     redirectSignOut: process.env.REACT_APP_COGNITO_REDIRECT_SIGN_OUT, // Sign-out redirect URL
  //     responseType: 'code', // OAuth response type (authorization code flow)
  //   }
  // }
};

export default awsconfig;