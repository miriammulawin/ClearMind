import { FiLogOut, FiSearch } from "react-icons/fi";
import { AiFillMessage } from "react-icons/ai";
import { IoNotifications } from "react-icons/io5";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../index.css";

function AdminTopNavbar({ activeMenu }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Optional: confirmation before logout
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You will be logged out.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, logout",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await axios.post(
          "http://localhost/ClearMind/clearmind-backend/logout.php",
          {},
          { withCredentials: true }
        );

        // SweetAlert success
        Swal.fire({
          icon: "success",
          title: "Logged out successfully!",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top-end",
        });

        // Redirect to login page after short delay
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      Swal.fire({
        icon: "error",
        title: "Logout failed",
        text: "Please try again later.",
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
