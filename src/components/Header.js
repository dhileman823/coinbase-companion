import { Navbar, Container, Nav, NavDropdown, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from '@firebase/auth';
import { auth, provider } from "../firestore";
import { useEffect, useState } from "react";

function Header(props) {
    if (props.displayName) {
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
                            <NavDropdown title={props.displayName} id="basic-nav-dropdown">
                                <NavDropdown.Item onClick={props.logoutHandler}>
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
                <Button variant="dark" onClick={props.loginHandler}>Log In</Button>
            </Container>
        </Navbar>
    );
}

export default Header;