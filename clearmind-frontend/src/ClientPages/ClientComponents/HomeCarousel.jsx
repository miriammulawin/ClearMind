import { useState, useEffect, useRef, useCallback } from "react";
import { FaUserMd, FaVideo, FaHeartbeat, FaClock } from "react-icons/fa";
import styles from "../ClientStyle/ClientHome.module.css";

const SLIDES = [
  {
    label: "New",
    icon: <FaUserMd />,
    heading: "Book an Appointment",
    subheading: "with Our Specialists",
    description: "Connect with top-rated doctors at your convenience.",
    cta: "Book Now",
    gradient: "linear-gradient(135deg, #542982 0%, #8a4fcf 100%)",
    accentColor: "#c3a6e8",
  },
  {
    label: "Available",
    icon: <FaVideo />,
    heading: "Teleconsult",
    subheading: "from the Comfort of Home",
    description: "Skip the commute. See a doctor via secure video call.",
    cta: "Start Teleconsult",
    gradient: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
    accentColor: "#90caf9",
  },
  {
    label: "Mon – Sat",
    icon: <FaClock />,
    heading: "Walk-in Clinic",
    subheading: "Open 8 AM – 5 PM",
    description: "No appointment needed for general consultations.",
    cta: "View Branches",
    gradient: "linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)",
    accentColor: "#a5d6a7",
  },
];

const AUTO_DELAY = 4000;

function HomeCarousel() {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isHoriz = useRef(false);
  const mouseStartX = useRef(null);
  const autoTimer = useRef(null);

  const stopAuto = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    autoTimer.current = setInterval(
      () => setCurrent((c) => (c + 1) % SLIDES.length),
      AUTO_DELAY
    );
  }, [stopAuto]);

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [startAuto, stopAuto]);

  const goTo = useCallback(
    (idx) => {
      setCurrent((idx + SLIDES.length) % SLIDES.length);
      startAuto();
    },
    [startAuto]
  );

  /* ── Touch ── */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isHoriz.current = false;
    setDragOffset(0);
    stopAuto();
  };

  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (!isHoriz.current && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
      isHoriz.current = true;
    }
    if (isHoriz.current) {
      e.preventDefault();
      setIsDragging(true);
      setDragOffset(dx);
    }
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (isHoriz.current) {
      if (dx < -50) goTo(current + 1);
      else if (dx > 50) goTo(current - 1);
      else startAuto();
    } else {
      startAuto();
    }
    setIsDragging(false);
    setDragOffset(0);
    touchStartX.current = null;
    isHoriz.current = false;
  };

  /* ── Mouse drag ── */
  const onMouseDown = (e) => {
    mouseStartX.current = e.clientX;
    setDragOffset(0);
    stopAuto();
  };

  const onMouseMove = (e) => {
    if (mouseStartX.current === null) return;
    const dx = e.clientX - mouseStartX.current;
    if (Math.abs(dx) > 6) {
      setIsDragging(true);
      setDragOffset(dx);
    }
  };

  const endMouse = (clientX) => {
    if (mouseStartX.current === null) return;
    const dx = clientX - mouseStartX.current;
    if (Math.abs(dx) > 50) {
      dx < 0 ? goTo(current + 1) : goTo(current - 1);
    } else {
      startAuto();
    }
    setIsDragging(false);
    setDragOffset(0);
    mouseStartX.current = null;
  };

  return (
    <div className={styles.hcWrap}>
      {/* overflow:hidden clips the other slides */}
      <div className={styles.hcViewport}>
        <div
          className={styles.hcTrack}
          style={{
            /* each slide is 100% wide, so slide N starts at N*100% */
            transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))`,
            transition: isDragging
              ? "none"
              : "transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1)",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={(e) => endMouse(e.clientX)}
          onMouseLeave={(e) => endMouse(e.clientX)}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={styles.hcSlide}
              style={{ background: slide.gradient }}
            >
              <div className={styles.hcSlideCircle} />

              <span className={styles.hcSlidePill}>{slide.label}</span>

              <div className={styles.hcSlideIcon}>{slide.icon}</div>

              <div className={styles.hcSlideText}>
                <p className={styles.hcSlideHeading}>{slide.heading}</p>
                <p className={styles.hcSlideSubheading}>{slide.subheading}</p>
                <p className={styles.hcSlideDesc}>{slide.description}</p>
              </div>

              <button
                className={styles.hcSlideCta}
                style={{ borderColor: slide.accentColor, color: slide.accentColor }}
              >
                {slide.cta}
              </button>

              {i === current && (
                <div className={styles.hcSlideOverlay}>
                  <div className={styles.hcDots}>
                    {SLIDES.map((_, d) => (
                      <button
                        key={d}
                        className={`${styles.hcDot} ${d === current ? styles.hcDotActive : ""}`}
                        onClick={(e) => { e.stopPropagation(); goTo(d); }}
                      />
                    ))}
                  </div>
                  <div className={styles.hcProgress}>
                    <div key={current} className={styles.hcProgressBar} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HomeCarousel;