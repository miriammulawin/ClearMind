import { useState, useEffect } from "react";
import { Image } from "react-bootstrap";
import { IoNotifications } from "react-icons/io5";
import { IoMdInformationCircle } from "react-icons/io";
import logo_login_single from "../../assets/CMPS_Img_logo_only.png";
import "../ClientStyle/ClientHeader.css";
import axiosClient from "../../axiosClient";

function ClientHeader() {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosClient
      .get("/me")
      .then((response) => {
        if (response.data.success) {
          setClient(response.data.data);
        }
      })    
      .catch((error) => {
        console.error("Failed to fetch client data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

//   const formatPronoun = (pronoun) => {
//     if (!pronoun) return null;
//     const map = {
//       he_him: "He/Him",
//       she_her: "She/Her",
//       they_them: "They/Them",
//       other: client?.customPronoun || "Other",
//     };
//     return map[pronoun] || pronoun;
//   };

//   const formatGenderIdentity = (gender) => {
//     if (!gender) return null;
//     return gender.split("_").map(capitalize).join(" ");
//   };

//   const getAge = (dob) => {
//     if (!dob) return null;
//     const today = new Date();
//     const birthDate = new Date(dob);
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const m = today.getMonth() - birthDate.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
//     return age;
//   };

  const firstName = capitalize(client?.firstName);
//   const lastName = capitalize(client?.lastName);
//   const middleInitial = client?.middleInitial
//     ? client.middleInitial.toUpperCase() + "."
//     : "";

  return (
    <div>
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <Image
              src={logo_login_single}
              fluid
              className="logo-icon d-block mx-auto"
            />
            <div className="welcome-text">
              {loading ? (
                <h1 className="greeting">Hello!</h1>
              ) : (
                <>
                  <h1 className="greeting">Hello, {firstName}!</h1>
                  <p className="subtext">Welcome to ClearMind</p>

                  {/* Optional: Extended client info strip */}
                </>
              )}
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-btn notification-btn">
              <IoNotifications className="icon-btn" />
            </button>
            <button className="icon-btn info-btn">
              <IoMdInformationCircle className="icon-btn" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default ClientHeader;
