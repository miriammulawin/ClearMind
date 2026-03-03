import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminPatient.css";
import { FiX } from "react-icons/fi";
import axiosClient from "../axiosClient";
import toast from "react-hot-toast";

function AdminPatient() {
  const [activeMenu, setActiveMenu]           = useState("Patients");
  const [activeTab, setActiveTab]             = useState("consultation");
  const [currentPage, setCurrentPage]         = useState(1);
  const [lastPage, setLastPage]               = useState(1);
  const [loading, setLoading]                 = useState(false);
  const [showModal, setShowModal]             = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalLoading, setModalLoading]       = useState(false);
  const [zoomImage, setZoomImage]             = useState(null);

  const [consultations, setConsultations]     = useState([]);
  const [patients, setPatients]               = useState([]);
  const [consultTotal, setConsultTotal]       = useState(0);
  const [patientsTotal, setPatientsTotal]     = useState(0);

  // ── Search state ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]         = useState("");
  const [isSearchMode, setIsSearchMode]       = useState(false);
  const [searchResults, setSearchResults]     = useState([]);
  const [searchTotal, setSearchTotal]         = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  // ── Read ?q= from URL on mount / URL change ──────────────────────
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    if (q) {
      setSearchQuery(q);
      setIsSearchMode(true);
      fetchSearch(q, 1);
    } else {
      setIsSearchMode(false);
      setSearchQuery("");
      fetchData(1, activeTab);
      // Pre-fetch tab totals
      axiosClient.get("/admin/patients?page=1").then((r) => setPatientsTotal(r.data.total));
      axiosClient.get("/admin/patients/consultations?page=1").then((r) => setConsultTotal(r.data.total));
    }
  }, [location.search]);

  // ── Fetch normal tab data ────────────────────────────────────────
  const fetchData = async (page = 1, tab = activeTab) => {
    setLoading(true);
    try {
      const endpoint = tab === "consultation"
        ? `/admin/patients/consultations?page=${page}`
        : `/admin/patients?page=${page}`;

      const res = await axiosClient.get(endpoint);
      const { data, last_page, total } = res.data;

      if (tab === "consultation") {
        setConsultations(data);
        setConsultTotal(total);
      } else {
        setPatients(data);
        setPatientsTotal(total);
      }

      setLastPage(last_page);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch:", err);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch search results ─────────────────────────────────────────
  const fetchSearch = async (q, page = 1) => {
    setLoading(true);
    try {
      const res = await axiosClient.get(`/admin/patients/search?q=${encodeURIComponent(q)}&page=${page}`);
      const { data, last_page, total } = res.data;
      setSearchResults(data);
      setSearchTotal(total);
      setLastPage(last_page);
      setCurrentPage(page);
    } catch (err) {
      console.error("Search failed:", err);
      toast.error("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  // ── Clear search → go back to normal view ───────────────────────
  const clearSearch = () => {
    navigate("/admin/patients");
  };

  // ── Switch tab ───────────────────────────────────────────────────
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    fetchData(1, tab);
  };

  // ── Pagination handler ───────────────────────────────────────────
  const handlePageChange = (page) => {
    if (isSearchMode) {
      fetchSearch(searchQuery, page);
    } else {
      fetchData(page, activeTab);
    }
  };

  // ── View single appointment ──────────────────────────────────────
  const handleView = async (row) => {
    setShowModal(true);
    setModalLoading(true);
    try {
      const res = await axiosClient.get(`/admin/patients/${row.id}`);
      setSelectedPatient(res.data);
    } catch (err) {
      toast.error("Failed to load patient details.");
      setShowModal(false);
    } finally {
      setModalLoading(false);
    }
  };

  // ── Confirm ──────────────────────────────────────────────────────
  const handleConfirm = async (id) => {
    try {
      await axiosClient.patch(`/admin/patients/${id}/confirm`);
      toast.success("Appointment confirmed!");
      isSearchMode ? fetchSearch(searchQuery, currentPage) : fetchData(currentPage, activeTab);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to confirm.");
    }
  };

  // ── Complete ─────────────────────────────────────────────────────
  const handleComplete = async (id) => {
    try {
      await axiosClient.patch(`/admin/patients/${id}/complete`);
      toast.success("Appointment marked as completed!");
      isSearchMode ? fetchSearch(searchQuery, currentPage) : fetchData(currentPage, activeTab);
      if (selectedPatient?.id === id) {
        setSelectedPatient((prev) => ({ ...prev, status: "Completed" }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete.");
    }
  };

  // ── Smart pagination ─────────────────────────────────────────────
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;
    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > delta + 2) pages.push("...");
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(lastPage - 1, currentPage + delta);
      i++
    ) { pages.push(i); }
    if (currentPage < lastPage - delta - 1) pages.push("...");
    pages.push(lastPage);
    return pages;
  };

  const displayedData = isSearchMode
    ? searchResults
    : activeTab === "consultation" ? consultations : patients;

  return (
    <div className="admin-layout">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content" style={{ padding: "20px" }}>
          <div className="patient-card">

            {/* ── Search Result Banner ───────────────────────────── */}
            {isSearchMode && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "#f3eafd", borderRadius: "10px", padding: "10px 16px",
                marginBottom: "12px", fontSize: "14px", color: "#4D227C",
              }}>
                <span>
                  Showing <strong>{searchTotal}</strong> result{searchTotal !== 1 ? "s" : ""} for&nbsp;
                  <strong>"{searchQuery}"</strong>
                </span>
                <button
                  onClick={clearSearch}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#4D227C", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600" }}
                >
                  <FiX /> Clear search
                </button>
              </div>
            )}

            {/* ── Tabs (hidden in search mode) ───────────────────── */}
            {!isSearchMode && (
              <div className="patient-tabs">
                <button
                  className={activeTab === "patients" ? "tab-active" : ""}
                  onClick={() => handleTabSwitch("patients")}
                >
                  Total's Patients <span>{patientsTotal}</span>
                </button>
                <button
                  className={activeTab === "consultation" ? "tab-active" : ""}
                  onClick={() => handleTabSwitch("consultation")}
                >
                  Consultation Request <span>{consultTotal}</span>
                </button>
              </div>
            )}

            {/* ── Table ──────────────────────────────────────────── */}
            <div className="patient-table-wrapper">
              {loading ? (
                <p className="text-center py-4">Loading...</p>
              ) : (
                <table className="patient-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Date of Appointment</th>
                      <th>Time</th>
                      <th>Visit Type</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedData.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "20px", color: "#888" }}>
                          {isSearchMode ? `No results found for "${searchQuery}".` : "No records found."}
                        </td>
                      </tr>
                    ) : (
                      displayedData.map((row) => (
                        <tr key={row.id}>
                          <td>{row.name}</td>
                          <td>{row.date}</td>
                          <td>{row.time}</td>
                          <td>{row.type}</td>
                          <td>
                            <span className={`status ${row.status.toLowerCase()}`}>
                              {row.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn-view" onClick={() => handleView(row)}>
                              View
                            </button>
                            {/* In search mode show both buttons based on status */}
                            {isSearchMode ? (
                              row.status === "Pending" ? (
                                <button className="btn-confirm" onClick={() => handleConfirm(row.id)}>
                                  Confirm
                                </button>
                              ) : (
                                <button
                                  className="btn-completed"
                                  disabled={row.status === "Completed"}
                                  onClick={() => handleComplete(row.id)}
                                >
                                  Completed
                                </button>
                              )
                            ) : activeTab === "patients" ? (
                              <button
                                className="btn-completed"
                                disabled={row.status === "Completed"}
                                onClick={() => handleComplete(row.id)}
                              >
                                Completed
                              </button>
                            ) : (
                              <button className="btn-confirm" onClick={() => handleConfirm(row.id)}>
                                Confirm
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── Pagination ─────────────────────────────────────── */}
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                ‹ Previous
              </button>
              {getPageNumbers().map((n, i) =>
                n === "..." ? (
                  <span key={`dots-${i}`} style={{ padding: "0 6px", alignSelf: "center", color: "#574a65" }}>...</span>
                ) : (
                  <button
                    key={n}
                    className={currentPage === n ? "page-active" : ""}
                    onClick={() => handlePageChange(n)}
                  >
                    {n}
                  </button>
                )
              )}
              <button disabled={currentPage === lastPage} onClick={() => handlePageChange(currentPage + 1)}>
                Next ›
              </button>
            </div>
            <div className="page-info">Page {currentPage} of {lastPage}</div>

          </div>
        </div>
      </div>

      {/* ── Patient Details Modal ───────────────────────────────────── */}
      {showModal && (
        <div className="patient-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="patient-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Patient Details</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                {selectedPatient && <span className="modal-date">{selectedPatient.date}</span>}
                <button
                  className="close-btn"
                  onClick={() => setShowModal(false)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "20px", display: "flex", alignItems: "center" }}
                >
                  <FiX />
                </button>
              </div>
            </div>

            <div className="modal-body">
              {modalLoading ? (
                <p className="text-center py-4">Loading details...</p>
              ) : selectedPatient ? (
                <div className="modal-section" style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: "300px" }}>
                    <h4>Patient Information</h4>
                    <p><strong>Name:</strong> {selectedPatient.name}</p>
                    <p><strong>Contact Number:</strong> {selectedPatient.contact}</p>
                    <p><strong>Email:</strong> {selectedPatient.email}</p>
                    <p><strong>Address:</strong> {selectedPatient.address ?? "—"}</p>
                    <h4 style={{ marginTop: "40px" }}>Appointment Details</h4>
                    <p><strong>Date:</strong> {selectedPatient.date}</p>
                    <p><strong>Time:</strong> {selectedPatient.time}</p>
                    <p><strong>Visit Type:</strong> {selectedPatient.type}</p>
                    <p><strong>Status:</strong> {selectedPatient.status}</p>
                  </div>
                  <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: "200px", borderRight: "1px solid #e5d6f5", paddingRight: "20px" }}>
                      <h4>Payment Details</h4>
                      <p><strong>Paid Amount:</strong> {selectedPatient.payment?.paid_amount ?? "—"}</p>
                      <p><strong>Reference No:</strong> {selectedPatient.payment?.reference_no ?? "—"}</p>
                      <p><strong>Payment Option:</strong> {selectedPatient.payment?.payment_option ?? "—"}</p>
                    </div>
                    <div style={{ flex: 1, minWidth: "200px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                      {selectedPatient.payment?.payment_proof ? (
                        <img
                          src={selectedPatient.payment.payment_proof}
                          alt="Payment Proof"
                          style={{ width: "100%", maxHeight: "250px", borderRadius: "8px", objectFit: "cover", cursor: "pointer" }}
                          onClick={() => setZoomImage(selectedPatient.payment.payment_proof)}
                        />
                      ) : (
                        <div style={{ color: "#aaa", fontSize: "14px", textAlign: "center" }}>No payment proof uploaded.</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="modal-footer">
              <button
                className="btn-completed"
                disabled={!selectedPatient || selectedPatient.status === "Completed"}
                onClick={() => selectedPatient && handleComplete(selectedPatient.id)}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Zoom Image ─────────────────────────────────────────────── */}
      {zoomImage && (
        <div className="patient-modal-overlay" onClick={() => setZoomImage(null)} style={{ cursor: "zoom-out" }}>
          <div style={{ maxWidth: "90%", maxHeight: "90%", display: "flex", justifyContent: "center", alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomImage}
              alt="Zoomed Payment Proof"
              style={{ maxWidth: "100%", maxHeight: "90vh", objectFit: "contain", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPatient;