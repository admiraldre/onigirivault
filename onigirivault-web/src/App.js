import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom'; // React Router
import { Amplify} from 'aws-amplify'; // Correct import for Amplify and Auth
import Signup from './components/Signup'; // Your signup page
import Login from './components/Login'; // Your login page
import SearchAnime from './components/SearchAnime'; // Your search page
import Favourites from './components/Favourites'; // Your favourites page

// You can also import the aws-exports config here if you need it
import awsconfig from './aws-exports'; // Assuming you have aws-exports.js file

// Configure Amplify
Amplify.configure(awsconfig);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if a user is authenticated on initial load
    const checkUser = async () => {
      try {
        const currentUser = await Amplify.currentAuthenticatedUser();
        setUser(currentUser);
      } catch (error) {
        console.log('Not signed in:', error);
        setUser(null);
      }
    };
    
    checkUser();
  }, []);

  // Sign out the user
  const signOut = async () => {
    try {
      await Amplify.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            {user ? (
              <>
                <li><Link to="/search">Search Anime</Link></li>
                <li><Link to="/favourites">Favourites</Link></li>
                <li><button onClick={signOut}>Sign Out</button></li>
              </>
            ) : (
              <>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/login">Log In</Link></li>
              </>
            )}
          </ul>
        </nav>

        <Routes>
          {/* Route to the Sign Up page */}
          <Route path="/signup" element={<Signup />} />
          
          {/* Route to the Login page */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route
            path="/search"
            element={user ? <SearchAnime /> : <Navigate to="/login" />}
          />
          <Route
            path="/favourites"
            element={user ? <Favourites /> : <Navigate to="/login" />}
          />
          
          {/* Home Route */}
          <Route path="/" element={<h1>Welcome to Onigiri Vault</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;