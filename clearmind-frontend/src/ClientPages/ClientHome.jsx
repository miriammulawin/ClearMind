import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
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