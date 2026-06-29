import React, { useEffect, useState } from "react"
import Navbar from "./Components/Navbar/Navbar"
import Admin from "./Pages/Admin/Admin"

const App = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isBridge = urlParams.get("auth_bridge") === "1" || window.self !== window.top;

    if (isBridge) {
      const handleMessage = (event) => {
        if (event.origin === "http://localhost:3000" && event.data && event.data.type === "AUTH_TOKEN") {
          const receivedToken = event.data.token;
          if (receivedToken) {
            localStorage.setItem("auth-token", receivedToken);
            event.source.postMessage("AUTH_SUCCESS", event.origin);
          }
        }
      };

      window.addEventListener("message", handleMessage);
      if (window.parent) {
        window.parent.postMessage("AUTH_READY", "http://localhost:3000");
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
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.user && (payload.user.role === 'admin' || payload.user.role === 'super_admin')) {
          authorized = true;
        }
      } catch (e) {
        console.error("Token parsing error:", e);
      }
    }
    
    if (!authorized) {
      window.location.href = "http://localhost:3000/";
    } else {
      setIsAuthorized(true);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px', fontFamily: 'Inter, sans-serif' }}>Đang kiểm tra quyền truy cập...</div>;
  }

  return (
    <div>
        <Navbar/>
        <Admin/>
    </div>
  )
}

export default App