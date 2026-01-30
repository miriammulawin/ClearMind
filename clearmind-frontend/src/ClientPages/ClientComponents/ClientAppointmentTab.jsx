import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import "../ClientStyle/ClientAppointmentTab.css";

const ClientAppointmentTab = () => {
  const [activeTab, setActiveTab] = useState('services');

  return (
    <div className="tab-navigation-wrapper d-flex justify-content-center align-items-center">
      <Nav variant="tabs" className="custom-tabs">
        <Nav.Item>
          <Nav.Link 
            eventKey="services" 
            active={activeTab === 'services'}
            onClick={() => setActiveTab('services')}
          >
            Services
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="upcoming" 
            active={activeTab === 'upcoming'}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link 
            eventKey="history" 
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
          >
            History
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default ClientAppointmentTab;
