import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./config/msalConfig";
import App from "./App";
import "./index.css";

const msalInstance = new PublicClientApplication(msalConfig);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const root = ReactDOM.createRoot(document.getElementById("root")!);

msalInstance
  .initialize()
  .then(() => {
    root.render(
      <React.StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
          <MsalProvider instance={msalInstance}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </MsalProvider>
        </GoogleOAuthProvider>
      </React.StrictMode>
    );
  })
  .catch((err) => {
    console.error("MSAL init failed:", err);
    // Render without MSAL if it fails
    root.render(
      <React.StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </React.StrictMode>
    );
  });
