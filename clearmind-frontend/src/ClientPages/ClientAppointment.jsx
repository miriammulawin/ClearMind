import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import "./ClientStyle/ClienAppoinment.css"
import ClientHeader from "./ClientComponents/ClientHeader";
import ClientFooter from "./ClientComponents/ClientFooter";

function ClienAppoinment() {
    return (
        <div>
            <ClientHeader />

            <ClientFooter />
        </div>
    );
}

export default ClienAppoinment;