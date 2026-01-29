import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import "./ClientStyle/ClientAppointment.css"
import ClientHeader from "./ClientComponents/ClientHeader";
import ClientFooter from "./ClientComponents/ClientFooter";
import ClientAppointmentTab from "./ClientComponents/ClientAppointmentTab";

function ClientAppointment() {
    return (
        <div>
            <ClientHeader />
            <ClientAppointmentTab/ >
            <ClientFooter />
        </div>
    );
}

export default ClientAppointment;