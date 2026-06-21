import React from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";
import add_product_icon from "../../assets/Product_Cart.svg";
import list_product_icon from "../../assets/Product_list_icon.svg";
import customer from "../../assets/customer.png";
import { FcShipped } from "react-icons/fc";

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

  return (
    <div className="sidebar">
      {isSuperAdmin && (
        <Link to={"/listusers"} style={{ textDecoration: "none" }}>
          <div className="sidebar-item">
            <img src={customer} alt="" />
            <p>Quản lý thành viên</p>
          </div>
        </Link>
      )}

      <Link to={"/addproduct"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="" />
          <p>Thêm sản phẩm</p>
        </div>
      </Link>

      <Link to={"/listproduct"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="" />
          <p>Danh sách sản phẩm</p>
        </div>
      </Link>

      <Link to={"/listorder"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <FcShipped className="order-icon" />
          <p>Danh sách đơn hàng</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
