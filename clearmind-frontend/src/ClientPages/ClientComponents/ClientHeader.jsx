import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import { IoNotifications } from "react-icons/io5";
import { IoMdInformationCircle } from "react-icons/io";
import logo_login_single from "../../assets/CMPS_Img_logo_only.png";
import "../ClientStyle/ClientHeader.css";

function ClientHeader() {
    return (
        <div>
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-section">
                        <Image src={logo_login_single } fluid className="logo-icon d-block mx-auto" />
                        <div className="welcome-text">
                            <h1 className="greeting">Hello, Juan!</h1>
                            <p className="subtext">Welcome to ClearMind</p>
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