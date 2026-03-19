import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminPatient.module.css";
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiUsers,
  FiClipboard,
  FiHeart,
  FiFileText,
  FiX,
  FiClock,
  FiActivity,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCheck,
} from "react-icons/fi";
import { FaCalendarAlt, FaUserMd } from "react-icons/fa";
import samplePayment from "../assets/payment/images.png";

/* ════════════════════════════════════════════
   ClinicalNotesSection
════════════════════════════════════════════ */
function ClinicalNotesSection() {
  const [activeTab, setActiveTab] = useState("intake");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formValue, setFormValue] = useState("");

  const [notes, setNotes] = useState({
    intake: [
      {
        id: 1,
        date: "January 15, 2026",
        author: "Dr. Maria Santos, MD",
        content:
          "Patient presents with persistent anxiety symptoms for the past 6 months. Reports difficulty sleeping, excessive worry, and occasional panic attacks. No prior psychiatric history. Family history of anxiety disorder on maternal side. Patient is cooperative and motivated for treatment.",
      },
    ],
    progress: [
      {
        id: 1,
        date: "February 10, 2026",
        author: "Dr. John Cruz, MD",
        content:
          "Patient reports reduced frequency of panic attacks (from 3x/week to 1x/week). Sleeping better with medication. Continues CBT exercises at home. GAD-7 score improved from 18 to 12. Medication compliance confirmed.",
      },
    ],
    recommendation: [
      {
        id: 1,
        date: "February 10, 2026",
        author: "Dr. John Cruz, MD",
        content:
          "Continue escitalopram 10mg once daily. Maintain weekly CBT sessions. Patient advised to practice mindfulness exercises daily. Follow-up in 4 weeks. Refer to support group if symptoms persist.",
      },
    ],
  });

  const tabConfig = [
    {
      key: "intake",
      label: "Intake",
      icon: <FiClipboard size={15} />,
      color: "#4D227C",
      light: "#f0e8ff",
    },
    {
      key: "progress",
      label: "Progress Note",
      icon: <FiActivity size={15} />,
      color: "#1d6fa4",
      light: "#e8f4ff",
    },
    {
      key: "recommendation",
      label: "Recommendation",
      icon: <FiFileText size={15} />,
      color: "#15803d",
      light: "#e8faf0",
    },
  ];

  const currentTab = tabConfig.find((t) => t.key === activeTab);

  const handleAdd = () => {
    if (!formValue.trim()) return;
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      author: "Dr. Admin",
      content: formValue.trim(),
    };
    setNotes((prev) => ({
      ...prev,
      [activeTab]: [newEntry, ...prev[activeTab]],
    }));
    setFormValue("");
    setShowAddModal(false);
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setFormValue(entry.content);
    setShowAddModal(true);
  };

  const handleSaveEdit = () => {
    if (!formValue.trim()) return;
    setNotes((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((e) =>
        e.id === editingEntry.id ? { ...e, content: formValue.trim() } : e,
      ),
    }));
    setFormValue("");
    setEditingEntry(null);
    setShowAddModal(false);
  };

  const handleDelete = (id) =>
    setNotes((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].filter((e) => e.id !== id),
    }));

  const openAdd = () => {
    setEditingEntry(null);
    setFormValue("");
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingEntry(null);
    setFormValue("");
  };

  return (
    <div className={styles.clinicalSection}>
      {/* ── Tab Bar ── */}
      <div className={styles.clinicalTabsBar}>
        <div className={styles.clinicalTabs}>
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              className={`${styles.clinicalTabBtn} ${activeTab === tab.key ? styles.clinicalTabActive : ""}`}
              style={
                activeTab === tab.key
                  ? {
                      background: tab.color,
                      color: "#fff",
                      borderColor: tab.color,
                    }
                  : {}
              }
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={styles.clinicalTabCount}
                style={
                  activeTab === tab.key
                    ? { background: "rgba(255,255,255,0.25)", color: "#fff" }
                    : { background: tab.light, color: tab.color }
                }
              >
                {notes[tab.key].length}
              </span>
            </button>
          ))}
        </div>
        <button
          className={styles.clinicalAddBtn}
          style={{ background: currentTab.color }}
          onClick={openAdd}
        >
          <FiPlus size={14} /> Add {currentTab.label}
        </button>
      </div>

      {/* ── Entries ── */}
      <div className={styles.clinicalEntries}>
        {notes[activeTab].length === 0 ? (
          <div className={styles.clinicalEmpty}>
            <span style={{ fontSize: "36px", opacity: 0.25 }}>📋</span>
            <p>No {currentTab.label} entries yet.</p>
            <button
              className={styles.clinicalAddBtn}
              style={{ background: currentTab.color }}
              onClick={openAdd}
            >
              <FiPlus size={13} /> Add First Entry
            </button>
          </div>
        ) : (
          notes[activeTab].map((entry, index) => (
            <div
              key={entry.id}
              className={styles.clinicalEntryCard}
              style={{ borderLeftColor: currentTab.color }}
            >
              <div className={styles.clinicalEntryHeader}>
                <div className={styles.clinicalEntryMeta}>
                  <span
                    className={styles.clinicalEntryBadge}
                    style={{
                      background: currentTab.light,
                      color: currentTab.color,
                    }}
                  >
                    {currentTab.icon} {currentTab.label} #
                    {notes[activeTab].length - index}
                  </span>
                  <span className={styles.clinicalEntryDate}>
                    <FiCalendar size={11} /> {entry.date}
                  </span>
                  <span className={styles.clinicalEntryAuthor}>
                    <FiUser size={11} /> {entry.author}
                  </span>
                </div>
                <div className={styles.clinicalEntryActions}>
                  <button
                    className={`${styles.clinicalActionBtn} ${styles.clinicalEditBtn}`}
                    onClick={() => handleEdit(entry)}
                    title="Edit"
                  >
                    <FiEdit3 size={13} />
                  </button>
                  <button
                    className={`${styles.clinicalActionBtn} ${styles.clinicalDeleteBtn}`}
                    onClick={() => handleDelete(entry.id)}
                    title="Delete"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </div>
              </div>
              <p className={styles.clinicalEntryContent}>{entry.content}</p>
            </div>
          ))
        )}
      </div>

      {/* ── Add / Edit Modal ── */}
      {showAddModal && (
        <div className={styles.clinicalModalOverlay} onClick={closeModal}>
          <div
            className={styles.clinicalModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={styles.clinicalModalHeader}
              style={{ background: currentTab.color }}
            >
              <div className={styles.clinicalModalHeaderLeft}>
                {currentTab.icon}
                <h3>
                  {editingEntry ? "Edit" : "Add"} {currentTab.label}
                </h3>
              </div>
              <button
                className={styles.clinicalModalCloseBtn}
                onClick={closeModal}
              >
                <FiX />
              </button>
            </div>
            <div className={styles.clinicalModalBody}>
              <label className={styles.clinicalFormLabel}>
                {currentTab.label} Entry
              </label>
              <textarea
                className={styles.clinicalTextarea}
                placeholder={`Write your ${currentTab.label.toLowerCase()} notes here…`}
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                rows={7}
                autoFocus
              />
            </div>
            <div className={styles.clinicalModalFooter}>
              <button className={styles.clinicalCancelBtn} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={styles.clinicalSaveBtn}
                style={{ background: currentTab.color }}
                onClick={editingEntry ? handleSaveEdit : handleAdd}
              >
                <FiCheck size={14} />{" "}
                {editingEntry ? "Save Changes" : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   AdminPatientProfile
════════════════════════════════════════════ */
function AdminPatientProfile() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const patient = state?.patient;

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState(null);

  if (!patient) {
    return (
      <div style={{ padding: "40px" }}>
        <h2>Patient not found.</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const appointments = patient.appointments || [
    {
      id: 1,
      date: "January 15, 2026",
      time: "9:00 am",
      psychiatrist: "Dr. Maria Santos, MD",
      specialization: "General Physician",
      reason: "Initial Psychological Assessment",
      status: "Completed",
      consultationMode: "On-Site",
      type: "New Concern",
      notes:
        "Patient was assessed for generalized anxiety disorder. Prescribed escitalopram 10mg once daily. Follow-up in 2 weeks.",
    },
    {
      id: 2,
      date: "February 10, 2026",
      time: "2:00 pm",
      psychiatrist: "Dr. John Cruz, MD",
      specialization: "Psychiatrist",
      reason: "Follow-up Consultation (Anxiety Management)",
      status: "Completed",
      consultationMode: "Virtual",
      type: "Follow Up",
      notes:
        "Patient reports reduced anxiety levels. Medication compliance confirmed. Dosage maintained. Next session in 1 month.",
    },
    {
      id: 3,
      date: "February 25, 2026",
      time: "11:00 am",
      psychiatrist: "Dr. Maria Santos, MD",
      specialization: "General Physician",
      reason: "Cognitive Behavioral Therapy Session",
      status: "Scheduled",
      consultationMode: "On-Site",
      type: "Follow Up",
      notes: "",
    },
  ];

  const getStatusBadgeStyle = (status) =>
    ({
      completed: {
        background: "#dcfce7",
        color: "#16a34a",
        border: "1px solid #bbf7d0",
      },
      scheduled: {
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "1px solid #bfdbfe",
      },
      cancelled: {
        background: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      },
      pending: {
        background: "#fef9c3",
        color: "#b45309",
        border: "1px solid #fde68a",
      },
    })[status?.toLowerCase()] || {
      background: "#f3f4f6",
      color: "#6b7280",
      border: "1px solid #e5e7eb",
    };

  /* Reusable info item */
  const InfoItem = ({ icon, label, value, colSpan }) => (
    <div
      className={styles.infoItem}
      style={colSpan ? { gridColumn: "1 / -1" } : {}}
    >
      <div className={styles.infoIcon}>{icon}</div>
      <div>
        <span className={styles.infoLabel}>{label}</span>
        <span className={styles.infoValue}>{value || "—"}</span>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar activeMenu="Patients" />
      <div className="admin-main">
        <AdminTopNavbar activeMenu="Patients" />

        <div className={styles.profileContainer}>
          {/* ── Patient Info Card ── */}
          <div className={styles.profileCard}>
            <div className={styles.profileLayout}>
              {/* Avatar */}
              <div className={styles.profileAvatar}>
                {patient.profileImage ? (
                  <img src={patient.profileImage} alt="Profile" />
                ) : (
                  <FiUser size={70} />
                )}
              </div>

              {/* Details */}
              <div className={styles.profileDetails}>
                {/* Name + Back button on same row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <h2 className={styles.profileName} style={{ margin: 0 }}>
                    {patient.name}
                  </h2>
                  <button
                    className={styles.backBtn}
                    style={{ margin: 0 }}
                    onClick={() => navigate(-1)}
                  >
                    <FiArrowLeft /> Back
                  </button>
                </div>

                {/* Personal Information */}
                <p className={styles.sectionSubLabel}>Personal Information</p>
                <div className={styles.twoCol} style={{ marginBottom: "16px" }}>
                  <InfoItem
                    icon={<FiCalendar />}
                    label="Age"
                    value={`${patient.age} yrs`}
                  />
                  <InfoItem
                    icon={<FiCalendar />}
                    label="Date of Birth"
                    value={patient.dateOfBirth || "January 15, 1997"}
                  />
                  <InfoItem
                    icon={<FiUsers />}
                    label="Sex"
                    value={patient.gender}
                  />
                  <InfoItem
                    icon={<FiHeart />}
                    label="Civil Status"
                    value={patient.civilStatus || "Single"}
                  />
                </div>

                <hr className={styles.sectionDivider} />

                {/* Contact Information */}
                <p className={styles.sectionSubLabel}>Contact Information</p>
                <div className={styles.twoCol} style={{ marginBottom: "16px" }}>
                  <InfoItem
                    icon={<FiPhone />}
                    label="Contact"
                    value={patient.contact}
                  />
                  <InfoItem
                    icon={<FiMail />}
                    label="Email"
                    value={patient.email}
                  />
                  <InfoItem
                    icon={<FiMapPin />}
                    label="Address"
                    value={patient.address}
                    colSpan
                  />
                </div>

                <hr className={styles.sectionDivider} />

                {/* Patient Details */}
                <p className={styles.sectionSubLabel}>Patient Details</p>
                <div className={styles.twoCol}>
                  <InfoItem
                    icon={<FiClipboard />}
                    label="Patient Type"
                    value={patient.patientType}
                  />
                  <InfoItem
                    icon={<FiClipboard />}
                    label="Total Visits"
                    value={patient.totalVisits}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Clinical Notes ── */}
          <ClinicalNotesSection />

          {/* ── Appointment History ── */}
          <div className={styles.historyCard}>
            <h3 className={styles.historyTitle}>Appointment History</h3>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Assigned Doctor</th>
                  <th>Reason</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <span className={styles.historyDateCell}>
                        {appt.date}
                      </span>
                      <br />
                      <span className={styles.historyTimeCell}>
                        {appt.time}
                      </span>
                    </td>
                    <td>{appt.psychiatrist}</td>
                    <td className={styles.historyReasonCell}>{appt.reason}</td>
                    <td>{appt.type}</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{
                          ...getStatusBadgeStyle(appt.status),
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.historyViewBtn}
                        onClick={() => setSelectedAppointment(appt)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ════════════════════════════
          APPOINTMENT DETAIL MODAL
      ════════════════════════════ */}
      {selectedAppointment && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className={styles.modalLg}
            style={{ maxWidth: "560px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={styles.modalProfileHeader}>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedAppointment(null)}
              >
                <FiX />
              </button>
              <div className={styles.modalProfileRow}>
                <div className={styles.patientProfileInfo}>
                  <h3 className={styles.patientProfileName}>
                    Appointment Details
                  </h3>
                  <p className={styles.patientProfileContact}>{patient.name}</p>
                  <div className={styles.patientProfileMeta}>
                    <span className={styles.metaChip}>
                      {selectedAppointment.date}
                    </span>
                    <span className={styles.metaChip}>
                      {selectedAppointment.time}
                    </span>
                    <span className={styles.metaChip}>
                      {selectedAppointment.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className={styles.modalBody}>
              {/* Appointment Info card */}
              <div
                className={styles.modalCard}
                style={{ marginBottom: "12px" }}
              >
                <div className={styles.cardSectionHeader}>
                  <div className={styles.cardSectionIcon}>
                    <FaCalendarAlt size={13} color="#fff" />
                  </div>
                  <h4 className={styles.cardSectionTitle}>Appointment Info</h4>
                </div>
                <div className={styles.twoCol}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiCalendar />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Date</span>
                      <span className={styles.infoValue}>
                        {selectedAppointment.date}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiClock />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Time</span>
                      <span className={styles.infoValue}>
                        {selectedAppointment.time}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiClipboard />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Visit Type</span>
                      <span className={styles.infoValue}>
                        {selectedAppointment.type}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiUser />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Status</span>
                      <span
                        className={styles.statusBadge}
                        style={{
                          ...getStatusBadgeStyle(selectedAppointment.status),
                          marginTop: "2px",
                        }}
                      >
                        {selectedAppointment.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Doctor */}
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "14px",
                    borderTop: "1px dashed #e5e7eb",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#9b7ec8",
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      marginBottom: "10px",
                    }}
                  >
                    Assigned Doctor
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      background: "linear-gradient(135deg, #f3eeff, #ede9f6)",
                      border: "1px solid #d8ccf0",
                      borderRadius: "10px",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #7341A8, #4D227C)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(115,65,168,0.3)",
                      }}
                    >
                      <FaUserMd size={18} color="#fff" />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#3b1f6e",
                          margin: "0 0 2px 0",
                          lineHeight: 1.2,
                        }}
                      >
                        {selectedAppointment.psychiatrist}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#7341A8",
                          margin: 0,
                          fontStyle: "italic",
                        }}
                      >
                        {selectedAppointment.specialization}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progression Notes */}
              {selectedAppointment.status === "Completed" &&
                selectedAppointment.notes && (
                  <div
                    className={styles.modalCard}
                    style={{ marginBottom: "12px" }}
                  >
                    <div className={styles.cardSectionHeader}>
                      <div className={styles.cardSectionIcon}>
                        <FiActivity size={14} color="#fff" />
                      </div>
                      <h4 className={styles.cardSectionTitle}>
                        Progression Notes
                      </h4>
                    </div>
                    <div
                      style={{
                        background: "#faf7ff",
                        border: "1px solid #ede9f6",
                        borderRadius: "10px",
                        padding: "16px 18px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "13.5px",
                          color: "#374151",
                          margin: 0,
                          lineHeight: "1.75",
                        }}
                      >
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  </div>
                )}

              {/* Payment Details */}
              <div className={styles.modalCard}>
                <button
                  className={styles.paymentToggle}
                  onClick={() => setPaymentOpen(!paymentOpen)}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div className={styles.cardSectionIcon}>
                      <FiFileText size={13} color="#fff" />
                    </div>
                    <span className={styles.paymentToggleTitle}>
                      Payment Details
                    </span>
                  </span>
                  <span className={styles.paymentToggleIcon}>
                    {paymentOpen ? (
                      <FiChevronUp size={18} />
                    ) : (
                      <FiChevronDown size={18} />
                    )}
                    <span style={{ fontSize: 12, marginLeft: 4 }}>
                      {paymentOpen ? "Hide" : "View"}
                    </span>
                  </span>
                </button>
                {paymentOpen && (
                  <div className={styles.paymentCollapseBody}>
                    <div className={styles.paymentLayout}>
                      <div className={styles.paymentFields}>
                        <div className={styles.infoItem}>
                          <div
                            className={styles.infoIcon}
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            ₱
                          </div>
                          <div>
                            <span className={styles.infoLabel}>
                              Paid Amount
                            </span>
                            <span className={styles.infoValue}>—</span>
                          </div>
                        </div>
                        <div className={styles.infoItem}>
                          <div
                            className={styles.infoIcon}
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            #
                          </div>
                          <div>
                            <span className={styles.infoLabel}>
                              Reference No.
                            </span>
                            <span className={styles.infoValue}>—</span>
                          </div>
                        </div>
                        <div className={styles.infoItem}>
                          <div
                            className={styles.infoIcon}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: "#888",
                            }}
                          >
                            PAY
                          </div>
                          <div>
                            <span className={styles.infoLabel}>
                              Payment Option
                            </span>
                            <span className={styles.infoValue}>—</span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.paymentProof}>
                        <span className={styles.paymentProofLabel}>
                          Payment Proof
                        </span>
                        <img
                          src={samplePayment}
                          alt="Payment Proof"
                          className={styles.paymentProofImg}
                          onClick={() => setZoomImage(samplePayment)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button
                className={styles.apptCloseBtn}
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Zoom Image ── */}
      {zoomImage && (
        <div className={styles.zoomOverlay} onClick={() => setZoomImage(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <img src={zoomImage} alt="Zoomed" className={styles.zoomImg} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPatientProfile;
