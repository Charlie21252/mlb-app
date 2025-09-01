// components/TaskBar.jsx

import { Link } from "react-router-dom";

const styles = {
  taskbar: {
    backgroundColor: "#2C3E50",
    padding: "1rem",
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    position: "fixed",    // 👈 Always stay at the top
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    fontSize: "1.1rem"
  }
};

export default function TaskBar() {
  return (
    <nav style={styles.taskbar}>
      <Link to="/" style={styles.link}>Home</Link>
      <Link to="/Leaderboard" style={styles.link}>Leaderboard</Link>
      <Link to="/pitchers" style={styles.link}>Predict Homers</Link>
    </nav>
  );
}