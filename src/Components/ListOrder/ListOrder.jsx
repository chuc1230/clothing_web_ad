import React, { useEffect, useState } from "react";
import { FiEye } from "react-icons/fi";
import { Modal } from "antd";
import "./ListOrder.css";

const ListOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [allProducts, setAllProducts] = useState([]);

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

  const getProductName = (productId) => {
    const prod = allProducts.find(p => p.id === Number(productId));
    return prod ? prod.name : `Sản phẩm ${productId}`;
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
          const filteredOrders = data.orders.filter((order) => {
            return new Date(order.orderDate) > new Date("2025-01-01");
          });
          setOrders(filteredOrders);
        } else {
          alert("Lỗi khi tải danh sách đơn hàng: " + data.message);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        alert("Không thể tải danh sách đơn hàng.");
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:4000/allproducts");
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchAllOrders();
    fetchProducts();
  }, []);

  useEffect(() => {
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
      <h1>Danh Sách Đơn Hàng</h1>
      <div className="search-container">
        <input
          className="search-box"
          type="text"
          placeholder="Tìm theo tên khách hàng"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />

        <input
          className="search-box"
          type="email"
          placeholder="Tìm theo email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
        />
      </div>
      <div className="listorder-format-main">
        <p>Tên khách hàng</p>
        <p>Email</p>
        <p>Ngày đặt hàng</p>
        <p>Số lượng</p>
        <p>Tổng tiền</p>
        <p>Chi tiết</p>
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
                {Object.values(order.cart || {}).reduce(
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
        title={`Chi tiết đơn hàng của ${selectedOrder ? selectedOrder.name : ""}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {selectedOrder && (
          <div>
            <h3>
              Ngày đặt hàng:{" "}
              {new Date(selectedOrder.orderDate).toLocaleDateString()}
            </h3>
            <h3>Tổng tiền: {selectedOrder.totalPrice}đ</h3>
            <h3>Danh sách sản phẩm:</h3>
            <ul>
              {Object.entries(selectedOrder.cart || {}).map(
                ([productId, quantity]) => (
                  <li key={productId}>
                    <strong>{getProductName(productId)}</strong>: Số lượng {quantity}
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