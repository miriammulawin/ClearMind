import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
// import logo_login from "../assets/CMPS_Logo.png";
import { FaEye, FaEyeSlash, FaLock} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import "./ClientStyle/ClientHome.css"
import ClientHeader from "./ClientComponents/ClientHeader";
import ClientFooter from "./ClientComponents/ClientFooter";

function ClientHome() {
    return (
        <div>
            <ClientHeader />

            <ClientFooter />
        </div>
    );
}

export default ClientHome;