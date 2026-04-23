import { Image } from "react-bootstrap";
import { IoArrowBack } from "react-icons/io5";
import { FaFacebook } from "react-icons/fa";
import { MdQuestionMark, MdLocationOn, MdEmail, MdPhone } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import logo_login from "../../assets/CMPS_Logo.png";
import styles from "../ClientStyle/About.module.css";
import OrgChart from "./OrgChart";

export default function About() {
  const navigate = useNavigate();

  const services = [
    { name: "Psychotherapy" },
    { name: "Psychological Assessment" },
    { name: "Psychiatric Evaluation" },
    { name: "Mental Health Certification" },
    { name: "Special Education Program" },
    { name: "Clinical Internship" },
    { name: "Academic and Community Services" },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <div className={styles.header}>
        <IoArrowBack
          size={22}
          className={styles.backIcon}
          onClick={() => navigate("/client/account")}
        />
        <h4 className={styles.headerTitle}>About</h4>
      </div>

      {/* Logo */}
      <div className={styles.logoWrapper}>
        <Image src={logo_login} className={styles.logoImg} />
      </div>

      {/* Intro */}
      <div className={styles.introCard}>
        <p className={styles.introText}>
          <b className={styles.sectionTitle}>
            ClearMind Psychological Services
          </b>{" "}
          provides professional and compassionate mental health care tailored to
          your needs. Our expert therapists offer individual therapy, couples
          counseling, child and adolescent therapy, psychological assessments,
          and stress management strategies. We are dedicated to helping you
          achieve emotional well-being and a clearer mind. Let us support you on
          your journey to mental wellness.
        </p>
      </div>

      {/* Two column — Mission Vision */}
      <div className={styles.twoCol}>
        {/* Mission*/}
        <div>
          <h5 className={styles.sectionTitle}>Mission</h5>
          <div className={styles.servicesCard}>
            <p className={styles.introText}>
              At{" "}
              <b className={styles.sectionTitle}>
                ClearMind Psychological Services
              </b>
              , our mission is to provide compassionate, evidence-based mental
              health care that empowers individuals, couples, and families to
              navigate life’s challenges with clarity and confidence. Through
              personalized therapy, psychological assessments, and holistic
              wellness strategies, we create a safe, supportive space where
              healing begins, resilience grows, and mental well being thrives.
            </p>
          </div>
        </div>

        {/* Vision*/}
        <div>
          <h5 className={styles.sectionTitle}> Vision </h5>
          <div className={styles.servicesCard}>
            <p className={styles.introText}>
              We envision a future where mental health is valued as a
              cornerstone of overall well-being, free from stigma and barriers.{" "}
              <b className={styles.sectionTitle}>
                ClearMind Psychological Services
              </b>
              is dedicated to being a trusted leader in psychological care,
              fostering a culture of self-awareness, emotional strength, and
              personal growth. Our goal is to empower individuals and
              communities with the tools to lead balanced, fulfilling lives.
            </p>
          </div>
        </div>
      </div>

      {/* Two column — Services + Map */}
      <div className={styles.twoCol}>
        {/* Services Offered */}
        <div>
          <h5 className={styles.sectionTitle}>Services Offered</h5>
          <div className={styles.servicesCard}>
            {services.map((s, i) => (
              <div key={i} className={styles.serviceItem}>
                <p className={styles.serviceName}>• {s.name}</p>
                {s.desc && <p className={styles.serviceDesc}>{s.desc}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Where to Find Us */}
        <div>
          <h5 className={styles.sectionTitle}> Where to Find Us ? </h5>
          <div className={styles.mapCard}>
            <iframe
              className={styles.mapEmbed}
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3867.417768061809!2d121.13729906973286!3d14.228834855747639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd63dbe09b13d7%3A0x303da66cc7d126cd!2sClearMind%20Psychological%20Services!5e0!3m2!1sen!2sph!4v1776330613596!5m2!1sen!2sph"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ClearMind Location"
            />
            <div className={styles.addressRow}>
              <MdLocationOn className={styles.addressIcon} />
              <p className={styles.addressText}>
                Block 1 Lot 7, Palmsville Subdivision, Brgy. Banlic, City of
                Cabuyao, Laguna, 4025
              </p>
            </div>
          </div>
        </div>
      </div>
      <h5 className={styles.sectionTitle}>Organizational Chart</h5>

      <div className={styles.introCard}>
        <OrgChart />
      </div>

      {/* Contact Us — full width */}
      <h5 className={styles.sectionTitle}>Contact Us</h5>
      <div className={styles.contactCard}>
        <div className={styles.contactRow}>
          <span className={styles.contactLabel}>
            <MdEmail className={styles.contactIcon} />
            &nbsp;Gmail:
          </span>
          <span className={styles.contactText}>
            clearmind.psychservices@gmail.com
          </span>
        </div>

        <div className={styles.contactRow}>
          <span className={styles.contactLabel}>
            <FaFacebook className={styles.contactIcon} /> &nbsp;Facebook:
          </span>
          <a
            href="https://www.facebook.com/clearmindpsychservices"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkText}
          >
            @clearmindpsychservices{" "}
          </a>
        </div>

        <div className={styles.contactRow}>
          <span className={styles.contactLabel}>
            <MdPhone className={styles.contactIcon} /> &nbsp;Phone:
          </span>
          +63992 -916 - 4078
        </div>
      </div>
    </div>
  );
}
