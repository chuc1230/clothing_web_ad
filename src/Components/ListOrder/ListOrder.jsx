import React, { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import { Modal } from "antd";
import "./ListOrder.css";

const ListOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchName, setSearchName] = useState(""); // State for name search
  const [searchEmail, setSearchEmail] = useState(""); // State for email search
  const showModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        const response = await fetch("http://localhost:4000/admin/allorders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        const data = await response.json();
  
        if (data.success) {
          // Lọc đơn hàng có ngày sau 1/1/2025
          const filteredOrders = data.orders.filter(order => {
            return new Date(order.orderDate) > new Date("2025-01-01");
          });
          setOrders(filteredOrders); // Lưu các đơn hàng đã lọc
        } else {
          alert("Error fetching orders: " + data.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        alert("Failed to fetch orders.");
      }
    };
    fetchAllOrders();
  }, []);
  

  useEffect(() => {
    // Filter orders when either searchName or searchEmail changes
    const filtered = orders.filter((order) => {
      const isNameMatch = order.name
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const isEmailMatch = order.email
        .toLowerCase()
        .includes(searchEmail.toLowerCase());
      return isNameMatch && isEmailMatch;
    });
    setFilteredOrders(filtered);
  }, [searchName, searchEmail, orders]);
  return (
    <div className="list-order">
      <h1>All Orders</h1>
      <div className="search-container">
        <input
          className="search-box"
          type="text"
          placeholder="Search by Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        <input
          className="search-box"
          type="email"
          placeholder="Search by Email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
      </div>
      <div className="listorder-format-main">
        <p>Name</p>
        <p>Email</p>
        <p>Order Date</p>
        <p>Quantity</p>
        <p>Total Price</p>
        <p>Details</p>
      </div>
      <div className="listorder-allorders">
        <hr />
        {filteredOrders.map((order, index) => (
          <div key={index} className="listorder-format-main listorder-format">
            <p>{order.name}</p>
            <p>{order.email}</p>
            <p>{new Date(order.orderDate).toLocaleDateString()}</p>
            <p>
              <button className="orderitems-quantity">
                {Object.values(order.cart).reduce(
                  (total, quantity) => total + quantity,
                  0
                )}
              </button>
            </p>
            <p>{order.totalPrice}đ</p>
            <p>
              <FiEye className="icon" onClick={() => showModal(order)} />
            </p>
          </div>
        ))}
        <hr />
      </div>
      <Modal
        title={`Order Details of {selectedOrder ? selectedOrder.name : ""}đ`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {selectedOrder && (
          <div>
            <h3>
              Order Date:{" "}
              {new Date(selectedOrder.orderDate).toLocaleDateString()}
            </h3>
            <h3>Total Price: {selectedOrder.totalPrice}đ</h3>
            <h3>Items in this order:</h3>
            <ul>
              {Object.entries(selectedOrder.cart).map(
                ([productId, quantity]) => (
                  <li key={productId}>
                    <strong>Product {productId}</strong>: Quantity {quantity}
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListOrder;
