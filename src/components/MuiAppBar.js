import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import LogoIcon from "@mui/icons-material/DonutSmall";

const pages = [
  { name: "Markets", path: "/" },
  { name: "Orders", path: "orders" }
];

const LogInOutButton = function (props) {
  if (props.displayName) {
    return (
      <Button
        onClick={props.handleOpenUserMenu}
        sx={{ my: 2, color: "white", display: "block" }}
      >
        {props.displayName}
      </Button>
    );
  } else {
    return (
      <Button
        onClick={props.loginHandler}
        sx={{ my: 2, color: "white", display: "block" }}
      >
        Login
      </Button>
    );
  }
};

const NavButtons = function (props) {
  if (props.isLoggedIn) {
    return (
      <>
        {pages.map((page) => (
          <Button
            component={RouterLink}
            to={page.path}
            key={page.name}
            sx={{ my: 2, color: "white", display: "block" }}
          >
            {page.name}
          </Button>
        ))}
      </>
    );
  }
  return <></>;
};

const NavButtonsMobile = function (props) {
  if (props.isLoggedIn) {
    return (
      <>
        {pages.map((page) => (
        <MenuItem
          component={RouterLink}
          to={page.path}
          key={page.name}
          onClick={props.handleCloseNavMenu}
        >
          <Typography textAlign="center">{page.name}</Typography>
        </MenuItem>
        ))}
      </>
    );
  }
  return <></>;
};

const MuiAppBar = (props) => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    props.logoutHandler();
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <LogoIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Coinbase Companion
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              <NavButtonsMobile
                isLoggedIn={props.displayName ? true : false}
                handleCloseNavMenu={handleCloseNavMenu}
              />
            </Menu>
          </Box>
          <LogoIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            CC
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <NavButtons isLoggedIn={props.displayName ? true : false} />
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <LogInOutButton
              displayName={props.displayName}
              loginHandler={props.loginHandler}
              handleOpenUserMenu={handleOpenUserMenu}
            />
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem component={RouterLink} to="settings" key="Settings" onClick={handleCloseUserMenu}>
                <Typography textAlign="center">Settings</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Typography textAlign="center">Sign Out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default MuiAppBar;
