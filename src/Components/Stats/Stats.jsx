import React, { useState, useEffect } from "react";
import "./Stats.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

const Stats = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/admin/stats`);
      const data = await response.json();
      if (data.success) {
        setStats({
          totalOrders: data.totalOrders,
          totalRevenue: data.totalRevenue,
          topProducts: data.topProducts || [],
        });
      } else {
        setError(data.message || "Không thể lấy dữ liệu thống kê.");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Lỗi kết nối tới máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-error">
        <p>⚠️ {error}</p>
        <button onClick={fetchStats} className="stats-retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  const now = new Date();
  const currentMonthText = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;

  return (
    <div className="admin-stats-container">
      <div className="stats-header">
        <h1>Báo Cáo Thống Kê Doanh Thu ({currentMonthText})</h1>
        <button onClick={fetchStats} className="stats-refresh-btn" title="Làm mới dữ liệu">
          🔄 Làm mới
        </button>
      </div>

      <div className="stats-cards-grid">
        <div className="stats-card revenue-card">
          <div className="stats-card-icon">💰</div>
          <div className="stats-card-info">
            <h3>Tổng doanh thu ({currentMonthText})</h3>
            <p className="stats-card-value">
              {stats.totalRevenue.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>

        <div className="stats-card orders-card">
          <div className="stats-card-icon">📦</div>
          <div className="stats-card-info">
            <h3>Số lượng đơn hàng ({currentMonthText})</h3>
            <p className="stats-card-value">{stats.totalOrders} đơn hàng</p>
          </div>
        </div>
      </div>

      <div className="top-products-section">
        <h2>Top 10 sản phẩm bán chạy nhất ({currentMonthText})</h2>
        <div className="top-products-table-wrapper">
          {stats.topProducts.length === 0 ? (
            <div className="no-data">Chưa có thông tin sản phẩm bán ra.</div>
          ) : (
            <table className="top-products-table">
              <thead>
                <tr>
                  <th style={{ width: "80px", textAlign: "center" }}>Hạng</th>
                  <th>Tên sản phẩm</th>
                  <th style={{ textAlign: "right" }}>Giá bán</th>
                  <th style={{ textAlign: "center" }}>Số lượng đã bán</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((prod, index) => (
                  <tr key={prod.productId}>
                    <td style={{ textAlign: "center" }}>
                      <span className={`rank-badge rank-${index + 1}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td>
                      <div className="product-table-name">
                        <span className="product-name-txt">{prod.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      {prod.price.toLocaleString("vi-VN")}đ
                    </td>
                    <td style={{ textAlign: "center", fontWeight: "700", color: "#ff4141" }}>
                      {prod.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;
