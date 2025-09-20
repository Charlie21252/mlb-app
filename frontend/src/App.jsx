import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TaskBar from "../components/TaskBar";
import HomePage from "../pages/HomePage";
import Leaderboard from "../pages/Leaderboard";
import StartingPitchers from "../pages/StartingPitchers";

export default function App() {
  return (
    <Router>
      <>
        <TaskBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Leaderboard" element={<Leaderboard />} />
          <Route path="/pitchers" element={<StartingPitchers />} />
        </Routes>
      </>
    </Router>
  );
}