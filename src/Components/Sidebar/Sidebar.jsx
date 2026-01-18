import React from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";
import add_product_icon from "../../assets/Product_Cart.svg";
import list_product_icon from "../../assets/Product_list_icon.svg";
import customer from "../../assets/customer.png";
import { FcShipped } from "react-icons/fc";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to={"/listusers"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={customer} alt="" />
          <p>Users List</p>
        </div>
      </Link>

      <Link to={"/addproduct"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={add_product_icon} alt="" />
          <p>Add Product</p>
        </div>
      </Link>

      <Link to={"/listproduct"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <img src={list_product_icon} alt="" />
          <p>Product List</p>
        </div>
      </Link>

      <Link to={"/listorder"} style={{ textDecoration: "none" }}>
        <div className="sidebar-item">
          <FcShipped className="order-icon" />
          <p>Order List</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
