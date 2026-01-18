import React, { useEffect, useState } from "react";
import "./ListUser.css";
import cross_icon from "../../assets/cross_icon.png";

const ListUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  // const fetchUsers = async () => {
  //   await fetch("http://localhost:4000/getUsers")
  //     .then((res) => res.json())
  //     .then((data) => {
  //       setUsers(data);
  //     });
  // };
  const fetchUsers = async () => {
    await fetch("http://localhost:4000/getUsers")
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
    // Gửi yêu cầu DELETE
    await fetch("http://localhost:4000/removeuser", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert("User removed successfully!");
          setUsers(users.filter((user) => user._id !== userId));
        } else {
          alert("Failed to remove user");
        }
      })
      .catch((error) => {
        console.error("Error removing user:", error);
        alert("An error occurred while removing the user");
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Filter orders when either searchName or searchEmail changes
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
      <h1>All Users</h1>
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
      <div className="listuser-format-main">
        <p>Username</p>
        <p>Email</p>
        <p>Registration Date</p>
        <p>Remove</p>
      </div>

      <div className="listuser-allusers">
        <hr />
        {filteredUsers.map((user, index) => (
          <div key={index} className="listuser-format listuser-format-main">
            <p>{user.name}</p>
            <p>{user.email}</p>
            <p>{new Date(user.date).toLocaleDateString()}</p>
            <p>
              <img
                onClick={() => {
                  removeUser(user.id);
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
  );
};

export default ListUser;
