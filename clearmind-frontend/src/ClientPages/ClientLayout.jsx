import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ClientHeader from "./ClientComponents/Header";
import ClientFooter from "./ClientComponents/Footer";
import ClientAppointmentTab from "./AppointmentNavPages/AppointmentComponents/AppointmentTab";
import styles from "./ClientStyle/ClientLayout.module.css";

function ClientLayout() {
  const location = useLocation();
  const isAppointment = location.pathname.startsWith("/client/appointment");
  const [isInChat, setIsInChat] = useState(false);
  const isSchedule = location.pathname === "/client/appointment/upcoming";
  const isPending = location.pathname === "/client/appointment/pending";
  const isSessions = location.pathname === "/client/appointment/sessions";
  const isServices = location.pathname === "/client/appointment/services";
  const isHistory = location.pathname === "/client/appointment/history";
  const isPACAppointment =
    location.pathname === "/client/appointment/psychotherapy-and-counseling";
  const isPAEAppointment =
    location.pathname === "/client/appointment/psychological-assessment";
  const isBookNext =
    location.pathname === "/client/appointment/sessions/book-next";
  const isHelp = location.pathname === "/client/help";

  const [navCollapsed, setNavCollapsed] = useState(false);

  return (
    <div className={styles.pageWrapper}>
      {/* Side nav — desktop only */}
      {!isBookNext && !isInChat && (
        <div className={styles.sideNavWrapper}>
          <ClientFooter
            collapsed={navCollapsed}
            onToggle={() => setNavCollapsed((prev) => !prev)}
          />
        </div>
      )}

      {/* Right side — header + content */}
      <div className={styles.mainContent}>
        {!isBookNext && !isInChat && (
          <div className={styles.stickyHeader}>
            <ClientHeader />
            {isAppointment && <ClientAppointmentTab />}
          </div>
        )}

        <div
          className={`${styles.bodyWrapper} ${
            isSchedule ||
            isPending ||
            isSessions ||
            isServices ||
            isHistory ||
            isPACAppointment ||
            isPAEAppointment ||
            isHelp
              ? styles.noScroll
              : ""
          }`}
        >
          {/* I-pass ang setIsInChat sa Outlet via context */}
          <Outlet context={{ setIsInChat }} />
        </div>
      </div>
    </div>
  );
}

export default ClientLayout;
