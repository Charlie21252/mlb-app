import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 24 },
  visible: (i) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: i * 0.07, type: "spring", stiffness: 260, damping: 22 },
  }),
};

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

function VideoCard({ homer, index, onClick, isMobile }) {
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
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
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

      {/* Play icon overlay on mobile */}
      {isMobile && homer.videoUrl && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(0,0,0,0.55)", border: "2px solid rgba(255,255,255,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <polygon points="5,2 14,8 5,14" fill="white"/>
            </svg>
          </div>
        </div>
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

function FullscreenView({ homer, onPrev, onNext, hasPrev, hasNext, isMobile }) {
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
        background: "#000", borderRadius: isMobile ? 8 : 12, overflow: "hidden",
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

      {/* Player info overlay — only shown when no video controls */}
      {!homer.videoUrl && (
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
      )}

      {/* Prev / Next arrows */}
      {hasPrev && (
        <button onClick={onPrev} style={arrowStyle("left", isMobile)} aria-label="Previous">‹</button>
      )}
      {hasNext && (
        <button onClick={onNext} style={arrowStyle("right", isMobile)} aria-label="Next">›</button>
      )}
    </motion.div>
  );
}

function arrowStyle(side, isMobile) {
  const size = isMobile ? 52 : 44;
  return {
    position: "absolute",
    top: isMobile ? "auto" : "50%",
    bottom: isMobile ? 56 : "auto",
    [side]: isMobile ? 8 : 14,
    transform: isMobile ? "none" : "translateY(-50%)",
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "50%",
    width: size, height: size,
    color: "#fff", fontSize: isMobile ? "2rem" : "1.8rem",
    lineHeight: `${size - 2}px`, textAlign: "center",
    cursor: "pointer", zIndex: 10,
  };
}

export default function HRCollage({ homeruns, onClose, dayOffset = 0 }) {
  const [focused, setFocused] = useState(null);
  const isMobile = useIsMobile();

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
        background: "rgba(5, 10, 18, 0.97)",
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
          onClick={() => inVideo ? setFocused(null) : onClose()}
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
            minWidth: 0,
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
          aria-label={inVideo ? "Back to highlights grid" : "Back to home"}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {inVideo ? "All Clips" : "Back"}
        </button>

        {/* Title + count */}
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
            {inVideo
              ? `${focused + 1} of ${homeruns.length}`
              : isMobile
                ? `${homeruns.length} home run${homeruns.length !== 1 ? "s" : ""} · tap to watch`
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
                padding: isMobile ? "12px 12px 24px" : "18px 20px 32px",
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "repeat(auto-fill, minmax(min(160px, 100%), 1fr))"
                  : "repeat(auto-fill, minmax(260px, 1fr))",
                gap: isMobile ? 8 : 12,
                alignContent: "start",
              }}
            >
              {homeruns.map((homer, i) => (
                <VideoCard
                  key={homer.playerId || i}
                  homer={homer}
                  index={i}
                  onClick={() => setFocused(i)}
                  isMobile={isMobile}
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
              style={{
                position: "relative", height: "100%",
                padding: isMobile ? 8 : 12,
              }}
            >
              <AnimatePresence mode="wait">
                <FullscreenView
                  key={focused}
                  homer={homeruns[focused]}
                  onPrev={() => setFocused(f => Math.max(0, f - 1))}
                  onNext={() => setFocused(f => Math.min(homeruns.length - 1, f + 1))}
                  hasPrev={focused > 0}
                  hasNext={focused < homeruns.length - 1}
                  isMobile={isMobile}
                />
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
