import React, { useState } from 'react';
import { Auth } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';

const AuthComponent = () => {
  const [user, setUser] = useState(null);

  Auth.currentAuthenticatedUser()
    .then(user => setUser(user))
    .catch(() => setUser(null));

  return (
    <div>
      <h2>{user ? `Hello, ${user.username}` : 'Please sign in'}</h2>
      <button onClick={() => Auth.signOut()}>Sign Out</button>
    </div>
  );
};

export default withAuthenticator(AuthComponent);