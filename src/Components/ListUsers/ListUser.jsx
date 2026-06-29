import React, { useEffect, useState } from "react";
import "./ListUser.css";
import cross_icon from "../../assets/cross_icon.png";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const ListUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const fetchUsers = async () => {
    await fetch(`${API_URL}/getUsers`)
      .then((res) => res.json())
      .then((data) => {
        // Lọc người dùng có ngày đăng ký sau 1/1/2025
        const filteredData = data.filter((user) => {
          const registrationDate = new Date(user.date);
          return registrationDate > new Date("2025-01-01");
        });
        setUsers(filteredData); // Chỉ lưu người dùng hợp lệ
      });
  };
  

  const removeUser = async (userId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thành viên này không?")) {
      return;
    }
    // Gửi yêu cầu DELETE
    await fetch(`${API_URL}/removeuser`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("Xóa người dùng thành công!");
          setUsers(users.filter((user) => user._id !== userId));
        } else {
          alert("Xóa người dùng thất bại");
        }
      })
      .catch((error) => {
        console.error("Error removing user:", error);
        alert("Đã xảy ra lỗi khi xóa người dùng");
      });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("auth-token")
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await response.json();
      if (data.success) {
        alert("Cập nhật vai trò thành công!");
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } else {
        alert("Cập nhật vai trò thất bại: " + data.message);
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Đã xảy ra lỗi khi cập nhật vai trò");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Lọc người dùng khi tên hoặc email thay đổi
    const filtered = users.filter((user) => {
      const isNameMatch = user.name
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const isEmailMatch = user.email
        .toLowerCase()
        .includes(searchEmail.toLowerCase());
      return isNameMatch && isEmailMatch;
    });
    setFilteredUsers(filtered);
  }, [searchName, searchEmail, users]);

  return (
    <div className="list-user">
      <h1>Quản Lý Thành Viên</h1>
      <div className="search-container">
        <input
          className="search-box"
          type="text"
          placeholder="Tìm theo tên"
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
      <div className="listuser-table-wrapper" style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: "800px" }}>
          <div className="listuser-format-main">
            <p>Tên tài khoản</p>
            <p>Email</p>
            <p>Ngày đăng ký</p>
            <p>Vai trò</p>
            <p>Xóa</p>
          </div>

          <div className="listuser-allusers">
            <hr />
            {filteredUsers.map((user, index) => (
              <div key={index} className="listuser-format listuser-format-main">
                <p>{user.name}</p>
                <p>{user.email}</p>
                <p>{new Date(user.date).toLocaleDateString()}</p>
                <p>
                  <select
                    value={user.role || "user"}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    style={{ padding: "5px", borderRadius: "4px", border: "1px solid #ccc" }}
                  >
                    <option value="user">Người dùng (user)</option>
                    <option value="admin">Quản trị viên (admin)</option>
                    <option value="super_admin">Quản trị tối cao (super_admin)</option>
                  </select>
                </p>
                <p>
                  <img
                    onClick={() => {
                      removeUser(user._id);
                    }}
                    src={cross_icon}
                    alt=""
                    className="listuser-remove-icon"
                  />
                </p>
              </div>
            ))}
            <hr />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListUser;
