import React from "react";
import "./GameButtons.css";

export default function GameButtons() {
  return (
    <div style={{ textAlign: "center", marginTop: "40px", backgroundColor:'black' }}>
      <button className="game-btn retro-btn">Retro Start</button>
      <button className="game-btn neon-btn">Neon Play</button>
      <button className="game-btn arcade-btn">Arcade Mode</button>
      <button className="game-btn minimal-btn">Minimal UI</button>
    </div>
  );
}
