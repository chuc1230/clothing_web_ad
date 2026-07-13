import React, { useEffect, useState } from "react";
import "./ListProduct.css";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const FRONTEND_URL = (import.meta.env.VITE_FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");

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
  const [existingImages, setExistingImages] = useState([]);
  const [editStock, setEditStock] = useState("");
  const [editSeason, setEditSeason] = useState("Quanh năm");
  const [editColors, setEditColors] = useState([]);
  const [newEditColorName, setNewEditColorName] = useState("");
  const [editColorFile, setEditColorFile] = useState(null);
  const [editColorPreview, setEditColorPreview] = useState("");

  const subcategoryDetails = {
    "Áo": ["Áo thun", "Áo sơ mi", "Áo khoác", "Áo len"],
    "Quần": ["Quần jean", "Quần tây", "Quần short", "Quần kaki"],
    "Váy": ["Váy ngắn", "Váy dài", "Đầm công sở", "Đầm dự tiệc"]
  };

  const fetchInfo = async () => {
    await fetch(`${API_URL}/allproducts`)
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
    await fetch(`${API_URL}/removeproduct`, {
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
    setEditStock(product.stock !== undefined ? product.stock : 0);
    setEditSeason(product.season || "Quanh năm");
    setEditColors(product.colors || []);
    setNewEditColorName("");
    setEditColorFile(null);
    setEditColorPreview("");
    
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
    setExistingImages(product.images || []);
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

  const handleEditColorFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditColorFile(file);
      setEditColorPreview(URL.createObjectURL(file));
    }
  };

  const addEditColor = () => {
    if (!newEditColorName.trim()) {
      alert("Vui lòng nhập tên màu!");
      return;
    }
    if (!editColorFile) {
      alert("Vui lòng chọn ảnh cho màu sắc này!");
      return;
    }
    if (editColors.some(c => c.name.toLowerCase() === newEditColorName.trim().toLowerCase())) {
      alert("Tên màu sắc này đã tồn tại!");
      return;
    }
    setEditColors([...editColors, { name: newEditColorName.trim(), file: editColorFile, preview: editColorPreview }]);
    setNewEditColorName("");
    setEditColorFile(null);
    setEditColorPreview("");
    if (document.getElementById('edit-color-image-input')) {
      document.getElementById('edit-color-image-input').value = "";
    }
  };

  const removeEditColor = (index) => {
    setEditColors(editColors.filter((_, i) => i !== index));
  };

  const handleUpdateProductSubmit = async () => {
    if (!editName) {
      alert("Vui lòng nhập tên sản phẩm!");
      return;
    }

    const hasSizes = editSizes.some(s => s.active);
    if (!hasSizes) {
      alert("Vui lòng chọn ít nhất một kích thước (Size) cho sản phẩm!");
      return;
    }

    const invalid = editSizes.filter(s => s.active && !s.old_price);
    if (invalid.length > 0) {
      alert("Vui lòng nhập đầy đủ giá bán gốc cho các kích cỡ đã chọn!");
      return;
    }

    // Upload color images first
    const updatedColors = [];
    for (const col of editColors) {
      if (col.file) {
        let uploadedUrl = "";
        try {
          const uploadForm = new FormData();
          uploadForm.append("product", col.file);
          const uploadRes = await fetch(`${API_URL}/upload`, {
            method: "POST",
            body: uploadForm
          });
          const uploadData = await uploadRes.json();
          if (uploadData.success) {
            uploadedUrl = uploadData.image_urls[0];
          } else {
            alert(`Lỗi upload ảnh màu sắc ${col.name}: ` + uploadData.message);
            return;
          }
        } catch (err) {
          console.error(err);
          alert(`Lỗi kết nối khi upload ảnh màu sắc ${col.name}!`);
          return;
        }
        updatedColors.push({ name: col.name, image: uploadedUrl });
      } else {
        updatedColors.push({ name: col.name, image: col.image });
      }
    }

    const activeSizes = editSizes
      .filter(s => s.active)
      .map(s => ({
        size: s.size,
        new_price: s.new_price ? Number(s.new_price) : Number(s.old_price), // Giá KM không bắt buộc, nếu trống sẽ lấy giá gốc
        old_price: Number(s.old_price)
      }));

    const finalNewPrice = activeSizes[0].new_price;
    const finalOldPrice = activeSizes[0].old_price;

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
    formData.append("colors", JSON.stringify(updatedColors));
    formData.append("season", editSeason);
    formData.append("stock", Number(editStock));
    formData.append("existingImages", JSON.stringify(existingImages));

    if (editMainImage) {
      formData.append("product", editMainImage);
    }
    editAccompanying.forEach(file => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(`${API_URL}/updateproduct`, {
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
          <option value="women">Nữ </option>
          <option value="men">Nam </option>
          <option value="kid">Trẻ em </option>
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
            <p>Số lượng</p>
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
                  <a href={`${FRONTEND_URL}/product/${product.id}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#ff4141', fontWeight: '600' }} title="Xem chi tiết sản phẩm">
                    {product.name}
                  </a>
                </p>
                <p>{product.old_price}đ</p>
                <p>{product.new_price}đ</p>
                <p>{product.category === "women" ? "Nữ" : product.category === "men" ? "Nam" : "Trẻ em"}</p>
                <p>{product.stock !== undefined ? product.stock : 0}</p>
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
                  <button
                    onClick={() => {
                      remove_product(product.id);
                    }}
                    style={{
                      background: '#ff4d4f',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    Xóa
                  </button>
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
                className="modal-input-field"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={{ fontWeight: '600' }}>Mô tả sản phẩm</label>
              <textarea 
                value={editDesc} 
                onChange={(e) => setEditDesc(e.target.value)} 
                rows="3"
                style={{ padding: '12px', border: '1px solid #ccc', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '150px' }}>
                <label style={{ fontWeight: '600', height: '20px', display: 'flex', alignItems: 'center' }}>Danh mục chính</label>
                <select 
                  value={editCategory} 
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="modal-input-field"
                >
                  <option value="women">Nữ </option>
                  <option value="men">Nam </option>
                  <option value="kid">Trẻ em </option>
                </select>
              </div>

              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '150px' }}>
                <label style={{ fontWeight: '600', height: '20px', display: 'flex', alignItems: 'center' }}>Danh mục con</label>
                <select 
                  value={editSubcategory} 
                  onChange={(e) => {
                    setEditSubcategory(e.target.value);
                    setEditDetailCategory("");
                  }}
                  className="modal-input-field"
                >
                  <option value="">Chọn danh mục con</option>
                  <option value="Áo">Áo</option>
                  <option value="Quần">Quần</option>
                  <option value="Váy">Váy</option>
                </select>
              </div>

              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px', minWidth: '150px' }}>
                <label style={{ fontWeight: '600', height: '20px', display: 'flex', alignItems: 'center' }}>Phân loại mùa</label>
                <select 
                  value={editSeason} 
                  onChange={(e) => setEditSeason(e.target.value)}
                  className="modal-input-field"
                >
                  <option value="Quanh năm">Quanh năm</option>
                  <option value="Xuân/Hè">Xuân/Hè</option>
                  <option value="Thu/Đông">Thu/Đông</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontWeight: '600' }}>Số lượng tồn kho</label>
                <input 
                  type="number" 
                  value={editStock} 
                  onChange={(e) => setEditStock(e.target.value)} 
                  className="modal-input-field"
                  style={{ maxWidth: '300px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
              <label style={{ fontWeight: '600' }}>Cấu hình size (Bắt buộc chọn ít nhất 1 size, Giá khuyến mãi là tùy chọn)</label>
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
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <input 
                        type="number" 
                        value={s.old_price} 
                        placeholder="Giá gốc (Bắt buộc)" 
                        onChange={(e) => handleEditSizePriceChange(idx, 'old_price', e.target.value)}
                        style={{ padding: '8px 12px', width: '180px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                      />
                      <input 
                        type="number" 
                        value={s.new_price} 
                        placeholder="Giá KM (Trống = Giá gốc)" 
                        onChange={(e) => handleEditSizePriceChange(idx, 'new_price', e.target.value)}
                        style={{ padding: '8px 12px', width: '220px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
              <label style={{ fontWeight: '600' }}>Màu sắc (Tùy chọn)</label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  placeholder="Tên màu (VD: Đen, Trắng)" 
                  value={newEditColorName}
                  onChange={(e) => setNewEditColorName(e.target.value)}
                  style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: '1', maxWidth: '200px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <label htmlFor="edit-color-image-input" style={{ padding: '8px 12px', background: '#e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    {editColorFile ? "Đổi ảnh màu" : "Chọn ảnh màu"}
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    id="edit-color-image-input"
                    onChange={handleEditColorFileChange}
                    style={{ display: 'none' }}
                  />
                  {editColorPreview && (
                    <img 
                      src={editColorPreview} 
                      alt="preview" 
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} 
                    />
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={addEditColor}
                  style={{ padding: '8px 15px', background: '#ff4141', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Thêm màu
                </button>
              </div>
              {editColors.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', background: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}>
                  {editColors.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f0f0', padding: '5px 12px', borderRadius: '20px', border: '1px solid #ccc' }}>
                      <img src={c.preview || c.image} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #bbb' }} />
                      <span style={{ fontSize: '14px', fontWeight: '500' }}>{c.name}</span>
                      <button 
                        type="button" 
                        onClick={() => removeEditColor(i)}
                        style={{ border: 'none', background: 'none', color: '#ff4d4f', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginLeft: '5px', lineHeight: '1' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
                  onChange={(e) => setEditAccompanying((prev) => [...prev, ...Array.from(e.target.files)])}
                />
              </div>
            </div>

            {/* Accompanying images preview with delete button */}
            {(existingImages.length > 0 || editAccompanying.length > 0) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: '600' }}>Danh sách ảnh kèm theo hiện tại</label>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', background: '#f9f9f9', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                  {existingImages.map((url, i) => (
                    <div key={`existing-${i}`} style={{ position: 'relative', width: '60px', height: '60px' }}>
                      <img src={url} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                      <button 
                        type="button" 
                        onClick={() => setExistingImages((prev) => prev.filter((_, idx) => idx !== i))}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'rgba(255, 77, 79, 0.9)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          lineHeight: '1',
                          padding: '0'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {editAccompanying.map((file, i) => (
                    <div key={`new-${i}`} style={{ position: 'relative', width: '60px', height: '60px' }}>
                      <img src={URL.createObjectURL(file)} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                      <button 
                        type="button" 
                        onClick={() => setEditAccompanying((prev) => prev.filter((_, idx) => idx !== i))}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'rgba(255, 77, 79, 0.9)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          lineHeight: '1',
                          padding: '0'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
