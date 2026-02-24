import { useState, useEffect, useRef, useCallback } from "react";
import { FaUserMd, FaVideo, FaHeartbeat, FaClock } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
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
  {
    label: "Promo",
    icon: <FaHeartbeat />,
    heading: "Health Packages",
    subheading: "Complete Check-up Bundles",
    description: "Annual packages starting at ₱1,500. Limited slots available.",
    cta: "See Packages",
    gradient: "linear-gradient(135deg, #c62828 0%, #ef5350 100%)",
    accentColor: "#ef9a9a",
  },
];

const AUTO_DELAY = 3500;

function HomeCarousel() {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isDragging = useRef(false);
  const autoTimer = useRef(null);

  const stopAuto = useCallback(() => {
    if (autoTimer.current) clearInterval(autoTimer.current);
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();
    autoTimer.current = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, AUTO_DELAY);
  }, [stopAuto]);

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, [startAuto, stopAuto]);

  const goTo = useCallback((idx) => {
    setCurrent((idx + SLIDES.length) % SLIDES.length);
    startAuto();
  }, [startAuto]);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
    stopAuto();
  };

  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      isDragging.current = true;
      e.preventDefault();
    }
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (isDragging.current) {
      if (dx < -40) goTo(current + 1);
      else if (dx > 40) goTo(current - 1);
      else startAuto();
    } else {
      startAuto();
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  return (
    <div className={styles.hcWrap}>
      <p className={styles.hcHeading}>
        Book an Appointment<br />with Our Specialists
      </p>

      <div className={styles.hcViewport}>
        <button className={styles.hcArrow} onClick={() => goTo(current - 1)} aria-label="Previous slide">
          <IoIosArrowBack />
        </button>

        <div
          className={styles.hcTrack}
          style={{ transform: `translateX(-${current * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
        >
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={styles.hcSlide}
              style={{ background: slide.gradient }}
            >
              <span
                className={styles.hcSlidePill}
                style={{ background: slide.accentColor }}
              >
                {slide.label}
              </span>

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
                        className={`${styles.hcDot}${d === current ? ` ${styles.hcDotActive}` : ""}`}
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

        <button className={styles.hcArrow} onClick={() => goTo(current + 1)} aria-label="Next slide">
          <IoIosArrowForward />
        </button>
      </div>
    </div>
  );
}

export default HomeCarousel;