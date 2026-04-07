import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function arrowStyle(side, isMobile) {
  const size = isMobile ? 52 : 44;
  return {
    position: "absolute",
    top: isMobile ? "auto" : "50%",
    bottom: isMobile ? 64 : "auto",
    [side]: isMobile ? 8 : 14,
    transform: isMobile ? "none" : "translateY(-50%)",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "50%",
    width: size, height: size,
    color: "#fff", fontSize: isMobile ? "2rem" : "1.8rem",
    lineHeight: `${size - 2}px`, textAlign: "center",
    cursor: "pointer", zIndex: 10,
    flexShrink: 0,
  };
}

export default function HRCollage({ homeruns, onClose, dayOffset = 0, startIndex = 0 }) {
  const [current, setCurrent] = useState(startIndex);
  const isMobile = useIsMobile();
  const videoRef = useRef(null);

  const homer = homeruns[current];
  const hasPrev = current > 0;
  const hasNext = current < homeruns.length - 1;

  // Play the video whenever the current homer changes
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
  }, [current]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) setCurrent(c => c - 1);
      if (e.key === "ArrowRight" && hasNext) setCurrent(c => c + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasPrev, hasNext, onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const goNext = () => { if (hasNext) setCurrent(c => c + 1); };
  const goPrev = () => { if (hasPrev) setCurrent(c => c - 1); };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(5, 10, 18, 0.98)",
        backdropFilter: "blur(10px)",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: isMobile ? "10px 14px" : "14px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0, zIndex: 10, gap: 12,
      }}>
        {/* Back button */}
        <button
          onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 8,
            cursor: "pointer",
            padding: isMobile ? "8px 14px" : "7px 14px",
            color: "var(--text-secondary)",
            fontFamily: "var(--font-data)",
            fontSize: isMobile ? "0.82rem" : "0.78rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "all 0.15s",
            flexShrink: 0,
            whiteSpace: "nowrap",
            WebkitTapHighlightColor: "transparent",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.12)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
          aria-label="Back to home"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* Title + counter */}
        <div style={{ textAlign: "right", minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: isMobile ? "0.95rem" : "1.1rem",
            color: "var(--text)", letterSpacing: "0.02em",
            whiteSpace: "nowrap",
          }}>
            {dayOffset === 0 ? "Today's" : "Yesterday's"}{" "}
            <span style={{ color: "var(--gold)" }}>Highlights</span>
          </div>
          <div style={{
            fontFamily: "var(--font-data)", fontSize: "0.65rem",
            color: "var(--text-muted)", letterSpacing: "0.1em",
            textTransform: "uppercase", marginTop: 1,
          }}>
            {current + 1} of {homeruns.length}
          </div>
        </div>
      </div>

      {/* ── Video player ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{
              position: "absolute", inset: 0,
              background: "#000",
              padding: isMobile ? 8 : 12,
            }}
          >
            <div style={{
              position: "relative", width: "100%", height: "100%",
              borderRadius: isMobile ? 8 : 12, overflow: "hidden",
              background: "#000",
            }}>
              {homer.videoUrl ? (
                <video
                  ref={videoRef}
                  src={homer.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  onEnded={goNext}
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
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
                  {hasNext && (
                    <button
                      onClick={goNext}
                      style={{
                        marginTop: 8, padding: "10px 22px",
                        background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 8, color: "#fff", cursor: "pointer",
                        fontFamily: "var(--font-data)", fontSize: "0.78rem",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                      }}
                    >
                      Next Highlight
                    </button>
                  )}
                </div>
              )}

              {/* Player info overlay at bottom */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                padding: isMobile ? "28px 14px 14px" : "36px 20px 18px",
                pointerEvents: "none",
              }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontSize: isMobile ? "1.1rem" : "1.4rem",
                  color: "#fff", letterSpacing: "0.01em",
                }}>
                  {homer.name}
                </div>
                <div style={{
                  display: "flex", gap: 14, marginTop: 4,
                  fontFamily: "var(--font-data)", fontSize: isMobile ? "0.7rem" : "0.75rem",
                  color: "var(--gold)", letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  {homer.totalDistance && <span>{homer.totalDistance} ft</span>}
                  {homer.launchSpeed && <span>{homer.launchSpeed} mph exit velo</span>}
                </div>
              </div>

              {/* Prev / Next arrows */}
              {hasPrev && (
                <button onClick={goPrev} style={arrowStyle("left", isMobile)} aria-label="Previous">‹</button>
              )}
              {hasNext && (
                <button onClick={goNext} style={arrowStyle("right", isMobile)} aria-label="Next">›</button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Progress dots ── */}
      {homeruns.length > 1 && homeruns.length <= 20 && (
        <div style={{
          display: "flex", justifyContent: "center", gap: 6,
          padding: isMobile ? "10px 14px" : "12px 20px",
          flexShrink: 0,
        }}>
          {homeruns.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to highlight ${i + 1}`}
              style={{
                width: i === current ? 20 : 8,
                height: 8, borderRadius: 4,
                background: i === current ? "var(--gold)" : "rgba(255,255,255,0.2)",
                border: "none", cursor: "pointer", padding: 0,
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>,
    document.body
  );
}
