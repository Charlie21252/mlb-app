import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 24 },
  visible: (i) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.07, type: "spring", stiffness: 260, damping: 22 },
  }),
};

function VideoCard({ homer, index, onClick }) {
  const videoRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) v.play().catch(() => {});
    else { v.pause(); v.currentTime = 0; }
  }, [hovered]);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.04 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 12, overflow: "hidden",
        cursor: "pointer", aspectRatio: "16/9", background: "#0d1117",
        boxShadow: hovered
          ? "0 0 0 2px var(--gold), 0 12px 40px rgba(0,0,0,0.6)"
          : "0 4px 20px rgba(0,0,0,0.4)",
        transition: "box-shadow 0.2s",
      }}
    >
      {homer.videoUrl ? (
        <video
          ref={videoRef}
          src={homer.videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <img
          src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${homer.playerId}/headshot/67/current.png`}
          alt={homer.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={e => { e.target.style.display = "none"; }}
        />
      )}

      {/* Always-visible name bar at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)",
        padding: "20px 12px 10px",
      }}>
        <div style={{
          fontFamily: "var(--font-display)", fontSize: "0.95rem",
          color: "#fff", letterSpacing: "0.01em", lineHeight: 1.2,
        }}>
          {homer.name}
        </div>
        <div style={{
          display: "flex", gap: 10, marginTop: 3,
          fontFamily: "var(--font-data)", fontSize: "0.68rem",
          color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          {homer.totalDistance && <span>{homer.totalDistance} ft</span>}
          {homer.launchSpeed && <span>{homer.launchSpeed} mph</span>}
          {!homer.videoUrl && <span style={{ color: "var(--text-muted)" }}>no video</span>}
        </div>
      </div>
    </motion.div>
  );
}

function FullscreenView({ homer, onPrev, onNext, hasPrev, hasNext }) {
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, [homer]);

  return (
    <motion.div
      key={homer.playerId}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      style={{
        position: "absolute", inset: 0,
        background: "#000", borderRadius: 12, overflow: "hidden",
      }}
    >
      {homer.videoUrl ? (
        <video
          ref={videoRef}
          src={homer.videoUrl}
          controls
          autoPlay
          loop
          playsInline
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      ) : (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 16, height: "100%",
        }}>
          <img
            src={`https://img.mlbstatic.com/mlb-photos/image/upload/q_100/v1/people/${homer.playerId}/headshot/67/current.png`}
            alt={homer.name}
            style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 50, opacity: 0.7 }}
            onError={e => { e.target.style.display = "none"; }}
          />
          <span style={{
            fontFamily: "var(--font-data)", color: "var(--text-muted)",
            fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            No highlight available
          </span>
        </div>
      )}

      {/* Player info overlay */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
        padding: "32px 20px 16px", pointerEvents: "none",
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", color: "#fff" }}>
          {homer.name}
        </div>
        <div style={{
          display: "flex", gap: 14, marginTop: 4,
          fontFamily: "var(--font-data)", fontSize: "0.72rem",
          color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          {homer.totalDistance && <span>{homer.totalDistance} ft</span>}
          {homer.launchSpeed && <span>{homer.launchSpeed} mph exit velo</span>}
        </div>
      </div>

      {/* Prev / Next arrows */}
      {hasPrev && (
        <button onClick={onPrev} style={arrowStyle("left")} aria-label="Previous">‹</button>
      )}
      {hasNext && (
        <button onClick={onNext} style={arrowStyle("right")} aria-label="Next">›</button>
      )}
    </motion.div>
  );
}

function arrowStyle(side) {
  return {
    position: "absolute", top: "50%", [side]: 14,
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.15)", border: "none",
    borderRadius: "50%", width: 44, height: 44,
    color: "#fff", fontSize: "1.8rem", lineHeight: "42px", textAlign: "center",
    cursor: "pointer", zIndex: 10,
  };
}

export default function HRCollage({ homeruns, onClose, dayOffset = 0 }) {
  const [focused, setFocused] = useState(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") {
        if (focused !== null) setFocused(null);
        else onClose();
      }
      if (focused !== null) {
        if (e.key === "ArrowLeft" && focused > 0) setFocused(f => f - 1);
        if (e.key === "ArrowRight" && focused < homeruns.length - 1) setFocused(f => f + 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focused, onClose, homeruns.length]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const inVideo = focused !== null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(5, 10, 18, 0.95)",
        backdropFilter: "blur(10px)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0, zIndex: 10,
      }}>
        {/* Emblem back button — mirrors the TaskBar logo position */}
        <button
          onClick={() => inVideo ? setFocused(null) : onClose()}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", cursor: "pointer",
            padding: "4px 6px", borderRadius: 8,
            color: "var(--gold)", transition: "opacity 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.7"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          aria-label={inVideo ? "Back to highlights" : "Close"}
        >
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="13" cy="13" r="12" fill="#102035" stroke="#e8b84b" strokeWidth="1.4"/>
            <path d="M7.5 7 Q13 13 7.5 19" stroke="#e8b84b" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
            <path d="M18.5 7 Q13 13 18.5 19" stroke="#e8b84b" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
            <path d="M8.5 8L7.2 6.8M9.2 10.2L7.8 9.6M9 12.8L7.5 12.5M9 15.2L7.5 15.5M9.2 17.4L7.8 18" stroke="#e8b84b" strokeWidth="0.7" strokeLinecap="round"/>
            <path d="M17.5 8L18.8 6.8M16.8 10.2L18.2 9.6M17 12.8L18.5 12.5M17 15.2L18.5 15.5M16.8 17.4L18.2 18" stroke="#e8b84b" strokeWidth="0.7" strokeLinecap="round"/>
          </svg>
          <span style={{
            fontFamily: "var(--font-display)", fontSize: "0.95rem",
            color: "#e8b84b", letterSpacing: "0.08em",
          }}>
            HOMERS
          </span>
        </button>

        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "var(--font-display)", fontSize: "1.1rem",
            color: "var(--text)", letterSpacing: "0.02em",
          }}>
            {dayOffset === 0 ? "Today's" : "Yesterday's"}{" "}
            <span style={{ color: "var(--gold)" }}>Highlights</span>
          </div>
          <div style={{
            fontFamily: "var(--font-data)", fontSize: "0.65rem",
            color: "var(--text-muted)", letterSpacing: "0.1em",
            textTransform: "uppercase", marginTop: 1,
          }}>
            {inVideo
              ? `${focused + 1} of ${homeruns.length}`
              : `${homeruns.length} home run${homeruns.length !== 1 ? "s" : ""} · hover to preview`}
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait">
          {!inVideo ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                height: "100%", overflowY: "auto",
                padding: "18px 20px 32px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 12,
                alignContent: "start",
              }}
            >
              {homeruns.map((homer, i) => (
                <VideoCard
                  key={homer.playerId || i}
                  homer={homer}
                  index={i}
                  onClick={() => setFocused(i)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="fullscreen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ position: "relative", height: "100%", padding: 12 }}
            >
              <AnimatePresence mode="wait">
                <FullscreenView
                  key={focused}
                  homer={homeruns[focused]}
                  onPrev={() => setFocused(f => Math.max(0, f - 1))}
                  onNext={() => setFocused(f => Math.min(homeruns.length - 1, f + 1))}
                  hasPrev={focused > 0}
                  hasNext={focused < homeruns.length - 1}
                />
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
