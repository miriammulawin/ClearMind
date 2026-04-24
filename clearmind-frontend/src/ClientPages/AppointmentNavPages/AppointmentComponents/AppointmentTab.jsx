import React, { useEffect, useRef } from "react";
import { Nav } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./styles/AppointmentTab.css";

const AppointmentTab = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeRef = useRef(null);

  const getActiveTab = () => {
    if (location.pathname.includes("/services")) return "services";
    if (location.pathname.includes("/pending")) return "pending";
    if (location.pathname.includes("/upcoming")) return "upcoming";
    if (location.pathname.includes("/sessions")) return "sessions";
    if (location.pathname.includes("/history")) return "history";
    return "services";
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab) => {
    navigate(`/client/appointment/${tab}`);
  };
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeTab]);

  return (
    <div className="tab-navigation-wrapper">
      <Nav variant="tabs" className="custom-tabs">
        {["services", "pending", "upcoming", "sessions", "history"].map(
          (tab) => (
            <Nav.Item key={tab}>
              <Nav.Link
                ref={activeTab === tab ? activeRef : null}
                active={activeTab === tab}
                onClick={() => handleTabChange(tab)}
              >
                {tab === "upcoming"
                  ? "Scheduled"
                  : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Nav.Link>
            </Nav.Item>
          ),
        )}
      </Nav>
    </div>
  );
};

export default AppointmentTab;
