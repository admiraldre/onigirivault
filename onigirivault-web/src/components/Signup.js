import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';

function Signup() {
  return (
    <div>
      <Authenticator>
        {({ signOut, user }) => (
          <div>
            <h2>Welcome {user.username}</h2>
            <button onClick={signOut}>Sign Out</button>
          </div>
        )}
      </Authenticator>
    </div>
  );
}

export default Signup;