import { FiLogOut, FiSearch } from "react-icons/fi";
import { AiFillMessage } from "react-icons/ai";
import { IoNotifications } from "react-icons/io5";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";

function AdminTopNavbar({ activeMenu }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Toast confirmation at bottom-right
    toast(
      (t) => (
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: "0 0 15px 0", fontWeight: 600, fontSize: "1rem" }}>
            Are you sure?
          </p>
          <p style={{ margin: "0 0 20px 0", fontSize: "0.9rem", color: "#666" }}>
            You will be logged out.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => {
                toast.dismiss(t.id);
              }}
              style={{
                padding: "8px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                performLogout();
              }}
              style={{
                padding: "8px 20px",
                backgroundColor: "#7C3AED",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Yes, logout
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "bottom-right",
        style: {
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          minWidth: "350px",
        },
      }
    );
  };

  const performLogout = async () => {
    try {
      await axios.post(
        "http://localhost/ClearMind/clearmind-backend/logout.php",
        {},
        { withCredentials: true }
      );

      // Success toast
      toast.success("Logged out successfully!", {
        duration: 500,
        position: "top-center",
        style: {
          background: "#E2F7E3",
          border: "1px solid #91C793",
          color: "#2E7D32",
          fontWeight: 600,
          fontSize: "0.95rem",
          textAlign: "center",
          maxWidth: "320px",
          borderRadius: "10px",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
        },
        iconTheme: {
          primary: "#2E7D32",
          secondary: "#E2F7E3",
        },
      });

      // Redirect to login page after short delay
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again later.", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#FFEBEE",
          border: "1px solid #EF5350",
          color: "#C62828",
          fontWeight: 600,
          fontSize: "0.95rem",
          textAlign: "center",
          maxWidth: "320px",
          borderRadius: "10px",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
        },
        iconTheme: {
          primary: "#C62828",
          secondary: "#FFEBEE",
        },
      });
    }
  };

  return (
    <div className="top-navbar">
      <div className="top-navbar-left">
        <h3>{activeMenu}</h3>
      </div>

      <div className="top-navbar-right">
        <AiFillMessage className="top-icon" />
        <IoNotifications className="top-icon" />

        <div className="search-box">
          <input type="text" placeholder="Search" />
          <FiSearch className="search-icon" />
        </div>

        <FiLogOut
          className="top-icon"
          style={{ cursor: "pointer" }}
          onClick={handleLogout}
        />
      </div>
    </div>
  );
}

export default AdminTopNavbar;