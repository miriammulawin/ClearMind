import React from 'react';
import AdminSideBar from './AdminSideBar';
import AdminTopNavbar from './AdminTopNavbar';  

function CreateAccounts() {

  const [activeMenu, setActiveMenu] = React.useState("Create Accounts");

  return (
    <div className="admin-layout">
      <AdminSideBar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu} 
      />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />
        <div className="admin-content">
          <h3 className='doctor-text'>Doctor's Account</h3>
          <div style={{ marginTop: '2rem' }}>
            <p>This is where your account creation form will go...</p>
        
            <div className="card p-4 mt-4 shadow-m">
              <h4>New Doctor / Staff Account</h4>
              <div className="row mt-3">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" placeholder="Juan Dela Cruz" />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="example@clinic.com" />
                </div>
              </div>
              <button className="btn btn-primary mt-3">Create Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateAccounts;