import React, { useState } from "react";
import "./AdminLogin.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");
const FRONTEND_URL = (import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

const AdminLogin = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ Email và Mật khẩu!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        const token = data.token;
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
          if (payload.user && (payload.user.role === "admin" || payload.user.role === "super_admin")) {
            localStorage.setItem("auth-token", token);
            onLoginSuccess();
          } else {
            setError("Tài khoản của bạn không có quyền truy cập trang quản trị!");
          }
        } catch (e) {
          setError("Lỗi xác thực quyền truy cập!");
          console.error(e);
        }
      } else {
        setError(data.errors || data.message || "Tài khoản hoặc mật khẩu không chính xác");
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi kết nối với máy chủ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h2>QUẢN TRỊ VIÊN</h2>
          <p>Đăng nhập vào hệ thống quản trị cửa hàng</p>
        </div>
        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && <div className="admin-login-error">{error}</div>}
          <div className="admin-login-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Nhập địa chỉ email admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="admin-login-field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "ĐĂNG NHẬP"}
          </button>
        </form>
        <div className="admin-login-footer">
          <a href={`${FRONTEND_URL}/`} className="admin-back-to-store">
            ← Quay lại trang chủ bán hàng
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
