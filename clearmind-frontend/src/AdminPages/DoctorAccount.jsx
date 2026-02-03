import React from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import { useNavigate } from "react-router-dom";
import "./AdminStyle/DoctorAccount.css";

function CreateAccounts() {
  const [activeMenu, setActiveMenu] = React.useState("Create Accounts");
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className="admin-content d-flex justify-content-center">
          <div className="form-card p-4 w-100" style={{ maxWidth: "900px" }}>
            <div className="d-flex justify-content-end mb-3">
              <button
                className="btn btn-outline-primary back-btn d-flex align-items-center"
                onClick={() => navigate("/create-accounts")}
              >
                BACK <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>

            <h4 className="text-purple mb-4">Personal Information</h4>

            <form>
              <div className="row g-3">
                <div className="col-md-4">
                  <label htmlFor="firstName" className="form-label">
                    First Name:
                  </label>
                  <input
                    type="text"
                    className="form-control input-violet"
                    id="firstName"
                    placeholder="Liezel"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="lastName" className="form-label">
                    Last Name:
                  </label>
                  <input
                    type="text"
                    className="form-control input-violet"
                    id="lastName"
                    placeholder="Paciente"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="mi" className="form-label">
                    M.I:
                  </label>
                  <input
                    type="text"
                    className="form-control input-violet"
                    id="mi"
                    placeholder="Talite"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="sex" className="form-label">
                    Sex:
                  </label>
                  <select className="form-select input-violet" id="sex">
                    <option value="">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label htmlFor="dob" className="form-label">
                    Date of Birth:
                  </label>
                  <input
                    type="date"
                    className="form-control input-violet"
                    id="dob"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="email" className="form-label">
                    Email Address:
                  </label>
                  <input
                    type="email"
                    className="form-control input-violet"
                    id="email"
                    placeholder="pacienteliezel@gmail.com"
                  />
                </div>

                <div className="col-md-4">
                  <label htmlFor="contact" className="form-label">
                    Contact Number:
                  </label>
                  <input
                    type="tel"
                    className="form-control input-violet"
                    id="contact"
                    placeholder="09123456234"
                  />
                </div>
              </div>

              <div className="d-flex justify-content-center mt-4">
                <button
                  type="submit"
                  className="btn btn-primary create-btn px-5"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAccounts;
