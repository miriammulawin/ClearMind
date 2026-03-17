import { useState, useEffect } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminBilling.css";
import {
  FiX,
  FiDollarSign,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiHash,
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import samplePayment from "../assets/payment/images.png";

const AvatarPlaceholder = ({ name, size = 48 }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const colors = [
    "#7341A8",
    "#4D227C",
    "#005892",
    "#4A965B",
    "#9333ea",
    "#0ea5e9",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
        border: "2.5px solid #fff",
      }}
    >
      {initials}
    </div>
  );
};

function AdminBilling() {
  const [activeMenu, setActiveMenu] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    setActiveMenu("Billing");
  }, []);

  const billingData = [
    {
      id: 1,
      date: "Jan 15, 2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15, 2026",
      paymentMethod: "GCash",
      referenceNo: "GC-20260115-001",
      visitType: "Follow Up",
      consultationMode: "On-Site",
    },
    {
      id: 2,
      date: "Jan 15, 2026",
      patientName: "Ara Christina Ceres",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15, 2026",
      paymentMethod: "Maya",
      referenceNo: "MY-20260115-002",
      visitType: "New Concern",
      consultationMode: "Virtual",
    },
    {
      id: 3,
      date: "Jan 15, 2026",
      patientName: "Maria Santos",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15, 2026",
      paymentMethod: "Bank Transfer",
      referenceNo: "BT-20260115-003",
      visitType: "Check Up",
      consultationMode: "On-Site",
    },
    {
      id: 4,
      date: "Jan 15, 2026",
      patientName: "Kevin Ramos",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15, 2026",
      paymentMethod: "GCash",
      referenceNo: "GC-20260115-004",
      visitType: "Follow Up",
      consultationMode: "Virtual",
    },
    {
      id: 5,
      date: "Jan 15, 2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 1500,
      status: "UNSETTLED",
      datePaid: "—",
      paymentMethod: "—",
      referenceNo: "—",
      visitType: "Follow Up",
      consultationMode: "On-Site",
    },
    {
      id: 6,
      date: "Jan 15, 2026",
      patientName: "Ara Christina Ceres",
      amount: 1500,
      balance: 1500,
      status: "UNSETTLED",
      datePaid: "—",
      paymentMethod: "—",
      referenceNo: "—",
      visitType: "New Concern",
      consultationMode: "Virtual",
    },
    {
      id: 7,
      date: "Jan 15, 2026",
      patientName: "Maria Santos",
      amount: 1500,
      balance: 0,
      status: "VOID",
      datePaid: "Jan 15, 2026",
      paymentMethod: "—",
      referenceNo: "—",
      visitType: "Check Up",
      consultationMode: "On-Site",
    },
    {
      id: 8,
      date: "Jan 15, 2026",
      patientName: "Kevin Ramos",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15, 2026",
      paymentMethod: "Maya",
      referenceNo: "MY-20260115-008",
      visitType: "Follow Up",
      consultationMode: "Virtual",
    },
    {
      id: 9,
      date: "Jan 15, 2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15, 2026",
      paymentMethod: "GCash",
      referenceNo: "GC-20260115-009",
      visitType: "Check Up",
      consultationMode: "On-Site",
    },
    {
      id: 10,
      date: "Jan 15, 2026",
      patientName: "Ara Christina Ceres",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15, 2026",
      paymentMethod: "Bank Transfer",
      referenceNo: "BT-20260115-010",
      visitType: "New Concern",
      consultationMode: "Virtual",
    },
  ];

  const filteredData =
    filterStatus === "ALL"
      ? billingData
      : billingData.filter((item) => item.status === filterStatus);

  const totalBalance = filteredData.reduce(
    (sum, item) => sum + item.balance,
    0,
  );
  const countByStatus = (status) =>
    billingData.filter((item) => item.status === status).length;

  const tabs = [
    {
      label: "Total's Billing",
      key: "ALL",
      count: billingData.length,
      red: false,
    },
    {
      label: "Cleared",
      key: "CLEARED",
      count: countByStatus("CLEARED"),
      red: false,
    },
    {
      label: "Unsettled",
      key: "UNSETTLED",
      count: countByStatus("UNSETTLED"),
      red: true,
    },
    { label: "Void", key: "VOID", count: countByStatus("VOID"), red: false },
  ];

  const handleView = (item) => {
    setSelectedBill(item);
    setShowModal(true);
    setReceiptOpen(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "CLEARED":
        return <FiCheckCircle size={15} />;
      case "UNSETTLED":
        return <FiAlertCircle size={15} />;
      case "VOID":
        return <FiXCircle size={15} />;
      default:
        return null;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "CLEARED":
        return {
          background: "#dcfce7",
          color: "#16a34a",
          border: "1px solid #bbf7d0",
        };
      case "UNSETTLED":
        return {
          background: "#fef9c3",
          color: "#b45309",
          border: "1px solid #fde68a",
        };
      case "VOID":
        return {
          background: "#fee2e2",
          color: "#dc2626",
          border: "1px solid #fecaca",
        };
      default:
        return {};
    }
  };

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className="admin-content p-3 p-md-4">
          <div className="billing-container">
            {/* ── Tabs ── */}
            <div className="patient-tabs mb-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  className={filterStatus === tab.key ? "tab-active" : ""}
                  onClick={() => setFilterStatus(tab.key)}
                >
                  {tab.label}
                  <span className={tab.red ? "tab-badge-pending" : ""}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* ── Table ── */}
            <div className="patient-table-wrapper">
              <table className="patient-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Patient Name</th>
                    <th>Amount</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Date Paid</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.patientName}</td>
                        <td>₱ {item.amount.toLocaleString()}</td>
                        <td>₱ {item.balance.toLocaleString()}</td>
                        <td>
                          <span
                            className={`status ${item.status.toLowerCase()}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>{item.datePaid}</td>
                        <td>
                          <button
                            className="btn-view"
                            onClick={() => handleView(item)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          color: "#777",
                          padding: "24px",
                          textAlign: "center",
                        }}
                      >
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Total Balance ── */}
            <div className="d-flex justify-content-end mt-4">
              <div className="text-end">
                <span
                  className="fw-bold me-3"
                  style={{ fontSize: "14px", color: "#4D227C" }}
                >
                  TOTAL BALANCE:
                </span>
                <span style={{ fontSize: "16px", color: "#333" }}>
                  ₱ {totalBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment Details Modal ── */}
      {showModal && selectedBill && (
        <div
          className="patient-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="patient-modal-lg"
            style={{ maxWidth: "680px" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="modal-profile-header">
              <button
                className="close-btn profile-close-btn"
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
              <div className="modal-profile-row">
                <AvatarPlaceholder name={selectedBill.patientName} size={64} />
                <div className="patient-profile-info">
                  <h3 className="patient-profile-name">
                    {selectedBill.patientName}
                  </h3>
                  <p
                    className="patient-profile-contact"
                    style={{ marginBottom: "8px" }}
                  >
                    <FiCalendar size={12} style={{ marginRight: 5 }} />
                    Billing Date: {selectedBill.date}
                  </p>
                  <div className="patient-profile-meta">
                    <span className="profile-meta-chip">
                      {selectedBill.visitType}
                    </span>
                    <span className="profile-meta-chip">
                      {selectedBill.consultationMode}
                    </span>
                    <span
                      className="profile-meta-chip"
                      style={{
                        background:
                          selectedBill.status === "CLEARED"
                            ? "rgba(34,197,94,0.25)"
                            : selectedBill.status === "UNSETTLED"
                              ? "rgba(245,158,11,0.25)"
                              : "rgba(239,68,68,0.25)",
                        border:
                          selectedBill.status === "CLEARED"
                            ? "1px solid rgba(34,197,94,0.4)"
                            : selectedBill.status === "UNSETTLED"
                              ? "1px solid rgba(245,158,11,0.4)"
                              : "1px solid rgba(239,68,68,0.4)",
                      }}
                    >
                      {selectedBill.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Billing Summary */}
              <div
                className="modal-content-card"
                style={{ marginBottom: "12px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #ede9f6",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #7341A8, #4D227C)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FiDollarSign size={14} color="#fff" />
                  </div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#3b1f6e",
                    }}
                  >
                    Billing Summary
                  </h4>
                </div>

                {/* Amount breakdown */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #f3eeff, #ede9f6)",
                    border: "1px solid #d8ccf0",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#7341A8",
                        fontWeight: 600,
                      }}
                    >
                      Consultation Fee
                    </span>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#3b1f6e",
                      }}
                    >
                      ₱ {selectedBill.amount.toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "1px",
                      background: "#d8ccf0",
                      margin: "10px 0",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#7341A8",
                        fontWeight: 600,
                      }}
                    >
                      Amount Paid
                    </span>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      ₱{" "}
                      {(
                        selectedBill.amount - selectedBill.balance
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "1px",
                      background: "#d8ccf0",
                      margin: "10px 0",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#4D227C",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Remaining Balance
                    </span>
                    <span
                      style={{
                        fontSize: "17px",
                        fontWeight: 800,
                        color: selectedBill.balance > 0 ? "#dc2626" : "#16a34a",
                      }}
                    >
                      ₱ {selectedBill.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div className="modal-two-col">
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiUser />
                    </div>
                    <div>
                      <span className="modal-info-label">Patient</span>
                      <span className="modal-info-value">
                        {selectedBill.patientName}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiCalendar />
                    </div>
                    <div>
                      <span className="modal-info-label">Billing Date</span>
                      <span className="modal-info-value">
                        {selectedBill.date}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiCalendar />
                    </div>
                    <div>
                      <span className="modal-info-label">Date Paid</span>
                      <span className="modal-info-value">
                        {selectedBill.datePaid}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div
                      className="modal-info-icon"
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#7341A8",
                      }}
                    >
                      {getStatusIcon(selectedBill.status)}
                    </div>
                    <div>
                      <span className="modal-info-label">Status</span>
                      <span
                        className="status-badge"
                        style={{
                          ...getStatusStyle(selectedBill.status),
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          marginTop: "2px",
                        }}
                      >
                        {getStatusIcon(selectedBill.status)}
                        {selectedBill.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details + Collapsible Receipt */}
              <div className="modal-content-card">
                {/* Payment method & reference */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #ede9f6",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #7341A8, #4D227C)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FiCreditCard size={14} color="#fff" />
                  </div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "17px",
                      fontWeight: 800,
                      color: "#3b1f6e",
                    }}
                  >
                    Payment Details
                  </h4>
                </div>

                <div className="modal-two-col" style={{ marginBottom: "16px" }}>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiCreditCard />
                    </div>
                    <div>
                      <span className="modal-info-label">Payment Method</span>
                      <span className="modal-info-value">
                        {selectedBill.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <div className="modal-info-icon">
                      <FiHash />
                    </div>
                    <div>
                      <span className="modal-info-label">Reference No.</span>
                      <span
                        className="modal-info-value"
                        style={{
                          fontFamily: "monospace",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {selectedBill.referenceNo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Collapsible View Payment Receipt ── */}
                <div
                  style={{
                    border: "1.5px solid #e5d6f5",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  {/* Toggle header */}
                  <button
                    onClick={() => setReceiptOpen(!receiptOpen)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      background: receiptOpen ? "#f3eeff" : "#fff",
                      border: "none",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#4D227C",
                      }}
                    >
                      View Payment Receipt
                    </span>
                    {receiptOpen ? (
                      <FiChevronUp size={18} color="#4D227C" />
                    ) : (
                      <FiChevronDown size={18} color="#4D227C" />
                    )}
                  </button>

                  {/* Collapsible body */}
                  {receiptOpen && (
                    <div
                      style={{
                        borderTop: "1.5px solid #e5d6f5",
                        animation: "fadeSlideIn 0.2s ease",
                      }}
                    >
                      {selectedBill.status === "UNSETTLED" ||
                      selectedBill.status === "VOID" ? (
                        <div
                          style={{
                            padding: "32px",
                            background: "#f9fafb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#9ca3af",
                            fontSize: "13px",
                            fontStyle: "italic",
                          }}
                        >
                          No payment proof available
                        </div>
                      ) : (
                        /* Full receipt image — shown directly on expand */
                        <div style={{ padding: "16px", background: "#faf7fd" }}>
                          <img
                            src={samplePayment}
                            alt="Payment Receipt"
                            style={{
                              width: "100%",
                              display: "block",
                              borderRadius: "10px",
                              boxShadow: "0 4px 20px rgba(77,34,124,0.15)",
                              border: "1px solid #e5d6f5",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: "10px 24px",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "10px",
                  border: "1px solid #e5d6f5",
                  background: "#f0ebf7",
                  color: "#4D227C",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBilling;
