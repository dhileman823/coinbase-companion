import { Navbar, Container, Nav, NavDropdown, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from '@firebase/auth';
import { auth, provider } from "../firestore";
import { useEffect, useState } from "react";

function Header() {
    const [userName, setUserName] = useState(null);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log(user.email);
                setUserName(user.displayName);
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

    if (userName) {
        return (
            <Navbar bg="primary" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand as={Link} to="/">Coinbase Companion</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link as={Link} to="/">Markets</Nav.Link>
                            <Nav.Link as={Link} to="orders">Orders</Nav.Link>
                            <Nav.Link as={Link} to="settings">Settings</Nav.Link>
                        </Nav>
                        <Nav>
                            <NavDropdown title={userName} id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={logoutHandler}>
                                    Sign Out
                                </NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
    return (
        <Navbar bg="primary" variant="dark" expand="lg">
            <Container>
                <Navbar.Brand as={Link} to="/">Coinbase Companion</Navbar.Brand>
                <Button variant="dark" onClick={googleHandler}>Log In</Button>
            </Container>
        </Navbar>
    );
}

export default Header;