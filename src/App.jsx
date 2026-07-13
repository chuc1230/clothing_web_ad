import React, { useEffect, useState } from "react"
import Navbar from "./Components/Navbar/Navbar"
import Admin from "./Pages/Admin/Admin"
import AdminLogin from "./Components/AdminLogin/AdminLogin"

const FRONTEND_URL = (import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

const App = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isBridge = urlParams.get("auth_bridge") === "1" || window.self !== window.top;

    if (isBridge) {
      const handleMessage = (event) => {
        if (event.origin === FRONTEND_URL && event.data && event.data.type === "AUTH_TOKEN") {
          const receivedToken = event.data.token;
          if (receivedToken) {
            localStorage.setItem("auth-token", receivedToken);
            event.source.postMessage("AUTH_SUCCESS", event.origin);
          }
        }
      };

      window.addEventListener("message", handleMessage);
      if (window.parent) {
        window.parent.postMessage("AUTH_READY", FRONTEND_URL);
      }

      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }

    const tokenFromQuery = urlParams.get("token");
    if (tokenFromQuery) {
      localStorage.setItem("auth-token", tokenFromQuery);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem("auth-token");
    let authorized = false;
    if (token) {
      try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);
        if (payload.user && (payload.user.role === 'admin' || payload.user.role === 'super_admin')) {
          authorized = true;
        }
      } catch (e) {
        console.error("Token parsing error:", e);
      }
    }
    
    if (authorized) {
      setIsAuthorized(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px', fontFamily: 'Inter, sans-serif' }}>Đang kiểm tra quyền truy cập...</div>;
  }

  if (!isAuthorized) {
    return <AdminLogin onLoginSuccess={() => setIsAuthorized(true)} />;
  }

  return (
    <div>
        <Navbar/>
        <Admin/>
    </div>
  )
}

export default App