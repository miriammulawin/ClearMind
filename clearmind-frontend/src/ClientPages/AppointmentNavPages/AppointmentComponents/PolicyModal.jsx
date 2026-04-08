import React, { useState, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import styles from "./styles/PolicyModal.module.css";

/**
 * PolicyModal — Versatile reusable modal for policy/declaration content.
 *
 * Props:
 * ─────────────────────────────────────────────────────────────────
 * show            {bool}     — controls visibility
 * onHide          {func}     — called when modal should close
 * onConfirm       {func}     — called when user clicks the confirm button
 *
 * headerTitle     {string}   — bold title in the purple header bar
 * headerSubtitle  {string}   — muted subtitle under the header title
 *
 * sections        {array}    — array of content section objects (see below)
 * radioLabel      {string}   — label text next to the radio/checkbox acknowledgement
 * requireScroll   {bool}     — if true, confirm button is locked until user scrolls to bottom
 *
 * cancelLabel     {string}   — label for the cancel/back button (default: "Cancel")
 * confirmLabel    {string}   — label for the confirm button (default: "Continue")
 *
 * size            {string}   — Bootstrap modal size: "sm" | "md" | "lg" (default: "md")
 *
 * ─────────────────────────────────────────────────────────────────
 * Section object shape:
 * {
 *   type: "paragraph" | "heading" | "ordered-list" | "unordered-list" | "divider" | "note",
 *   content: string | string[]   — string for paragraph/heading/note, array for lists
 *   title: string                — optional bold title above an ordered/unordered list
 *   indent: bool                 — for unordered-list, renders as indented sub-bullets
 * }
 *
 * ─────────────────────────────────────────────────────────────────
 * Usage examples:
 *
 * // Declaration Modal
 * <PolicyModal
 *   show={declarationModal.show}
 *   onHide={() => setDeclarationModal({ show: false })}
 *   onConfirm={handleDeclarationConfirm}
 *   headerTitle="Declaration of Participation"
 *   headerSubtitle="Please read carefully and acknowledge below"
 *   sections={DECLARATION_SECTIONS}
 *   radioLabel="I declare my voluntary willingness to be involved..."
 *   confirmLabel="Continue"
 * />
 *
 * // Policy Modal
 * <PolicyModal
 *   show={policyModal.show}
 *   onHide={() => setPolicyModal({ show: false })}
 *   onConfirm={handlePolicyConfirm}
 *   headerTitle="Appointment & Cancellation Policy"
 *   headerSubtitle="All parties are advised to carefully review this policy."
 *   sections={POLICY_SECTIONS}
 *   radioLabel="I have read, understood, and agree to the policy."
 *   requireScroll
 *   size="lg"
 *   confirmLabel="I Agree"
 *   cancelLabel="Back"
 * />
 */

const PolicyModal = ({
  show,
  onHide,
  onConfirm,
  headerTitle = "Policy",
  headerSubtitle = "",
  sections = [],
  radioLabel = "I acknowledge and agree.",
  requireScroll = false,
  cancelLabel = "Cancel",
  confirmLabel = "Continue",
  size = "md",
  initialAgreed = false,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bodyRef = useRef(null);

  // Reset state each time modal opens
  useEffect(() => {
    if (show) {
      setAgreed(initialAgreed);
      setScrolled(false);
      setTimeout(() => {
        if (bodyRef.current) {
          const el = bodyRef.current;
          setScrolled(el.scrollHeight <= el.clientHeight); // already fits = no scroll needed
        }
      }, 100);
    }
  }, [show]);

  const handleScroll = () => {
    if (!bodyRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = bodyRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 8) setScrolled(true);
  };

  const canConfirm = agreed && (!requireScroll || scrolled);

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm?.();
    setAgreed(false);
    setScrolled(false);
  };

  const handleHide = () => {
    onHide?.();
    setAgreed(false);
    setScrolled(false);
  };

  const renderSection = (section, idx) => {
    switch (section.type) {
      case "heading":
        return (
          <p key={idx} className={styles.sectionHeading}>
            {section.content}
          </p>
        );
      case "paragraph":
        return (
          <p key={idx} className={styles.sectionParagraph}>
            {section.content}
          </p>
        );
      case "note":
        return (
          <p key={idx} className={styles.sectionNote}>
            {section.content}
          </p>
        );
      case "divider":
        return <hr key={idx} className={styles.sectionDivider} />;
      case "ordered-list":
        return (
          <div key={idx} className={styles.listBlock}>
            {section.title && (
              <p className={styles.listTitle}>{section.title}</p>
            )}
            <ol className={styles.orderedList}>
              {(section.content || []).map((item, i) =>
                typeof item === "string" ? (
                  <li key={i}>{item}</li>
                ) : (
                  // item can be { text, sub: string[] } for nested bullets
                  <li key={i}>
                    {item.text}
                    {item.sub && (
                      <ul className={styles.subList}>
                        {item.sub.map((s, j) => (
                          <li key={j}>{s}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ),
              )}
            </ol>
          </div>
        );
      case "unordered-list":
        return (
          <div key={idx} className={styles.listBlock}>
            {section.title && (
              <p className={styles.listTitle}>{section.title}</p>
            )}
            <ul
              className={`${styles.unorderedList} ${section.indent ? styles.indented : ""}`}
            >
              {(section.content || []).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleHide}
      centered
      size={size}
      contentClassName={styles.modalContent}
      backdrop="static"
      keyboard={false}
    >
      {/* ── Purple Header ── */}
      <div className={styles.modalHeader}>
        <p className={styles.modalHeaderTitle}>{headerTitle}</p>
        {headerSubtitle && (
          <p className={styles.modalHeaderSubtitle}>{headerSubtitle}</p>
        )}
      </div>

      {/* ── Scrollable Body ── */}
      <div className={styles.modalBody} ref={bodyRef} onScroll={handleScroll}>
        {sections.map((section, idx) => renderSection(section, idx))}

        <hr className={styles.sectionDivider} />

        {/* ── Radio acknowledgement ── */}
        <label className={styles.radioLabel}>
          <input
            type="radio"
            name={`policy-modal-radio-${headerTitle}`}
            className={styles.radioInput}
            checked={agreed}
            onChange={() => setAgreed(true)}
          />
          <span>{radioLabel}</span>
        </label>

        {requireScroll && !scrolled && (
          <p className={styles.scrollHint}>
            ↓ Please scroll to the bottom to continue.
          </p>
        )}
      </div>

      {/* ── Footer Actions ── */}
      <div className={styles.modalFooter}>
        <button className={styles.cancelBtn} onClick={handleHide}>
          {cancelLabel}
        </button>
        <button
          className={`${styles.confirmBtn} ${!canConfirm ? styles.confirmBtnDisabled : ""}`}
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};

export default PolicyModal;
