// iHelp.jsx  -  CMPS-iHELP Information Help Survey
// Helps users decide between Psychotherapy & Counseling vs Psychological Assessment

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles/iHelp.module.css';

/* -----------------------------------------------------------------
   Survey Data
------------------------------------------------------------------ */
const QUESTIONS = [
  {
    id: 1,
    badge: 'Question 1 of 4',
    emoji: '🤔',
    text: "How are you feeling lately?",
    hint: "Pick at least 2 that feel true for you",
    options: [
      { emoji: '😔', text: 'Overwhelmed or stressed',   sub: 'Emotions feel hard to manage',        value: 'therapy'    },
      { emoji: '🧩', text: 'Confused about myself',     sub: 'Hard to understand my own patterns',   value: 'assessment' },
      { emoji: '😰', text: 'Anxious or down most days', sub: "It's affecting my daily life",         value: 'therapy'    },
      { emoji: '🔍', text: 'Unsure - I need clarity',   sub: 'I want a professional evaluation',     value: 'assessment' },
    ],
  },
  {
    id: 2,
    badge: 'Question 2 of 4',
    emoji: '🎯',
    text: "What's your main goal right now?",
    hint: "Pick at least 2 that match your needs",
    options: [
      { emoji: '💬', text: 'Talk through my problems',  sub: 'I want someone to listen & guide',     value: 'therapy'    },
      { emoji: '📋', text: 'Get tested or evaluated',   sub: 'Understand my cognitive/mental state',  value: 'assessment' },
      { emoji: '🌱', text: 'Grow & heal emotionally',   sub: 'Work on trauma, grief, or stress',      value: 'therapy'    },
      { emoji: '📄', text: 'Get an official report',    sub: 'For school, work, or legal purposes',   value: 'assessment' },
    ],
  },
  {
    id: 3,
    badge: 'Question 3 of 4',
    emoji: '📅',
    text: "How long have you been experiencing this?",
    hint: "Pick at least 2 that apply",
    options: [
      { emoji: '⚡', text: 'Recently - past few weeks',  sub: 'Something happened that triggered it',  value: 'therapy'    },
      { emoji: '📆', text: 'For months or even years',   sub: "It's been an ongoing struggle",         value: 'therapy'    },
      { emoji: '🧠', text: 'All my life, honestly',      sub: "I've always had these tendencies",      value: 'assessment' },
      { emoji: '❓', text: 'Hard to say exactly',        sub: 'I just want to understand myself more',  value: 'assessment' },
    ],
  },
  {
    id: 4,
    badge: 'Question 4 of 4',
    emoji: '💡',
    text: "What does getting help look like to you?",
    hint: "Pick at least 2 that resonate",
    options: [
      { emoji: '🛋️', text: 'Regular sessions with a counselor',      sub: 'A safe space to open up weekly',         value: 'therapy'    },
      { emoji: '🧪', text: 'Structured tests & a written report',    sub: 'Clear findings I can act on',            value: 'assessment' },
      { emoji: '🤝', text: 'Someone to guide me through my pain',    sub: 'Emotional support & coping strategies',  value: 'therapy'    },
      { emoji: '📊', text: 'Data & insight about how my mind works', sub: 'Diagnoses or screening results',         value: 'assessment' },
    ],
  },
];

const MAX_PER_Q      = 4;
const TOTAL_MAX      = 16;
const MIN_SELECTIONS = 2;

/* -----------------------------------------------------------------
   Result Logic
------------------------------------------------------------------ */
function analyzeAnswers(answers) {
  const counts = { therapy: 0, assessment: 0 };
  let totalSelected = 0;

  answers.forEach(qAnswers => {
    if (Array.isArray(qAnswers)) {
      qAnswers.forEach(key => {
        const value = key.split('-')[0];
        if (counts[value] !== undefined) { counts[value]++; totalSelected++; }
      });
    }
  });

  const winner = counts.therapy >= counts.assessment ? 'therapy' : 'assessment';
  const loser  = winner === 'therapy' ? 'assessment' : 'therapy';
  const diff   = counts[winner] - counts[loser];

  let confidence;
  if (totalSelected >= 14)          confidence = 'mixed';
  else if (diff >= 5 || counts[loser] === 0) confidence = 'strong';
  else if (diff >= 2)               confidence = 'moderate';
  else                              confidence = 'mixed';

  return { winner, therapyCount: counts.therapy, assessmentCount: counts.assessment, totalSelected, confidence };
}

