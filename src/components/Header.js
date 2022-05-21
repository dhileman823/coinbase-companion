import { Navbar, Container, Nav, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

function Header(){
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
            <Navbar.Brand as={Link} to="/">Coinbase Companion</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
                <Nav.Link as={Link} to="/">Markets</Nav.Link>
                <Nav.Link as={Link} to="orders">Orders</Nav.Link>
                <Nav.Link as={Link} to="settings">Settings</Nav.Link>
                <NavDropdown title="User Name" id="basic-nav-dropdown">
                    <NavDropdown.Item href="#action/3.1">Logout</NavDropdown.Item>
                </NavDropdown>
            </Nav>
            </Navbar.Collapse>
        </Container>
        </Navbar>
    );
}

export default Header;