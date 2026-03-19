import { useState, useEffect } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import styles from "./AdminStyle/AdminBilling.module.css";
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
  const [dateFrom, setDateFrom] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

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

  const filteredData = billingData.filter((i) => {
    const matchStatus = filterStatus === "ALL" || i.status === filterStatus;
    if (!matchStatus) return false;
    if (dateFrom) {
      const itemDate = new Date(i.date).toDateString();
      const filterDate = new Date(dateFrom).toDateString();
      if (itemDate !== filterDate) return false;
    }
    return true;
  });

  const totalBalance = filteredData.reduce((sum, i) => sum + i.balance, 0);
  const countByStatus = (s) => billingData.filter((i) => i.status === s).length;
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const displayedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleTabChange = (key) => {
    setFilterStatus(key);
    setCurrentPage(1);
  };
  const handleDateFrom = (e) => {
    setDateFrom(e.target.value);
    setCurrentPage(1);
  };
  const clearDates = () => {
    setDateFrom("");
    setCurrentPage(1);
  };

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

  const getStatusIcon = (s) =>
    ({
      CLEARED: <FiCheckCircle size={15} />,
      UNSETTLED: <FiAlertCircle size={15} />,
      VOID: <FiXCircle size={15} />,
    })[s] || null;

  const getStatusStyle = (s) =>
    ({
      CLEARED: {
        background: "#dcfce7",
        color: "#16a34a",
        border: "1px solid #bbf7d0",
      },
      UNSETTLED: {
        background: "#fef9c3",
        color: "#b45309",
        border: "1px solid #fde68a",
      },
      VOID: {
        background: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fecaca",
      },
    })[s] || {};

  const statusClass = (s) =>
    ({
      CLEARED: styles.statusCleared,
      UNSETTLED: styles.statusUnsettled,
      VOID: styles.statusVoid,
    })[s] || "";

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className={`admin-content ${styles.billingPage}`}>
          <div className={styles.billingCard}>
            {/* ── Tabs + Date Filter ── */}
            <div className={styles.tabsRow}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    className={`${styles.tabBtn} ${filterStatus === tab.key ? styles.tabActive : ""}`}
                    onClick={() => handleTabChange(tab.key)}
                  >
                    {tab.label}
                    <span className={tab.red ? styles.tabBadgeRed : ""}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className={styles.dateFilterGroup}>
                <span className={styles.dateLabel}>Date:</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={dateFrom}
                  onChange={handleDateFrom}
                />
                {dateFrom && (
                  <button className={styles.btnClearDate} onClick={clearDates}>
                    <FiX size={12} /> Clear
                  </button>
                )}
              </div>
            </div>

            {/* ── Table ── */}
            <div className={styles.tableWrapper}>
              <table className={styles.billingTable}>
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
                    displayedData.map((item) => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.patientName}</td>
                        <td>₱ {item.amount.toLocaleString()}</td>
                        <td>₱ {item.balance.toLocaleString()}</td>
                        <td>
                          <span className={statusClass(item.status)}>
                            {item.status}
                          </span>
                        </td>
                        <td>{item.datePaid}</td>
                        <td>
                          <button
                            className={styles.btnView}
                            onClick={() => handleView(item)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className={styles.emptyRow}>
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Total Balance ── */}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>TOTAL BALANCE:</span>
              <span className={styles.totalValue}>
                ₱ {totalBalance.toLocaleString()}
              </span>
            </div>

            {/* ── Pagination ── */}
            <div className={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ‹ Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={currentPage === i + 1 ? styles.pageActive : ""}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next ›
              </button>
            </div>
            <div className={styles.pageInfo}>
              Page {currentPage} of {totalPages || 1}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════
          PAYMENT DETAILS MODAL
      ════════════════════════════ */}
      {showModal && selectedBill && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div className={styles.modalLg} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <button
                className={styles.closeBtn}
                onClick={() => setShowModal(false)}
              >
                <FiX />
              </button>
              <div className={styles.modalHeaderRow}>
                <AvatarPlaceholder name={selectedBill.patientName} size={64} />
                <div className={styles.headerInfo}>
                  <h3 className={styles.headerName}>
                    {selectedBill.patientName}
                  </h3>
                  <p className={styles.headerSub}>
                    <FiCalendar size={12} style={{ marginRight: 5 }} />
                    Billing Date: {selectedBill.date}
                  </p>
                  <div className={styles.headerMeta}>
                    <span className={styles.metaChip}>
                      {selectedBill.visitType}
                    </span>
                    <span className={styles.metaChip}>
                      {selectedBill.consultationMode}
                    </span>
                    <span
                      className={styles.metaChip}
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
            <div className={styles.modalBody}>
              {/* ── Billing Summary ── */}
              <div
                className={styles.modalCard}
                style={{ marginBottom: "12px" }}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <FiDollarSign size={14} color="#fff" />
                  </div>
                  <h4 className={styles.cardTitle}>Billing Summary</h4>
                </div>

                {/* Amount breakdown */}
                <div className={styles.summaryBox}>
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>
                      Consultation Fee
                    </span>
                    <span className={styles.summaryValueFee}>
                      ₱ {selectedBill.amount.toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.summaryDivider} />
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Amount Paid</span>
                    <span className={styles.summaryValuePaid}>
                      ₱{" "}
                      {(
                        selectedBill.amount - selectedBill.balance
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className={styles.summaryDivider} />
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabelBold}>
                      Remaining Balance
                    </span>
                    <span
                      className={styles.summaryValueOwed}
                      style={{
                        color: selectedBill.balance > 0 ? "#dc2626" : "#16a34a",
                      }}
                    >
                      ₱ {selectedBill.balance.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div className={styles.twoCol}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiUser />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Patient</span>
                      <span className={styles.infoValue}>
                        {selectedBill.patientName}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiCalendar />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Billing Date</span>
                      <span className={styles.infoValue}>
                        {selectedBill.date}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiCalendar />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Date Paid</span>
                      <span className={styles.infoValue}>
                        {selectedBill.datePaid}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      {getStatusIcon(selectedBill.status)}
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Status</span>
                      <span
                        className={styles.statusBadge}
                        style={getStatusStyle(selectedBill.status)}
                      >
                        {getStatusIcon(selectedBill.status)}{" "}
                        {selectedBill.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Payment Details ── */}
              <div className={styles.modalCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>
                    <FiCreditCard size={14} color="#fff" />
                  </div>
                  <h4 className={styles.cardTitle}>Payment Details</h4>
                </div>

                <div className={styles.twoCol} style={{ marginBottom: "16px" }}>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiCreditCard />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Payment Method</span>
                      <span className={styles.infoValue}>
                        {selectedBill.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>
                      <FiHash />
                    </div>
                    <div>
                      <span className={styles.infoLabel}>Reference No.</span>
                      <span
                        className={styles.infoValue}
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

                {/* Receipt collapsible */}
                <div className={styles.receiptToggleWrapper}>
                  <button
                    className={`${styles.receiptToggle} ${receiptOpen ? styles.receiptToggleOpen : ""}`}
                    onClick={() => setReceiptOpen(!receiptOpen)}
                  >
                    <span className={styles.receiptToggleLabel}>
                      View Payment Receipt
                    </span>
                    {receiptOpen ? (
                      <FiChevronUp size={18} color="#4D227C" />
                    ) : (
                      <FiChevronDown size={18} color="#4D227C" />
                    )}
                  </button>

                  {receiptOpen && (
                    <div className={styles.receiptBody}>
                      {selectedBill.status === "UNSETTLED" ||
                      selectedBill.status === "VOID" ? (
                        <div className={styles.receiptEmpty}>
                          No payment proof available
                        </div>
                      ) : (
                        <div className={styles.receiptImageWrapper}>
                          <img
                            src={samplePayment}
                            alt="Payment Receipt"
                            className={styles.receiptImage}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button
                className={styles.btnClose}
                onClick={() => setShowModal(false)}
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
