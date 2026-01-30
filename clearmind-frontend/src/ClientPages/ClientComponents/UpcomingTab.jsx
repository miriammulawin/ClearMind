import React from 'react';
import { Container } from 'react-bootstrap';

const UpcomingTab = () => {
  return (
    <Container className="py-4">
      <h5 style={{ 
        color: '#5B2C91', 
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Upcoming Appointments
      </h5>
      <div style={{ 
        textAlign: 'center', 
        marginTop: '50px',
        color: '#6c757d' 
      }}>
        <p>📅</p>
        <p>No upcoming appointments scheduled yet.</p>
      </div>
    </Container>
  );
};

export default UpcomingTab;