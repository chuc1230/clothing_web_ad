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

  const handleStatusChange = async (userId, orderDate, newStatus) => {
    try {
      const response = await fetch("http://localhost:4000/admin/updateOrderStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          orderDate,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Cập nhật trạng thái đơn hàng thành công!");
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.userId === userId && o.orderDate === orderDate
              ? { ...o, status: newStatus }
              : o
          )
        );
      } else {
        alert("Cập nhật trạng thái thất bại: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
      alert("Đã xảy ra lỗi khi cập nhật.");
    }
  };

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
      <div className="listorder-table-wrapper" style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: "1000px" }}>
          <div className="listorder-format-main">
            <p>Tên khách hàng</p>
            <p>Email</p>
            <p>Ngày đặt hàng</p>
            <p>Số lượng</p>
            <p>Tổng tiền</p>
            <p>Trạng thái</p>
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
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <select 
                    value={order.status || "Chờ shop đóng hàng"} 
                    onChange={(e) => handleStatusChange(order.userId, order.orderDate, e.target.value)}
                    className="admin-status-select"
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      fontSize: "14px",
                      outline: "none",
                      cursor: "pointer"
                    }}
                  >
                    <option value="Chờ shop đóng hàng">Chờ shop đóng hàng</option>
                    <option value="Đang ship">Đang ship</option>
                    <option value="Đã thanh toán">Đã thanh toán</option>
                  </select>
                </div>
                <p>
                  <FiEye className="icon" onClick={() => showModal(order)} style={{ cursor: "pointer", fontSize: "18px" }} />
                </p>
              </div>
            ))}
            <hr />
          </div>
        </div>
      </div>
      
      <Modal
        title={`Chi tiết đơn hàng của ${selectedOrder ? selectedOrder.name : ""}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p><strong>Ngày đặt hàng:</strong> {new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
            <p><strong>Số điện thoại:</strong> {selectedOrder.phoneNumber || "Không có"}</p>
            <p>
              <strong>Địa chỉ giao hàng:</strong>{" "}
              {selectedOrder.address 
                ? `${selectedOrder.address.street || ""}, ${selectedOrder.address.city || ""}, ${selectedOrder.address.state || ""}` 
                : "Không có"}
            </p>
            <p><strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod || "Tiền mặt"}</p>
            <p><strong>Tổng tiền:</strong> <strong style={{ color: '#ff4141' }}>{selectedOrder.totalPrice}đ</strong></p>
            <p><strong>Trạng thái hiện tại:</strong> {selectedOrder.status || "Chờ shop đóng hàng"}</p>
            <hr style={{ border: '0', height: '1px', background: '#eee' }} />
            <h3 style={{ fontSize: "16px", fontWeight: "600" }}>Danh sách sản phẩm:</h3>
            <ul>
              {Object.entries(selectedOrder.cart || {}).map(
                ([productId, quantity]) => (
                  <li key={productId} style={{ margin: '4px 0' }}>
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