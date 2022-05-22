import { Outlet } from "react-router-dom";
import Header from "./Header";

function Layout() {
  return (
    <>
      <Header />
      <div className="page-container">
        <Outlet />
      </div>
    </>
  );
}

export default Layout;