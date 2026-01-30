import React from 'react';
import { Container } from 'react-bootstrap';

const HistoryTab = () => {
  return (
    <Container className="py-4">
      <h5 style={{ 
        color: '#5B2C91', 
        fontWeight: 'bold',
        marginBottom: '20px'
      }}>
        Appointment History
      </h5>
      <div style={{ 
        textAlign: 'center', 
        marginTop: '50px',
        color: '#6c757d' 
      }}>
        <p>📋</p>
        <p>No appointment history available.</p>
      </div>
    </Container>
  );
};

export default HistoryTab;