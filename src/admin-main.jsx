import React from "react";
import { createRoot } from "react-dom/client";
import AnalyticsAdmin from "./AnalyticsAdmin.jsx";
import "./analytics-admin.css";

createRoot(document.getElementById("analytics-root")).render(
  <React.StrictMode>
    <AnalyticsAdmin />
  </React.StrictMode>,
);
