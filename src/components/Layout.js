import { Outlet } from "react-router-dom";
import MuiAppBar from "./MuiAppBar";

function Layout(props) {
  return (
    <>
      <MuiAppBar displayName={props.displayName} loginHandler={props.loginHandler} logoutHandler={props.logoutHandler}/>
      <div className="page-container">
        <Outlet />
      </div>
    </>
  );
}

export default Layout;