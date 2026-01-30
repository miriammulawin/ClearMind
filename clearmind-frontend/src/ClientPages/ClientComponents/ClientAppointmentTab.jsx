import React from 'react';
import { Nav } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import "../ClientStyle/ClientAppointmentTab.css";

const ClientAppointmentTab = () => {

  const navigate = useNavigate();
  const location = useLocation();

   

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (location.pathname.includes('/client-services')) return 'services';
    if (location.pathname.includes('/client-upcoming')) return 'upcoming';
    if (location.pathname.includes('/client-history')) return 'history';
    return 'services';
  };


  const activeTab = getActiveTab();

  const handleTabChange = (tab) => {
    navigate(`/client-appointment/${tab}`);
  };

  return (
    <div className="tab-navigation-wrapper d-flex justify-content-center align-items-center">
      <Nav variant="tabs" className="custom-tabs">
        <Nav.Item className='nav-item'>
          <Nav.Link 
            eventKey="services" 
            active={activeTab === 'services'}
            onClick={() => handleTabChange('client-services')}
            >
            Services
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item className='nav-item'>
          <Nav.Link 
            eventKey="upcoming" 
            active={activeTab === 'upcoming'}
            onClick={() => handleTabChange('client-upcoming')}
          >
            Upcoming
          </Nav.Link>
        </Nav.Item>
        
        <Nav.Item className='nav-item'>
          <Nav.Link 
            eventKey="history" 
            active={activeTab === 'history'}
            onClick={() => handleTabChange('client-history')}
          >
            History
          </Nav.Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default ClientAppointmentTab;