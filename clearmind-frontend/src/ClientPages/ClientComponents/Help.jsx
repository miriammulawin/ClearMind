import React, { useState } from "react";
import { Container, Form, InputGroup, Accordion } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../ClientStyle/Help.css";
import { IoSearchOutline, IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import ClientHeader from "./Header";
import ClientFooter from "./Footer";

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const faqItems = [
    {
      id: 1,
      question: "How can I reschedule my appointment?",
      answer:
        "To reschedule your appointment, go to your upcoming appointments, select the appointment you want to reschedule, and click on the 'Reschedule' button. Choose your preferred date and time from the available slots.",
    },
    {
      id: 2,
      question: "How can I cancel my appointment?",
      answer:
        "You can cancel your appointment by going to your appointments list, selecting the appointment, and clicking the 'Cancel' button. Please note that cancellations should be made at least 24 hours in advance.",
    },
    {
      id: 3,
      question: "How do I update my profile information?",
      answer:
        "Navigate to your Profile page, click on the edit icon next to your name, and update your information. Don't forget to save your changes before exiting.",
    },
    {
      id: 4,
      question: "What payment methods are accepted?",
      answer:
        "We accept various payment methods including credit/debit cards, PayPal, and other digital payment platforms. You can manage your payment methods in the Payments section.",
    },
    {
      id: 5,
      question: "How can I contact my therapist?",
      answer:
        "You can contact your therapist through the messaging feature in the app. Go to your appointments and select 'Message Therapist' to start a conversation.",
    },
    {
      id: 6,
      question: "Is my information secure and confidential?",
      answer:
        "Yes, we take your privacy very seriously. All your information is encrypted and stored securely. We follow strict confidentiality protocols in accordance with healthcare privacy laws.",
    },
    {
      id: 7,
      question: "How do I book a new appointment?",
      answer:
        "To book a new appointment, click on the 'Book Appointment' button on the home screen, select your preferred therapist, choose an available date and time, and confirm your booking.",
    },
    {
      id: 8,
      question: "What should I do if I'm having technical issues?",
      answer:
        "If you're experiencing technical issues, try logging out and back in, or reinstalling the app. If the problem persists, please contact our support team at support@cmps.com",
    },
  ];

  const filteredFAQs = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="client-appointment-container">
      <div className="sticky-header">
        <ClientHeader />
      </div>

      <div className="tab-content-wrapper">
        <div className="help-page-container">
          <Container className="help-container">
            {/* Header */}
            <div
              className="help-header"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <IoArrowBack
                size={22}
                onClick={() => navigate("/client/profile")}
                style={{ cursor: "pointer" }}
              />
              <h4 className="help-title">How can we help you today?</h4>
            </div>

            {/* Search Bar */}
            <div className="search-section">
              <InputGroup className="search-input-group">
                <Form.Control
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <InputGroup.Text className="search-icon-wrapper">
                  <IoSearchOutline size={22} className="search-icon" />
                </InputGroup.Text>
              </InputGroup>
            </div>

            {/* FAQ Accordion */}
            <div className="faq-section">
              <Accordion>
                {filteredFAQs.map((item, index) => (
                  <Accordion.Item
                    key={item.id}
                    eventKey={index.toString()}
                    className="faq-item"
                  >
                    <Accordion.Header className="faq-question">
                      {item.question}
                    </Accordion.Header>
                    <Accordion.Body className="faq-answer">
                      {item.answer}
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>

              {filteredFAQs.length === 0 && (
                <div className="no-results">
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </Container>
        </div>
      </div>

      <div className="sticky-footer">
        <ClientFooter />
      </div>
    </div>
  );
}
