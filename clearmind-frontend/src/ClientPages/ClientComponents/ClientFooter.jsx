import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import "../ClientStyle/ClientFooter.css";
import { GoHomeFill } from "react-icons/go";
import { FaCalendarCheck } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import { BiSolidUserCircle } from "react-icons/bi";


function ClientFooter() {
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { name: "Home", icon: <GoHomeFill />, path: "/client/home" },
    { name: "Appointments", icon: <FaCalendarCheck />, path: "/client/appointment" },
    { name: "Messages", icon: <AiFillMessage />, path: "/client/messages" },
    { name: "Profile", icon: <BiSolidUserCircle />, path: "/client/profile" },
  ];

  return (
    <nav className="bottom-nav">
      {menus.map((menu) => {
        const isActive = location.pathname.startsWith(menu.path);

        return (
          <button
            key={menu.name}
            className={`nav-item ${isActive ? "active" : ""}`}
            onClick={() => navigate(menu.path)}
          >
            {menu.icon}
            <span>{menu.name}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default ClientFooter;