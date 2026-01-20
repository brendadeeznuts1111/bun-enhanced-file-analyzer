import { createRoot } from "react-dom/client";
import { FileAnalyzer } from "./components/FileAnalyzer";
import { DOMAnalyzer } from "./components/DOMAnalyzer";
import { CookieManagerComponent } from "./components/CookieManager";
import { URLPatternDemo } from "./components/URLPatternDemo";
import { BunCookieMapDemo } from "./components/BunCookieMapDemo";
import { HTTPHeadersDemo } from "./components/HTTPHeadersDemo";
import { DevDashboard } from "./components/DevDashboard";

// HMR-persistent root
let root: any;
if (import.meta.hot?.data.root) {
  root = import.meta.hot.data.root;
} else {
  root = createRoot(document.getElementById("root")!);
  if (import.meta.hot) {
    import.meta.hot.data.root = root;
  }
}

// Create colored app wrapper
const AppWithTheme = () => (
  <div style={{
    background: "linear-gradient(135deg, #3b82f6, #22c55e)",
    minHeight: "100vh",
    padding: "2rem",
  }}>
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "1rem",
      padding: "2rem",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
    }}>
      <h1 style={{
        fontSize: "2rem",
        fontWeight: "bold",
        marginBottom: "1rem",
        color: "#1f2937",
      }}>🚀 Bun-Native File Analyzer</h1>
      
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
          Drop files below to analyze them with native Bun APIs
        </p>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          Explore Cookie Management, URLPattern routing, HTTP headers, DOM analysis, and more!
        </p>
      </div>
      
      <FileAnalyzer />
      
      <hr style={{ margin: "2rem 0", border: "1px solid #e5e7eb" }} />
      
      <DevDashboard />
      
      <hr style={{ margin: "2rem 0", border: "1px solid #e5e7eb" }} />
      
      <HTTPHeadersDemo />
      
      <hr style={{ margin: "2rem 0", border: "1px solid #e5e7eb" }} />
      
      <CookieManagerComponent />
      
      <hr style={{ margin: "2rem 0", border: "1px solid #e5e7eb" }} />
      
      <BunCookieMapDemo />
      
      <hr style={{ margin: "2rem 0", border: "1px solid #e5e7eb" }} />
      
      <URLPatternDemo />
      
      <hr style={{ margin: "2rem 0", border: "1px solid #e5e7eb" }} />
      
      <DOMAnalyzer />
    </div>
  </div>
);

root.render(<AppWithTheme />);

// HMR setup
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log("%c✅ App updated via HMR", "color: #22c55e");
  });
  
  import.meta.hot.dispose(() => {
    import.meta.hot.data.root = root;
  });
}

// Service worker registration (re-enabled)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").then(registration => {
    console.log("%c📡 SW registered", "color: #0ea5e9");
  });
}
