import { useEffect, useState } from "react";
import { Image } from "react-bootstrap";
import { IoNotifications } from "react-icons/io5";
import { IoMdInformationCircle } from "react-icons/io";
import logo_login_single from "../../assets/CMPS_Img_logo_only.png";
import "../ClientStyle/ClientHeader.css";
import axiosClient from "../../axiosClient";

function ClientHeader() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axiosClient
      .get("/me")
      .then((res) => {
        console.log(res.data);
        setUser(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching user:", err);
      });
  }, []);

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <Image
            src={logo_login_single}
            fluid
            className="logo-icon d-block mx-auto"
          />

          <div className="welcome-text">
            <h1 className="greeting">
              Hello, {user ? user.firstName : "Loading..."}!
            </h1>
            <p className="subtext">Welcome to ClearMind</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="icon-btn notification-btn">
            <IoNotifications />
          </button>
          <button className="icon-btn info-btn">
            <IoMdInformationCircle />
          </button>
        </div>
      </div>
    </header>
  );
}

export default ClientHeader;
