import React, { useState } from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";
import add_product_icon from "../../assets/Product_Cart.svg";
import list_product_icon from "../../assets/Product_list_icon.svg";
import customer from "../../assets/customer.png";
import { FcShipped, FcLineChart } from "react-icons/fc";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const Sidebar = () => {
  const token = localStorage.getItem("auth-token");
  let isSuperAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.user && payload.user.role === 'super_admin') {
        isSuperAdmin = true;
      }
    } catch (e) {
      console.error(e);
    }
  }

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div 
        className="sidebar-toggle" 
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          display: 'flex',
          justifyContent: isCollapsed ? 'center' : 'flex-end',
          padding: '10px 20px',
          cursor: 'pointer',
          borderBottom: '1px solid #eee',
          fontSize: '18px',
          color: '#555'
        }}
        title={isCollapsed ? "Mở rộng" : "Thu gọn"}
      >
        {isCollapsed ? <FaAngleRight /> : <FaAngleLeft />}
      </div>

      {isSuperAdmin && (
        <Link to={"/listusers"} style={{ textDecoration: "none" }}>
          <div className="sidebar-item" title="Quản lý thành viên">
            <img src={customer} alt="" />
            {!isCollapsed && <p>Quản lý thành viên</p>}
          </div>
        </Link>
      )}

      <Link to={"/addproduct"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item" title="Thêm sản phẩm">
          <img src={add_product_icon} alt="" />
          {!isCollapsed && <p>Thêm sản phẩm</p>}
        </div>
      </Link>

      <Link to={"/listproduct"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item" title="Danh sách sản phẩm">
          <img src={list_product_icon} alt="" />
          {!isCollapsed && <p>Danh sách sản phẩm</p>}
        </div>
      </Link>

      <Link to={"/listorder"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item" title="Danh sách đơn hàng">
          <FcShipped className="order-icon" />
          {!isCollapsed && <p>Danh sách đơn hàng</p>}
        </div>
      </Link>

      <Link to={"/stats"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item" title="Thống kê doanh thu">
          <FcLineChart className="order-icon" />
          {!isCollapsed && <p>Thống kê doanh thu</p>}
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
