import MessagingApp from "./ClientComponents/MessageBody";
import { useState } from "react";
import { useOutletContext } from "react-router-dom";

function ClientMessages() {
  const { setIsInChat } = useOutletContext();
  const handleChatStateChange = (showChat) => {
    setIsInChat(showChat);
  };

  return <MessagingApp onChatStateChange={setIsInChat} />;
}

export default ClientMessages;
