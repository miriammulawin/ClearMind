import styles from "./ClientStyle/ClientHome.module.css";
import ClientHeader from "./ClientComponents/Header.jsx";
import ClientFooter from "./ClientComponents/Footer.jsx";
import ProfessionalsSection from "./ClientComponents/ProfessionalsSection.jsx";
import Announcements from "./ClientComponents/Announcements.jsx";
import NextAppointment from "./ClientComponents/NextAppointment.jsx";

function ClientHome() {
  return (
    <div className={styles.pageWrapper}>

      <div className={styles.stickyHeader}>
        <ClientHeader />
      </div>

      <div className={styles.bodyWrapper}>
        <ProfessionalsSection />
        <Announcements />
        <NextAppointment />
      </div>

      <div className={styles.stickyFooter}>
        <ClientFooter />
      </div>

    </div>
  );
}

export default ClientHome;