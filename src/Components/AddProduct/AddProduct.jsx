import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

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
        old_price:""       
    })

    const [sizes, setSizes] = useState([
        { size: 'S', active: false, new_price: '', old_price: '' },
        { size: 'M', active: false, new_price: '', old_price: '' },
        { size: 'L', active: false, new_price: '', old_price: '' },
        { size: 'XL', active: false, new_price: '', old_price: '' },
        { size: 'XXL', active: false, new_price: '', old_price: '' },
    ]);

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

    const Add_Product = async () => {
        if (!productDetails.name) {
            alert("Vui lòng điền tên sản phẩm!");
            return;
        }

        const hasSizes = sizes.some(s => s.active);
        if (!hasSizes && (!productDetails.new_price || !productDetails.old_price)) {
            alert("Vui lòng điền giá gốc và giá khuyến mãi hoặc thêm kích thước có giá!");
            return;
        }

        if (hasSizes) {
            const invalidSizes = sizes.filter(s => s.active && (!s.new_price || !s.old_price));
            if (invalidSizes.length > 0) {
                alert("Vui lòng nhập đầy đủ giá gốc và giá khuyến mãi cho tất cả các kích thước đã chọn!");
                return;
            }
        }

        if (!image) {
            alert("Vui lòng chọn ảnh chính sản phẩm!");
            return;
        }

        console.log(productDetails);
    
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
                new_price: Number(s.new_price),
                old_price: Number(s.old_price),
            }));

        const finalNewPrice = hasSizes ? activeSizes[0].new_price : productDetails.new_price;
        const finalOldPrice = hasSizes ? activeSizes[0].old_price : productDetails.old_price;

        formData.append("name", productDetails.name);
        formData.append("description", productDetails.description);
        formData.append("category", productDetails.category);
        formData.append("subcategory", productDetails.subcategory);
        formData.append("detail_category", productDetails.detail_category);
        formData.append("new_price", finalNewPrice);
        formData.append("old_price", finalOldPrice);
        formData.append("sizes", JSON.stringify(activeSizes));
    
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/addproduct`, {
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
                    old_price:""
                });
                setSizes([
                    { size: 'S', active: false, new_price: '', old_price: '' },
                    { size: 'M', active: false, new_price: '', old_price: '' },
                    { size: 'L', active: false, new_price: '', old_price: '' },
                    { size: 'XL', active: false, new_price: '', old_price: '' },
                    { size: 'XXL', active: false, new_price: '', old_price: '' },
                ]);
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
            <div className='addproduct-itemfield'>
                <p>Giá gốc (Bắt buộc nếu không chọn size)</p>
                <input value={productDetails.old_price} onChange={changeHandler} type='text' name='old_price' placeholder='Nhập giá gốc' />
            </div>
            <div className='addproduct-itemfield'>
                <p>Giá khuyến mãi (Bắt buộc nếu không chọn size)</p>
                <input value={productDetails.new_price} onChange={changeHandler} type='text' name='new_price' placeholder='Nhập giá khuyến mãi' />
            </div>
        </div>

        <div className="addproduct-itemfield">
            <p style={{ marginBottom: '10px' }}>Chọn Kích Thước và Thiết Lập Giá Riêng (Tùy chọn)</p>
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
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontSize: '14px', color: '#555' }}>Giá gốc:</span>
                                    <input 
                                        type="number" 
                                        value={s.old_price} 
                                        placeholder="Nhập giá gốc" 
                                        onChange={(e) => handleSizePriceChange(index, 'old_price', e.target.value)}
                                        style={{ padding: '8px', width: '150px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontSize: '14px', color: '#555' }}>Giá KM:</span>
                                    <input 
                                        type="number" 
                                        value={s.new_price} 
                                        placeholder="Nhập giá khuyến mãi" 
                                        onChange={(e) => handleSizePriceChange(index, 'new_price', e.target.value)}
                                        style={{ padding: '8px', width: '150px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <div className="addproduct-category-group" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', width: '100%' }}>
            <div className="addproduct-itemfield" style={{ flex: '1', minWidth: '200px' }}>
                <p>Danh mục chính (Nhóm đối tượng)</p>
                <select value={productDetails.category} onChange={changeHandler} name='category' className='add-product-selector'>
                    <option value='women'>Nữ (Women)</option>
                    <option value='men'>Nam (Men)</option>
                    <option value='kid'>Trẻ em (Kid)</option>
                </select>
            </div>

            <div className="addproduct-itemfield" style={{ flex: '1', minWidth: '200px' }}>
                <p>Danh mục con (Loại sản phẩm)</p>
                <select value={productDetails.subcategory} onChange={handleSubcategoryChange} name='subcategory' className='add-product-selector'>
                    <option value=''>Chọn danh mục con</option>
                    <option value='Áo'>Áo</option>
                    <option value='Quần'>Quần</option>
                    <option value='Váy'>Váy</option>
                </select>
            </div>

            <div className="addproduct-itemfield" style={{ flex: '1', minWidth: '200px' }}>
                <p>Chi tiết sản phẩm</p>
                <select value={productDetails.detail_category} onChange={changeHandler} name='detail_category' className='add-product-selector' disabled={!productDetails.subcategory}>
                    <option value=''>Chọn chi tiết</option>
                    {productDetails.subcategory && subcategoryDetails[productDetails.subcategory]?.map((detail, idx) => (
                        <option key={idx} value={detail}>{detail}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="addproduct-images-section" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            <div className="addproduct-itemfield">
                <p>Ảnh chính sản phẩm</p>
                <label htmlFor='file-input'>
                    <img src={image? URL.createObjectURL(image): upload_area} className='addproduct-thumnail-img' alt="" style={{ width: '120px', height: '120px', objectFit: 'cover', cursor: 'pointer' }} />
                </label>
                <input onChange={imageHandler} type="file" name='image' id='file-input' hidden/>
            </div>

            <div className="addproduct-itemfield" style={{ flex: '1', minWidth: '250px' }}>
                <p>Ảnh kèm theo (Chọn nhiều ảnh)</p>
                <input 
                    id="accompanying-input"
                    type="file" 
                    multiple 
                    onChange={(e) => setAccompanyingImages(Array.from(e.target.files))}
                    style={{ margin: '10px 0' }}
                />
                {accompanyingImages.length > 0 && (
                  <div className="addproduct-thumbnails-preview" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {accompanyingImages.map((file, i) => (
                      <img 
                        key={i} 
                        src={URL.createObjectURL(file)} 
                        alt="" 
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                      />
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