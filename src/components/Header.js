import { Navbar, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import Login from "./Login";

function Header(){
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
                <Login />
            </Nav>
            </Navbar.Collapse>
        </Container>
        </Navbar>
    );
}

export default Header;