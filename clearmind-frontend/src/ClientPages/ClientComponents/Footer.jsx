import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoHomeFill } from "react-icons/go";
import { FaCalendarCheck } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import { BiSolidUserCircle } from "react-icons/bi";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import styles from "../ClientStyle/ClientFooter.module.css";

import { RxHamburgerMenu } from "react-icons/rx";

const HIDDEN_ON = ["/client/appointment/set-appointment-form"];

function ClientFooter({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (HIDDEN_ON.some((path) => location.pathname.startsWith(path))) return null;

  const menus = [
    { name: "Home", icon: <GoHomeFill />, path: "/client/home" },
    {
      name: "Appointments",
      icon: <FaCalendarCheck />,
      path: "/client/appointment",
    },
    { name: "Messages", icon: <AiFillMessage />, path: "/client/messages" },
    { name: "Profile", icon: <BiSolidUserCircle />, path: "/client/account" },
  ];

  const isActive = (menuPath) => {
    const current = location.pathname;
    return current === menuPath || current.startsWith(menuPath + "/");
  };

  return (
    <>
      {/* Desktop Side Nav */}
      <nav
        className={`${styles.sideNav} ${collapsed ? styles.collapsed : styles.expanded}`}
      >
        <div className={styles.toggleWrapper}>
          <button className={styles.toggleBtn} onClick={onToggle}>
            {collapsed ? <RxHamburgerMenu /> : <MdChevronLeft />}
          </button>
        </div>

        {menus.map((menu) => (
          <button
            key={menu.name}
            className={`${styles.sideNavItem} ${collapsed ? styles.sideNavItemCollapsed : ""} ${isActive(menu.path) ? styles.active : ""}`}
            onClick={() => navigate(menu.path)}
          >
            <span className={styles.sideNavIcon}>{menu.icon}</span>
            {!collapsed && (
              <span className={styles.sideNavLabel}>{menu.name}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className={styles.bottomNav}>
        {menus.map((menu) => (
          <button
            key={menu.name}
            className={`${styles.navItem} ${isActive(menu.path) ? styles.active : ""}`}
            onClick={() => navigate(menu.path)}
          >
            {menu.icon}
            <span>{menu.name}</span>
          </button>
        ))}
      </nav>
    </>
  );
}

export default ClientFooter;
