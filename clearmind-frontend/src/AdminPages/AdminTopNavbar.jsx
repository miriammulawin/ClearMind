import { FiLogOut, FiSearch } from "react-icons/fi";
import { AiFillMessage } from "react-icons/ai";
import { IoNotifications } from "react-icons/io5";
import { useNavigate } from "react-router-dom"; 
import "../index.css";

function AdminTopNavbar({ activeMenu }) {
  const navigate = useNavigate(); 

  return (
    <div className="top-navbar">
      <div className="top-navbar-left">
        <h3>{activeMenu}</h3>
      </div>

      <div className="top-navbar-right">
        <AiFillMessage
          className="top-icon"
          onClick={() => navigate("/admin-messages")}
          style={{ cursor: "pointer" }}
        />
        <IoNotifications className="top-icon" />

        <div className="search-box">
          <input type="text" placeholder="Search" />
          <FiSearch className="search-icon" />
        </div>

        <FiLogOut className="top-icon" />
      </div>
    </div>
  );
}

export default AdminTopNavbar;
