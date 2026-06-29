import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../../assets/cross_icon.png";

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Edit product states
  const [editProduct, setEditProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editSubcategory, setEditSubcategory] = useState("");
  const [editDetailCategory, setEditDetailCategory] = useState("");
  const [editOldPrice, setEditOldPrice] = useState("");
  const [editNewPrice, setEditNewPrice] = useState("");
  const [editSizes, setEditSizes] = useState([]);
  const [editMainImage, setEditMainImage] = useState(null);
  const [editAccompanying, setEditAccompanying] = useState([]);

  const subcategoryDetails = {
    "Áo": ["Áo thun", "Áo sơ mi", "Áo khoác", "Áo len"],
    "Quần": ["Quần jean", "Quần tây", "Quần short", "Quần kaki"],
    "Váy": ["Váy ngắn", "Váy dài", "Đầm công sở", "Đầm dự tiệc"]
  };

  const fetchInfo = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/allproducts`)
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
        : true;

      return isTitleMatch && isCategoryMatch;
    });

    setFilteredProducts(filtered);
  }, [searchTitle, searchCategory, allproducts]);

  const remove_product = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      return;
    }
    await fetch(`${import.meta.env.VITE_API_URL}/removeproduct`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });

    await fetchInfo();
  };

  const handleEditClick = (product) => {
    setEditProduct(product);
    setEditName(product.name || "");
    setEditDesc(product.description || "");
    setEditCategory(product.category || "women");
    setEditSubcategory(product.subcategory || "");
    setEditDetailCategory(product.detail_category || "");
    setEditOldPrice(product.old_price || "");
    setEditNewPrice(product.new_price || "");
    
    const standardSizes = ["S", "M", "L", "XL", "XXL"];
    const mappedSizes = standardSizes.map(sizeStr => {
      const match = product.sizes && product.sizes.find(s => s.size === sizeStr);
      if (match) {
        return { size: sizeStr, active: true, new_price: match.new_price, old_price: match.old_price };
      }
      return { size: sizeStr, active: false, new_price: "", old_price: "" };
    });
    setEditSizes(mappedSizes);
    setEditMainImage(null);
    setEditAccompanying([]);
  };

  const handleEditSizeActiveChange = (index, checked) => {
    const newSizes = [...editSizes];
    newSizes[index].active = checked;
    setEditSizes(newSizes);
  };

  const handleEditSizePriceChange = (index, field, value) => {
    const newSizes = [...editSizes];
    newSizes[index][field] = value;
    setEditSizes(newSizes);
  };

  const handleUpdateProductSubmit = async () => {
    if (!editName) {
      alert("Vui lòng nhập tên sản phẩm!");
      return;
    }

    const hasSizes = editSizes.some(s => s.active);
    if (!hasSizes && (!editNewPrice || !editOldPrice)) {
      alert("Vui lòng nhập giá bán gốc và giá khuyến mãi hoặc chọn kích thước có giá!");
      return;
    }

    if (hasSizes) {
      const invalid = editSizes.filter(s => s.active && (!s.new_price || !s.old_price));
      if (invalid.length > 0) {
        alert("Vui lòng nhập đầy đủ giá bán gốc và giá khuyến mãi cho các kích cỡ đã chọn!");
        return;
      }
    }

    const activeSizes = editSizes
      .filter(s => s.active)
      .map(s => ({
        size: s.size,
        new_price: Number(s.new_price),
        old_price: Number(s.old_price)
      }));

    const finalNewPrice = hasSizes ? activeSizes[0].new_price : editNewPrice;
    const finalOldPrice = hasSizes ? activeSizes[0].old_price : editOldPrice;

    const formData = new FormData();
    formData.append("id", editProduct.id);
    formData.append("name", editName);
    formData.append("description", editDesc);
    formData.append("category", editCategory);
    formData.append("subcategory", editSubcategory);
    formData.append("detail_category", editDetailCategory);
    formData.append("new_price", finalNewPrice);
    formData.append("old_price", finalOldPrice);
    formData.append("sizes", JSON.stringify(activeSizes));

    if (editMainImage) {
      formData.append("product", editMainImage);
    }
    editAccompanying.forEach(file => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/updateproduct`, {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        alert("Cập nhật sản phẩm thành công!");
        setEditProduct(null);
        fetchInfo();
      } else {
        alert("Cập nhật thất bại: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi cập nhật!");
    }
  };

  return (
    <div className="list-product" style={{ position: 'relative' }}>
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
      <div className="listproduct-table-wrapper" style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: "800px" }}>
          <div className="listproduct-format-main">
            <p>Hình ảnh</p>
            <p>Tên sản phẩm</p>
            <p>Giá bán gốc</p>
            <p>Giá khuyến mãi</p>
            <p>Danh mục</p>
            <p>Hành động</p>
          </div>
          <div className="listproduct-allproducts">
            <hr />
            {filteredProducts.map((product, index) => (
              <div
                key={index}
                className="listproduct-format-main listproduct-format"
                style={{ alignItems: 'center' }}
              >
                <img
                  src={product.image}
                  alt=""
                  className="listproduct-product-icon"
                />
                <p>
                  <a href={`http://localhost:3000/product/${product.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#ff4141', fontWeight: '600' }} title="Xem chi tiết sản phẩm">
                    {product.name}
                  </a>
                </p>
                <p>{product.old_price}đ</p>
                <p>{product.new_price}đ</p>
                <p>{product.category === "women" ? "Nữ" : product.category === "men" ? "Nam" : "Trẻ em"}</p>
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <button
                    onClick={() => handleEditClick(product)}
                    style={{
                      background: '#4a90e2',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    Sửa
                  </button>
                  <img
                    onClick={() => {
                      remove_product(product.id);
                    }}
                    src={cross_icon}
                    alt=""
                    className="listproduct-remove-icon"
                    style={{ margin: '0', cursor: 'pointer' }}
                  />
                </p>
              </div>
            ))}
            <hr />
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editProduct && (
        <div className="edit-product-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <div className="edit-product-modal-content" style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              Chỉnh Sửa Sản Phẩm (ID: {editProduct.id})
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontWeight: '600' }}>Tên sản phẩm</label>
              <input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontWeight: '600' }}>Mô tả sản phẩm</label>
              <textarea 
                value={editDesc} 
                onChange={(e) => setEditDesc(e.target.value)} 
                rows="3"
                style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: '600' }}>Danh mục chính</label>
                <select 
                  value={editCategory} 
                  onChange={(e) => setEditCategory(e.target.value)}
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="women">Nữ (Women)</option>
                  <option value="men">Nam (Men)</option>
                  <option value="kid">Trẻ em (Kid)</option>
                </select>
              </div>

              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: '600' }}>Danh mục con</label>
                <select 
                  value={editSubcategory} 
                  onChange={(e) => {
                    setEditSubcategory(e.target.value);
                    setEditDetailCategory("");
                  }}
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">Chọn danh mục con</option>
                  <option value="Áo">Áo</option>
                  <option value="Quần">Quần</option>
                  <option value="Váy">Váy</option>
                </select>
              </div>

              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: '600' }}>Chi tiết</label>
                <select 
                  value={editDetailCategory} 
                  onChange={(e) => setEditDetailCategory(e.target.value)}
                  disabled={!editSubcategory}
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                >
                  <option value="">Chọn chi tiết</option>
                  {editSubcategory && subcategoryDetails[editSubcategory]?.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: '600' }}>Giá bán gốc (Nếu không có size)</label>
                <input 
                  type="number" 
                  value={editOldPrice} 
                  onChange={(e) => setEditOldPrice(e.target.value)} 
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: '600' }}>Giá khuyến mãi (Nếu không có size)</label>
                <input 
                  type="number" 
                  value={editNewPrice} 
                  onChange={(e) => setEditNewPrice(e.target.value)} 
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
              <label style={{ fontWeight: '600' }}>Cấu hình size (Tùy chọn)</label>
              {editSizes.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: '80px', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={s.active} 
                      onChange={(e) => handleEditSizeActiveChange(idx, e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    Size {s.size}
                  </label>
                  {s.active && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="number" 
                        value={s.old_price} 
                        placeholder="Giá gốc" 
                        onChange={(e) => handleEditSizePriceChange(idx, 'old_price', e.target.value)}
                        style={{ padding: '6px', width: '120px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                      <input 
                        type="number" 
                        value={s.new_price} 
                        placeholder="Giá KM" 
                        onChange={(e) => handleEditSizePriceChange(idx, 'new_price', e.target.value)}
                        style={{ padding: '6px', width: '120px', border: '1px solid #ccc', borderRadius: '4px' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: '600' }}>Thay đổi ảnh chính</label>
                <input 
                  type="file" 
                  onChange={(e) => setEditMainImage(e.target.files[0])}
                />
              </div>
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: '600' }}>Thay đổi ảnh kèm theo</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => setEditAccompanying(Array.from(e.target.files))}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <button 
                onClick={() => setEditProduct(null)}
                style={{ padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                HỦY
              </button>
              <button 
                onClick={handleUpdateProductSubmit}
                style={{ padding: '10px 20px', background: '#4a90e2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                CẬP NHẬT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProduct;
