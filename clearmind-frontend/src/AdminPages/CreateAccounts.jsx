import React from 'react';
import AdminSideBar from './AdminSideBar';
import AdminTopNavbar from './AdminTopNavbar';
import { useNavigate } from 'react-router-dom';

function CreateAccounts() {
  const [activeMenu, setActiveMenu] = React.useState('Create Accounts');
  const navigate = useNavigate();

  return (
    <div className="admin-layout">
      <AdminSideBar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className="admin-content d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="doctor-text text-black">Doctor&apos;s Account</h3>

            <button
              className="btn btn-primary text-white px-3 p-3"
              style={{
                backgroundColor: '#005892',
                border: 'none',
              }}
              onClick={() => navigate('/create-doctors')}
            >
            
              Create 
          <i class="bi bi-plus-lg px-2"></i>
            </button>
          </div>

          {/* Table Content */}
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <td>#</td>
                <td>Name</td>
                <td>Specialization</td>
                <td>Email Address</td>
                <td>Mobile No.</td>
                <td>Status</td>
                <td>Actions</td>
              </tr>
            </thead>

            <tbody>
              <tr>
                <th scope="row">1</th>
                <th>Liezel Paciente</th>
                <th>Psychologist</th>
                <th>paciente@gmail.com</th>
                <th>09123456767</th>
                <th>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                    />
                  </div>
                </th>
                <th>
                  <button
                    className="btn btn-primary px-4"
                    style={{ backgroundColor: '#7341A8' }}
                  >
                    View
                  </button>
                </th>
              </tr>

              <tr>
                <th scope="row">2</th>
                <th>Brian Dela Cruz</th>
                <th>Psychologist</th>
                <th>briandelacruz@gmail.com</th>
                <th>09123456767</th>
                <th>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                    />
                  </div>
                </th>
                <th>
                  <button
                    className="btn btn-primary px-4"
                    style={{ backgroundColor: '#7341A8' }}
                  >
                    View
                  </button>
                </th>
              </tr>
            </tbody>
          </table>

          {/* Pagination */}
          <nav className="mt-auto">
            <div className="d-flex align-items-center position-relative">
              <p className="mb-0" style={{ color: '#4D227C' }}>
                Page 1 of 3
              </p>

              <ul className="pagination justify-content-center mx-auto mb-0">
                <li className="page-item">
                  <i className="bi bi-arrow-left-short" />
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">1</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">2</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">3</a>
                </li>
                <li className="page-item">
                  <a className="page-link" href="#">Next</a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default CreateAccounts;
