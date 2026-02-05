import { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Image } from "react-bootstrap";
import ClientHeader from "./ClientComponents/ClientHeader";
import ClientFooter from "./ClientComponents/ClientFooter";
import MessagingApp from "./ClientComponents/MessageBody";

function ClientMessages() {
    const [isInChat, setIsInChat] = useState(false);

    const handleChatStateChange = (showChat) => {
        setIsInChat(showChat);
    };

    return (
        <div>
            {!isInChat && <ClientHeader />}
            <MessagingApp onChatStateChange={handleChatStateChange} />
            {!isInChat && <ClientFooter />}
        </div>
    );
}

export default ClientMessages;