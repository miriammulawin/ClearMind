import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css"
import logo_login from "./assets/CMPS_Logo.png";


function Login() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="container-fluid vh-100 d-flex justify-content-center align-items-center bg-light ">
      <div className="card shadow-sm pt-4 pb-5 rounded-5" style={{ width: "100%", maxWidth: "800px" }}>

        <div className="d-flex justify-content-center">
          <img src={logo_login} alt="Logo" className="img-fluid" style={{ maxWidth: '553px', maxheight: 'auto' }} />
        </div>

        <div className="d-flex justify-content-center align-items-center" >
          <div style={{ maxWidth: '550px', width: '100%' }}>
            <h2 className="text-center text-color mb-4">LOG IN</h2>
        <h6 className="text-center text-color mb-4">Log in to continue your journey toward a clearer, healthier mind.</h6>

          <div className="position-relative mb-3">
            <label className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              className="form-control input-large"
              placeholder="Enter email"
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">
                Password <span className="text-danger">*</span>
            </label>
            <input
              type="password"
              className="form-control input-large"
              placeholder="Enter password"
            />
          </div>

          <div className="d-flex align-items-center">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="termsCheck"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="termsCheck">
              I agree to the <a className="clickable-text" href="/terms">Terms & Conditions.</a>
              <span className="text-danger"> *</span>
            </label>
          </div>
            
          <button className="btn btn-large rounded-4 w-100 my-3">
            LOG IN
          </button>
          </div>
        </div>
        
      </div>
    </div>
   )
}

export default Login;
