import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // or wherever your Tailwind/global CSS lives — adjust path

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
