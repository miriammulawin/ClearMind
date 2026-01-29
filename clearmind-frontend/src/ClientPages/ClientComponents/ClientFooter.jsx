import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import "../ClientStyle/ClientFooter.css";
import { GoHomeFill } from "react-icons/go";
import { FaCalendarCheck } from "react-icons/fa";
import { AiFillMessage } from "react-icons/ai";
import { BiSolidUserCircle } from "react-icons/bi";


function ClientFooter() {
    const [active, setActive] = useState("home");
    
    return (
        <div> 
            <nav className="bottom-nav">
                <button className={`nav-item ${active === "home" ? "active" : ""}`} onClick={() => setActive("home")}>
                    <GoHomeFill />
                <span>Home</span>
                </button>
                
                <button className={`nav-item ${active === "appointments" ? "active" : ""}`} onClick={() => setActive("appointments")}>
                    <FaCalendarCheck />
                <span>Appointments</span>
                </button>
                
                <button className={`nav-item ${active === "messages" ? "active" : ""}`} onClick={() => setActive("messages")}>
                    <AiFillMessage />
                <span>Messages</span>
                </button>
                
                <button className={`nav-item ${active === "account" ? "active" : ""}`}onClick={() => setActive("account")}>
                    <BiSolidUserCircle />
                <span>Account</span>
                </button>
            </nav>
        </div>
    );
}

export default ClientFooter;