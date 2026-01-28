import React from 'react';
import AdminSideBar from './AdminSideBar';
import AdminTopNavbar from './AdminTopNavbar';

function CreateAccounts() {
  const [activeMenu, setActiveMenu] = React.useState("Create Accounts");


  const doctors = [
    {
      name: "Liezel Paciente",
      specialization: "Psychologist",
      email: "paciente@gmail.com",
      mobile: "09123456789",
      status: true,
    },
    {
      name: "Brian Dela Cruz",
      specialization: "Psychologist",
      email: "brandelacruz@gmail.com",
      mobile: "09123456767",
      status: false,
    },
    // add more...
  ];

  return (
    <div className="admin-layout">
      <AdminSideBar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
      />

      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className="admin-content">
          {/* Header + Create Button */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0" style={{ color: "#381851", fontWeight: 700 }}>
              Doctor's Accounts
            </h3>
            <button 
              className="btn btn-primary d-flex align-items-center gap-2"
              style={{
                backgroundColor: "#005892",
                padding: "8px 16px",
                fontWeight: 500,
              }}
            >
              <span>Create</span>
              <span>+</span>
            </button>
          </div>

          {/* Table Card */}
          <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>Name</th>
                      <th>Specialization</th>
                      <th>Email Address</th>
                      <th>Mobile No.</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doctor, index) => (
                      <tr key={index}>
                        <td>{doctor.name}</td>
                        <td>{doctor.specialization}</td>
                        <td>{doctor.email}</td>
                        <td>{doctor.mobile}</td>
                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={doctor.status}
                              readOnly
                            />
                          </div>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary text-white"
                             style={{
                              backgroundColor: "#4E237C",
                              borderColor: "#4E237C",
                              padding: "8px 16px",
                              fontWeight: 500,
                            }}
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

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <small className="text-muted">
              Page 1 of 5
            </small>

            <nav aria-label="Page navigation">
              <ul className="pagination pagination-sm mb-0">
                <li className="page-item disabled">
                  <span className="page-link">Previous</span>
                </li>
                <li className="page-item active">
                  <span className="page-link">1</span>
                </li>
                <li className="page-item">
                  <span className="page-link">2</span>
                </li>
                <li className="page-item">
                  <span className="page-link">3</span>
                </li>
                <li className="page-item">
                  <span className="page-link">Next</span>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAccounts;