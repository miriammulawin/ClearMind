import { useState, useEffect } from "react";
import AdminSideBar from "./AdminSideBar";
import AdminTopNavbar from "./AdminTopNavbar";
import "./AdminStyle/AdminBilling.css";

function AdminBilling() {
  const [activeMenu, setActiveMenu] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    setActiveMenu("Billing");
  }, []);

  const billingData = [
    {
      id: 1,
      date: "Jan 15,2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15,2026",
    },
    {
      id: 2,
      date: "Jan 15,2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15,2026",
    },
    {
      id: 3,
      date: "Jan 15,2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15,2026",
    },
    {
      id: 4,
      date: "Jan 15,2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15,2026",
    },
    {
      id: 5,
      date: "Jan 15,2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15,2026",
    },
    {
      id: 6,
      date: "Jan 15,2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15,2026",
    },
    {
      id: 7,
      date: "Jan 15,2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15,2026",
    },
    {
      id: 8,
      date: "Jan 15,2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15,2026",
    },
    {
      id: 9,
      date: "Jan 15,2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15,2026",
    },
    {
      id: 10,
      date: "Jan 15,2026",
      patientName: "Liezel Paciente",
      amount: 1500,
      balance: 0,
      status: "CLEARED",
      datePaid: "Jan 15,2026",
    },
  ];

  const filteredData =
    filterStatus === "ALL"
      ? billingData
      : billingData.filter((item) => item.status === filterStatus);

  const totalBalance = billingData.reduce((sum, item) => sum + item.balance, 0);

  return (
    <div className="admin-layout">
      <AdminSideBar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="admin-main">
        <AdminTopNavbar activeMenu={activeMenu} />

        <div className="admin-content p-3 p-md-4">
          <div className="billing-container bg-white rounded-3 p-3 p-md-4 shadow-sm">

            <div className="d-flex justify-content-center justify-content-md-end gap-2 mb-4 flex-wrap">
              <button
                className={`btn ${filterStatus === "ALL" ? "btn-primary" : "btn-outline-secondary"} rounded-pill px-3 px-md-4 py-2 fs-6`}
                onClick={() => setFilterStatus("ALL")}
              >
                ALL
              </button>
              <button
                className={`btn ${filterStatus === "CLEARED" ? "btn-primary" : "btn-outline-secondary"} rounded-pill px-3 px-md-4 py-2 fs-6`}
                onClick={() => setFilterStatus("CLEARED")}
              >
                CLEARED
              </button>
              <button
                className={`btn ${filterStatus === "UNSETTLED" ? "btn-primary" : "btn-outline-secondary"} rounded-pill px-3 px-md-4 py-2 fs-6`}
                onClick={() => setFilterStatus("UNSETTLED")}
              >
                UNSETTLED
              </button>
              <button
                className={`btn ${filterStatus === "VOID" ? "btn-primary" : "btn-outline-secondary"} rounded-pill px-3 px-md-4 py-2 fs-6`}
                onClick={() => setFilterStatus("VOID")}
              >
                VOID
              </button>
            </div>

            {/* Billing Table */}
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th scope="col" className="text-white  fs-7 py-3 px-3">
                      Date
                    </th>
                    <th scope="col" className="text-white  fs-7 py-3 px-3">
                      Patient Name
                    </th>
                    <th scope="col" className="text-white  fs-7 py-3 px-3">
                      Amount
                    </th>
                    <th scope="col" className="text-white  fs-7 py-3 px-3">
                      Balance
                    </th>
                    <th scope="col" className="text-white  fs-7 py-3 px-3">
                      Status
                    </th>
                    <th scope="col" className="text-white  fs-7 py-3 px-3">
                      Date Paid
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className={"cursor-pointer"}>
                      <td className="py-3 px-3 fs-6">{item.date}</td>
                      <td className="py-3 px-3 fs-6">{item.patientName}</td>
                      <td className="py-3 px-3 fs-6">
                        ₱ {item.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 fs-6">₱ {item.balance}</td>
                      <td className="py-3 px-3">
                        <span className={`status ${item.status.toLowerCase()}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 fs-6">{item.datePaid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Balance */}
            <div className="d-flex justify-content-end mt-4">
              <div className="text-end">
                <span className="fw-bold me-3 fs-6">TOTAL BALANCE:</span>
                <span className="fs-5 fw-normal">
                  {totalBalance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminBilling;
