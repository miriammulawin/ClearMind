# ClearMind Website Database
---

CREATE DATABASE ClearMindWebsite;
USE ClearMindWebsite;

CREATE TABLE admin (
    ad_username VARCHAR(50) PRIMARY KEY, 
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_initial VARCHAR(10),
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    sex ENUM('Male', 'Female'),
    age INT,
    password VARCHAR(255) NOT NULL,
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE specialization (
    spec_id INT AUTO_INCREMENT PRIMARY KEY,
    specialization VARCHAR(100) NOT NULL
);

CREATE TABLE sub_specialization (
    sub_spec_id INT AUTO_INCREMENT PRIMARY KEY,
    sub_specialization VARCHAR(100) NOT NULL
);

CREATE TABLE board_certification (
    board_cert_id INT AUTO_INCREMENT PRIMARY KEY,
    board_cert VARCHAR(100) NOT NULL
);

CREATE TABLE service (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service VARCHAR(100) NOT NULL
);

CREATE TABLE doctors (
    doctors_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    middle_initial VARCHAR(10),
    sex ENUM('Male','Female'),
    date_of_birth DATE,
    age INT,
    email_address VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    description TEXT,
    professional_title VARCHAR(100),
    years_of_experience INT,
    license_number VARCHAR(50),
    spec_id INT,
    sub_spec_id INT,
    board_cert_id INT,
    service_id INT,
    cert_image VARCHAR(255),
    password VARCHAR(255),
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (spec_id) REFERENCES specialization(spec_id),
    FOREIGN KEY (sub_spec_id) REFERENCES sub_specialization(sub_spec_id),
    FOREIGN KEY (board_cert_id) REFERENCES board_certification(board_cert_id),
    FOREIGN KEY (service_id) REFERENCES service(service_id)
);

CREATE TABLE client (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    middle_initial VARCHAR(10),
    sex ENUM('Male','Female'),
    date_of_birth DATE,
    age INT,
    email_address VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    password VARCHAR(255),
    profile_pic VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin 
(ad_username, first_name, last_name, middle_initial, email, phone, date_of_birth, sex, age, password, profile_pic)
VALUES
(
    'Admin101',
    'Brian',
    'Delacruz',
    'C',
    'brian.admin@clearmind.com',
    '09171234567',
    '2001-05-12',
    'Male',
    23,
    '$2y$10$Xuo7ReHKOAKgccgYP.H9VO1FONNegTskKiYPAI3L4tAc4etAQnHXm',
    'default-profile-pic.png'
);

SELECT * FROM admin;

Admin Password = Admin111229#


