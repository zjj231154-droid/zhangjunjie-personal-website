import React from "react";
import { createRoot } from "react-dom/client";
import MysteryGame from "./MysteryGame.jsx";
import { initAnalytics } from "./analytics.js";
import "./mystery-game.css";

initAnalytics();

class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("Game render failed", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, color: "#e9e1d2", background: "#15110d", textAlign: "center" }}>
        <section>
          <h1 style={{ color: "#efc978" }}>世界记录暂时中断</h1>
          <p style={{ color: "#9d907f" }}>你的本地存档仍然安全。请重新加载页面恢复连接。</p>
          <button style={{ marginTop: 16, padding: "12px 20px", color: "#15110d", border: 0, background: "#efc978", cursor: "pointer" }} onClick={() => location.reload()}>重新载入</button>
        </section>
      </main>
    );
  }
}

createRoot(document.getElementById("mystery-root")).render(
  <React.StrictMode>
    <GameErrorBoundary>
      <MysteryGame />
    </GameErrorBoundary>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator && location.protocol === "https:") {
  addEventListener("load", () => navigator.serviceWorker.register("./game-sw.js").catch(() => {}));
}
