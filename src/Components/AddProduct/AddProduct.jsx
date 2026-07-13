import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

const subcategoryDetails = {
  "Áo": ["Áo thun", "Áo sơ mi", "Áo khoác", "Áo len"],
  "Quần": ["Quần jean", "Quần tây", "Quần short", "Quần kaki"],
  "Váy": ["Váy ngắn", "Váy dài", "Đầm công sở", "Đầm dự tiệc"]
};

const AddProduct = () => {

    const [image, setImage] = useState(false);
    const [accompanyingImages, setAccompanyingImages] = useState([]);
    const [productDetails, setProductDetails] = useState({
        name:"",
        description:"",
        image:"",
        category:"women",
        subcategory:"",
        detail_category:"",
        new_price:"",
        old_price:"",
        stock:""
    })

    const [sizes, setSizes] = useState([
        { size: 'S', active: false, new_price: '', old_price: '' },
        { size: 'M', active: false, new_price: '', old_price: '' },
        { size: 'L', active: false, new_price: '', old_price: '' },
        { size: 'XL', active: false, new_price: '', old_price: '' },
        { size: 'XXL', active: false, new_price: '', old_price: '' },
    ]);

    const [colors, setColors] = useState([]);
    const [newColorName, setNewColorName] = useState("");
    const [colorFile, setColorFile] = useState(null);
    const [colorPreview, setColorPreview] = useState("");
    const [season, setSeason] = useState("Quanh năm");

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    }
    const changeHandler = (e) => {
        setProductDetails({...productDetails, [e.target.name]:e.target.value});
    }

    const handleSubcategoryChange = (e) => {
        setProductDetails({
            ...productDetails, 
            subcategory: e.target.value,
            detail_category: "" 
        });
    }

    const handleSizeActiveChange = (index, checked) => {
        const newSizes = [...sizes];
        newSizes[index].active = checked;
        setSizes(newSizes);
    }

    const handleSizePriceChange = (index, field, value) => {
        const newSizes = [...sizes];
        newSizes[index][field] = value;
        setSizes(newSizes);
    }

    const handleColorFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setColorFile(file);
            setColorPreview(URL.createObjectURL(file));
        }
    };

    const addColor = () => {
        if (!newColorName.trim()) {
            alert("Vui lòng nhập tên màu!");
            return;
        }
        if (!colorFile) {
            alert("Vui lòng chọn ảnh cho màu sắc này!");
            return;
        }
        if (colors.some(c => c.name.toLowerCase() === newColorName.trim().toLowerCase())) {
            alert("Tên màu sắc này đã tồn tại!");
            return;
        }
        setColors([...colors, { name: newColorName.trim(), file: colorFile, preview: colorPreview }]);
        setNewColorName("");
        setColorFile(null);
        setColorPreview("");
        if (document.getElementById('color-image-input')) {
            document.getElementById('color-image-input').value = "";
        }
    };

    const removeColor = (index) => {
        setColors(colors.filter((_, i) => i !== index));
    };

    const Add_Product = async () => {
        if (!productDetails.name) {
            alert("Vui lòng điền tên sản phẩm!");
            return;
        }

        const hasSizes = sizes.some(s => s.active);
        if (!hasSizes) {
            alert("Vui lòng chọn ít nhất một kích thước (Size) cho sản phẩm!");
            return;
        }

        const invalidSizes = sizes.filter(s => s.active && !s.old_price);
        if (invalidSizes.length > 0) {
            alert("Vui lòng nhập đầy đủ giá gốc cho tất cả các kích thước đã chọn!");
            return;
        }

        if (!image) {
            alert("Vui lòng chọn ảnh chính sản phẩm!");
            return;
        }

        console.log(productDetails);

        // Upload color images first
        const updatedColors = [];
        for (const col of colors) {
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
    
        let formData = new FormData();
        formData.append("product", image); // Ảnh chính
        
        // Thêm các ảnh kèm theo
        accompanyingImages.forEach((file) => {
            formData.append("images", file);
        });

        const activeSizes = sizes
            .filter((s) => s.active)
            .map((s) => ({
                size: s.size,
                new_price: s.new_price ? Number(s.new_price) : Number(s.old_price), // Giá KM không bắt buộc, nếu trống sẽ lấy giá gốc
                old_price: Number(s.old_price),
            }));

        const finalNewPrice = activeSizes[0].new_price;
        const finalOldPrice = activeSizes[0].old_price;

        formData.append("name", productDetails.name);
        formData.append("description", productDetails.description);
        formData.append("category", productDetails.category);
        formData.append("subcategory", productDetails.subcategory);
        formData.append("detail_category", productDetails.detail_category);
        formData.append("new_price", finalNewPrice);
        formData.append("old_price", finalOldPrice);
        formData.append("sizes", JSON.stringify(activeSizes));
        formData.append("colors", JSON.stringify(updatedColors));
        formData.append("season", season);
        formData.append("stock", productDetails.stock ? Number(productDetails.stock) : 0);
    
        try {
            const response = await fetch(`${API_URL}/addproduct`, {
                method: "POST",
                body: formData,
            });
    
            const data = await response.json();
            if (data.success) {
                alert("Thêm sản phẩm thành công!");
                setProductDetails({
                    name:"",
                    description:"",
                    image:"",
                    category:"women",
                    subcategory:"",
                    detail_category:"",
                    new_price:"",
                    old_price:"",
                    stock:""
                });
                setSizes([
                    { size: 'S', active: false, new_price: '', old_price: '' },
                    { size: 'M', active: false, new_price: '', old_price: '' },
                    { size: 'L', active: false, new_price: '', old_price: '' },
                    { size: 'XL', active: false, new_price: '', old_price: '' },
                    { size: 'XXL', active: false, new_price: '', old_price: '' },
                ]);
                setColors([]);
                setSeason("Quanh năm");
                setImage(false);
                setAccompanyingImages([]);
                // Reset file inputs manually
                document.getElementById('accompanying-input').value = "";
            } else {
                alert("Thêm sản phẩm thất bại: " + data.message);
            }
        } catch (error) {
            console.error("Add product error:", error);
            alert("Đã xảy ra lỗi khi thêm sản phẩm!");
        }
    };
    

  return (
    <div className='add-product'>
        <div className='addproduct-itemfield'>
            <p>Tên sản phẩm (Bắt buộc)</p>
            <input value={productDetails.name} onChange={changeHandler} type='text' name='name' placeholder='Nhập tên sản phẩm' />
        </div>

        <div className='addproduct-itemfield'>
            <p>Mô tả sản phẩm (Tùy chọn)</p>
            <textarea 
                value={productDetails.description} 
                onChange={changeHandler} 
                name='description' 
                placeholder='Nhập mô tả sản phẩm'
                rows="4"
                style={{
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #c3c3c3',
                    outline: 'none',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                }}
            />
        </div>

        <div className='addproduct-price'>
            <div className='addproduct-itemfield' style={{ width: '100%' }}>
                <p>Số lượng tồn kho (Mặc định: 0)</p>
                <input value={productDetails.stock} onChange={changeHandler} type='number' name='stock' placeholder='Nhập số lượng tồn kho' style={{ width: '100%', maxWidth: '300px' }} />
            </div>
        </div>

        <div className="addproduct-itemfield">
            <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Chọn Kích Thước và Thiết Lập Giá (Bắt buộc chọn ít nhất 1 size, Giá khuyến mãi là tùy chọn)</p>
            <div className="addproduct-sizes-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
                {sizes.map((s, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px', cursor: 'pointer', fontWeight: 'bold' }}>
                            <input 
                                type="checkbox" 
                                checked={s.active} 
                                onChange={(e) => handleSizeActiveChange(index, e.target.checked)} 
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            Size {s.size}
                        </label>
                        {s.active && (
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: '#555', minWidth: '130px', display: 'inline-block' }}>Giá gốc (Bắt buộc):</span>
                                    <input 
                                        type="number" 
                                        value={s.old_price} 
                                        placeholder="Nhập giá gốc" 
                                        onChange={(e) => handleSizePriceChange(index, 'old_price', e.target.value)}
                                        style={{ padding: '8px 12px', width: '200px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '14px', color: '#555', minWidth: '130px', display: 'inline-block' }}>Giá KM (Tùy chọn):</span>
                                    <input 
                                        type="number" 
                                        value={s.new_price} 
                                        placeholder="Để trống = Giá gốc" 
                                        onChange={(e) => handleSizePriceChange(index, 'new_price', e.target.value)}
                                        style={{ padding: '8px 12px', width: '200px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className="addproduct-itemfield" style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Màu sắc sản phẩm (Tùy chọn)</p>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder="Tên màu (VD: Đỏ, Xanh, Đen)" 
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', flex: '1', maxWidth: '200px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label htmlFor="color-image-input" style={{ padding: '8px 12px', background: '#e0e0e0', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                        {colorFile ? "Đổi ảnh màu" : "Chọn ảnh màu"}
                    </label>
                    <input 
                        type="file" 
                        accept="image/*"
                        id="color-image-input"
                        onChange={handleColorFileChange}
                        style={{ display: 'none' }}
                    />
                    {colorPreview && (
                        <img 
                            src={colorPreview} 
                            alt="preview" 
                            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }} 
                        />
                    )}
                </div>
                <button 
                    type="button" 
                    onClick={addColor}
                    style={{ padding: '8px 15px', background: '#ff4141', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Thêm màu
                </button>
            </div>
            {colors.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', background: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #eee', marginTop: '10px' }}>
                    {colors.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f0f0f0', padding: '5px 12px', borderRadius: '20px', border: '1px solid #ddd' }}>
                            <img src={c.preview} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #bbb' }} />
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{c.name}</span>
                            <button 
                                type="button" 
                                onClick={() => removeColor(i)}
                                style={{ border: 'none', background: 'none', color: '#ff4d4f', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginLeft: '5px', lineHeight: '1' }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="addproduct-category-group" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
            <div className="addproduct-itemfield" style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0, fontWeight: '600', height: '24px', display: 'flex', alignItems: 'center' }}>Danh mục chính</p>
                <select value={productDetails.category} onChange={changeHandler} name='category' className='add-product-selector'>
                    <option value='women'>Nữ </option>
                    <option value='men'>Nam </option>
                    <option value='kid'>Trẻ em </option>
                </select>
            </div>

            <div className="addproduct-itemfield" style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0, fontWeight: '600', height: '24px', display: 'flex', alignItems: 'center' }}>Danh mục con</p>
                <select value={productDetails.subcategory} onChange={handleSubcategoryChange} name='subcategory' className='add-product-selector'>
                    <option value=''>Chọn danh mục con</option>
                    <option value='Áo'>Áo</option>
                    <option value='Quần'>Quần</option>
                    <option value='Váy'>Váy</option>
                </select>
            </div>

            <div className="addproduct-itemfield" style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ margin: 0, fontWeight: '600', height: '24px', display: 'flex', alignItems: 'center' }}>Phân loại mùa</p>
                <select value={season} onChange={(e) => setSeason(e.target.value)} name='season' className='add-product-selector'>
                    <option value='Quanh năm'>Quanh năm</option>
                    <option value='Xuân/Hè'>Xuân/Hè</option>
                    <option value='Thu/Đông'>Thu/Đông</option>
                </select>
            </div>
        </div>

        <div className="addproduct-images-section" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div className="addproduct-itemfield">
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Ảnh chính sản phẩm</p>
                <label htmlFor='file-input'>
                    <img src={image? URL.createObjectURL(image): upload_area} className='addproduct-thumnail-img' alt="" style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer', borderRadius: '8px', border: '1px solid #ccc' }} />
                </label>
                <input onChange={imageHandler} type="file" name='image' id='file-input' hidden/>
            </div>

            <div className="addproduct-itemfield" style={{ flex: '1', minWidth: '250px' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px' }}>Ảnh kèm theo (Chọn nhiều ảnh)</p>
                <input 
                    id="accompanying-input"
                    type="file" 
                    multiple 
                    onChange={(e) => setAccompanyingImages((prev) => [...prev, ...Array.from(e.target.files)])}
                    style={{ margin: '10px 0' }}
                />
                {accompanyingImages.length > 0 && (
                  <div className="addproduct-thumbnails-preview" style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {accompanyingImages.map((file, i) => (
                      <div key={i} style={{ position: 'relative', width: '60px', height: '60px' }}>
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="" 
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => removeColor ? setAccompanyingImages((prev) => prev.filter((_, idx) => idx !== i)) : null}
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
                )}
            </div>
        </div>

        <button onClick={() => {Add_Product()}} className='addproduct-btn'>THÊM SẢN PHẨM</button>
    </div>
  )
}

export default AddProduct