/* -----------------------------------------------------------------
   Conclusion copy
------------------------------------------------------------------ */
const CONCLUSIONS = {
  therapy: {
    strong: {
      label: 'Strong Match',
      labelColor: 'green',
      intro: "Your answers point clearly toward Psychotherapy & Counseling. Almost everything you selected is centered around emotional support, healing, and having someone to talk to.",
      note: "This is a confident recommendation based on your choices.",
    },
    moderate: {
      label: 'Good Match',
      labelColor: 'blue',
      intro: "Your answers lean toward Psychotherapy & Counseling. Most of what you shared suggests you would benefit from regular emotional support and guidance.",
      note: "You also selected a few assessment-leaning answers, so consider reading about both services.",
    },
    mixed: {
      label: 'Both Could Help',
      labelColor: 'orange',
      intro: "Your answers are spread across both services — which means you might actually benefit from both. Psychotherapy & Counseling edges ahead slightly based on your selections.",
      note: "We recommend consulting with a professional who can assess which to start with.",
    },
  },
  assessment: {
    strong: {
      label: 'Strong Match',
      labelColor: 'green',
      intro: "Your answers point clearly toward a Psychological Assessment. You consistently selected choices about understanding yourself, getting evaluated, and receiving structured findings.",
      note: "This is a confident recommendation based on your choices.",
    },
    moderate: {
      label: 'Good Match',
      labelColor: 'blue',
      intro: "Your answers lean toward a Psychological Assessment. You seem to want clarity, structured insight, and a formal understanding of how your mind works.",
      note: "You also selected a few counseling-leaning answers, so consider reading about both services.",
    },
    mixed: {
      label: 'Both Could Help',
      labelColor: 'orange',
      intro: "Your answers are spread across both services, suggesting you might benefit from both. Psychological Assessment edges ahead slightly based on your selections.",
      note: "We recommend consulting with a professional who can guide which to start with.",
    },
  },
};

const LABEL_STYLES = {
  green:  { background: '#D4F5EF', color: '#1A7A5E' },
  blue:   { background: '#DDD0F2', color: '#3A1860' },
  orange: { background: '#FDF0CC', color: '#7A5500' },
};

const RESULTS = {
  therapy: {
    emoji: '💚',
    title: "Psychotherapy & Counseling",
    primary: {
      emoji: '🛋️',
      title: 'Psychotherapy and Counseling',
      badge: 'Best Match',
      desc: 'Regular one-on-one sessions with a licensed therapist to help you process emotions, develop coping skills, and heal from stress, anxiety, grief, or trauma.',
      navigable: true,   // <-- only this service has a booking route
    },
    secondary: {
      emoji: '🔬',
      title: 'Psychological Assessment & Evaluation',
      desc: 'Structured tests to measure your cognitive and mental functioning - useful if you also want a formal evaluation alongside counseling.',
    },
  },
  assessment: {
    emoji: '🔵',
    title: "Psychological Assessment & Evaluation",
    primary: {
      emoji: '🔬',
      title: 'Psychological Assessment & Evaluation',
      badge: 'Best Match',
      desc: 'A series of standardized tests and interviews to assess your cognitive, behavioral, and emotional functioning - results in a professional report.',
      navigable: false,
    },
    secondary: {
      emoji: '🛋️',
      title: 'Psychotherapy and Counseling',
      desc: 'If you also need emotional support, counseling pairs well with assessment to help you process the findings and move forward.',
    },
  },
};

