import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../../assets/cross_icon.png";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const fetchInfo = async () => {
    await fetch("http://localhost:4000/allproducts")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  useEffect(() => {
    const filtered = allproducts.filter((product) => {
      const isTitleMatch = product.name
        .toLowerCase()
        .includes(searchTitle.toLowerCase());
      const isCategoryMatch = searchCategory
        ? product.category === searchCategory
        : true; // Add category filtering

      return isTitleMatch && isCategoryMatch;
    });

    setFilteredProducts(filtered);
  }, [searchTitle, searchCategory, allproducts]);

  const remove_product = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      return;
    }
    await fetch("http://localhost:4000/removeproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });

    await fetchInfo();
  };

  return (
    <div className="list-product">
      <h1>Danh Sách Sản Phẩm</h1>
      <div className="search-container">
        <input
          className="search-box"
          type="text"
          placeholder="Tìm kiếm theo tên"
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
        />
        <select
          className="search-box"
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
        >
          <option value="">Chọn danh mục</option>
          <option value="women">Nữ (Women)</option>
          <option value="men">Nam (Men)</option>
          <option value="kid">Trẻ em (Kid)</option>
        </select>
      </div>
      <div className="listproduct-format-main">
        <p>Hình ảnh</p>
        <p>Tên sản phẩm</p>
        <p>Giá cũ</p>
        <p>Giá mới</p>
        <p>Danh mục</p>
        <p>Xóa</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {filteredProducts.map((product, index) => (
          <div
            key={index}
            className="listproduct-format-main listproduct-format"
          >
            <img
              src={product.image}
              alt=""
              className="listproduct-product-icon"
            />
            <p>{product.name}</p>
            <p>{product.old_price}đ</p>
            <p>{product.new_price}đ</p>
            <p>{product.category === "women" ? "Nữ" : product.category === "men" ? "Nam" : "Trẻ em"}</p>
            <p>
              <img
                onClick={() => {
                  remove_product(product.id);
                }}
                src={cross_icon}
                alt=""
                className="listproduct-remove-icon"
              />
            </p>
          </div>
        ))}
        <hr />
      </div>
    </div>
  );
};

export default ListProduct;
