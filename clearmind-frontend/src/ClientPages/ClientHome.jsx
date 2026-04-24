import styles from "./ClientStyle/ClientHome.module.css";
import ClientHeader from "../ClientPages/ClientComponents/Header.jsx";
import ClientFooter from "../ClientPages/ClientComponents/Footer.jsx";
import ProfessionalsSection from "../ClientPages/ClientComponents/ProfessionalsSection";
import Announcements from "../ClientPages/ClientComponents/Announcements";
import NextAppointment from "../ClientPages/ClientComponents/NextAppointment";

function ClientHome() {
  return (
    <div className={styles.bodyWrapper}>
      <ProfessionalsSection />
      <Announcements />
      <NextAppointment />
    </div>
  );
}

export default ClientHome;