/* -----------------------------------------------------------------
   Main Component
------------------------------------------------------------------ */
const IHelp = ({ onClose, onSelectService }) => {
  const navigate = useNavigate();

  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState([[], [], [], []]);
  const [animKey, setAnimKey] = useState(0);

  const currentQ   = QUESTIONS[step - 1];
  const currentSel = answers[step - 1] ?? [];
  const progress   = step === 0 ? 0 : step === 5 ? 100 : ((step - 1) / 4) * 100;
  const canProceed = currentSel.length >= MIN_SELECTIONS;
  const remaining  = Math.max(0, MIN_SELECTIONS - currentSel.length);

  const analysis   = step === 5 ? analyzeAnswers(answers) : null;
  const result     = step === 5 ? RESULTS[analysis.winner] : null;
  const conclusion = step === 5 ? CONCLUSIONS[analysis.winner][analysis.confidence] : null;

  const toggleOption = (value, idx) => {
    const key = `${value}-${idx}`;
    const current = answers[step - 1] ?? [];
    const exists  = current.includes(key);
    const updated = exists ? current.filter(v => v !== key) : [...current, key];
    const newAnswers = [...answers];
    newAnswers[step - 1] = updated;
    setAnswers(newAnswers);
  };

  const isSelected = (value, idx) => (answers[step - 1] ?? []).includes(`${value}-${idx}`);

  const goNext  = () => { setAnimKey(k => k + 1); setStep(s => s + 1); };
  const goBack  = () => { setAnimKey(k => k + 1); setStep(s => s - 1); };
  const restart = () => { setAnswers([[], [], [], []]); setAnimKey(k => k + 1); setStep(1); };

  // Handles the primary Book button on the result screen
  const handleBook = () => {
    const serviceTitle = result.primary.title;
    if (result.primary.navigable) {
      // Psychotherapy and Counseling — go directly to set-appointment
      onClose();
      navigate('/client/appointment/set-appointment', {
        state: { selectedService: serviceTitle },
      });
    } else {
      // Assessment — not yet bookable online
      alert(`${serviceTitle} booking will be available soon. This feature is currently under development.`);
    }
    onSelectService && onSelectService(serviceTitle);
  };

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.sheet}>

        {/* Close */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>

        {/* Header */}
        <div className={styles.header}>
          <span className={styles.mascot}>💜</span>
          <h2 className={styles.brand}>CMPS-iHELP</h2>
          <p className={styles.brandSub}>Information Help · Find Your Service</p>
        </div>

        {/* Progress */}
        {step > 0 && (
          <div className={styles.progressWrap}>
            <div className={styles.progressLabel}>
              <span>{step === 5 ? 'Done! 🎉' : `Step ${step} of 4`}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* ── Intro Screen ── */}
        {step === 0 && (
          <div className={styles.questionCard} key="intro">
            <span className={styles.questionEmoji}>👋</span>
            <p className={styles.questionText}>
              Not sure which service you need? Let us figure it out together in just 4 quick questions!
            </p>
            <p className={styles.questionHint}>
              For each question, choose <strong>at least 2 answers</strong> that feel true for you.
            </p>
            <div className={styles.options}>
              <button className={styles.nextBtn} style={{ borderRadius: 20 }} onClick={goNext}>
                {"Let's go! 🚀"}
              </button>
            </div>
          </div>
        )}

        {/* ── Question Screens ── */}
        {step >= 1 && step <= 4 && currentQ && (
          <div className={styles.questionCard} key={animKey}>
            <span className={styles.questionBadge}>{currentQ.badge}</span>
            <span className={styles.questionEmoji}>{currentQ.emoji}</span>
            <p className={styles.questionText}>{currentQ.text}</p>
            <p className={styles.questionHint}>
              {currentQ.hint} &nbsp;
              <span className={`${styles.selCount} ${canProceed ? styles.selCountDone : ''}`}>
                {currentSel.length}/{MAX_PER_Q} selected
              </span>
            </p>

            <div className={styles.options}>
              {currentQ.options.map((opt, i) => {
                const selected = isSelected(opt.value, i);
                return (
                  <button
                    key={i}
                    className={`${styles.option} ${selected ? styles.selected : ''}`}
                    onClick={() => toggleOption(opt.value, i)}
                  >
                    <span className={styles.optionEmoji}>{opt.emoji}</span>
                    <span>
                      <div className={styles.optionText}>{opt.text}</div>
                      <div className={styles.optionSub}>{opt.sub}</div>
                    </span>
                    <span className={`${styles.optionCheck} ${selected ? styles.optionCheckVisible : ''}`}>
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={styles.navRow}>
              {step > 1 && (
                <button className={styles.backBtn} onClick={goBack}>← Back</button>
              )}
              <button
                className={styles.nextBtn}
                onClick={goNext}
                disabled={!canProceed}
              >
                {!canProceed
                  ? `Pick ${remaining} more`
                  : step === 4 ? 'See My Result ✨' : 'Next →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Result Screen ── */}
        {step === 5 && result && analysis && conclusion && (
          <div className={styles.result} key="result">
            <span className={styles.resultEmoji}>{result.emoji}</span>
            <h3 className={styles.resultTitle}>You might need</h3>
            <h2 className={styles.resultService}>{result.title}</h2>

            {/* Confidence badge + score */}
            <div className={styles.resultMeta}>
              <span
                className={styles.confidenceBadge}
                style={LABEL_STYLES[conclusion.labelColor]}
              >
                {conclusion.label}
              </span>
              <span className={styles.scoreChip}>
                🛋️ {analysis.therapyCount} &nbsp;·&nbsp; 🔬 {analysis.assessmentCount} &nbsp;·&nbsp; {analysis.totalSelected}/{TOTAL_MAX} answered
              </span>
            </div>

            {/* Conclusion paragraph */}
            <div className={styles.conclusionBox}>
              <p className={styles.conclusionText}>{conclusion.intro}</p>
              <p className={styles.conclusionNote}>💡 {conclusion.note}</p>
            </div>

            {/* Primary recommendation */}
            <div className={`${styles.resultCard} ${styles.primary}`}>
              <div className={styles.resultCardHeader}>
                <span className={styles.resultCardEmoji}>{result.primary.emoji}</span>
                <p className={styles.resultCardTitle}>{result.primary.title}</p>
                <span className={styles.resultCardBadge}>{result.primary.badge}</span>
              </div>
              <p className={styles.resultCardDesc}>{result.primary.desc}</p>
            </div>

            {/* Secondary */}
            <div className={styles.resultCard}>
              <div className={styles.resultCardHeader}>
                <span className={styles.resultCardEmoji}>{result.secondary.emoji}</span>
                <p className={styles.resultCardTitle}>{result.secondary.title}</p>
              </div>
              <p className={styles.resultCardDesc}>{result.secondary.desc}</p>
            </div>

            <div className={styles.resultActions}>
              <button className={styles.primaryAction} onClick={handleBook}>
                Book {result.primary.title} →
              </button>
              <button className={styles.secondaryAction} onClick={restart}>
                🔄 Retake the quiz
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* -----------------------------------------------------------------
   Trigger Button  -  drop into your Services page
   Usage: <IHelpTrigger onSelectService={(title) => ...} />
------------------------------------------------------------------ */
export const IHelpTrigger = ({ onSelectService }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={styles.triggerWrap}>
        <button className={styles.triggerBtn} onClick={() => setOpen(true)}>
          <span className={styles.triggerIcon}>💜</span>
          Not sure which service? Try CMPS-iHELP
          <span className={styles.triggerPulse} />
        </button>
      </div>
      {open && (
        <IHelp
          onClose={() => setOpen(false)}
          onSelectService={onSelectService}
        />
      )}
    </>
  );
};

export default IHelp;