// AppointmentForm/PAeEDocuments.jsx
// Step: Upload Required Documents
// Shows: mandatory + optional doc upload zones per service config

import React from 'react';
import styles from '../style/PAaEAppointmentForm.module.css';

/* -----------------------------------------------------------------
   PAeEDocuments
   Props:
     config   — SERVICE_CONFIG entry (reads mandatoryDocs, optionalDocs)
     form     — shared form state
     setForm  — form state setter
------------------------------------------------------------------ */
const PAeEDocuments = ({ config, form, setForm }) => {

  const allDocs = [
    ...config.mandatoryDocs.map(d => ({ name: d, required: true  })),
    ...config.optionalDocs.map(d  => ({ name: d, required: false })),
  ];

  const docFiles = form.docFiles || {};

  const handleFileChange = (docName, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, docFiles: { ...docFiles, [docName]: file.name } });
    e.target.value = '';
  };

  const handleRemove = (docName) => {
    const updated = { ...docFiles };
    delete updated[docName];
    setForm({ ...form, docFiles: updated });
  };

  return (
    <div className={styles.stepCard}>

      <div className={styles.infoBanner}>
        <span>📎</span>
        <span>Please upload the required documents in PDF format only (max 10 MB each).</span>
      </div>

      {allDocs.map(doc => (
        <div key={doc.name} className={styles.docUploadBlock}>

          <label className={styles.label}>
            {doc.required
              ? <span className={styles.mandatoryTag}>Required</span>
              : <span className={styles.optionalTag}>Optional</span>
            }
            &nbsp; {doc.name}
          </label>

          {docFiles[doc.name] ? (
            /* ── Uploaded file row ── */
            <div className={styles.fileItem}>
              <span style={{ color: '#c0392b' }}>📄</span>
              <span className={styles.fileItemName}>{docFiles[doc.name]}</span>
              <button
                className={styles.fileItemRemove}
                onClick={() => handleRemove(doc.name)}
              >
                ✕
              </button>
            </div>
          ) : (
            /* ── Upload zone ── */
            <div className={styles.uploadZone}>
              <div className={styles.uploadIcon}>📄</div>
              <div className={styles.uploadHint}>Click to upload</div>
              <div className={styles.uploadSub}>PDF only</div>
              <input
                type='file'
                className={styles.uploadInput}
                accept='.pdf'
                onChange={e => handleFileChange(doc.name, e)}
              />
            </div>
          )}

        </div>
      ))}

    </div>
  );
};

export default PAeEDocuments;