import { Outlet } from "react-router-dom";
import HeaderBar from "./HeaderBar";

export default function Layout() {
  return (
    <div>
      <HeaderBar />
      <Outlet />
    </div>
  );
}
