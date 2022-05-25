import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from '@firebase/auth';
import { auth, provider } from "./firestore";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import MarketPage from "./components/pages/MarketPage";
import OrderPage from "./components/pages/OrderPage";
import SettingsPage from "./components/pages/SettingsPage";
import NoPage from "./components/pages/NoPage";

function App() {
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("active login: " + user.email);
        setUserName(user.displayName);
      }
      else{
        console.log("no active login");
      }
    });
  });

  const loginHandler = async () => {
    provider.setCustomParameters({ prompt: "select_account" });
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // redux action? --> dispatch({ type: SET_USER, user });
        console.log("logged in");
        setUserName(user.displayName);
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log(errorMessage);
      });
  };

  const logoutHandler = async () => {
    signOut(auth)
      .then(() => {
        console.log('logged out');
        setUserName(null);
        //navigate('/');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout displayName={userName} loginHandler={loginHandler} logoutHandler={logoutHandler}/>}>
            <Route index element={<MarketPage />} />
            <Route path="orders" element={<OrderPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
