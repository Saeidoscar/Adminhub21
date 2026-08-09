import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { ThemeProvider } from "./design-system/ThemeProvider"
import { PackageProvider } from "./contexts/PackageContext"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PackageProvider>
          <App />
        </PackageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
