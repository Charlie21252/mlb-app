import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/Leaderboard", label: "Leaderboard" },
  { to: "/pitchers", label: "Pitchers" },
  { to: "/analytics", label: "Analytics" },
];

function BaseballIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="13" cy="13" r="12" fill="#102035" stroke="#e8b84b" strokeWidth="1.4"/>
      <path d="M7.5 7 Q13 13 7.5 19" stroke="#e8b84b" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      <path d="M18.5 7 Q13 13 18.5 19" stroke="#e8b84b" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      <path d="M8.5 8L7.2 6.8M9.2 10.2L7.8 9.6M9 12.8L7.5 12.5M9 15.2L7.5 15.5M9.2 17.4L7.8 18" stroke="#e8b84b" strokeWidth="0.7" strokeLinecap="round"/>
      <path d="M17.5 8L18.8 6.8M16.8 10.2L18.2 9.6M17 12.8L18.5 12.5M17 15.2L18.5 15.5M16.8 17.4L18.2 18" stroke="#e8b84b" strokeWidth="0.7" strokeLinecap="round"/>
    </svg>
  );
}

export default function TaskBar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav className="nav">
        <div className="nav-logo">
          <BaseballIcon />
          HOMERS
        </div>

        {/* Desktop nav */}
        <div className="nav-links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link${pathname === to ? " active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Hamburger button — mobile only */}
        <button
          className={`nav-hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-mobile-drawer${menuOpen ? " open" : ""}`}>
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link${pathname === to ? " active" : ""}`}
            onClick={closeMenu}
          >
            {label}
          </Link>
        ))}
      </div>
    </>
  );
}
