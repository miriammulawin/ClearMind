// ServiceAlert.jsx
import React from 'react';
import { Alert } from 'react-bootstrap';
import styles from './styles/ServiceAlert.module.css';


const ServiceAlert = ({ selectedService }) => {
  if (!selectedService) return null;
  
  return (
    <Alert className={styles.serviceAlert}>
        <strong>Selected Service:</strong> {selectedService}
    </Alert>
  );
};

export default ServiceAlert;