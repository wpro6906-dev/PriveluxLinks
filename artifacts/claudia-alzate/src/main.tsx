import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { API_BASE } from "@/lib/api-base";

if (API_BASE) {
  setBaseUrl(API_BASE);
}

setAuthTokenGetter(() => localStorage.getItem("auth_token"));

createRoot(document.getElementById("root")!).render(<App />);
