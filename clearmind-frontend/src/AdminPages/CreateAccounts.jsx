import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/CreateAccount.css";
import { FiX } from "react-icons/fi";
import toast from "react-hot-toast";

function CreateAccounts() {
  const [activeMenu, setActiveMenu] = useState("Create Accounts");
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [togglingDoctor, setTogglingDoctor] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    sex: "",
    birthdate: "",
    email: "",
    contactNumber: "",
    specialization: ""
  });

  // Inline errors
  const [errors, setErrors] = useState({});

  // Fetch doctors
  const fetchDoctors = () => {
    axios
      .get("http://localhost/ClearMind/clearmind-backend/get_doctor_acc.php")
      .then((res) => {
        if (res.data.status === "success") setDoctors(res.data.data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Real-time validation for email and contact
    if (e.target.name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setErrors((prev) => ({
        ...prev,
        email: !emailRegex.test(e.target.value)
          ? "Invalid email format"
          : ""
      }));
    }

    if (e.target.name === "contactNumber") {
      const phoneRegex = /^09\d{9}$/;
      setErrors((prev) => ({
        ...prev,
        contactNumber: !phoneRegex.test(e.target.value)
          ? "Contact must start with 09 and be 11 digits"
          : ""
      }));
    }

    // Clear other errors while typing
    if (!["email", "contactNumber"].includes(e.target.name)) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      middleInitial: "",
      sex: "",
      birthdate: "",
      email: "",
      contactNumber: "",
      specialization: ""
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // Basic empty validation
    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) newErrors[key] = "This field is required";
    });

    // Additional validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^09\d{9}$/;

    if (formData.email && !emailRegex.test(formData.email))
      newErrors.email = "Invalid email format";

    if (formData.contactNumber && !phoneRegex.test(formData.contactNumber))
      newErrors.contactNumber = "Contact must start with 09 and be 11 digits";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTimeout(() => setErrors({}), 1500);
      return;
    }

    // React-hot-toast confirmation at bottom-right
    toast(
      (t) => (
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: "0 0 15px 0", fontWeight: 600, fontSize: "1rem" }}>
            Are you sure?
          </p>
          <p style={{ margin: "0 0 20px 0", fontSize: "0.9rem", color: "#666" }}>
            Do you want to create this doctor account?
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => {
                toast.dismiss(t.id);
              }}
              style={{
                padding: "8px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                createDoctorAccount();
              }}
              style={{
                padding: "8px 20px",
                backgroundColor: "#7C3AED",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Yes, create it!
            </button>
          </div>
        </div>
      ),
      {
        duration: 500,
        position: "bottom-right",
        style: {
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          minWidth: "350px",
        },
      }
    );
  };

  const createDoctorAccount = () => {
    setLoading(true);

    axios
      .post(
        "http://localhost/ClearMind/clearmind-backend/create_acc_doctors.php",
        formData
      )
      .then((res) => {
        setLoading(false);
        if (res.data.status === "success") {
          toast.success("Doctor Account Created Successfully!", {
            duration: 500,
            position: "top-center",
            style: {
              background: "#E2F7E3",
              border: "1px solid #91C793",
              color: "#2E7D32",
              fontWeight: 600,
              fontSize: "0.95rem",
              textAlign: "center",
              maxWidth: "320px",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
            },
            iconTheme: {
              primary: "#2E7D32",
              secondary: "#E2F7E3",
            },
          });
          setShowDoctorModal(false);
          resetForm();
          fetchDoctors();
        } else {
          toast.error(res.data.message || "Something went wrong", {
            duration: 500,
            position: "top-center",
            style: {
              background: "#FFEBEE",
              border: "1px solid #EF5350",
              color: "#C62828",
              fontWeight: 600,
              fontSize: "0.95rem",
              textAlign: "center",
              maxWidth: "320px",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
            },
            iconTheme: {
              primary: "#C62828",
              secondary: "#FFEBEE",
            },
          });
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Failed to create doctor account", {
          duration: 500,
          position: "top-center",
          style: {
            background: "#FFEBEE",
            border: "1px solid #EF5350",
            color: "#C62828",
            fontWeight: 600,
            fontSize: "0.95rem",
            textAlign: "center",
            maxWidth: "320px",
            borderRadius: "10px",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
          },
          iconTheme: {
            primary: "#C62828",
            secondary: "#FFEBEE",
          },
        });
        console.error(err);
      });
  };

  // Handle toggle status with confirmation
  const handleToggleStatus = (doctorId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    toast(
      (t) => (
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: "0 0 15px 0", fontWeight: 600, fontSize: "1rem" }}>
            {newStatus === 'inactive' ? "Inactive Doctor?" : "Active Doctor?"}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                padding: "8px 20px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                updateDoctorStatus(doctorId, newStatus);
              }}
              style={{
                padding: "8px 20px",
                backgroundColor: "#7C3AED",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      ),
      {
        duration: 1500,
        position: "bottom-right",
        style: {
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          minWidth: "350px",
        },
      }
    );
  };

  // Update doctor status
  const updateDoctorStatus = async (doctorId, newStatus) => {
    setTogglingDoctor(doctorId);
    
    try {
      const res = await axios.post(
        "http://localhost/ClearMind/clearmind-backend/update_doctor_status.php",
        { 
          doctors_id: doctorId, 
          status: newStatus 
        }
      );
      
      if (res.data.status === "success") {
        toast.success(
          newStatus === 'active' ? "Doctor Active!" : "Doctor Inactive!",
          {
            duration: 1500,
            position: "top-center",
            style: {
              background: "#E2F7E3",
              border: "1px solid #91C793",
              color: "#2E7D32",
              fontWeight: 600,
              fontSize: "0.95rem",
              textAlign: "center",
              maxWidth: "320px",
              borderRadius: "10px",
              boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
            },
            iconTheme: {
              primary: "#2E7D32",
              secondary: "#E2F7E3",
            },
          }
        );
        fetchDoctors();
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to update status", {
        duration: 500,
        position: "top-center",
        style: {
          background: "#FFEBEE",
          border: "1px solid #EF5350",
          color: "#C62828",
          fontWeight: 600,
          fontSize: "0.95rem",
          textAlign: "center",
          maxWidth: "320px",
          borderRadius: "10px",
          boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
        },
        iconTheme: {
          primary: "#C62828",
          secondary: "#FFEBEE",
        },
      });
      console.error(err);
    } finally {
      setTogglingDoctor(null);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content create-accounts-page">
          <div className="create-accounts-header">
            <h3 className="create-accounts-title">Doctor&apos;s Account</h3>
            <button
              className="create-btn"
              onClick={() => setShowDoctorModal(true)}
            >
              Create <i className="bi bi-plus-lg" />
            </button>
          </div>

          <div className="create-accounts-card">
            <table className="create-accounts-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Email Address</th>
                  <th>Mobile No.</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length > 0 ? (
                  doctors.map((doc, index) => (
                    <tr key={doc.doctors_id}>
                      <td>{index + 1}</td>
                      <td>{`${doc.first_name} ${doc.middle_initial} ${doc.last_name}`}</td>
                      <td>{doc.specialization}</td>
                      <td>{doc.email_address}</td>
                      <td>{doc.phone}</td>
                      <td>
                        <div className="status-switch form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={doc.status === 'active'}
                            onChange={() => handleToggleStatus(doc.doctors_id, doc.status)}
                            disabled={togglingDoctor === doc.doctors_id}
                          />
                        </div>
                      </td>
                      <td>
                        <button className="view-btn">View</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>
                      No doctors found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Doctor Modal */}
      {showDoctorModal && (
        <div
          className="doctor-modal-overlay"
          onClick={() => {
            setShowDoctorModal(false);
            resetForm();
          }}
        >
          <div
            className="doctor-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="doctor-modal-header">
              <h2>Create Doctor Account</h2>
              <button
                className="doctor-close-btn"
                onClick={() => {
                  setShowDoctorModal(false);
                  resetForm();
                }}
              >
                <FiX />
              </button>
            </div>

            <div className="doctor-modal-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">

<div className="col-md-4">
  <label className="form-label">First Name</label>
  <input
    type="text"
    name="firstName"
    value={formData.firstName}
    onChange={handleChange}
    placeholder="Enter first name"
    className="form-control input-violet"
  />
</div>

<div className="col-md-4">
  <label className="form-label">Last Name</label>
  <input
    type="text"
    name="lastName"
    value={formData.lastName}
    onChange={handleChange}
    placeholder="Enter last name"
    className="form-control input-violet"
  />
</div>

<div className="col-md-4">
  <label className="form-label">M.I</label>
  <input
    type="text"
    name="middleInitial"
    value={formData.middleInitial}
    onChange={handleChange}
    placeholder="Enter middle initial"
    className="form-control input-violet"
  />
</div>

<div className="col-md-4">
  <label className="form-label">Sex</label>
  <select
    name="sex"
    value={formData.sex}
    onChange={handleChange}
    className="form-select input-violet"
  >
    <option value="">Select Sex</option>
    <option value="Female">Female</option>
    <option value="Male">Male</option>
  </select>
</div>

<div className="col-md-4">
  <label className="form-label">Date of Birth</label>
  <input
    type="date"
    name="birthdate"
    value={formData.birthdate}
    onChange={handleChange}
    placeholder="Select birthdate"
    className="form-control input-violet"
  />
</div>

<div className="col-md-4">
  <label className="form-label">Email Address</label>
  <input
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    placeholder="Enter email address"
    className="form-control input-violet"
  />
</div>

<div className="col-md-6">
  <label className="form-label">Contact Number</label>
  <input
    type="tel"
    name="contactNumber"
    value={formData.contactNumber}
    onChange={handleChange}
    placeholder="(09XXXXXXXXX)"
    className="form-control input-violet"
  />
</div>

<div className="col-md-6">
  <label className="form-label">Specialization</label>
  <input
    type="text"
    name="specialization"
    value={formData.specialization}
    onChange={handleChange}
    placeholder="Enter specialization"
    className="form-control input-violet"
  />
</div>

                </div>

                {/* Error Messages Section */}
                {Object.keys(errors).length > 0 && (
                  <div style={{ marginTop: "16px", textAlign: "center" }}>
                    {Object.entries(errors).map(([field, message]) => (
                      message && (
                        <small key={field} style={{ color: "red", display: "block", fontSize: "14px" }}>
                          {message}
                        </small>
                      )
                    ))}
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDoctorModal(false);
                      resetForm();
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary create-btn"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateAccounts;