import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import "./ClientStyle/ClientMessages.css"
import ClientHeader from "./ClientComponents/ClientHeader";
import ClientFooter from "./ClientComponents/ClientFooter";

function ClientMessages() {
    return (
        <div>
            <ClientHeader />

            <ClientFooter />
        </div>
    );
}

export default ClientMessages;