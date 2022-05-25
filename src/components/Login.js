import { signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from '@firebase/auth';
import { auth, provider } from "../firestore";
import { Button, NavDropdown } from "react-bootstrap";
import { useEffect, useState } from "react";

function Login() {
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        console.log(user.email);
        setUserName(user.displayName);
      }
      else {
        console.log("authChange, no user");
      }
    });
  });

  const googleHandler = async () => {
    provider.setCustomParameters({ prompt: "select_account" });
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // redux action? --> dispatch({ type: SET_USER, user });
        console.log(user);
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
        // ...
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

  if(userName){
    return (
      <NavDropdown title={userName} id="basic-nav-dropdown">
        <NavDropdown.Item href="#action/3.1">
          <Button variant="link" onClick={logoutHandler}>Log-out</Button>
        </NavDropdown.Item>
      </NavDropdown>
    );
  }

  return (
    <div className="login-wrapper">
      <Button variant="dark" onClick={googleHandler}>Log-in</Button>
    </div>
  );
}

export default Login;
