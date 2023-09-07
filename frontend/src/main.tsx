import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import theme from "./styles/theme";
import { ThemeProvider } from "@mui/material/styles";
import { AuthProvider } from "./contexts/AuthContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
