import { useState, useEffect, useCallback } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
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
  FiSearch,
} from "react-icons/fi";

/* ── Config ── */
const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

const getToken = () =>
  localStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("auth_token") ||
  "";

const authHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const formatTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr < 12 ? "AM" : "PM"}`;
};

/* ── Spinner ── */
function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 220,
        gap: 14,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          border: "3px solid #ede9f6",
          borderTop: "3px solid #4D227C",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: 14, color: "#9ca3af" }}>
        Loading billing records…
      </span>
    </div>
  );
}

/* ── Avatar ── */
const Avatar = ({ name, size = 48 }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const palette = [
    "#7341A8",
    "#4D227C",
    "#005892",
    "#4A965B",
    "#9333ea",
    "#0ea5e9",
  ];
  const bg = palette[name.charCodeAt(0) % palette.length];
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        border: "2.5px solid #fff",
        boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
      }}
    >
      {initials}
    </div>
  );
};

/* ── Status helpers ── */
const STATUS_MAP = {
  paid: "PAID",
  not_paid: "UNPAID",
};

const statusStyle = (s) =>
  ({
    PAID: {
      background: "#dcfce7",
      color: "#16a34a",
      border: "1px solid #bbf7d0",
    },
    UNPAID: {
      background: "#fef9c3",
      color: "#b45309",
      border: "1px solid #fde68a",
    },
    VOID: {
      background: "#fee2e2",
      color: "#dc2626",
      border: "1px solid #fecaca",
    },
  })[s] || {
    background: "#f3f4f6",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
  };

const StatusIcon = ({ s }) =>
  ({
    PAID: <FiCheckCircle size={13} />,
    UNPAID: <FiAlertCircle size={13} />,
    VOID: <FiXCircle size={13} />,
  })[s] || null;

/* ── Main ── */
export default function AdminBilling() {
  const [activeMenu, setActiveMenu] = useState("Billing");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterPayment, setFilterPayment] = useState("ALL");
  const [filterDoctor, setFilterDoctor] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  /* ── Fetch appointments ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/appointments/`, {
        method: "GET",
        headers: authHeaders(),
        credentials: "include",
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const b = await res.json();
          msg = b.message ?? b.error ?? msg;
        } catch (_) {}
        throw new Error(msg);
      }
      const body = await res.json();
      const raw = Array.isArray(body)
        ? body
        : Array.isArray(body.data)
          ? body.data
          : [];
      raw.sort(
        (a, b) => new Date(b.appointment_date) - new Date(a.appointment_date),
      );
      setAppointments(raw);
    } catch (e) {
      setError(`Failed to load billing records: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Derived data ── */
  const doctors = [
    ...new Map(appointments.map((a) => [a.doctor.id, a.doctor])).values(),
  ];
  const dates = [
    ...new Set(appointments.map((a) => a.appointment_date.slice(0, 10))),
  ]
    .sort()
    .reverse();

  const filtered = appointments.filter((a) => {
    const payStatus =
      STATUS_MAP[a.payment_status] ?? a.payment_status?.toUpperCase();
    if (filterPayment !== "ALL" && payStatus !== filterPayment) return false;
    if (filterDoctor && String(a.doctor.id) !== filterDoctor) return false;
    if (filterDate && a.appointment_date.slice(0, 10) !== filterDate)
      return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${a.patient.firstName} ${a.patient.lastName}`.toLowerCase();
      const ref = a.appointment_ref?.toLowerCase() ?? "";
      if (!name.includes(q) && !ref.includes(q)) return false;
    }
    return true;
  });

  const totalBilled = filtered.reduce(
    (s, a) => s + (parseFloat(a.bill_amount) || 0),
    0,
  );
  const collected = filtered
    .filter((a) => a.payment_status === "paid")
    .reduce((s, a) => s + (parseFloat(a.bill_amount) || 0), 0);
  const countPaid = filtered.filter((a) => a.payment_status === "paid").length;
  const countUnpaid = filtered.filter(
    (a) => a.payment_status === "not_paid",
  ).length;

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const displayed = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleView = (a) => {
    setSelected(a);
    setShowModal(true);
    setReceiptOpen(false);
  };

  const TABS = [
    { label: "All", key: "ALL", count: appointments.length },
    {
      label: "Paid",
      key: "PAID",
      count: appointments.filter((a) => a.payment_status === "paid").length,
    },
    {
      label: "Unpaid",
      key: "UNPAID",
      count: appointments.filter((a) => a.payment_status === "not_paid").length,
    },
    {
      label: "Void",
      key: "VOID",
      count: appointments.filter((a) => a.payment_status === "not_paid").length,
    },
  ];

  /* ── Styles (inline, no CSS module needed) ── */
  const S = {
    page: { display: "flex", flexDirection: "column", gap: 0 },
    card: {
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #ede9f6",
      padding: "24px 28px",
      margin: "0 0 24px",
    },
    metricsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: 14,
      marginBottom: 24,
    },
    metricBox: {
      background: "#f9f7fe",
      borderRadius: 12,
      padding: "16px 18px",
      border: "1px solid #ede9f6",
    },
    metricLabel: {
      fontSize: 12,
      color: "#9ca3af",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    metricValue: { fontSize: 22, fontWeight: 600, color: "#1f2937" },
    filterRow: {
      display: "flex",
      gap: 10,
      alignItems: "center",
      flexWrap: "wrap",
      marginBottom: 18,
    },
    select: {
      fontSize: 13,
      padding: "7px 12px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      background: "#fff",
      color: "#374151",
      cursor: "pointer",
      outline: "none",
    },
    searchWrap: { position: "relative", flex: 1, minWidth: 180 },
    searchInput: {
      width: "100%",
      fontSize: 13,
      padding: "7px 12px 7px 34px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      background: "#fff",
      color: "#374151",
      outline: "none",
      boxSizing: "border-box",
    },
    searchIcon: {
      position: "absolute",
      left: 10,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
      pointerEvents: "none",
    },
    tabsRow: { display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" },
    tab: (active) => ({
      padding: "7px 18px",
      borderRadius: 999,
      border: active ? "none" : "1px solid #e5e7eb",
      background: active ? "#4D227C" : "#fff",
      color: active ? "#fff" : "#6b7280",
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      transition: "all .15s",
    }),
    tabBadge: (active, red) => ({
      background: active
        ? "rgba(255,255,255,0.25)"
        : red
          ? "#fee2e2"
          : "#f3f4f6",
      color: active ? "#fff" : red ? "#dc2626" : "#6b7280",
      borderRadius: 999,
      padding: "1px 7px",
      fontSize: 11,
      fontWeight: 600,
    }),
    tableWrap: {
      overflowX: "auto",
      borderRadius: 10,
      border: "1px solid #f3f0fa",
    },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: {
      textAlign: "left",
      padding: "11px 14px",
      background: "#f9f7fe",
      color: "#6b7280",
      fontWeight: 600,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      borderBottom: "1px solid #ede9f6",
      whiteSpace: "nowrap",
    },
    td: {
      padding: "12px 14px",
      borderBottom: "1px solid #f5f3fb",
      color: "#374151",
      verticalAlign: "middle",
    },
    statusBadge: (s) => ({
      ...statusStyle(s),
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
    }),
    btnView: {
      padding: "6px 16px",
      background: "#4D227C",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 12,
      fontWeight: 500,
    },
    totalRow: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 10,
      padding: "14px 0 0",
      borderTop: "1px solid #f3f0fa",
      marginTop: 4,
    },
    pagination: {
      display: "flex",
      gap: 6,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 18,
      flexWrap: "wrap",
    },
    pageBtn: (active) => ({
      padding: "5px 12px",
      borderRadius: 8,
      border: active ? "none" : "1px solid #e5e7eb",
      background: active ? "#4D227C" : "#fff",
      color: active ? "#fff" : "#6b7280",
      fontSize: 13,
      cursor: active ? "default" : "pointer",
    }),
    /* Modal */
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.45)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    },
    modal: {
      background: "#fff",
      borderRadius: 18,
      width: "100%",
      maxWidth: 560,
      maxHeight: "90vh",
      overflowY: "auto",
      boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
    },
    modalHeader: {
      background: "linear-gradient(135deg, #4D227C, #7341A8)",
      padding: "22px 24px",
      borderRadius: "18px 18px 0 0",
      position: "relative",
    },
    modalHeaderRow: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      marginTop: 8,
    },
    closeBtn: {
      position: "absolute",
      top: 14,
      right: 14,
      background: "rgba(255,255,255,0.2)",
      border: "none",
      borderRadius: "50%",
      width: 30,
      height: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "#fff",
    },
    modalBody: { padding: "20px 24px" },
    modalCard: {
      background: "#f9f7fe",
      borderRadius: 12,
      padding: "16px",
      border: "1px solid #ede9f6",
      marginBottom: 14,
    },
    cardHeaderRow: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    },
    cardIconCircle: {
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: "#4D227C",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    twoCol: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginTop: 14,
    },
    infoItem: { display: "flex", alignItems: "flex-start", gap: 8 },
    infoIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      background: "#ede9f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#4D227C",
      flexShrink: 0,
      fontSize: 13,
    },
    infoLabel: {
      fontSize: 10,
      color: "#9ca3af",
      display: "block",
      textTransform: "uppercase",
      letterSpacing: "0.06em",
    },
    infoValue: { fontSize: 13, color: "#1f2937", fontWeight: 500 },
    summaryRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
    },
    divider: { height: 1, background: "#ede9f6", margin: "2px 0" },
    receiptToggle: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 14px",
      background: "#fff",
      border: "1px solid #ede9f6",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 500,
      color: "#4D227C",
    },
    receiptBody: {
      marginTop: 10,
      borderRadius: 8,
      overflow: "hidden",
      border: "1px solid #ede9f6",
    },
    modalFooter: {
      padding: "14px 24px",
      borderTop: "1px solid #f3f0fa",
      display: "flex",
      justifyContent: "flex-end",
    },
    btnClose: {
      padding: "8px 24px",
      background: "#f3f0fa",
      color: "#4D227C",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 600,
    },
    errorBanner: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: 10,
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 18,
    },
  };

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content">
          {/* ── Error ── */}
          {error && (
            <div style={S.errorBanner}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>⚠️</span>
                <span style={{ color: "#991b1b", fontSize: 13 }}>{error}</span>
              </div>
              <button
                onClick={fetchData}
                style={{
                  padding: "6px 14px",
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Metric cards ── */}
          <div style={S.metricsGrid}>
            <div style={S.metricBox}>
              <div style={S.metricLabel}>Total Billed</div>
              <div style={S.metricValue}>
                ₱
                {totalBilled.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div style={S.metricBox}>
              <div style={S.metricLabel}>Collected</div>
              <div style={{ ...S.metricValue, color: "#16a34a" }}>
                ₱
                {collected.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div style={S.metricBox}>
              <div style={S.metricLabel}>Paid</div>
              <div style={{ ...S.metricValue, color: "#16a34a" }}>
                {countPaid}
              </div>
            </div>
            <div style={S.metricBox}>
              <div style={S.metricLabel}>Unpaid</div>
              <div style={{ ...S.metricValue, color: "#b45309" }}>
                {countUnpaid}
              </div>
            </div>
          </div>

          {/* ── Main card ── */}
          <div style={S.card}>
            {/* Tabs */}
            <div style={S.tabsRow}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  style={S.tab(filterPayment === t.key)}
                  onClick={() => {
                    setFilterPayment(t.key);
                    setCurrentPage(1);
                  }}
                >
                  {t.label}
                  <span
                    style={S.tabBadge(
                      filterPayment === t.key,
                      t.key === "UNPAID",
                    )}
                  >
                    {t.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Filters */}
            <div style={S.filterRow}>
              <div style={S.searchWrap}>
                <FiSearch size={14} style={S.searchIcon} />
                <input
                  style={S.searchInput}
                  placeholder="Search patient or ref…"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <select
                style={S.select}
                value={filterDoctor}
                onChange={(e) => {
                  setFilterDoctor(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All doctors</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.firstName} {d.lastName}
                  </option>
                ))}
              </select>
              <select
                style={S.select}
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">All dates</option>
                {dates.map((d) => (
                  <option key={d} value={d}>
                    {formatDate(d)}
                  </option>
                ))}
              </select>
              {(filterDate || search || filterDoctor) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setFilterDoctor("");
                    setFilterDate("");
                    setCurrentPage(1);
                  }}
                  style={{
                    ...S.select,
                    color: "#dc2626",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FiX size={12} /> Clear
                </button>
              )}
            </div>

            {/* Table */}
            {loading ? (
              <Spinner />
            ) : (
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {[
                        "Ref",
                        "Patient",
                        "Doctor",
                        "Date & Time",
                        "Service",
                        "Bill",
                        "Payment",
                        "Status",
                        "Action",
                      ].map((h) => (
                        <th key={h} style={S.th}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.length === 0 ? (
                      <tr>
                        <td
                          colSpan={9}
                          style={{
                            ...S.td,
                            textAlign: "center",
                            color: "#9ca3af",
                            padding: "32px 0",
                          }}
                        >
                          No records found.
                        </td>
                      </tr>
                    ) : (
                      displayed.map((a) => {
                        const payStatus =
                          STATUS_MAP[a.payment_status] ?? "UNKNOWN";
                        const hasReceipt = a.receipt_urls?.length > 0;
                        return (
                          <tr
                            key={a.appointment_id}
                            style={{ transition: "background .1s" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#faf8ff")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "")
                            }
                          >
                            <td
                              style={{
                                ...S.td,
                                fontFamily: "monospace",
                                fontSize: 11,
                                color: "#9ca3af",
                              }}
                            >
                              {a.appointment_ref}
                            </td>
                            <td style={S.td}>
                              <div style={{ fontWeight: 500 }}>
                                {a.patient.full_name}
                              </div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                {a.patient.patientClassification}
                              </div>
                            </td>
                            <td style={S.td}>
                              Dr. {a.doctor.firstName} {a.doctor.lastName}
                            </td>
                            <td style={S.td}>
                              <div>{formatDate(a.appointment_date)}</div>
                              <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                {formatTime(a.start_time)} –{" "}
                                {formatTime(a.end_time)}
                              </div>
                            </td>
                            <td
                              style={{ ...S.td, fontSize: 12, maxWidth: 130 }}
                            >
                              {a.service_type || (
                                <span style={{ color: "#d1d5db" }}>—</span>
                              )}
                            </td>
                            <td style={{ ...S.td, fontWeight: 600 }}>
                              {a.bill_amount ? (
                                `₱${parseFloat(a.bill_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                              ) : (
                                <span style={{ color: "#d1d5db" }}>—</span>
                              )}
                            </td>
                            <td style={S.td}>
                              <div style={S.statusBadge(payStatus)}>
                                <StatusIcon s={payStatus} /> {payStatus}
                              </div>
                              {hasReceipt && (
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "#7341A8",
                                    marginTop: 3,
                                  }}
                                >
                                  receipt ✓
                                </div>
                              )}
                            </td>
                            <td style={S.td}>
                              <span
                                style={{
                                  ...S.statusBadge("PAID"),
                                  background: "#ede9f6",
                                  color: "#4D227C",
                                  border: "1px solid #d8d0ee",
                                }}
                              >
                                {a.status}
                              </span>
                            </td>
                            <td style={S.td}>
                              <button
                                style={S.btnView}
                                onClick={() => handleView(a)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total balance */}
            {!loading && (
              <div style={S.totalRow}>
                <span
                  style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}
                >
                  TOTAL BILLED:
                </span>
                <span
                  style={{ fontSize: 18, fontWeight: 700, color: "#4D227C" }}
                >
                  ₱
                  {totalBilled.toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div style={S.pagination}>
                <button
                  style={S.pageBtn(false)}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ‹ Prev
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    style={S.pageBtn(currentPage === i + 1)}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  style={S.pageBtn(false)}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next ›
                </button>
              </div>
            )}
            {!loading && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#9ca3af",
                  marginTop: 8,
                }}
              >
                Showing {filtered.length} appointment
                {filtered.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {showModal && selected && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={S.modalHeader}>
              <button style={S.closeBtn} onClick={() => setShowModal(false)}>
                <FiX size={16} />
              </button>
              <div style={S.modalHeaderRow}>
                <Avatar name={selected.patient.full_name} size={60} />
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                    {selected.patient.full_name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.75)",
                      marginTop: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FiCalendar size={11} />{" "}
                    {formatDate(selected.appointment_date)} ·{" "}
                    {formatTime(selected.start_time)} –{" "}
                    {formatTime(selected.end_time)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      marginTop: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    {[selected.visit_type, selected.service_type]
                      .filter(Boolean)
                      .map((c) => (
                        <span
                          key={c}
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            color: "#fff",
                            borderRadius: 999,
                            padding: "2px 10px",
                            fontSize: 11,
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    <span
                      style={{
                        background:
                          selected.payment_status === "paid"
                            ? "rgba(34,197,94,0.3)"
                            : "rgba(245,158,11,0.3)",
                        color: "#fff",
                        borderRadius: 999,
                        padding: "2px 10px",
                        fontSize: 11,
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      {STATUS_MAP[selected.payment_status] ??
                        selected.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div style={S.modalBody}>
              {/* Billing summary */}
              <div style={S.modalCard}>
                <div style={S.cardHeaderRow}>
                  <div style={S.cardIconCircle}>
                    <FiDollarSign size={14} color="#fff" />
                  </div>
                  <span
                    style={{ fontWeight: 600, fontSize: 14, color: "#1f2937" }}
                  >
                    Billing Summary
                  </span>
                </div>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    padding: "12px 16px",
                    border: "1px solid #ede9f6",
                  }}
                >
                  <div style={S.summaryRow}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>
                      Consultation Fee
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      {selected.bill_amount
                        ? `₱${parseFloat(selected.bill_amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
                        : "—"}
                    </span>
                  </div>
                  <div style={S.divider} />
                  <div style={S.summaryRow}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>
                      Payment Status
                    </span>
                    <span
                      style={{
                        ...S.statusBadge(STATUS_MAP[selected.payment_status]),
                        fontSize: 12,
                      }}
                    >
                      <StatusIcon s={STATUS_MAP[selected.payment_status]} />{" "}
                      {STATUS_MAP[selected.payment_status] ??
                        selected.payment_status}
                    </span>
                  </div>
                </div>
                <div style={S.twoCol}>
                  <div style={S.infoItem}>
                    <div style={S.infoIcon}>
                      <FiUser size={13} />
                    </div>
                    <div>
                      <span style={S.infoLabel}>Patient</span>
                      <span style={S.infoValue}>
                        {selected.patient.full_name}
                      </span>
                    </div>
                  </div>
                  <div style={S.infoItem}>
                    <div style={S.infoIcon}>
                      <FiCalendar size={13} />
                    </div>
                    <div>
                      <span style={S.infoLabel}>Appointment Date</span>
                      <span style={S.infoValue}>
                        {formatDate(selected.appointment_date)}
                      </span>
                    </div>
                  </div>
                  <div style={S.infoItem}>
                    <div style={S.infoIcon}>
                      <FiUser size={13} />
                    </div>
                    <div>
                      <span style={S.infoLabel}>Doctor</span>
                      <span style={S.infoValue}>
                        Dr. {selected.doctor.firstName}{" "}
                        {selected.doctor.lastName}
                      </span>
                    </div>
                  </div>
                  <div style={S.infoItem}>
                    <div style={S.infoIcon}>
                      <FiHash size={13} />
                    </div>
                    <div>
                      <span style={S.infoLabel}>Ref No.</span>
                      <span
                        style={{
                          ...S.infoValue,
                          fontFamily: "monospace",
                          fontSize: 12,
                        }}
                      >
                        {selected.appointment_ref}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment details */}
              <div style={S.modalCard}>
                <div style={S.cardHeaderRow}>
                  <div style={S.cardIconCircle}>
                    <FiCreditCard size={14} color="#fff" />
                  </div>
                  <span
                    style={{ fontWeight: 600, fontSize: 14, color: "#1f2937" }}
                  >
                    Payment Details
                  </span>
                </div>
                <div style={S.twoCol}>
                  <div style={S.infoItem}>
                    <div style={S.infoIcon}>
                      <FiCreditCard size={13} />
                    </div>
                    <div>
                      <span style={S.infoLabel}>Payment Reference</span>
                      <span
                        style={{
                          ...S.infoValue,
                          fontFamily: "monospace",
                          fontSize: 12,
                        }}
                      >
                        {selected.payment_reference || "—"}
                      </span>
                    </div>
                  </div>
                  <div style={S.infoItem}>
                    <div style={S.infoIcon}>
                      <FiHash size={13} />
                    </div>
                    <div>
                      <span style={S.infoLabel}>Visit Type</span>
                      <span style={S.infoValue}>
                        {selected.visit_type || "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Receipt toggle */}
                <div style={{ marginTop: 14 }}>
                  <button
                    style={S.receiptToggle}
                    onClick={() => setReceiptOpen(!receiptOpen)}
                  >
                    <span>View Payment Receipt</span>
                    {receiptOpen ? (
                      <FiChevronUp size={18} color="#4D227C" />
                    ) : (
                      <FiChevronDown size={18} color="#4D227C" />
                    )}
                  </button>
                  {receiptOpen && (
                    <div style={S.receiptBody}>
                      {selected.receipt_urls?.length > 0 ? (
                        selected.receipt_urls.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            alt={`Receipt ${i + 1}`}
                            style={{ width: "100%", display: "block" }}
                          />
                        ))
                      ) : (
                        <div
                          style={{
                            padding: "24px",
                            textAlign: "center",
                            color: "#9ca3af",
                            fontSize: 13,
                          }}
                        >
                          No payment receipt uploaded.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={S.modalFooter}>
              <button style={S.btnClose} onClick={() => setShowModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
