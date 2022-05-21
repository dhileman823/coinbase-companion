import { signOut } from '@firebase/auth';
import { auth } from "../firestore";
import { Button } from "react-bootstrap";

function Logout() {
  const logoutHandler = async () => {
    signOut(auth)
    .then(() => {
        console.log('logged out');
        //navigate('/');
    })
    .catch((error) => {
        console.log(error);
    });
  };

  return (
    <div className="logout-wrapper">
      <Button variant="secondary" onClick={logoutHandler}>Log-out</Button>
    </div>
  );
}

export default Logout;
