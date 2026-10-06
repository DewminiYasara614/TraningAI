import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import "./styles/base.css";
import { App } from "./App";
import { createServices, ServicesProvider } from "./services/ServicesContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ServicesProvider value={createServices()}>
      <App />
    </ServicesProvider>
  </StrictMode>,
);
