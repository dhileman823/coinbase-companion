import { Outlet } from "react-router-dom";
import Header from "./Header";

function Layout(props) {
  return (
    <>
      <Header displayName={props.displayName} loginHandler={props.loginHandler} logoutHandler={props.logoutHandler}/>
      <div className="page-container">
        <Outlet />
      </div>
    </>
  );
}

export default Layout;