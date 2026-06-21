import React, { useEffect, useState } from "react"
import Navbar from "./Components/Navbar/Navbar"
import Admin from "./Pages/Admin/Admin"

const App = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      // Redirect to user front-end homepage
      window.location.href = "http://localhost:5173/";
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