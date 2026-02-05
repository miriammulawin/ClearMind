import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import "./ClientStyle/ClientAccount.css"
import ClientHeader from "./ClientComponents/ClientHeader";
import ClientFooter from "./ClientComponents/ClientFooter";
import ProfilePage from "./ClientComponents/ProfileBody";

function ClientAccount() {
    return (
        <div>
            <ClientHeader />
            <ProfilePage />
            <ClientFooter />
        </div>
    );
}

export default ClientAccount;