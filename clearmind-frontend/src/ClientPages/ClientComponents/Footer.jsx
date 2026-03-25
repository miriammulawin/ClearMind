import { useNavigate, useLocation } from "react-router-dom";

import "../ClientStyle/ClientFooter.css";
import { GoHomeFill } from "react-icons/go";
import { FaCalendarCheck } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import { BiSolidUserCircle } from "react-icons/bi";


// Routes where the footer should be completely hidden
const HIDDEN_ON = [
  "/client/appointment/set-appointment-form"
];

function ClientFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  // Fully unmount footer on these pages so it can't receive any touches
  if (HIDDEN_ON.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  const menus = [
    { name: "Home",         icon: <GoHomeFill />,        path: "/client/home" },
    { name: "Appointments", icon: <FaCalendarCheck />,   path: "/client/appointment" },
    { name: "Messages",     icon: <AiFillMessage />,     path: "/client/messages" },
    { name: "Profile",      icon: <BiSolidUserCircle />, path: "/client/profile" },
  ];

  const isActive = (menuPath) => {
    const current = location.pathname;
    if (current === menuPath) return true;
    return (
      current.startsWith(menuPath + "/") ||
      current.startsWith(menuPath + "?")
    );
  };

  return (
    <nav className="bottom-nav">
      {menus.map((menu) => (
        <button
          key={menu.name}
          className={`nav-item ${isActive(menu.path) ? "active" : ""}`}
          onClick={() => navigate(menu.path)}
        >
          {menu.icon}
          <span>{menu.name}</span>
        </button>
      ))}
    </nav>
  );
}

export default ClientFooter;