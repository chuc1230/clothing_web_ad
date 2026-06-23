import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'

const AddProduct = () => {

    const [image, setImage] = useState(false);
    const [accompanyingImages, setAccompanyingImages] = useState([]);
    const [productDetails, setProductDetails] = useState({
        name:"",
        description:"",
        image:"",
        category:"women",
        new_price:"",
        old_price:""       
    })

    const imageHandler = (e) => {
        setImage(e.target.files[0]);
    }
    const changeHandler = (e) => {
        setProductDetails({...productDetails, [e.target.name]:e.target.value});
    }
    const Add_Product = async () => {
        if (!productDetails.name || !productDetails.new_price || !productDetails.old_price) {
            alert("Vui lòng điền đầy đủ các thông tin bắt buộc!");
            return;
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

        formData.append("name", productDetails.name);
        formData.append("description", productDetails.description);
        formData.append("category", productDetails.category);
        formData.append("new_price", productDetails.new_price);
        formData.append("old_price", productDetails.old_price);
    
        try {
            const response = await fetch("http://localhost:4000/addproduct", {
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
                    new_price:"",
                    old_price:""
                });
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
                <p>Giá gốc (Bắt buộc)</p>
                <input value={productDetails.old_price} onChange={changeHandler} type='text' name='old_price' placeholder='Nhập giá gốc' />
            </div>
            <div className='addproduct-itemfield'>
                <p>Giá khuyến mãi (Bắt buộc)</p>
                <input value={productDetails.new_price} onChange={changeHandler} type='text' name='new_price' placeholder='Nhập giá khuyến mãi' />
            </div>
        </div>

        <div className="addproduct-itemfield">
            <p>Danh mục sản phẩm</p>
            <select value={productDetails.category} onChange={changeHandler} name='category' className='add-product-selector'>
                <option value='women'>Nữ (Women)</option>
                <option value='men'>Nam (Men)</option>
                <option value='kid'>Trẻ em (Kid)</option>
            </select>
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